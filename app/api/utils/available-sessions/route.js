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

    // Ensure the date is in the correct format (YYYY-MM-DD)
    const [year, month, day] = date.split('-').map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    const classData = await Classes.findById(subject.class);
    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    let attendanceQuery = {
      date: { $gte: startOfDay, $lte: endOfDay },
      subject: subjectId
    };

    if (subject.subType === 'practical' && batchId) {
      attendanceQuery.batch = batchId;
    }

    const takenAttendance = await Attendance.find(attendanceQuery).select('session');

    const takenSessions = takenAttendance.map(a => a.session);
    const allSessions = [1, 2, 3, 4, 5, 6, 7];
    const availableSessions = allSessions.filter(session => !takenSessions.includes(session));

    console.log('Date:', startOfDay);
    console.log('Subject:', subjectId);
    console.log('Batch:', batchId);
    console.log('Taken Sessions:', takenSessions);
    console.log('Available Sessions:', availableSessions);

    return NextResponse.json({ availableSessions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching available sessions:", error);
    return NextResponse.json({ error: "Failed to fetch available sessions" }, { status: 500 });
  }
}