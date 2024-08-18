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

    let students = [];
    
    const classDoc = await Classes.findById(subject.class).lean();
    
    if (subject.subType === 'practical' || subject.subType === 'tg') {
      if (batchId) {
        const selectedBatch = classDoc.batches.find(batch => batch._id.toString() === batchId);
        if (selectedBatch) {
          students = await Student.find({ _id: { $in: selectedBatch.students } }, 'name _id rollNumber').lean();
        }
      }
    } else {
      students = await Student.find({ class: subject.class, subjects: subjectId }, 'name _id rollNumber').lean();
    }
   
    const attendanceQuery = {
      subject: subjectId,
      date: { "$gte": new Date(date.setUTCHours(0, 0, 0, 0)), "$lt": new Date(date.setUTCHours(23, 59, 59, 999)) },
      session: parseInt(session)
    };
    if (subject.subType !== 'theory' && batchId) attendanceQuery.batch = batchId;

    const attendanceRecord = await Attendance.findOne(attendanceQuery).lean();
    
    const studentsWithAttendance = students.map(student => ({
      _id: student._id,
      name: student.name,
      rollNumber: student.rollNumber,
      status: attendanceRecord?.records.find(r => r.student.toString() === student._id.toString())?.status || 'absent'
    }));
    
    return NextResponse.json({
      message: "Data fetched successfully",
      students: studentsWithAttendance,
      attendanceRecord: attendanceRecord || null,
      subject: {
        _id: subject._id,
        name: subject.name,
        subType: subject.subType,
        content: subject.content,
        tgSessions: subject.tgSessions
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching subject attendance:", error);
    return NextResponse.json({ error: "Failed to fetch data", details: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectMongoDB();
    const { subject, date, session, batchId, attendanceRecords, contents, pointsDiscussed } = await req.json();

    if (!subject || !date || !session || !attendanceRecords) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const attendanceDate = new Date(date);
    const startOfDay = new Date(Date.UTC(attendanceDate.getUTCFullYear(), attendanceDate.getUTCMonth(), attendanceDate.getUTCDate()));
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    const filter = {
      subject,
      date: { $gte: startOfDay, $lt: endOfDay },
      session: parseInt(session)
    };

    if (batchId) {
      filter.batch = batchId;
    }

    const update = {
      $set: {
        records: attendanceRecords.map(record => ({
          student: record.student,
          status: record.status
        }))
      }
    };

    const options = { upsert: true, new: true };

    const attendanceResult = await Attendance.findOneAndUpdate(filter, update, options);

    // Update subject content or TG session
    const subjectDoc = await Subject.findById(subject);

    if (subjectDoc.subType === 'tg' && pointsDiscussed) {
      const tgSessionIndex = subjectDoc.tgSessions.findIndex(
        session => session.date.toISOString().split('T')[0] === date
      );

      if (tgSessionIndex !== -1) {
        subjectDoc.tgSessions[tgSessionIndex].pointsDiscussed = pointsDiscussed;
      } else {
        subjectDoc.tgSessions.push({ date: attendanceDate, pointsDiscussed });
      }
    } else if (contents && contents.length > 0) {
      const indianFormattedDate = attendanceDate.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      subjectDoc.content.forEach(content => {
        if (contents.includes(content._id.toString())) {
          content.status = 'covered';
          content.completedDate = indianFormattedDate;
        }
      });
    }

    await subjectDoc.save();

    return NextResponse.json({ 
      message: "Attendance and subject data updated successfully", 
      attendance: attendanceResult,
      subject: subjectDoc
    }, { status: 200 });

  } catch (error) {
    console.error("Failed to update attendance:", error);
    return NextResponse.json({ error: "Failed to update", details: error.message }, { status: 500 });
  }
}