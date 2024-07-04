import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";
import mongoose from 'mongoose';

// POST route to create a new subject
export async function POST(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { name, classId, teacher, content } = data;

        // Validate and convert classId and teacher to ObjectId
        const isValidObjectId = mongoose.Types.ObjectId.isValid;
        if (!isValidObjectId(classId) || !isValidObjectId(teacher)) {
            return NextResponse.json({ error: "Invalid ObjectId format for classId or teacher" }, { status: 400 });
        }

        const newSubject = new Subject({
            name,
            class: classId,
            teacher,
            content,
        });

        await newSubject.save();
        console.log("Subject Registered Successfully", newSubject);
        return NextResponse.json({ message: "Subject Registered Successfully", subject: newSubject }, { status: 201 });
    } catch (error) {
        console.error("Error creating subject:", error);
        return NextResponse.json({ error: "Failed to Register" }, { status: 500 });
    }
}
