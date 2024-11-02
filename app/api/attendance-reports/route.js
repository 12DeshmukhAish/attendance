//attendance-report.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Attendance from "@/models/attendance";
import Subject from "@/models/subject";
import Student from "@/models/student";

export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const department = searchParams.get("department");
        const classId = searchParams.get("classId");
        const semester = searchParams.get("semester");
        const academicYear = searchParams.get("academicYear");
        const viewType = searchParams.get("viewType"); // 'cumulative' or 'individual'
        const subjectId = searchParams.get("subjectId");

        if (!classId || !semester || !academicYear) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        let matchStage = {
            class: classId,
            semester,
            academicYear,
        };

        if (department) {
            matchStage.department = department;
        }

        if (viewType === 'individual' && subjectId) {
            matchStage.subject = subjectId;
        }

        const pipeline = viewType === 'cumulative' ? 
            [
                { $match: matchStage },
                { $unwind: '$records' },
                {
                    $group: {
                        _id: {
                            student: '$records.student',
                            subject: '$subject'
                        },
                        totalLectures: { $sum: 1 },
                        presentCount: {
                            $sum: { $cond: [{ $eq: ['$records.status', 'present'] }, 1, 0] }
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'students',
                        localField: '_id.student',
                        foreignField: '_id',
                        as: 'studentInfo'
                    }
                },
                { $unwind: '$studentInfo' },
                {
                    $lookup: {
                        from: 'subjects',
                        localField: '_id.subject',
                        foreignField: '_id',
                        as: 'subjectInfo'
                    }
                },
                { $unwind: '$subjectInfo' },
                {
                    $group: {
                        _id: '$studentInfo._id',
                        student: {
                            $first: {
                                name: '$studentInfo.name',
                                rollNumber: '$studentInfo.rollNumber'
                            }
                        },
                        subjects: {
                            $push: {
                                name: '$subjectInfo.name',
                                type: '$subjectInfo.subType',
                                totalLectures: '$totalLectures',
                                presentCount: '$presentCount',
                                percentage: {
                                    $multiply: [
                                        { $divide: ['$presentCount', '$totalLectures'] },
                                        100
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    $sort: {
                        'student.rollNumber': 1
                    }
                }
            ] :
            [
                { $match: matchStage },
                { $unwind: '$records' },
                {
                    $group: {
                        _id: {
                            student: '$records.student'
                        },
                        totalLectures: { $sum: 1 },
                        presentCount: {
                            $sum: { $cond: [{ $eq: ['$records.status', 'present'] }, 1, 0] }
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'students',
                        localField: '_id.student',
                        foreignField: '_id',
                        as: 'studentInfo'
                    }
                },
                { $unwind: '$studentInfo' },
                {
                    $project: {
                        _id: 0,
                        student: {
                            _id: '$studentInfo._id',
                            name: '$studentInfo.name',
                            rollNumber: '$studentInfo.rollNumber'
                        },
                        totalLectures: 1,
                        presentCount: 1,
                        percentage: {
                            $multiply: [
                                { $divide: ['$presentCount', '$totalLectures'] },
                                100
                            ]
                        }
                    }
                },
                {
                    $sort: {
                        'student.rollNumber': 1
                    }
                }
            ];

        const result = await Attendance.aggregate(pipeline);

        if (!result || result.length === 0) {
            return NextResponse.json({ error: "No attendance data found" }, { status: 404 });
        }

        let response = {
            classInfo: {
                class: classId,
                semester,
                academicYear,
                department
            },
            viewType,
            attendance: result
        };

        if (viewType === 'individual') {
            const subject = await Subject.findById(subjectId).select('name subType');
            response.subjectInfo = subject;
        }

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error("Error fetching admin attendance:", error);
        return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
    }
}