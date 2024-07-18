import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";

export async function PUT(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");

        if (!_id) {
            return NextResponse.json({ error: "Subject ID is required" }, { status: 400 });
        }

        const data = await req.json();
console.log(data);
        if (!data.content) {
            return NextResponse.json({ error: "Content data is required" }, { status: 400 });
        }

        const existingSubject = await Subject.findByIdAndUpdate(_id, {
            content: data.content
        }, { new: true });
console.log(existingSubject);
        if (!existingSubject) {
            return NextResponse.json({ error: "Subject not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Subject updated successfully", subject: existingSubject }, { status: 200 });
    } catch (error) {
        console.error("Error updating subject:", error);
        return NextResponse.json({ error: "Failed to update subject", details: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");

        if (!_id) {
            return NextResponse.json({ error: "Subject ID is required" }, { status: 400 });
        }

        const existingSubject = await Subject.findById(_id).populate('class teacher', 'name');

        if (!existingSubject) {
            return NextResponse.json({ error: "Subject not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Subject fetched successfully", subject: existingSubject }, { status: 200 });
    } catch (error) {
        console.error("Error fetching subject:", error);
        return NextResponse.json({ error: "Failed to fetch subject", details: error.message }, { status: 500 });
    }
}
