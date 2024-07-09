import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";
import Classes from "@/models/className";
import Student from "@/models/student";
import Faculty from "@/models/faculty";

// POST operation - Create new subject
export async function POST(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { _id, name, class: classId, teacher, department, subType, content } = data;

        const newContent = content.map(item => ({
            name: item.name,
            status: item.status || 'not_covered'
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

        // Update the Class document
        const classUpdateResult = await Classes.findByIdAndUpdate(classId, {
            $addToSet: { subjects: _id }
        });

        if (!classUpdateResult) {
            throw new Error("Class not found");
        }

        // Update Student documents
        const studentUpdateResult = await Student.updateMany(
            { class: classId },
            { $addToSet: { subjects: _id } }
        );

        // Update the Faculty document
        const facultyUpdateResult = await Faculty.findByIdAndUpdate(teacher, {
            $addToSet: { subjects: _id }
        });

        if (!facultyUpdateResult) {
            throw new Error("Faculty not found");
        }

        console.log("Subject Registered Successfully", newSubject);

        // Return response
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
            name: item.name,
            status: item.status || 'not_covered'
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

        // Update Class document
        const classUpdateResult = await Classes.findByIdAndUpdate(classId, {
            $addToSet: { subjects: _id }
        });

        if (!classUpdateResult) {
            throw new Error("Class not found");
        }

        // Update Student documents
        const studentUpdateResult = await Student.updateMany(
            { class: classId },
            { $addToSet: { subjects: _id } }
        );

        // Update Faculty document
        const facultyUpdateResult = await Faculty.findByIdAndUpdate(teacher, {
            $addToSet: { subjects: _id }
        });

        if (!facultyUpdateResult) {
            throw new Error("Faculty not found");
        }

        console.log("Subject Updated Successfully", existingSubject);

        // Return response
        return NextResponse.json({ message: "Subject Updated Successfully", subject: existingSubject }, { status: 200 });
    } catch (error) {
        console.error("Error updating subject:", error);
        return NextResponse.json({ error: "Failed to Update", details: error.message }, { status: 500 });
    }
}


// DELETE operation - Delete subject
export async function DELETE(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");

        // Find the subject to be deleted
        const deletedSubject = await Subject.findByIdAndDelete(_id);

        if (!deletedSubject) {
            return NextResponse.json({ error: "Subject not found" }, { status: 404 });
        }

        // Update Class document to remove the subject reference
        const classUpdateResult = await Classes.findByIdAndUpdate(deletedSubject.class, {
            $pull: { subjects: _id }
        });

        if (!classUpdateResult) {
            throw new Error("Class not found");
        }

        // Update Student documents to remove the subject reference
        const studentUpdateResult = await Student.updateMany(
            { class: deletedSubject.class },
            { $pull: { subjects: _id } }
        );

        // Update Faculty document to remove the subject reference
        const facultyUpdateResult = await Faculty.findByIdAndUpdate(deletedSubject.teacher, {
            $pull: { subjects: _id }
        });

        if (!facultyUpdateResult) {
            throw new Error("Faculty not found");
        }

        console.log("Subject Deleted Successfully", deletedSubject);

        // Return response
        return NextResponse.json({ message: "Subject Deleted Successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting subject:", error);
        return NextResponse.json({ error: "Failed to Delete", details: error.message }, { status: 500 });
    }
}
export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");

        if (!_id) {
            return NextResponse.json({ error: "Missing subject ID" }, { status: 400 });
        }

        // Find subject by _id
        const subject = await Subject.findById(_id);
        if (!subject) {
            return NextResponse.json({ error: "Subject not found" }, { status: 404 });
        }

        // Fetch students by classId and department from the subject details
        const students = await Student.find({ class: subject.class, department: subject.department });

        return NextResponse.json({ subject, students }, { status: 200 });
    } catch (error) {
        console.error("Error fetching subject details and students:", error);
        return NextResponse.json({ error: "Failed to fetch subject details and students", details: error.message }, { status: 500 });
    }
}