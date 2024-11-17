// import { NextResponse } from "next/server";
// import { connectMongoDB } from "@/lib/connectDb";
// import Attendance from "@/models/attendance";
// import Student from "@/models/student";
// import Classes from "@/models/className";

// export async function GET(req) {
//   try {
//     await connectMongoDB();
//     const { searchParams } = new URL(req.url);
//     const date = new Date(searchParams.get("date"));
//     const classId = searchParams.get("classId");

//     // Validate date and classId
//     if (isNaN(date.getTime())) {
//       return NextResponse.json({ error: "Invalid date" }, { status: 400 });
//     }
//     if (!classId) {
//       return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
//     }

//     const classDetails = await Classes.findById(classId);
//     if (!classDetails) {
//       return NextResponse.json({ error: "Class not found" }, { status: 404 });
//     }

//     // Get all subjects for the class
//     const subjects = classDetails.subjects;

//     // Find all sessions for the given date and subjects
//     const attendanceRecords = await Attendance.find({
//       date: {
//         $gte: new Date(date.setHours(0, 0, 0, 0)),
//         $lt: new Date(date.setHours(23, 59, 59, 999))
//       },
//       subject: { $in: subjects }
//     }).sort({ session: 1 });

//     if (attendanceRecords.length === 0) {
//       return NextResponse.json({ message: "No attendance records found for the given date and class" }, { status: 404 });
//     }

//     // Get all students in the class
//     const allStudents = await Student.find({ _id: { $in: classDetails.students } });

//     // Create a map to store absent students for each session
//     const absentStudentsBySession = new Map();
//     const absentCountByStudent = new Map();

//     // Process each session
//     attendanceRecords.forEach(record => {
//       const presentStudents = new Set(record.records.filter(r => r.status === 'present').map(r => r.student));
//       const absentStudents = allStudents.filter(student => !presentStudents.has(student._id.toString()));
      
//       absentStudentsBySession.set(record.session, absentStudents.map(student => {
//         const studentId = student._id.toString();
//         absentCountByStudent.set(studentId, (absentCountByStudent.get(studentId) || 0) + 1);
//         return {
//           _id: student._id,
//           name: student.name,
//           rollNumber: student.rollNumber,
//           email: student.email,
//           phoneNo: student.phoneNo,
//           totalAbsentSessions: absentCountByStudent.get(studentId)
//         };
//       }));
//     });

//     // Prepare the response
//     const response = {
//       date: date,
//       class: classDetails._id,
//       totalSessions: attendanceRecords.length,
//       absentees: Array.from(absentStudentsBySession.entries()).map(([session, students]) => ({
//         session: session,
//         subject: attendanceRecords.find(r => r.session === session).subject,
//         absentStudents: students
//       }))
//     };

//     console.log(response);
    
//     return NextResponse.json(response, { status: 200 });

//   } catch (error) {
//     console.error("Error fetching absent students:", error);
//     return NextResponse.json({ error: "Failed to fetch absent students" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Attendance from "@/models/attendance";
import Student from "@/models/student";
import Classes from "@/models/className";
import Subject from "@/models/subject";

export async function GET(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const date = new Date(searchParams.get("date"));
    const classId = searchParams.get("classId");

    // Validate date and classId
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    if (!classId) {
      return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
    }

    const classDetails = await Classes.findById(classId);
    if (!classDetails) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Get all subjects for the class
    const subjects = await Subject.find({ class: classId });
    const subjectIds = subjects.map(subject => subject._id);

    // Find all sessions for the given date and subjects
    const attendanceRecords = await Attendance.find({
      date: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      },
      subject: { $in: subjectIds }
    }).sort({ session: 1 });

    if (attendanceRecords.length === 0) {
      return NextResponse.json({ message: "No attendance records found for the given date and class" }, { status: 404 });
    }

    // Get all students in the class
    const allStudents = await Student.find({ class: classId });

    // Create a map to store absent students for each session
    const absentStudentsBySession = new Map();
    const absentCountByStudent = new Map();

    // Process each session
    attendanceRecords.forEach(record => {
      const presentStudents = new Set(record.records.filter(r => r.status === 'present').map(r => r.student));
      const absentStudents = allStudents.filter(student => !presentStudents.has(student._id));
      
      absentStudentsBySession.set(record.session, absentStudents.map(student => {
        const studentId = student._id;
        absentCountByStudent.set(studentId, (absentCountByStudent.get(studentId) || 0) + 1);
        return {
          _id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          email: student.email,
          phoneNo: student.phoneNo,
          totalAbsentSessions: absentCountByStudent.get(studentId)
        };
      }));
    });

    // Prepare the response
    const response = {
      date: date,
      class: classDetails._id,
      totalSessions: attendanceRecords.length,
      absentees: await Promise.all(Array.from(absentStudentsBySession.entries()).map(async ([session, students]) => {
        const attendanceRecord = attendanceRecords.find(r => r.session === session);
        const subject = await Subject.findById(attendanceRecord.subject);
        return {
          session: session,
          subject: subject ? subject.name : 'Unknown Subject',
          absentStudents: students
        };
      }))
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error("Error fetching absent students:", error);
    return NextResponse.json({ error: "Failed to fetch absent students" }, { status: 500 });
  }
}