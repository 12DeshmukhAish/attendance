import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Student from "@/models/student";
import Classes from "@/models/className";

export async function POST(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { _id, rollNumber, name, department, phoneNo,email,password, year } = data;
        console.log(data);
        if(!department){
            console.log("department is not found",department);
            return NextResponse.json({error:"department is missing"})
          }
        const newStudent = new Student({
            _id,
            rollNumber,
            name,
            department,
            email,
            phoneNo,
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
        const { _id, rollNumber, name, department, phoneNo,email,password, year } = data;
        if(!department){
            console.log("department is not found",department);
            return NextResponse.json({error:"department is missing"})
          }
        const existingStudent = await Student.findByIdAndUpdate(_id, {
            rollNumber,
            name, 
            department,
            year,
            email,
            phoneNo,

            password
        }, { new: true });


        return NextResponse.json({ message: "Student Updated Successfully", student:existingStudent }, { status: 200 });
    } catch (error) {
        console.error("Error updating student:", error);
        return NextResponse.json({ error: "Failed to Update" }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("_id");
        const department = searchParams.get("department");
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 15;
        const filterValue = searchParams.get("filterValue");

        // If ID is provided, fetch only that student
        if (id) {
            const student = await Student.findById(id);
            if (!student) {
                return NextResponse.json({ error: "Student not found" }, { status: 404 });
            }
            return NextResponse.json( student , { status: 200 });
        }

        // Existing functionality for department and filter-based queries
        let filter = {};

        if (department) {
            filter.department = department;
        }

        if (filterValue) {
            filter.$or = [
                { name: { $regex: filterValue, $options: "i" } },
                { rollNumber: { $regex: filterValue, $options: "i" } }
            ];
        }

        const skip = (page - 1) * limit;

        const [students, totalStudents] = await Promise.all([
            Student.find(filter).skip(skip).limit(limit),
            Student.countDocuments(filter)
        ]);

        if (students.length === 0) {
            return NextResponse.json({ error: "No students found" }, { status: 404 });
        }

        console.log("Fetched Students Successfully", students);
        return NextResponse.json({ students, totalStudents }, { status: 200 });
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

