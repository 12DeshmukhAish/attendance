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
    const batchId = searchParams.get("batchId");

    if (!subjectId || !dateString || !session) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }
    const date = new Date(dateString);
    const subject = await Subject.findById(subjectId).populate('class teacher', 'name');

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    let batches = [];
    let students = [];
    
    const classDoc = await Classes.findById(subject.class).lean();
    
    if (subject.subType === 'practical') {
      if (classDoc && classDoc.batches) {
        batches = classDoc.batches.map(batch => (batch._id ));
      }
      
      if (batchId) {
        const selectedBatch = classDoc.batches.find(batch => batch._id === batchId);
        if (selectedBatch) {
          students = await Student.find({ _id: { $in: selectedBatch.students } }, 'name _id rollNumber');
        }
      }
    } else if (subject.subType === 'theory') {
      // For theory subjects, get all students in the class
      students = await Student.find({ _id: { $in: classDoc.students } }, 'name _id rollNumber');
    }

    const attendanceQuery = {
      subject: subjectId,
      date: { "$gte": new Date(date.setUTCHours(0, 0, 0, 0)), "$lt": new Date(date.setUTCHours(23, 59, 59, 999)) },
      session: parseInt(session)
    };
    if (batchId) attendanceQuery.batch = batchId;

    const attendanceRecord = await Attendance.findOne(attendanceQuery);
    
console.log(attendanceRecord);
    const studentsWithAttendance = students.map(student => ({
      _id: student._id,
      name: student.name,
      rollNumber: student.rollNumber,
      status: attendanceRecord?.records?.find(record => record.student.status)
    }));

    return NextResponse.json({
      message: "Data fetched successfully",
      subject,
      students: studentsWithAttendance,
      attendanceRecord: attendanceRecord || null,
      batches: batches.length > 0 ? batches : null
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

    if (!subjectId || !session || !attendanceData) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const result = await Attendance.findOneAndUpdate(
      {
        subject: subjectId,
        session: parseInt(session)
      },
      {
        $set: {
          subject: subjectId,
          session: parseInt(session),
          records: attendanceData.map(record => ({
            student: record.studentId,
            status: record.status
          }))
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