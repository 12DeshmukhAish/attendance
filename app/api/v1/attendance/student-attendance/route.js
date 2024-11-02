import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Attendance from "@/models/attendance";
import Subject from "@/models/subject";
import Student from "@/models/student";

export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");
        const semester = searchParams.get("semester");
        const academicYear = searchParams.get("academicYear");

        console.log("Received parameters:", { studentId, semester, academicYear });

        if (!studentId || !semester || !academicYear) {
            console.log("Missing required parameters");
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        // First, check if the student exists and get their details
        const student = await Student.findById(studentId)
            .select('name rollNumber class')
            .lean();

        if (!student) {
            console.log(`Student not found with ID: ${studentId}`);
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        // Get all subjects for the student's class, semester and academic year
        const subjects = await Subject.find({
            class: student.class,
            sem: semester,
            academicYear: academicYear,
            isActive: true
        }).select('_id name subType batch').lean();

        if (!subjects || subjects.length === 0) {
            console.log("No subjects found for the given parameters");
            return NextResponse.json({ error: "No subjects found" }, { status: 404 });
        }

        // Create a map of subject IDs for efficient lookup
        const subjectMap = new Map(subjects.map(sub => [sub._id, sub]));

        // Get attendance for all subjects
        const attendanceResults = await Promise.all(
            subjects.map(async (subject) => {
                const matchQuery = {
                    'records.student': studentId,
                    'subject': subject._id
                };

                // If it's a practical subject and has batches, we need to filter by the student's batch
                if (subject.subType === 'practical' && subject.batch && subject.batch.length > 0) {
                    matchQuery.batch = { $in: subject.batch };
                }

                const attendance = await Attendance.aggregate([
                    { $match: matchQuery },
                    { $unwind: '$records' },
                    { $match: { 'records.student': studentId } },
                    {
                        $group: {
                            _id: '$subject',
                            totalLectures: { $sum: 1 },
                            presentCount: {
                                $sum: { $cond: [{ $eq: ['$records.status', 'present'] }, 1, 0] }
                            }
                        }
                    }
                ]);

                const attendanceData = attendance[0] || {
                    _id: subject._id,
                    totalLectures: 0,
                    presentCount: 0
                };

                return {
                    subjectId: subject._id,
                    subjectName: subject.name,
                    subjectType: subject.subType,
                    totalLectures: attendanceData.totalLectures,
                    presentCount: attendanceData.presentCount,
                    percentage: attendanceData.totalLectures > 0
                        ? ((attendanceData.presentCount / attendanceData.totalLectures) * 100).toFixed(2)
                        : 0
                };
            })
        );

        const response = {
            studentInfo: {
                id: student._id,
                name: student.name,
                rollNumber: student.rollNumber
            },
            semester,
            academicYear,
            attendance: attendanceResults.sort((a, b) => a.subjectName.localeCompare(b.subjectName))
        };

        console.log("Sending response:", response);
        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error("Error fetching attendance:", error);
        return NextResponse.json({ error: "Failed to fetch attendance", details: error.message }, { status: 500 });
    }
}