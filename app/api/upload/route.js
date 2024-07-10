import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Student from "@/models/student"

export async function POST(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { students} = data;
        console.log(data);
        const createdStudents = await Student.insertMany(students);
        console.log("Student Registered Successfully");
        console.log(createdStudents);
        return NextResponse.json({ message: "Student Registered Successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error creating student:", error);
        return NextResponse.json({ error: "Failed to Register" }, { status: 500 });
    }
}