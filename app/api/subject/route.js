import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";


export async function POST(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { _id, name, class: classId, teacher, department, subType, content } = data;

        const newContent = content.map(item => ({
            name: item.name,  // Access the name property
            status: item.status || 'not_covered'  // Default status if not provided
        }));

        const newSubject = new Subject({
            _id,
            name,
            class: classId,
            teacher,
            department,
            subType,
            content: newContent
        });

        await newSubject.save();
        console.log("Subject Registered Successfully", newSubject);
        return NextResponse.json({ message: "Subject Registered Successfully", subject: newSubject }, { status: 201 });
    } catch (error) {
        console.error("Error creating subject:", error);
        return NextResponse.json({ error: "Failed to Register", details: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");
        const data = await req.json();
        const { name, class: classId, teacher, department, subType, content } = data;

        const updatedContent = content.map(item => ({
            name: item.name,  // Access the name property
            status: item.status || 'not_covered'  // Default status if not provided
        }));

        const existingSubject = await Subject.findByIdAndUpdate(_id, {
            name,
            class: classId,
            teacher,
            department,
            subType,
            content: updatedContent
        }, { new: true });

        if (!existingSubject) {
            return NextResponse.json({ error: "Subject not found" }, { status: 404 });
        }

        console.log("Subject Updated Successfully", existingSubject);
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
        const subType = searchParams.get("subType")
        const department = searchParams.get("department")
        const classId = searchParams.get("class")
        console.log(department ,subType,classId);
        if (subType && department && classId) {
            const subjects = await Subject.find({ subType, department, class: classId });
            console.log("Fetched Subjects Successfully", subjects);
            return NextResponse.json(subjects, { status: 200 });
        } else if (subType && department) {
            const subjects = await Subject.find({ subType, department });
            console.log("Fetched Subjects Successfully", subjects);
            return NextResponse.json(subjects, { status: 200 });
        } else if (subType) {
            const subjects = await Subject.find({ subType });
            console.log("Fetched Subjects Successfully", subjects);
            return NextResponse.json(subjects, { status: 200 });
        } else {
            const subjects = await Subject.find();
            console.log("Fetched Subjects Successfully", subjects);
            return NextResponse.json(subjects, { status: 200 });
        }
    } catch (error) {
        console.error("Error fetching subjects:", error);
        return NextResponse.json({ error: "Failed to Fetch Subjects" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");
        const deletedSubject = await Subject.findByIdAndDelete(_id);

        if (!deletedSubject) {
            return NextResponse.json({ error: "Subject not found" }, { status: 404 });
        }
        console.log("Subject Deleted Successfully", deletedSubject);
        return NextResponse.json({ message: "Subject Deleted Successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting subject:", error);
        return NextResponse.json({ error: "Failed to Delete" }, { status: 500 });
    }
}
