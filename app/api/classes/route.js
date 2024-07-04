import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Classes from "@/models/className";
import Student from "@/models/student";

export async function POST(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { className, passOutYear, classCoordinator } = data;

        const studentIds = await Student.find({ passOutYear }, "_id").lean();

        const newClass = new Classes({
            name: className,
            students: studentIds.map(student => student._id),
            teacher: classCoordinator,
            passOutYear
        });

        await newClass.save();

        await Student.updateMany(
            { _id: { $in: studentIds.map(student => student._id) } },
            { $set: { class: newClass._id } }
        );

        console.log("Class Registered Successfully", newClass);
        return NextResponse.json({ message: "Class Registered Successfully", class: newClass }, { status: 201 });
    } catch (error) {
        console.error("Error creating class:", error);
        return NextResponse.json({ error: "Failed to Register" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");

        const data = await req.json();
        const { className, students, classCoordinator, passOutYear } = data;
        const existingClass = await Classes.findById(_id);

        if (!existingClass) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        const previousStudentIds = existingClass.students;

        existingClass.name = className;
        existingClass.students = students;
        existingClass.teacher = classCoordinator;
        existingClass.passOutYear = passOutYear;

        await existingClass.save();

        // Remove class reference from previous students
        await Student.updateMany(
            { _id: { $in: previousStudentIds } },
            { $unset: { class: "" } }
        );

        // Add class reference to new students
        await Student.updateMany(
            { _id: { $in: students } },
            { $set: { class: existingClass._id } }
        );

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
