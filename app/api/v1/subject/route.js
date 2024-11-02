import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";
import Classes from "@/models/className";
import Faculty from "@/models/faculty";
import Student from "@/models/student";
import Attendance from "@/models/attendance";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get("_id");
  const selectedBatchId = searchParams.get("batchId");

  try {
    await connectMongoDB();
    let subject = null;
    let batches = [];
    let students = [];

    if (subjectId) {
      subject = await Subject.findById(subjectId).lean();

      if (subject) {
        if (subject.subType === 'practical' || subject.subType === 'tg') {
          const classDoc = await Classes.findById(subject.class).populate('batches').lean();
          if (classDoc && classDoc.batches) {
            batches = classDoc.batches.map(batch => batch._id);
            if (selectedBatchId) {
              const selectedBatch = classDoc.batches.find(batch => batch._id.toString() === selectedBatchId);
              if (selectedBatch) {
                students = await Student.find({
                  _id: { $in: selectedBatch.students },
                  subjects: subjectId
                }).select('_id rollNumber name').lean();
              }
            }
          }
        } else {
          students = await Student.find({ class: subject.class, subjects: subjectId })
            .select('_id rollNumber name').lean();
        }
      }
    } else {
      subject = await Subject.find().lean();
    }

    const teachers = await Faculty.find().select('_id name').lean();
    return NextResponse.json({ subject, batches, students, teachers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching subjects and teachers:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { _id, name, class: classId, teacher, department, subType, batch, sem, academicYear } = await request.json();
    
    if (!department) {
      return NextResponse.json({error:"department is missing"}, { status: 400 });
    }

    const newSubject = new Subject({
      _id,
      name,
      class: classId,
      teacher,
      department,
      subType,
      batch: subType === 'practical' || subType === 'tg' ? batch : undefined,
      sem,
      academicYear
    });

    if (subType !== 'tg') {
      newSubject.content = [];
    } else {
      newSubject.tgSessions = [];
    }

    await newSubject.save();

    // Update the Classes model
    const classDoc = await Classes.findById(classId);
    if (!classDoc) {
      throw new Error('Class not found');
    }

    if (!classDoc.subjects) {
      classDoc.subjects = { sem1: [], sem2: [] };
    }

    if (sem === 'sem1') {
      classDoc.subjects.sem1.push(newSubject._id);
    } else if (sem === 'sem2') {
      classDoc.subjects.sem2.push(newSubject._id);
    }

    await classDoc.save();

    if (subType === 'theory') {
      const studentIds = classDoc.students;
      await Student.updateMany({ _id: { $in: studentIds } }, { $push: { subjects: newSubject._id } });
    } else if (batch && batch.length > 0) {
      const studentIds = classDoc.batches
        .filter(b => batch.includes(b._id.toString()))
        .flatMap(b => b.students);

      await Student.updateMany({ _id: { $in: studentIds } }, { $push: { subjects: newSubject._id } });
    }

    if (teacher) {
      await Faculty.findByIdAndUpdate(teacher, { $addToSet: { subjects: _id } });
    }

    return NextResponse.json(newSubject);
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json({ error: 'Error creating subject' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { _id, name, class: classId, teacher, department, subType, batch, sem, academicYear } = await request.json();

    if(!department){
      console.log("department is not found",department);
      return NextResponse.json({error:"department is missing"}, { status: 400 });
    }
    const oldSubject = await Subject.findById(_id);
    const updatedSubject = await Subject.findByIdAndUpdate(
      _id,
      {
        name,
        class: classId,
        teacher,
        department,
        subType,
        batch: subType === 'practical' || subType === 'tg' ? batch : undefined,
        sem,
        academicYear
      },
      { new: true }
    );

    if (updatedSubject) {
      if (oldSubject.class.toString() !== classId.toString() || oldSubject.sem !== sem) {
        // Remove from old class
        const oldClassDoc = await Classes.findById(oldSubject.class);
        if (oldClassDoc) {
          const oldSemSubjects = oldClassDoc.subjects[oldSubject.sem];
          oldClassDoc.subjects[oldSubject.sem] = oldSemSubjects.filter(s => s.toString() !== _id);
          await oldClassDoc.save();
        }

        // Add to new class
        const newClassDoc = await Classes.findById(classId);
        if (newClassDoc) {
          if (!newClassDoc.subjects[sem]) {
            newClassDoc.subjects[sem] = [];
          }
          newClassDoc.subjects[sem].push(_id);
          await newClassDoc.save();
        }
      }

      if (subType === 'theory') {
        const oldClassDoc = await Classes.findById(oldSubject.class);
        const newClassDoc = await Classes.findById(classId);
        const oldStudentIds = oldClassDoc.students;
        const newStudentIds = newClassDoc.students;

        await Student.updateMany({ _id: { $in: oldStudentIds } }, { $pull: { subjects: _id } });
        await Student.updateMany({ _id: { $in: newStudentIds } }, { $push: { subjects: _id } });
      } else {
        const oldClassDoc = await Classes.findById(oldSubject.class);
        const newClassDoc = await Classes.findById(classId);

        if (oldSubject.batch && oldSubject.batch.length > 0) {
          const oldStudentIds = oldClassDoc.batches
            .filter(b => oldSubject.batch.includes(b._id.toString()))
            .flatMap(b => b.students);

          await Student.updateMany({ _id: { $in: oldStudentIds } }, { $pull: { subjects: _id } });
        }

        if (batch && batch.length > 0) {
          const newStudentIds = newClassDoc.batches
            .filter(b => batch.includes(b._id.toString()))
            .flatMap(b => b.students);

          await Student.updateMany({ _id: { $in: newStudentIds } }, { $push: { subjects: _id } });
        }
      }

      if (oldSubject.teacher.toString() !== teacher.toString()) {
        await Faculty.findByIdAndUpdate(oldSubject.teacher, { $pull: { subjects: _id } });
        await Faculty.findByIdAndUpdate(teacher, { $addToSet: { subjects: _id } });
      }
    }

    return NextResponse.json(updatedSubject);
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json({ error: 'Error updating subject' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const url = new URL(request.url);
  const subjectId = url.searchParams.get('_id');

  try {
    const subject = await Subject.findById(subjectId);

    if (subject) {
      await Attendance.deleteMany({ subject: subjectId });
      await Subject.findByIdAndDelete(subjectId);

      // Remove subject from class
      const classDoc = await Classes.findById(subject.class);
      if (classDoc) {
        const semSubjects = classDoc.subjects[subject.sem];
        classDoc.subjects[subject.sem] = semSubjects.filter(s => s.toString() !== subjectId);
        await classDoc.save();
      }

      if (subject.subType === 'theory') {
        const studentIds = classDoc.students;
        await Student.updateMany({ _id: { $in: studentIds } }, { $pull: { subjects: subjectId } });
      } else if (subject.batch && subject.batch.length > 0) {
        const studentIds = classDoc.batches
          .filter(batch => subject.batch.includes(batch._id.toString()))
          .flatMap(batch => batch.students);

        await Student.updateMany({ _id: { $in: studentIds } }, { $pull: { subjects: subjectId } });
      }

      if (subject.teacher) {
        await Faculty.findByIdAndUpdate(subject.teacher, { $pull: { subjects: subjectId } });
      }

      return NextResponse.json({ message: 'Subject and associated reports deleted successfully' });
    } else {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json({ error: 'Error deleting subject' }, { status: 500 });
  }
}