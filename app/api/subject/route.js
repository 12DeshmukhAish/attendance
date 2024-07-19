import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";
import Classes from "@/models/className";
import Faculty from "@/models/faculty";
import Student from "@/models/student";
connectMongoDB();

// export async function GET(request) {
//   const url = new URL(request.url);
//   const department = url.searchParams.get('department');

//   try {
//     const subjects = await Subject.find(department ? { department } : {}).populate('class').populate('teacher').populate('batches');
//     return NextResponse.json(subjects);
//   } catch (error) {
//     return NextResponse.json({ error: 'Error fetching subjects' }, { status: 500 });
//   }
// }
export async function POST(request) {
    try {
        const { _id, name, class: classId, teacher, department, type, batchIds } = await request.json();

        const newSubject = new Subject({
            _id,
            name,
            class: classId,
            teacher,
            department,
            subType: type,
            batchIds: type === 'practical' ? batchIds : undefined,
        });

        await newSubject.save();

        // Update class to include this subject
        await Classes.findByIdAndUpdate(classId, { $push: { subjects: newSubject._id } });

        // Update only students in the selected batches to include this subject
        if (batchIds && batchIds.length > 0) {
            const classDoc = await Classes.findById(classId);
            const studentIds = classDoc.batches
                .filter(batch => batchIds.includes(batch._id))
                .flatMap(batch => batch.students);

            await Student.updateMany({ _id: { $in: studentIds } }, { $push: { subjects: newSubject._id } });
        }
        if (teacher) {
            await Faculty.findByIdAndUpdate(teacher, {
                $addToSet: { subjects: _id }
            });
        }
        return NextResponse.json(newSubject);
    } catch (error) {
        return NextResponse.json({ error: 'Error creating subject' }, { status: 500 });
    }
}
export async function PUT(request) {
    try {
        const { _id, name, class: classId, teacher, department, type, batchIds } = await request.json();

        const updatedSubject = await Subject.findByIdAndUpdate(
            _id,
            {
                name,
                class: classId,
                teacher,
                department,
                subType: type,
                batchIds: type === 'practical' ? batchIds : undefined,
            },
            { new: true }
        );

        if (updatedSubject) {
            // Find the previous class of the subject
            const oldSubject = await Subject.findById(_id);

            if (oldSubject.class !== classId || oldSubject.batchIds !== batchIds) {
                // Remove subject from students in the old batches
                if (oldSubject.batchIds && oldSubject.batchIds.length > 0) {
                    const oldClassDoc = await Classes.findById(oldSubject.class);
                    const oldStudentIds = oldClassDoc.batches
                        .filter(batch => oldSubject.batchIds.includes(batch._id))
                        .flatMap(batch => batch.students);

                    await Student.updateMany({ _id: { $in: oldStudentIds } }, { $pull: { subjects: _id } });
                }
                if (teacher) {
                    await Faculty.findByIdAndUpdate(teacher, {
                        $addToSet: { subjects: _id }
                    });
                }
                // Add subject to students in the new batches
                if (batchIds && batchIds.length > 0) {
                    const newClassDoc = await Classes.findById(classId);
                    const newStudentIds = newClassDoc.batches
                        .filter(batch => batchIds.includes(batch._id))
                        .flatMap(batch => batch.students);

                    await Student.updateMany({ _id: { $in: newStudentIds } }, { $push: { subjects: _id } });
                }
            }
        }

        return NextResponse.json(updatedSubject);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating subject' }, { status: 500 });
    }
}
export async function DELETE(request) {
    const url = new URL(request.url);
    const subjectId = url.searchParams.get('_id');

    try {
        const subject = await Subject.findByIdAndDelete(subjectId);

        if (subject) {
            await Class.findByIdAndUpdate(subject.class, { $pull: { subjects: subjectId } });

            // Remove subject from students in the batches
            if (subject.batchIds && subject.batchIds.length > 0) {
                const classDoc = await Classes.findById(subject.class);
                const studentIds = classDoc.batches
                    .filter(batch => subject.batchIds.includes(batch._id))
                    .flatMap(batch => batch.students);

                await Student.updateMany({ _id: { $in: studentIds } }, { $pull: { subjects: subjectId } });
            }
        }

        return NextResponse.json(subject);
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting subject' }, { status: 500 });
    }
}


export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("_id");
    const selectedBatchId = searchParams.get("batchId"); // Query parameter for batch selection

    try {
        await connectMongoDB();
        let subject = null;
        let batches = [];
        let students = [];

        if (subjectId) {
            subject = await Subject.findById(subjectId).lean();

            if (subject && subject.subType === 'practical') {
                const classDoc = await Classes.findById(subject.class).lean();
                if (classDoc && classDoc.batches) {
                    batches = classDoc.batches; // Get all batches

                    if (selectedBatchId) {
                        const selectedBatch = classDoc.batches.find(batch => batch._id.toString() === selectedBatchId);
                        if (selectedBatch) {
                            students = await Student.find({
                                _id: { $in: selectedBatch.students },
                                subjects: subjectId
                            }).lean();
                        }
                    }
                }
            } else if (subject) {
                students = await Student.find({ class: subject.class, subjects: subjectId }).lean();
            }
        } else {
            subject = await Subject.find().lean();
        }
        console.log(batches,students);
        const teachers = await Faculty.find().lean();
        return NextResponse.json({ subject, batches, students, teachers }, { status: 200 });
    } catch (error) {
        console.error("Error fetching subjects and teachers:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}