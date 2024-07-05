import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Classes from "@/models/className";

export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const classId = searchParams.get("classId");
        console.log(classId);
        if (!classId) {
            return NextResponse.json({ error: "Class ID is required" },{status:400});
        }

        const classData = await Classes.findById(classId).populate('students', '_id name rollNo');

        if (!classData) {
            return NextResponse.json({ error: "Class not found" },{status:404});
        }

        // Return the students array
        return NextResponse.json(classData.students,{status:200});
    } catch (error) {
        console.error("Error fetching students:", error);
        return NextResponse.json({ error: "Internal Server Error" },{status:500});
    }
}