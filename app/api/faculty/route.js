import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Faculty from "@/models/faculty";

export async function POST(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const {facultyId, name, department, email,password } = data;

        const newFaculty = new Faculty({
            _id:facultyId,
            name,
            department,
            email,
            password
        });

        await newFaculty.save();
        console.log("Faculty Registered Successfully", newFaculty);
        return NextResponse.json({ message: "Faculty Registered Successfully", faculty: newFaculty }, { status: 201 });
    } catch (error) {
        console.error("Error creating faculty:", error);
        return NextResponse.json({ error: "Failed to Register" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { _id, facultyId, name, department, email,password } = data;
        console.log(data);        
        const existingFaculty = await Faculty.findByIdAndUpdate(_id, {
            facultyId,
            name,
            department,
            email,
            password
        }, { new: true });

        if (!existingFaculty) {
            return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
        }
        console.log("Faculty Updated Successfully", existingFaculty);
        return NextResponse.json({ message: "Faculty Updated Successfully", faculty: existingFaculty }, { status: 200 });
    } catch (error) {
        console.error("Error updating faculty:", error);
        return NextResponse.json({ error: "Failed to Update" }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");

        if (_id) {
            const faculty = await Faculty.findById(_id);
            if (!faculty) {
                return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
            }
            console.log("Fetched Faculty Successfully", faculty);
            return NextResponse.json(faculty, { status: 200 });
        } else {
            const faculties = await Faculty.find();
            console.log("Fetched Faculties Successfully", faculties);
            return NextResponse.json(faculties, { status: 200 });
        }
    } catch (error) {
        console.error("Error fetching faculties:", error);
        return NextResponse.json({ error: "Failed to Fetch Faculties" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");
        const deletedFaculty = await Faculty.findByIdAndDelete(_id);

        if (!deletedFaculty) {
            return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
        }

        console.log("Faculty Deleted Successfully", deletedFaculty);
        return NextResponse.json({ message: "Faculty Deleted Successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting faculty:", error);
        return NextResponse.json({ error: "Failed to Delete" }, { status: 500 });
    }
}
