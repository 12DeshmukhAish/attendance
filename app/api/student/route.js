import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Student from "@/models/student";
import Classes from "@/models/className";

export async function POST(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { _id, rollNumber, name, passOutYear, department, password, year } = data;
        console.log(data);

        const newStudent = new Student({
            _id,
            rollNumber,
            name,
            passOutYear,
            department,
            password: password || "1234",
            year
        });

        await newStudent.save();
        console.log("Student Registered Successfully", newStudent);

        return NextResponse.json({ message: "Student Registered Successfully", student: newStudent }, { status: 201 });
    } catch (error) {
        console.error("Error creating student:", error);
        return NextResponse.json({ error: "Failed to Register" }, { status: 500 });
    }
}
export async function PUT(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { _id, rollNumber, name, passOutYear, department, password, year } = data;

        const existingStudent = await Student.findByIdAndUpdate(_id, {
            rollNumber,
            name,
            passOutYear,
            department,
            year,
            password
        }, { new: true });

        if (!updatedStudent) {
            throw new Error("Failed to update student's class field");
        }

        return NextResponse.json({ message: "Student Updated Successfully", student: updatedStudent }, { status: 200 });
    } catch (error) {
        console.error("Error updating student:", error);
        return NextResponse.json({ error: "Failed to Update" }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");
        const rollNumber = searchParams.get("rollNumber");
        const name = searchParams.get("name");
        const passOutYear = searchParams.get("passOutYear");
        const department = searchParams.get("department");
        const password = searchParams.get("password");
        const year = searchParams.get("year");
        let filter = {};

        if (_id) {
            filter._id = _id;
        }
        if (rollNumber) {
            filter.rollNumber = rollNumber;
        }
        if (name) {
            filter.name = { $regex: name, $options: "i" }; // case-insensitive regex search
        }
        if (passOutYear) {
            filter.passOutYear = passOutYear;
        }
        if (department) {
            filter.department = department;
        }
        if (year) filter.year = year;
        const students = await Student.find(filter);

        if (students.length === 0) {
            return NextResponse.json({ error: "No students found" }, { status: 404 });
        }

        console.log("Fetched Students Successfully", students);
        return NextResponse.json(students, { status: 200 });
    } catch (error) {
        console.error("Error fetching students:", error);
        return NextResponse.json({ error: "Failed to Fetch Students" }, { status: 500 });
    }
}// DELETE operation - Delete Student
export async function DELETE(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");
        const deletedStudent = await Student.findByIdAndDelete(_id);

        if (!deletedStudent) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        console.log("Student Deleted Successfully", deletedStudent);
        if (deletedStudent.class) {
            const classInfo = await Classes.findById(deletedStudent.class);

        
        if (!classInfo) {
            throw new Error("Class not found for student");
        }

        const classUpdateResult = await Classes.findByIdAndUpdate(classInfo._id, {
            $pull: { students: _id }
        });

        if (!classUpdateResult) {
            throw new Error("Failed to update Class");
        }
    }
        return NextResponse.json({ message: "Student Deleted Successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting student:", error);
        return NextResponse.json({ error: "Failed to Delete" }, { status: 500 });
    }
}

