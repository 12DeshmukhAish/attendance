import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";

export async function GET(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");

    if (!subjectId ) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }
    const subject = await Subject.findById(subjectId).select("name subType batch content");
    console.log(subject);

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Data fetched successfully",
      subject
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching subject data:", error);
    return NextResponse.json({ error: "Failed to fetch data", details: error.message }, { status: 500 });
  }
}
