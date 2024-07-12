import { connectMongoDB } from "@/lib/connectDb";
import { NextResponse } from "next/server";
import Attendance from "@/models/attendance";
import Subject from "@/models/subject"; // Assuming you have a Subject model imported
import Student from "@/models/student"; // Assuming you have a Student model imported

export async function PUT(req, { params }) {
    const { subjectId, date, session } = params;
    
    try {
        await connectMongoDB();
        const data = await req.json();
        const { records, contents } = data;

        const updatedAttendance = await Attendance.findOneAndUpdate(
            { subject: subjectId, date: new Date(date), session },
            { records },
            { new: true, upsert: true, runValidators: true }
        );

        if (contents && contents.length > 0) {
            await Subject.updateOne(
                { _id: subjectId },
                { $set: { "content.$[elem].status": "covered" } },
                { arrayFilters: [{ "elem.name": { $in: contents } }] }
            );
        }

        return NextResponse.JSON({ message: "Attendance updated successfully", attendance: updatedAttendance }, { status: 200 });
    } catch (error) {
        console.error("Error updating attendance:", error);
        return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 });
    }
}

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const date = new Date(searchParams.get("date")); // Ensure date is correctly parsed as Date object
    const session = searchParams.get("session");
    if (isNaN(session)) {
        return NextResponse.json({ error: "Invalid session parameter" }, { status: 400 });
    }
    try {
        await connectMongoDB();

        // Find attendance record for the subject, date, and session
        const attendance = await Attendance.findOne({ subject: subjectId, date, session })
                                          .populate('records.student', 'name rollNumber'); // Populate only name and rollNumber fields

        if (!attendance) {
            // If no attendance record is found, fetch students and return default status
            const students = await Student.find({ class: subjectId }, 'name rollNumber'); // Fetch only name and rollNumber
            const records = students.map(student => ({
                student: student._id,
                status: 'absent'
            }));
            return NextResponse.json({ records }, { status: 200 });
        }

        return NextResponse.json(attendance, { status: 200 });
    } catch (error) {
        console.error("Error fetching attendance:", error);
        return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
    }
}
