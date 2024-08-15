// pages/api/utils/available-sessions.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Attendance from "@/models/attendance";
import Subject from "@/models/subject";
import Classes from "@/models/className";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const subjectId = searchParams.get("subjectId");
  const batchId = searchParams.get("batchId");

  try {
    await connectMongoDB();

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    const classData = await Classes.findById(subject.class);
    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    let theoryAttendanceQuery = {
      date: { $gte: startOfDay, $lte: endOfDay },
      subject: { $in: classData.subjects },
      batch: { $exists: false }  // Theory sessions don't have a batch
    };

    let practicalAttendanceQuery = {
      date: { $gte: startOfDay, $lte: endOfDay },
      subject: { $in: classData.subjects },
      batch: { $exists: true }
    };

    if (batchId) {
      practicalAttendanceQuery.batch = batchId;
    }

    const theoryAttendance = await Attendance.find(theoryAttendanceQuery).select('session');
    const practicalAttendance = await Attendance.find(practicalAttendanceQuery).select('session');

    const takenSessions = [
      ...theoryAttendance.map(a => a.session),
      ...practicalAttendance.map(a => a.session)
    ];

    const allSessions = [1, 2, 3, 4, 5, 6, 7];
    const availableSessions = allSessions.filter(session => !takenSessions.includes(session));

    return NextResponse.json({ availableSessions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching available sessions:", error);
    return NextResponse.json({ error: "Failed to fetch available sessions" }, { status: 500 });
  }
}