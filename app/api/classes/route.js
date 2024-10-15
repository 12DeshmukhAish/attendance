// import { NextResponse } from "next/server";
// import { connectMongoDB } from "@/lib/connectDb";
// import Classes from "@/models/className";
// import Student from "@/models/student";
// import Faculty from "@/models/faculty";
// import mongoose from "mongoose";

// export async function POST(req) {
//     let session;
//     try {
//         await connectMongoDB();
//         session = await mongoose.startSession();
//         session.startTransaction();

//         const data = await req.json();
//         const { _id, classCoordinator, department, year, students, batches } = data;

//         const newClass = new Classes({
//             _id,
//             students,
//             teacher: classCoordinator,
//             department,
//             year,
//             batches
//         });
//         await newClass.save({ session });

//         await Student.updateMany(
//             { _id: { $in: students } },
//             { $set: { class: newClass._id } },
//             { session }
//         );

//         await Faculty.findByIdAndUpdate(
//             classCoordinator,
//             { 
//                 $push: { coordinatedClasses: newClass._id },
//                 $set: { classes: newClass._id }
//             },
//             { new: true, session }
//         );

//         await session.commitTransaction();
//         console.log("Class Registered Successfully", newClass);
//         return NextResponse.json({ message: "Class Registered Successfully", class: newClass }, { status: 201 });
//     } catch (error) {
//         console.error("Error creating class:", error);
//         if (session) {
//             await session.abortTransaction();
//         }
//         return NextResponse.json({ error: "Failed to Register" }, { status: 500 });
//     } finally {
//         if (session) {
//             session.endSession();
//         }
//     }
// }

// export async function PUT(req) {
//     let session;
//     try {
//         await connectMongoDB();
//         session = await mongoose.startSession();
//         session.startTransaction();

//         const { searchParams } = new URL(req.url);
//         const _id = searchParams.get("_id");

//         const data = await req.json();
//         const { classCoordinator, department, year, students, batches } = data;
//         const existingClass = await Classes.findById(_id).session(session);

//         if (!existingClass) {
//             await session.abortTransaction();
//             return NextResponse.json({ error: "Class not found" }, { status: 404 });
//         }

//         const previousStudentIds = existingClass.students;
//         const previousClassCoordinator = existingClass.teacher;

//         existingClass.teacher = classCoordinator;
//         existingClass.department = department;
//         existingClass.year = year;
//         existingClass.students = students;
//         existingClass.batches = batches;

//         await Student.updateMany(
//             { _id: { $in: previousStudentIds } },
//             { $unset: { class: "" } },
//             { session }
//         );

//         await Student.updateMany(
//             { _id: { $in: students } },
//             { $set: { class: existingClass._id } },
//             { session }
//         );

//         if (previousClassCoordinator && previousClassCoordinator !== classCoordinator) {
//             await Faculty.updateOne(
//                 { _id: previousClassCoordinator },
//                 { $unset: { classes: "" } },
//                 { session }
//             );
//         }

//         await Faculty.updateOne(
//             { _id: classCoordinator },
//             { $set: { classes: existingClass._id } },
//             { session }
//         );

//         await existingClass.save({ session });

//         await session.commitTransaction();
//         console.log("Class Updated Successfully", existingClass);
//         return NextResponse.json({ message: "Class Updated Successfully", class: existingClass }, { status: 200 });
//     } catch (error) {
//         console.error("Error updating class:", error);
//         if (session) {
//             await session.abortTransaction();
//         }
//         return NextResponse.json({ error: "Failed to Update" }, { status: 500 });
//     } finally {
//         if (session) {
//             session.endSession();
//         }
//     }
// }
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Classes from "@/models/className";
import Student from "@/models/student";
import Faculty from "@/models/faculty";
import Subject from "@/models/subject";
import mongoose from "mongoose";

export async function POST(req) {
    let session;
    try {
        await connectMongoDB();
        session = await mongoose.startSession();
        session.startTransaction();

        const data = await req.json();
        const { _id, classCoordinator, department, year, students, batches } = data;

        const newClass = new Classes({
            _id,
            students,
            teacher: classCoordinator,
            department,
            year,
            batches
        });
        await newClass.save({ session });

        // Update students
        const studentUpdateOps = students.map(studentId => ({
            updateOne: {
                filter: { _id: studentId },
                update: { $set: { class: newClass._id } },
                session
            }
        }));
        await Student.bulkWrite(studentUpdateOps, { session });

        // Update faculty
        await Faculty.findByIdAndUpdate(
            classCoordinator,
            { 
                $push: { coordinatedClasses: newClass._id },
                $set: { classes: newClass._id }
            },
            { new: true, session }
        );

        // Find all subjects for this class
        const subjects = await Subject.find({ class: newClass._id }, null, { session });

        // Add all subjects to theory students
        const theorySubjects = subjects.filter(subject => subject.subType === 'theory').map(subject => subject._id);
        if (theorySubjects.length > 0) {
            await Student.updateMany(
                { _id: { $in: students } },
                { $addToSet: { subjects: { $each: theorySubjects } } },
                { session }
            );
        }

        // Add practical and TG subjects to students in respective batches
        for (const subject of subjects) {
            if (subject.subType === 'practical' || subject.subType === 'tg') {
                const batchStudents = batches
                    .filter(batch => subject.batch.includes(batch._id))
                    .flatMap(batch => batch.students);
                
                await Student.updateMany(
                    { _id: { $in: batchStudents } },
                    { $addToSet: { subjects: subject._id } },
                    { session }
                );
            }
        }

        await session.commitTransaction();
        console.log("Class Registered Successfully", newClass);
        return NextResponse.json({ message: "Class Registered Successfully", class: newClass }, { status: 201 });
    } catch (error) {
        console.error("Error creating class:", error);
        if (session) {
            await session.abortTransaction();
        }
        return NextResponse.json({ error: "Failed to Register" }, { status: 500 });
    } finally {
        if (session) {
            session.endSession();
        }
    }
}

export async function PUT(req) {
    let session;
    let conn;
    try {
        console.log("Starting database connection");
        conn = await connectMongoDB();
        console.log("Database connected successfully");

        console.log("Starting session");
        session = await mongoose.startSession();
        session.startTransaction();
        console.log("Transaction started");

        await connectMongoDB();
        session = await mongoose.startSession();
        session.startTransaction();

        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");

        const data = await req.json();
        const { classCoordinator, department, year, students, batches } = data;

        // Use findOne with session instead of findById
        const existingClass = await Classes.findOne({ _id }).session(session);

        if (!existingClass) {
            await session.abortTransaction();
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        const previousStudentIds = existingClass.students;
        const previousClassCoordinator = existingClass.teacher;

        existingClass.teacher = classCoordinator;
        existingClass.department = department;
        existingClass.year = year;
        existingClass.students = students;
        existingClass.batches = batches;

        // Remove class reference from previous students
        await Student.updateMany(
            { _id: { $in: previousStudentIds } },
            { $unset: { class: "" } },
            { session }
        );

        // Add class reference to new students
        await Student.updateMany(
            { _id: { $in: students } },
            { $set: { class: existingClass._id } },
            { session }
        );

        // Update faculty references
        if (previousClassCoordinator && previousClassCoordinator !== classCoordinator) {
            await Faculty.updateOne(
                { _id: previousClassCoordinator },
                { $unset: { classes: "" } },
                { session }
            );
        }

        await Faculty.updateOne(
            { _id: classCoordinator },
            { $set: { classes: existingClass._id } },
            { session }
        );

        // Find all subjects for this class
        const subjects = await Subject.find({ class: existingClass._id }).session(session);

        // Remove all subjects from previous students
        await Student.updateMany(
            { _id: { $in: previousStudentIds } },
            { $pull: { subjects: { $in: subjects.map(s => s._id) } } },
            { session }
        );

        // Add theory subjects to all new students
        const theorySubjects = subjects.filter(subject => subject.subType === 'theory').map(subject => subject._id);
        if (theorySubjects.length > 0) {
            await Student.updateMany(
                { _id: { $in: students } },
                { $addToSet: { subjects: { $each: theorySubjects } } },
                { session }
            );
        }

        // Add practical and TG subjects to students in respective batches
        for (const subject of subjects) {
            if (subject.subType === 'practical' || subject.subType === 'tg') {
                const batchStudents = batches
                    .filter(batch => subject.batch.includes(batch._id))
                    .flatMap(batch => batch.students);
                
                if (batchStudents.length > 0) {
                    await Student.updateMany(
                        { _id: { $in: batchStudents } },
                        { $addToSet: { subjects: subject._id } },
                        { session }
                    );
                }
            }
        }

        await existingClass.save({ session });

        await session.commitTransaction();
          
        console.log("Transaction committed successfully");

        return NextResponse.json({ message: "Class Updated Successfully", class: existingClass }, { status: 200 });
    } catch (error) {
        console.error("Error updating class:", error);
        if (session) {
            console.log("Aborting transaction");
            await session.abortTransaction();
            console.log("Transaction aborted");
        }
        return NextResponse.json({ error: "Failed to Update" }, { status: 500 });
    } finally {
        if (session) {
            console.log("Ending session");
            await session.endSession();
            console.log("Session ended");
        }
    }
}
export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");
        const department = searchParams.get("department");

        let filter = {};
        if (_id) filter._id = _id;
        if (department) filter.department = department;

        console.log("Filter criteria:", filter);

        const classes = await Classes.find(filter)
            .populate('teacher', 'name')
            .populate('students', '_id rollNumber name')
            .lean();

        if (classes.length === 0) {
            console.log("No classes found for criteria:", filter);
            return NextResponse.json({ status: 404 });
        }
        return NextResponse.json(classes, { status: 200 });
    } catch (error) {
        console.error("Error fetching classes:", error);
        return NextResponse.json({ error: "Failed to Fetch Classes" }, { status: 500 });
    }
}

export async function DELETE(req) {
    let session;
    try {
        await connectMongoDB();
        session = await mongoose.startSession();
        session.startTransaction();

        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");

        const deletedClass = await Classes.findByIdAndDelete(_id).session(session);

        if (!deletedClass) {
            await session.abortTransaction();
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        await Student.updateMany(
            { _id: { $in: deletedClass.students } },
            { $unset: { class: "" } },
            { session }
        );

        await Faculty.updateOne(
            { _id: deletedClass.teacher },
            { 
                $pull: { coordinatedClasses: deletedClass._id },
                $unset: { classes: "" }
            },
            { session }
        );

        await session.commitTransaction();
        console.log("Class Deleted Successfully", deletedClass);
        return NextResponse.json({ message: "Class Deleted Successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting class:", error);
        if (session) {
            await session.abortTransaction();
        }
        return NextResponse.json({ error: "Failed to Delete" }, { status: 500 });
    } finally {
        if (session) {
            session.endSession();
        }
    }
}