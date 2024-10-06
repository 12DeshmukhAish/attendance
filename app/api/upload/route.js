import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Student from "@/models/student";
import mongoose from "mongoose";

export async function POST(req) {
    let session;
    try {
        await connectMongoDB();
        session = await mongoose.startSession();
        session.startTransaction();

        const data = await req.json();
        const { students } = data;
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

        const createdStudents = await Student.insertMany(processedStudents, { session });
        
        await session.commitTransaction();
        session.endSession();

        console.log("Students Registered Successfully");
        console.log(createdStudents);
        return NextResponse.json({ message: "Students Registered Successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error creating students:", error);
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        return NextResponse.json({ error: "Failed to Register" }, { status: 500 });
    }
}