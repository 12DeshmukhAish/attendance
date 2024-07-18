import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";
import Student from "@/models/student";
import Attendance from "@/models/attendance";
import Classes from "@/models/className"; 
export async function GET(req) {
  
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const dateString = searchParams.get("date");
    const session = searchParams.get("session");

    if (!subjectId || !dateString || !session) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Convert dateString to UTC format
    const date = new Date(dateString); // Ensure dateString is in UTC format ('YYYY-MM-DDTHH:MM:SSZ')

    // Find the subject details
    const subject = await Subject.findById(subjectId).populate('class teacher', 'name');

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Find students who belong to the subject
    const students = await Student.find({ subjects: subjectId }, 'name _id rollNumber'); // Fetch only name, _id, and rollNumber

    // Find the attendance record for the given subject, date, and session
    const attendanceRecord = await Attendance.findOne({
      subject: subjectId,
      date: { "$gte": new Date(date.setUTCHours(0, 0, 0, 0)), "$lt": new Date(date.setUTCHours(23, 59, 59, 999)) },
      session: parseInt(session)
    });

    // Prepare the student list with their attendance status
    const studentsWithAttendance = students.map(student => {
      const studentRecord = attendanceRecord && attendanceRecord.records.find(record =>
        record.student.toString() === student._id.toString()
      );
      return {
        _id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        status: studentRecord ? studentRecord.status : 'absent'
      };
    });

    return NextResponse.json({
      message: "Data fetched successfully",
      subject,
      students: studentsWithAttendance,
      attendanceRecord: attendanceRecord || null
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching subject attendance:", error);
    return NextResponse.json({ error: "Failed to fetch", details: error.message }, { status: 500 });
  }
}


export async function PUT(req) {
  try {
    await connectMongoDB();
    const { subjectId, session, attendanceData } = await req.json();
console.log(attendanceData);
    if (!subjectId  || !session || !attendanceData) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Parse date string to Date object (assuming date is in ISO format)
    // const parsedDate = new Date(date);

    const result = await Attendance.findOneAndUpdate(
      {
        subject: subjectId,
        // date: parsedDate,
        session: parseInt(session)
      },
      {
        $set: {
          subject: subjectId,
          // date: parsedDate,
          session: parseInt(session),
          records: attendanceData
        }
      },
      { upsert: true, new: true }
    );
console.log(result);
    return NextResponse.json({ message: "Attendance updated successfully", result }, { status: 200 });

  } catch (error) {
    console.error("Failed to update attendance:", error);
    return NextResponse.json({ error: "Failed to update", details: error.message }, { status: 500 });
  }
}