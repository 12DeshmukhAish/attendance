import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Student from "@/models/student";
import Classes from "@/models/className";
import mongoose from "mongoose";

export async function POST(req) {
    let session;
    try {
        await connectMongoDB();
        session = await mongoose.startSession();
        session.startTransaction();

        const data = await req.json();
        const { students, classId } = data;
        console.log("Original data:", data);

        // Trim and process student data
        const processedStudents = students.map(student => ({
            ...student,
            name: student.name.trim(),
            email: student.email.trim().toLowerCase(),
            // Trim all other fields except name
            ...Object.fromEntries(
                Object.entries(student)
                    .filter(([key]) => key !== 'name' && key !== 'email')
                    .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
            )
        }));

        console.log("Processed data:", processedStudents);

        // Check for duplicate entries
        const duplicates = [];
        const newStudents = [];
        for (const student of processedStudents) {
            const existingStudent = await Student.findOne({ 
                $or: [
                    { email: student.email },
                    { rollNumber: student.rollNumber }
                ]
            }).session(session);

            if (existingStudent) {
                duplicates.push({ ...student, _id: existingStudent._id });
            } else {
                newStudents.push(student);
            }
        }

        if (duplicates.length > 0) {
            // If duplicates found, send confirmation request to client
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json({ 
                message: 'Duplicate entries found',
                duplicates,
                newStudents
            }, { status: 409 });
        }

        // If no duplicates, proceed with insertion
        const createdStudents = await Student.insertMany(newStudents, { session });

        // Update the class with new students if classId is provided
        if (classId) {
            await Classes.findByIdAndUpdate(
                classId,
                { $push: { students: { $each: createdStudents.map(s => s._id) } } },
                { session }
            );
        }

        await session.commitTransaction();
        session.endSession();

        console.log("Students Registered Successfully");
        console.log(createdStudents);
        return NextResponse.json({ message: "Students Registered Successfully", createdStudents }, { status: 201 });
    } catch (error) {
        console.error("Error creating students:", error);
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        return NextResponse.json({ error: "Failed to Register" }, { status: 500 });
    }
}

export async function PUT(req) {
    let session;
    try {
        await connectMongoDB();
        session = await mongoose.startSession();
        session.startTransaction();

        const data = await req.json();
        const { studentsToUpdate, classId } = data;
        console.log("Students to update:", studentsToUpdate);

        const updateResults = await Promise.all(studentsToUpdate.map(async (student) => {
            const filter = { _id: student._id };
            const update = { $set: student };
            const options = { new: true, session };

            return Student.findOneAndUpdate(filter, update, options);
        }));

        // Update the class with updated students if classId is provided
        if (classId) {
            await Classes.findByIdAndUpdate(
                classId,
                { $addToSet: { students: { $each: updateResults.map(s => s._id) } } },
                { session }
            );
        }

        await session.commitTransaction();
        session.endSession();

        console.log("Students Updated Successfully");
        return NextResponse.json({ 
            message: "Students Updated Successfully",
            updatedStudents: updateResults
        }, { status: 200 });
    } catch (error) {
        console.error("Error updating students:", error);
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        return NextResponse.json({ error: "Failed to Update Students" }, { status: 500 });
    }
}