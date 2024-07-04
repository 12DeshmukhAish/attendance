import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Classes from "@/models/className";

export async function POST(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { className, students, classCoordinator } = data;

        const newClass = new Classes({
            name:className,
            students,
            teacher:classCoordinator
        });

        await newClass.save();
        console.log("Class Registered Successfully", newClass);
        return NextResponse.json({ message: "Class Registered Successfully", class: newClass }, { status: 201 });
    } 
    catch (error) {
        console.error("Error creating class:", error);
        return NextResponse.json({ error: "Failed to Register" }, { status: 500 });
    }
}

// PUT route to update an existing class
export async function PUT(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { _id, className, students, classCoordinator } = data;
        const existingClass = await Classes.findByIdAndUpdate(_id, {
            name:className,
            students,
            teacher:classCoordinator
        }, { new: true });

        if (!existingClass) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }
        console.log("Class Updated Successfully", existingClass);
        return NextResponse.json({ message: "Class Updated Successfully", class: existingClass }, { status: 200 });
    } catch (error) {
        console.error("Error updating class:", error);
        return NextResponse.json({ error: "Failed to Update" }, { status: 500 });
    }
}

// GET route to fetch all classes or a single class by _id
export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");

        if (_id) {
            const classData = await Classes.findById(_id);
            if (!classData) {
                return NextResponse.json({ error: "Class not found" }, { status: 404 });
            }
            console.log("Fetched Class Successfully", classData);
            return NextResponse.json(classData, { status: 200 });
        } else {
            const classes = await Classes.find();
            console.log("Fetched Classes Successfully", classes);
            return NextResponse.json(classes, { status: 200 });
        }
    } catch (error) {
        console.error("Error fetching classes:", error);
        return NextResponse.json({ error: "Failed to Fetch Classes" }, { status: 500 });
    }
}

// DELETE route to delete a class by _id
export async function DELETE(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");
        const deletedClass = await Classes.findByIdAndDelete(_id);

        if (!deletedClass) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        console.log("Class Deleted Successfully", deletedClass);
        return NextResponse.json({ message: "Class Deleted Successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting class:", error);
        return NextResponse.json({ error: "Failed to Delete" }, { status: 500 });
    }
}
