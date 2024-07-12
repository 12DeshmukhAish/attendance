import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";

export async function PUT(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");
        const data = await req.json();

        const existingSubject = await Subject.findByIdAndUpdate(_id, {
            content: data.content
        }, { new: true });

        if (!existingSubject) {
            return NextResponse.json({ error: "Subject not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Subject Updated Successfully", subject: existingSubject }, { status: 200 });
    } catch (error) {
        console.error("Error updating subject:", error);
        return NextResponse.json({ error: "Failed to Update", details: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");

        const existingSubject = await Subject.findById(_id).populate('class teacher', 'name');

        if (!existingSubject) {
            return NextResponse.json({ error: "Subject not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Subject fetched Successfully", subject: existingSubject }, { status: 200 });
    } catch (error) {
        console.error("Error to find subject:", error);
        return NextResponse.json({ error: "Failed to fetch", details: error.message }, { status: 500 });
    }
}
