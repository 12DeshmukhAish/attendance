import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";
import Faculty from "@/models/faculty";

export async function GET() {
    try {
        await connectMongoDB();
        const subjects = await Subject.find().lean();
        const teachers = await Faculty.find().lean();
        return NextResponse.json({ subjects, teachers }, { status: 200 });
    } catch (error) {
        console.error("Error fetching subjects and teachers:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
