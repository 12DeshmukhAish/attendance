import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Attendance from "@/models/attendance";
import Student from "@/models/student";
import Subject from "@/models/subject";
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

        const dateMatch = {
            $match: {
                date: {
                    $gte: startDate,
                    $lte: endDate,
                },
            },
        };

        if (studentId) {
            const student = await Student.findOne({ _id: studentId }).lean();
            if (!student) {
                console.log("Student not found:", studentId);
                return NextResponse.json({ error: "Student not found" }, { status: 404 });
            }
    
            console.log("Student found:", student);
    
            // Get all subject IDs for the student
            const subjectIds = student.subjects;
    
            console.log("Subject IDs:", subjectIds);
    
            pipeline = [
                // Match lectures for the given date range and subjects
                {
                    $match: {
                        subject: { $in: subjectIds },
                        date: { $gte: startDate, $lte: endDate }
                    }
                },
                // Group by subject to get total lecture count
                {
                    $group: {
                        _id: "$subject",
                        totalLectures: { $sum: 1 },
                        attendanceRecords: { $push: "$$ROOT" }
                    }
                },
                // Unwind attendance records
                {
                    $unwind: "$attendanceRecords"
                },
                // Unwind student records within each attendance record
                {
                    $unwind: "$attendanceRecords.records"
                },
                // Match only the records for the specific student
                {
                    $match: {
                        "attendanceRecords.records.student": studentId
                    }
                },
                // Group again to count present lectures
                {
                    $group: {
                        _id: "$_id",
                        totalLectures: { $first: "$totalLectures" },
                        presentCount: {
                            $sum: { $cond: [{ $eq: ["$attendanceRecords.records.status", "present"] }, 1, 0] }
                        }
                    }
                },
                // Look up subject information
                {
                    $lookup: {
                        from: "subjects",
                        localField: "_id",
                        foreignField: "_id",
                        as: "subjectInfo"
                    }
                },
                {
                    $unwind: "$subjectInfo"
                },
                // Final projection
                {
                    $project: {
                        _id: 1,
                        name: "$subjectInfo.name",
                        totalLectures: 1,
                        presentCount: 1,
                        attendancePercentage: {
                            $cond: [
                                { $eq: ["$totalLectures", 0] },
                                0,
                                {
                                    $multiply: [
                                        { $divide: ["$presentCount", "$totalLectures"] },
                                        100
                                    ]
                                }
                            ]
                        }
                    }
                }
            ];
        } else if (classId) {
            pipeline = [
                dateMatch,
                {
                    $lookup: {
                        from: "subjects",
                        localField: "subject",
                        foreignField: "_id",
                        as: "subjectInfo"
                    }
                },
                {
                    $unwind: "$subjectInfo"
                },
                {
                    $match: {
                        "subjectInfo.class": classId
                    }
                },
                {
                    $group: {
                        _id: "$subject",
                        name: { $first: "$subjectInfo.name" },
                        totalLectures: { $sum: 1 },
                        records: { $push: "$records" }
                    }
                },
                {
                    $unwind: "$records"
                },
                {
                    $unwind: "$records"
                },
                {
                    $group: {
                        _id: {
                            subject: "$_id",
                            student: "$records.student"
                        },
                        name: { $first: "$name" },
                        totalLectures: { $first: "$totalLectures" },
                        presentCount: {
                            $sum: { $cond: [{ $eq: ["$records.status", "present"] }, 1, 0] }
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
                    $group: {
                        _id: "$_id.subject",
                        name: { $first: "$name" },
                        totalLectures: { $first: "$totalLectures" },
                        students: {
                            $push: {
                                name: "$studentInfo.name",
                                rollNumber: "$studentInfo.rollNumber",
                                presentCount: "$presentCount"
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: "faculties",
                        localField: "_id",
                        foreignField: "subjects",
                        as: "facultyInfo"
                    }
                },
                {
                    $unwind: "$facultyInfo"
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        totalLectures: 1,
                        students: 1,
                        facultyName: "$facultyInfo.name"
                    }
                }
            ];
        } else if (subjectId) {
            pipeline = [
                dateMatch,
                {
                    $match: {
                        subject: subjectId
                    }
                },
                {
                    $group: {
                        _id: "$subject",
                        totalLectures: { $sum: 1 },
                        records: { $push: "$records" }
                    }
                },
                {
                    $unwind: "$records"
                },
                {
                    $unwind: "$records"
                },
                {
                    $group: {
                        _id: {
                            subject: "$_id",
                            student: "$records.student"
                        },
                        totalLectures: { $first: "$totalLectures" },
                        presentCount: {
                            $sum: { $cond: [{ $eq: ["$records.status", "present"] }, 1, 0] }
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
                        _id: "$_id.subject",
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
                }
            ];
        } else {
            return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
        }

        const result = await Attendance.aggregate(pipeline);

        if (!result || result.length === 0) {
            return NextResponse.json({ error: "No data found" }, { status: 404 });
        }

        console.log("Attendance Report Generated Successfully", result);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("Error fetching attendance report:", error);
        return NextResponse.json({ error: "Failed to Fetch Attendance Report" }, { status: 500 });
    }
}

// import { NextResponse } from "next/server";
// import { connectMongoDB } from "@/lib/connectDb";
// import Student from "@/models/student";
// import Attendance from "@/models/attendance";
// import Subject from "@/models/subject";

// export async function GET(req) {
//     try {
//         await connectMongoDB();
//         const { searchParams } = new URL(req.url);
//         const studentId = searchParams.get("studentId");
//         const startDate = new Date(searchParams.get("startDate"));
//         const endDate = new Date(searchParams.get("endDate"));

//         console.log("Fetching attendance for student:", studentId);

//         // Find the student
//         const student = await Student.findOne({ _id: studentId }).lean();
//         if (!student) {
//             console.log("Student not found:", studentId);
//             return NextResponse.json({ error: "Student not found" }, { status: 404 });
//         }

//         console.log("Student found:", student);

//         // Get all subject IDs for the student
//         const subjectIds = student.subjects;

//         console.log("Subject IDs:", subjectIds);

//         // Fetch attendance records
//         const attendanceRecords = await Attendance.aggregate([
//             {
//                 $match: {
//                     subject: { $in: subjectIds },
//                     date: { $gte: startDate, $lte: endDate }
//                 }
//             },
//             {
//                 $unwind: "$records"
//             },
//             {
//                 $match: {
//                     "records.student": studentId
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$subject",
//                     totalLectures: { $sum: 1 },
//                     presentCount: {
//                         $sum: { $cond: [{ $eq: ["$records.status", "present"] }, 1, 0] }
//                     }
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "subjects",
//                     localField: "_id",
//                     foreignField: "_id",
//                     as: "subjectInfo"
//                 }
//             },
//             {
//                 $unwind: "$subjectInfo"
//             },
//             {
//                 $project: {
//                     _id: 1,
//                     name: "$subjectInfo.name",
//                     totalLectures: 1,
//                     presentCount: 1,
//                     attendancePercentage: {
//                         $multiply: [
//                             { $cond: [{ $eq: ["$totalLectures", 0] }, 0, 
//                                 { $divide: ["$presentCount", "$totalLectures"] }] },
//                             100
//                         ]
//                     }
//                 }
//             }
//         ]);

//         console.log("Attendance records:", attendanceRecords);

//         if (attendanceRecords.length === 0) {
//             return NextResponse.json({ error: "No attendance records found" }, { status: 404 });
//         }

//         const report = {
//             studentName: student.name,
//             rollNumber: student.rollNumber,
//             dateRange: { startDate, endDate },
//             subjects: attendanceRecords
//         };

//         return NextResponse.json(report, { status: 200 });
//     } catch (error) {
//         console.error("Error fetching attendance report:", error);
//         return NextResponse.json({ error: "Failed to fetch attendance report", details: error.message }, { status: 500 });
//     }
// }