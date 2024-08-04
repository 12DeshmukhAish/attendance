import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Attendance from "@/models/attendance";
import Student from "@/models/student";
import Subject from "@/models/subject";
import Classes from "@/models/className";
export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");
        const classId = searchParams.get("classId");
        const subjectId = searchParams.get("subjectId");
        const startDate = new Date(searchParams.get("startDate"));
        const endDate = new Date(searchParams.get("endDate"));

        let pipeline = [];

        if (studentId) {
            const student = await Student.findOne({ _id: studentId }).lean();
            if (!student) {
                return NextResponse.json({ error: "Student not found" }, { status: 404 });
            }

            pipeline = [
                { $unwind: '$records' },
                { $match: { 'records.student': studentId, date: { $gte: startDate, $lte: endDate } } },
                {
                    $group: {
                        _id: {
                            subject: '$subject',
                            batch: '$batch',
                        },
                        presentCount: {
                            $sum: {
                                $cond: [{ $eq: ['$records.status', 'present'] }, 1, 0]
                            }
                        },
                        totalCount: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'subjects',
                        localField: 'subject',
                        foreignField: '_id',
                        as: 'subjectInfo'
                    }
                },
                { $unwind: '$subjectInfo' },
                { $match: { 'subjectInfo.isActive': true } },
                {
                    $project: {
                        _id: '$_id.subject',
                        name: '$subjectInfo.name',
                        batch: '$_id.batch',
                        presentCount: 1,
                        totalLectures: '$totalCount'
                    }
                }
            ];
        }  else if (subjectId) {
            const subject = await Subject.findOne({ _id: subjectId }).lean();
            if (!subject) {
                return NextResponse.json({ error: "Subject not found" }, { status: 404 });
            }
        
            pipeline = [
                {
                    $match: {
                        date: {
                            $gte: startDate,
                            $lte: endDate
                        },
                        subject: subjectId
                    }
                },
                {
                    $unwind: "$records"
                },
                {
                    $group: {
                        _id: {
                            subject: "$subject",
                            student: "$records.student",
                            batch: "$batch"
                        },
                        totalLectures: { $sum: 1 },
                        presentCount: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$records.status", "present"] },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: "students",
                        localField: "_id.student",
                        foreignField: "_id",
                        as: "studentInfo"
                    }
                },
                {
                    $unwind: "$studentInfo"
                },
                {
                    $lookup: {
                        from: "subjects",
                        localField: "_id.subject",
                        foreignField: "_id",
                        as: "subjectInfo"
                    }
                },
                {
                    $unwind: "$subjectInfo"
                },
                {
                    $lookup: {
                        from: "faculties",
                        localField: "subjectInfo.teacher",
                        foreignField: "_id",
                        as: "facultyInfo"
                    }
                },
                {
                    $unwind: "$facultyInfo"
                },
                {
                    $group: {
                        _id: {
                            subject: "$_id.subject",
                            batch: "$_id.batch"
                        },
                        name: { $first: "$subjectInfo.name" },
                        totalLectures: { $first: "$totalLectures" },
                        students: {
                            $push: {
                                name: "$studentInfo.name",
                                rollNumber: "$studentInfo.rollNumber",
                                presentCount: "$presentCount"
                            }
                        },
                        facultyName: { $first: "$facultyInfo.name" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        subject: "$_id.subject",
                        batch: "$_id.batch",
                        name: 1,
                        facultyName: 1,
                        totalLectures: 1,
                        students: 1
                    }
                }
            ];
        } else if (classId) {
            pipeline = [
                {
                    $lookup: {
                        from: 'subjects',
                        localField: 'subject',
                        foreignField: '_id',
                        as: 'subjectInfo'
                    }
                },
                { $unwind: '$subjectInfo' },
                {
                    $match: {
                        'subjectInfo.class': classId,
                        date: { $gte: startDate, $lte: endDate }
                    }
                },
                { $unwind: '$records' },
                {
                    $match: {
                        'records.status': { $in: ['present', 'absent'] }
                    }
                },
                {
                    $group: {
                        _id: {
                            student: '$records.student',
                            subject: '$subject'
                        },
                        totalCount: { $sum: 1 },
                        presentCount: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$records.status', 'present'] },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: '$_id.student',
                        subjects: {
                            $push: {
                                subject: '$_id.subject',
                                totalCount: '$totalCount',
                                presentCount: '$presentCount'
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'students',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'studentInfo'
                    }
                },
                { $unwind: '$studentInfo' },
                {
                    $project: {
                        _id: 0,
                        student: {
                            _id: '$_id',
                            name: '$studentInfo.name',
                            rollNumber: '$studentInfo.rollNumber'
                        },
                        subjects: 1
                    }
                }
            ];
        } else {
            return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
        }

        const result = await Attendance.aggregate(pipeline).exec();

        if (!result || result.length === 0) {
            return NextResponse.json({ error: "No data found" }, { status: 404 });
        }

        console.log(result);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {~
        console.error("Error fetching attendance report:", error);
        return NextResponse.json({ error: "Failed to Fetch Attendance Report" }, { status: 500 });
    }
}
