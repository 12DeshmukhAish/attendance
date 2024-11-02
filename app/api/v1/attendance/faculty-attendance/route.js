// import { NextResponse } from "next/server";
// import { connectMongoDB } from "@/lib/connectDb";
// import Attendance from "@/models/attendance";
// import Subject from "@/models/subject";
// import Student from "@/models/student";

// export async function GET(req) {
//     try {
//         await connectMongoDB();
//         const { searchParams } = new URL(req.url);
        
//         // Required parameters
//         const subjectId = searchParams.get("subjectId");
//         const startDate = searchParams.get("startDate");
//         const endDate = searchParams.get("endDate");
//         const viewType = searchParams.get("viewType"); // 'summary' or 'dateWise'

//         if (!subjectId) {
//             return NextResponse.json({ error: "Subject ID is required" }, { status: 400 });
//         }

//         // Verify subject exists and faculty has access
//         const subject = await Subject.findOne({ 
//             _id: subjectId,
//             isActive: true
//         });

//         if (!subject) {
//             return NextResponse.json({ error: "Subject not found" }, { status: 404 });
//         }

//         let dateMatch = {};
//         if (startDate && endDate) {
//             dateMatch.date = {
//                 $gte: new Date(startDate),
//                 $lte: new Date(endDate)
//             };
//         }

//         // Different pipelines based on view type
//         const pipeline = viewType === 'dateWise' ? 
//             [
//                 {
//                     $match: {
//                         subject: subject._id,
//                         ...dateMatch
//                     }
//                 },
//                 { $unwind: '$records' },
//                 {
//                     $lookup: {
//                         from: 'students',
//                         localField: 'records.student',
//                         foreignField: '_id',
//                         as: 'studentInfo'
//                     }
//                 },
//                 { $unwind: '$studentInfo' },
//                 {
//                     $group: {
//                         _id: {
//                             date: '$date',
//                             session: '$session',
//                             student: '$studentInfo._id'
//                         },
//                         student: {
//                             $first: {
//                                 _id: '$studentInfo._id',
//                                 name: '$studentInfo.name',
//                                 rollNumber: '$studentInfo.rollNumber'
//                             }
//                         },
//                         status: { $first: '$records.status' },
//                         remarks: { $first: '$records.remarks' }
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: {
//                             date: '$_id.date',
//                             session: '$_id.session'
//                         },
//                         date: { $first: '$_id.date' },
//                         session: { $first: '$_id.session' },
//                         students: {
//                             $push: {
//                                 _id: '$student._id',
//                                 name: '$student.name',
//                                 rollNumber: '$student.rollNumber',
//                                 status: '$status',
//                                 remarks: '$remarks'
//                             }
//                         },
//                         totalPresent: {
//                             $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
//                         },
//                         totalAbsent: {
//                             $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
//                         }
//                     }
//                 },
//                 {
//                     $sort: { 
//                         '_id.date': -1,
//                         '_id.session': 1
//                     }
//                 }
//             ] : 
//             [
//                 {
//                     $match: {
//                         subject: subject._id,
//                         ...dateMatch
//                     }
//                 },
//                 { $unwind: '$records' },
//                 {
//                     $group: {
//                         _id: {
//                             student: '$records.student',
//                             date: '$date',
//                             session: '$session'
//                         },
//                         status: { $first: '$records.status' }
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: '$_id.student',
//                         totalLectures: { $sum: 1 },
//                         presentCount: {
//                             $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
//                         },
//                         sessions: {
//                             $push: {
//                                 date: '$_id.date',
//                                 session: '$_id.session',
//                                 status: '$status'
//                             }
//                         }
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: 'students',
//                         localField: '_id',
//                         foreignField: '_id',
//                         as: 'studentInfo'
//                     }
//                 },
//                 { $unwind: '$studentInfo' },
//                 {
//                     $project: {
//                         _id: 1,
//                         student: {
//                             _id: '$studentInfo._id',
//                             name: '$studentInfo.name',
//                             rollNumber: '$studentInfo.rollNumber'
//                         },
//                         totalLectures: 1,
//                         presentCount: 1,
//                         sessions: 1,
//                         percentage: {
//                             $multiply: [
//                                 { $divide: ['$presentCount', '$totalLectures'] },
//                                 100
//                             ]
//                         }
//                     }
//                 },
//                 {
//                     $sort: { 'student.rollNumber': 1 }
//                 }
//             ];

//         const attendanceData = await Attendance.aggregate(pipeline);

//         if (!attendanceData || attendanceData.length === 0) {
//             return NextResponse.json({ error: "No attendance data found" }, { status: 404 });
//         }

//         // Calculate overall statistics
//         let response = {
//             subjectInfo: {
//                 _id: subject._id,
//                 name: subject.name,
//                 subType: subject.subType,
//                 semester: subject.semester
//             },
//             viewType,
//             dateRange: startDate && endDate ? { startDate, endDate } : null
//         };

//         if (viewType === 'dateWise') {
//             response.attendance = attendanceData.map(day => ({
//                 date: day.date,
//                 session: day.session,
//                 students: day.students.sort((a, b) => 
//                     a.rollNumber.localeCompare(b.rollNumber)
//                 ),
//                 summary: {
//                     totalStudents: day.students.length,
//                     present: day.totalPresent,
//                     absent: day.totalAbsent,
//                     percentage: ((day.totalPresent / day.students.length) * 100).toFixed(2)
//                 }
//             }));

//             // Add session-wise summary
//             response.sessionSummary = {
//                 totalSessions: attendanceData.length,
//                 averageAttendance: (
//                     attendanceData.reduce((acc, day) => 
//                         acc + (day.totalPresent / day.students.length * 100), 0
//                     ) / attendanceData.length
//                 ).toFixed(2)
//             };
//         } else {
//             response.attendance = attendanceData;
//             response.summary = {
//                 totalStudents: attendanceData.length,
//                 averageAttendance: (
//                     attendanceData.reduce((acc, curr) => acc + curr.percentage, 0) / 
//                     attendanceData.length
//                 ).toFixed(2),
//                 belowThreshold: attendanceData.filter(a => a.percentage < 75).length,
//                 totalSessions: attendanceData[0]?.sessions?.length || 0
//             };
//         }
        
//         return NextResponse.json(response, { status: 200 });
//     } catch (error) {
//         console.error("Error fetching faculty attendance:", error);
//         return NextResponse.json({ 
//             error: "Failed to fetch attendance data",
//             details: process.env.NODE_ENV === 'development' ? error.message : undefined 
//         }, { status: 500 });
//     }
// }

import { NextResponse } from  "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Attendance from "@/models/attendance";
import Subject from "@/models/subject";
import Student from "@/models/student";

export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        
        const subjectId = searchParams.get("subjectId");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const viewType = searchParams.get("viewType");

        if (!subjectId) {
            return NextResponse.json({ error: "Subject ID is required" }, { status: 400 });
        }

        const subject = await Subject.findOne({ 
            _id: subjectId,
            isActive: true
        });

        if (!subject) {
            return NextResponse.json({ error: "Subject not found" }, { status: 404 });
        }

        let dateMatch = {};
        if (startDate && endDate) {
            dateMatch.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const pipeline = viewType === 'dateWise' ? 
            [
                {
                    $match: {
                        subject: subject._id,
                        ...dateMatch
                    }
                },
                { $unwind: '$records' },
                {
                    $lookup: {
                        from: 'students',
                        localField: 'records.student',
                        foreignField: '_id',
                        as: 'studentInfo'
                    }
                },
                { $unwind: '$studentInfo' },
                {
                    $group: {
                        _id: {
                            date: '$date',
                            session: '$session',
                            student: '$studentInfo._id',
                            batch: '$batch'
                        },
                        student: {
                            $first: {
                                _id: '$studentInfo._id',
                                name: '$studentInfo.name',
                                rollNumber: '$studentInfo.rollNumber'
                            }
                        },
                        status: { $first: '$records.status' },
                        remarks: { $first: '$records.remarks' }
                    }
                },
                {
                    $group: {
                        _id: {
                            student: '$_id.student',
                            batch: '$_id.batch'
                        },
                        student: { $first: '$student' },
                        sessions: {
                            $push: {
                                date: '$_id.date',
                                session: '$_id.session',
                                status: '$status',
                                remarks: '$remarks'
                            }
                        },
                        totalLectures: { $sum: 1 },
                        presentCount: {
                            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        student: 1,
                        sessions: 1,
                        totalLectures: 1,
                        presentCount: 1,
                        percentage: {
                            $multiply: [
                                { $divide: ['$presentCount', '$totalLectures'] },
                                100
                            ]
                        },
                        batch: '$_id.batch'
                    }
                },
                {
                    $sort: { 'student.rollNumber': 1 }
                },
                {
                    $group: {
                        _id: '$batch',
                        students: { $push: '$$ROOT' }
                    }
                }
            ] : 
            [
                {
                    $match: {
                        subject: subject._id,
                        ...dateMatch
                    }
                },
                { $unwind: '$records' },
                {
                    $group: {
                        _id: {
                            student: '$records.student',
                            batch: '$batch'
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
                        },
                        batch: '$_id.batch'
                    }
                },
                {
                    $sort: { 'student.rollNumber': 1 }
                },
                {
                    $group: {
                        _id: '$batch',
                        students: { $push: '$$ROOT' }
                    }
                }
            ];

        const attendanceData = await Attendance.aggregate(pipeline);

        if (!attendanceData || attendanceData.length === 0) {
            return NextResponse.json({ error: "No attendance data found" }, { status: 404 });
        }

        let response = {
            subjectInfo: {
                _id: subject._id,
                name: subject.name,
                subType: subject.subType,
                semester: subject.semester
            },
            viewType,
            dateRange: startDate && endDate ? { startDate, endDate } : null
        };

        if (subject.subType === 'theory') {
            response.attendance = attendanceData[0].students;
        } else {
            response.attendance = Object.fromEntries(
                attendanceData.map(batch => [batch._id || 'No Batch', batch.students])
            );
        }

        // Calculate overall statistics
        const allStudents = attendanceData.flatMap(batch => batch.students);
        response.summary = {
            totalStudents: allStudents.length,
            averageAttendance: (
                allStudents.reduce((acc, curr) => acc + curr.percentage, 0) / 
                allStudents.length
            ).toFixed(2),
            belowThreshold: allStudents.filter(a => a.percentage < 75).length,
            totalSessions: allStudents[0]?.totalLectures || 0
        };

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error("Error fetching faculty attendance:", error);
        return NextResponse.json({ 
            error: "Failed to fetch attendance data",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined 
        }, { status: 500 });
    }
}