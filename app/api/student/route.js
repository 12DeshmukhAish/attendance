import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Student from "@/models/student";
import Classes from "@/models/className";

export async function POST(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { _id, rollNumber, name, passOutYear, department, password } = data;

        // Find the corresponding class by passOutYear and department
        const classInfo = await Classes.findOne({ passOutYear, department });

        if (!classInfo) {
            throw new Error("Class not found for passOutYear and department");
        }

        const newStudent = new Student({
            _id,
            rollNumber,
            name,
            passOutYear,
            department,
            password: password || "1234",
            class: classInfo._id 
        });

        await newStudent.save();
        console.log("Student Registered Successfully", newStudent);

        const classUpdateResult = await Classes.findByIdAndUpdate(classInfo._id, {
            $addToSet: { students: _id }
        });

        if (!classUpdateResult) {
            throw new Error("Failed to update Class");
        }

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
        const { _id, rollNumber, name, passOutYear, department, password } = data;

        const existingStudent = await Student.findByIdAndUpdate(_id, {
            rollNumber,
            name,
            passOutYear,
            department,
            password
        }, { new: true });

        if (!existingStudent) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }
        console.log("Student Updated Successfully", existingStudent);

        // Find the old and new classes by passOutYear and department
        const oldClassInfo = await Classes.findOne({ passOutYear: existingStudent.passOutYear, department: existingStudent.department });
        const newClassInfo = await Classes.findOne({ passOutYear, department });

        if (!oldClassInfo || !newClassInfo) {
            throw new Error("Old or New Class not found for passOutYear and department");
        }

        const classUpdateOld = await Classes.findByIdAndUpdate(oldClassInfo._id, {
            $pull: { students: _id }
        });

        if (!classUpdateOld) {
            throw new Error("Failed to update Old Class");
        }

        // Update new Classes collection
        const classUpdateNew = await Classes.findByIdAndUpdate(newClassInfo._id, {
            $addToSet: { students: _id }
        });

        if (!classUpdateNew) {
            throw new Error("Failed to update New Class");
        }

        return NextResponse.json({ message: "Student Updated Successfully", student: existingStudent }, { status: 200 });
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

        // Find the class by passOutYear
        const classInfo = await Classes.findById(deletedStudent.class);

        if (!classInfo) {
            throw new Error("Class not found for student");
        }

        // Update Classes collection
        const classUpdateResult = await Classes.findByIdAndUpdate(classInfo._id, {
            $pull: { students: _id }
        });

        if (!classUpdateResult) {
            throw new Error("Failed to update Class");
        }

        return NextResponse.json({ message: "Student Deleted Successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting student:", error);
        return NextResponse.json({ error: "Failed to Delete" }, { status: 500 });
    }
}

