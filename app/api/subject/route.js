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
console.log(subjectId);
  try {
    await connectMongoDB();
    let subject = null;
    let batches = [];
    let students = [];

    if (subjectId) {
      subject = await Subject.findById(subjectId).lean();

      if (subject) {
        if (subject.subType === 'practical' || 'tg') {
          const classDoc = await Classes.findById(subject.class).populate('batches').lean();
          if (classDoc && classDoc.batches) {
            // Filter batches allocated to this subject
            batches = classDoc.batches.map(batch => batch._id)
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
          // For theory subjects, fetch all students in the class
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
    const { _id, name, class: classId, teacher, department, type, batch } = await request.json();
    
    if(!department) 
      {
        return NextResponse.json({error:"department is missing"})
    }
    console.log(batch);
    const newSubject = new Subject({
      _id,
      name,
      class: classId,
      teacher,
      department,
      subType: type,
      batch: type === 'practical' || type === 'tg' ? batch : undefined,
    });

    await newSubject.save();

    // Update class to include this subject
    await Classes.findByIdAndUpdate(classId, { $push: { subjects: newSubject._id } });

    // Add subject to students based on type
    if (type === 'theory') {
      // Theory subjects are added to all students in the class
      const classDoc = await Classes.findById(classId);
      const studentIds = classDoc.students;
      await Student.updateMany({ _id: { $in: studentIds } }, { $push: { subjects: newSubject._id } });
    } else if (batch && batch.length > 0) {
      // Practical subjects are added to students in selected batches
      const classDoc = await Classes.findById(classId);
      const studentIds = classDoc.batches
        .filter(b => batch.includes(b._id))
        .flatMap(b => b.students);

      await Student.updateMany({ _id: { $in: studentIds } }, { $push: { subjects: newSubject._id } });
    }

    // Update teacher to include this subject
    if (teacher) {
      await Faculty.findByIdAndUpdate(teacher, { $addToSet: { subjects: _id } });
    }

    console.log(newSubject);
    return NextResponse.json(newSubject);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Error creating subject' }, { status: 500 });
  }
}
export async function PUT(request) {
  try {
    const { _id, name, class: classId, teacher, department, type, batch } = await request.json();

    if(!department){
      console.log("department is not found",department);
      return NextResponse.json({error:"department is missing"})
    }
    const oldSubject = await Subject.findById(_id);
    const updatedSubject = await Subject.findByIdAndUpdate(
      _id,
      {
        name,
        class: classId,
        teacher,
        department,
        subType: type,
        batch: type === 'practical' || type === 'tg' ? batch : undefined,
      },
      { new: true }
    );

    if (updatedSubject) {
      // Update class if changed
      if (oldSubject.class.toString() !== classId.toString()) {
        await Classes.findByIdAndUpdate(oldSubject.class, { $pull: { subjects: _id } });
        await Classes.findByIdAndUpdate(classId, { $push: { subjects: _id } });
      }

      // Update students based on type
      if (type === 'theory') {
        // Remove from old students and add to new students
        const oldClassDoc = await Classes.findById(oldSubject.class);
        const newClassDoc = await Classes.findById(classId);
        const oldStudentIds = oldClassDoc.students;
        const newStudentIds = newClassDoc.students;

        await Student.updateMany({ _id: { $in: oldStudentIds } }, { $pull: { subjects: _id } });
        await Student.updateMany({ _id: { $in: newStudentIds } }, { $push: { subjects: _id } });
      } else {
        // Remove from old batches and add to new batches
        const oldClassDoc = await Classes.findById(oldSubject.class);
        const newClassDoc = await Classes.findById(classId);

        if (oldSubject.batch && oldSubject.batch.length > 0) {
          const oldStudentIds = oldClassDoc.batches
            .filter(b => oldSubject.batch.includes(b._id))
            .flatMap(b => b.students);

          await Student.updateMany({ _id: { $in: oldStudentIds } }, { $pull: { subjects: _id } });
        }

        if (batch && batch.length > 0) {
          const newStudentIds = newClassDoc.batches
            .filter(b => batch.includes(b._id))
            .flatMap(b => b.students);

          await Student.updateMany({ _id: { $in: newStudentIds } }, { $push: { subjects: _id } });
        }
      }

      // Update teacher if changed
      if (oldSubject.teacher.toString() !== teacher.toString()) {
        await Faculty.findByIdAndUpdate(oldSubject.teacher, { $pull: { subjects: _id } });
        await Faculty.findByIdAndUpdate(teacher, { $addToSet: { subjects: _id } });
      }
    }

    return NextResponse.json(updatedSubject);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Error updating subject' }, { status: 500 });
  }
}
export async function DELETE(request) {
  const url = new URL(request.url);
  const subjectId = url.searchParams.get('_id');

  try {
    const subject = await Subject.findById(subjectId);

    if (subject) {
      // Delete all attendance reports associated with this subject
      await Attendance.deleteMany({ subject: subjectId });

      // Delete the subject
      await Subject.findByIdAndDelete(subjectId);

      // Remove subject from class
      await Classes.findByIdAndUpdate(subject.class, { $pull: { subjects: subjectId } });

      // Remove subject from students based on type
      if (subject.subType === 'theory') {
        const classDoc = await Classes.findById(subject.class);
        const studentIds = classDoc.students;
        await Student.updateMany({ _id: { $in: studentIds } }, { $pull: { subjects: subjectId } });
      } else if (subject.batchIds && subject.batchIds.length > 0) {
        const classDoc = await Classes.findById(subject.class);
        const studentIds = classDoc.batches
          .filter(batch => subject.batchIds.includes(batch._id))
          .flatMap(batch => batch.students);

        await Student.updateMany({ _id: { $in: studentIds } }, { $pull: { subjects: subjectId } });
      }

      // Remove subject from faculty
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