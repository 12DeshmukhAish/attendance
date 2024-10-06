import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Classes from "@/models/className";
import Student from "@/models/student";
import Faculty from "@/models/faculty";
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

        await Student.updateMany(
            { _id: { $in: students } },
            { $set: { class: newClass._id } },
            { session }
        );

        await Faculty.findByIdAndUpdate(
            classCoordinator,
            { 
                $push: { coordinatedClasses: newClass._id },
                $set: { classes: newClass._id }
            },
            { new: true, session }
        );

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
    try {
        await connectMongoDB();
        session = await mongoose.startSession();
        session.startTransaction();

        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");

        const data = await req.json();
        const { classCoordinator, department, year, students, batches } = data;
        const existingClass = await Classes.findById(_id).session(session);

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

        await Student.updateMany(
            { _id: { $in: previousStudentIds } },
            { $unset: { class: "" } },
            { session }
        );

        await Student.updateMany(
            { _id: { $in: students } },
            { $set: { class: existingClass._id } },
            { session }
        );

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

        await existingClass.save({ session });

        await session.commitTransaction();
        console.log("Class Updated Successfully", existingClass);
        return NextResponse.json({ message: "Class Updated Successfully", class: existingClass }, { status: 200 });
    } catch (error) {
        console.error("Error updating class:", error);
        if (session) {
            await session.abortTransaction();
        }
        return NextResponse.json({ error: "Failed to Update" }, { status: 500 });
    } finally {
        if (session) {
            session.endSession();
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