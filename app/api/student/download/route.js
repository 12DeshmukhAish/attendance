import { connectMongoDB } from "@/lib/connectDb";
import Student from "@/models/student";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department");
    await connectMongoDB();
    const students = await Student.find({department}).lean();
    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching student data:', error);
    return NextResponse.json({ error: "Failed to fetch student data" }, { status: 500 });
  }
}