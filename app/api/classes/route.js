import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Classes from "@/models/className";
import Student from "@/models/student";

export async function POST(req) {
    try {
        await connectMongoDB();
        const data = await req.json();

        const { _id,className, passOutYear, classCoordinator, department } = data;


        let studentFilter = { passOutYear };
        if (department !== "FE") {
            studentFilter.department = department;
        }

        const studentIds = await Student.find(studentFilter, "_id").lean();
        console.log(studentIds);
        const newClass = new Classes({
            _id:classId,
            name: className,
            students: studentIds.map(student => student._id),
            teacher: classCoordinator,
            passOutYear,
            department
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
        const { className, students, classCoordinator, passOutYear, department } = data;
        const existingClass = await Classes.findById(_id);

        if (!existingClass) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        const previousStudentIds = existingClass.students;
        existingClass._id = classId;
        existingClass.name = className;
        existingClass.students = students;
        existingClass.teacher = classCoordinator;
        existingClass.passOutYear = passOutYear;
        existingClass.department = department;

        // If department changed, find new students based on the new department and passOutYear
        if (existingClass.department !== department) {
            let studentFilter = { passOutYear };
            if (department !== "FE") {
                studentFilter.department = department;
            }
            const newStudentIds = await Student.find(studentFilter, "_id").lean();
            existingClass.students = newStudentIds.map(student => student._id);

            // Update students to reference the new class
            await Student.updateMany(
                { _id: { $in: previousStudentIds } },
                { $unset: { class: "" } }
            );

            await Student.updateMany(
                { _id: { $in: newStudentIds.map(student => student._id) } },
                { $set: { class: existingClass._id } }
            );
        }

        await existingClass.save();

        console.log("Class Updated Successfully", existingClass);
        return NextResponse.json({ message: "Class Updated Successfully", class: existingClass }, { status: 200 });
    } catch (error) {
        console.error("Error updating class:", error);
        return NextResponse.json({ error: "Failed to Update" }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");
        const department = searchParams.get("department");
        const passOutYear = searchParams.get("passOutYear");

        let filter = {};
        if (_id) filter._id = _id;
        if (department) filter.department = department;
        if (passOutYear) filter.passOutYear = passOutYear;

        console.log("Filter criteria:", filter);

        const classes = await Classes.find(filter);

        if (classes.length === 0) {
            console.log("No classes found for criteria:", filter);
            return NextResponse.json({ error: "No classes found" }, { status: 404 });
        }

        console.log("Fetched Classes Successfully", classes);
        return NextResponse.json(classes, { status: 200 });
    } catch (error) {
        console.error("Error fetching classes:", error);
        return NextResponse.json({ error: "Failed to Fetch Classes" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");

        const deletedClass = await Classes.findByIdAndDelete(_id);

        if (!deletedClass) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        await Student.updateMany(
            { _id: { $in: deletedClass.students } },
            { $unset: { class: "" } }
        );

        console.log("Class Deleted Successfully", deletedClass);
        return NextResponse.json({ message: "Class Deleted Successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting class:", error);
        return NextResponse.json({ error: "Failed to Delete" }, { status: 500 });
    }
}
