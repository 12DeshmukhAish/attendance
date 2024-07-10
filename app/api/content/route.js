import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";

// POST operation - Add new content to a subject
export async function POST(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { subjectId, content } = data;

        const updatedContent = content.map(item => ({
            name: item.name,
            status: item.status || 'not_covered'
        }));

        const updatedSubject = await Subject.findByIdAndUpdate(subjectId, {
            $addToSet: { content: { $each: updatedContent } }
        }, { new: true });

        if (!updatedSubject) {
            return NextResponse.json({ error: "Subject not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Content added successfully", subject: updatedSubject }, { status: 201 });
    } catch (error) {
        console.error("Error adding content:", error);
        return NextResponse.json({ error: "Failed to add content", details: error.message }, { status: 500 });
    }
}

// PUT operation - Update content of a subject
export async function PUT(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const subjectId = searchParams.get("subjectId");
        const data = await req.json();
        const { content } = data;

        const updatedContent = content.map(item => ({
            name: item.name,
            status: item.status || 'not_covered'
        }));

        const updatedSubject = await Subject.findByIdAndUpdate(subjectId, {
            $set: { content: updatedContent }
        }, { new: true });

        if (!updatedSubject) {
            return NextResponse.json({ error: "Subject not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Content updated successfully", subject: updatedSubject }, { status: 200 });
    } catch (error) {
        console.error("Error updating content:", error);
        return NextResponse.json({ error: "Failed to update content", details: error.message }, { status: 500 });
    }
}

// DELETE operation - Remove content from a subject
export async function DELETE(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const subjectId = searchParams.get("subjectId");
        const contentId = searchParams.get("contentId");

        const updatedSubject = await Subject.findByIdAndUpdate(subjectId, {
            $pull: { content: { _id: contentId } }
        }, { new: true });

        if (!updatedSubject) {
            return NextResponse.json({ error: "Subject or content not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Content removed successfully", subject: updatedSubject }, { status: 200 });
    } catch (error) {
        console.error("Error removing content:", error);
        return NextResponse.json({ error: "Failed to remove content", details: error.message }, { status: 500 });
    }
}

// GET operation - Fetch content of a subject
export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const subjectId = searchParams.get("subjectId");

        if (!subjectId) {
            return NextResponse.json({ error: "Missing subject ID" }, { status: 400 });
        }

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return NextResponse.json({ error: "Subject not found" }, { status: 404 });
        }

        return NextResponse.json({ content: subject.content }, { status: 200 });
    } catch (error) {
        console.error("Error fetching content:", error);
        return NextResponse.json({ error: "Failed to fetch content", details: error.message }, { status: 500 });
    }
}
