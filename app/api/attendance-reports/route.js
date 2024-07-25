// import { NextResponse } from "next/server";
// import { connectMongoDB } from "@/lib/connectDb";
// import Attendance from "@/models/attendance";
// import Student from "@/models/student";
// import Subject from "@/models/subject";
// export async function GET(req) {
//     try {
//         await connectMongoDB();
//         const { searchParams } = new URL(req.url);
//         const studentId = searchParams.get("studentId");
//         const classId = searchParams.get("classId");
//         const subjectId = searchParams.get("subjectId");
//         const startDate = new Date(searchParams.get("startDate"));
//         const endDate = new Date(searchParams.get("endDate"));

//         let pipeline = [];

//         const dateMatch = {
//             $match: {
//                 date: {
//                     $gte: startDate,
//                     $lte: endDate,
//                 },
//             },
//         };

//         if (studentId) {
//             const student = await Student.findOne({ _id: studentId }).lean();
//             if (!student) {
//                 console.log("Student not found:", studentId);
//                 return NextResponse.json({ error: "Student not found" }, { status: 404 });
//             }
    
//             console.log("Student found:", student);
    
//             // Get all subject IDs for the student
//             const subjectIds = student.subjects;
    
//             console.log("Subject IDs:", subjectIds);
    
//             pipeline = [
//                 // Match lectures for the given date range and subjects
//                 {
//                     $match: {
//                         subject: { $in: subjectIds },
//                         date: { $gte: startDate, $lte: endDate }
//                     }
//                 },
//                 // Group by subject to get total lecture count
//                 {
//                     $group: {
//                         _id: "$subject",
//                         totalLectures: { $sum: 1 },
//                         attendanceRecords: { $push: "$$ROOT" }
//                     }
//                 },
//                 // Unwind attendance records
//                 {
//                     $unwind: "$attendanceRecords"
//                 },
//                 // Unwind student records within each attendance record
//                 {
//                     $unwind: "$attendanceRecords.records"
//                 },
//                 // Match only the records for the specific student
//                 {
//                     $match: {
//                         "attendanceRecords.records.student": studentId
//                     }
//                 },
//                 // Group again to count present lectures
//                 {
//                     $group: {
//                         _id: "$_id",
//                         totalLectures: { $first: "$totalLectures" },
//                         presentCount: {
//                             $sum: { $cond: [{ $eq: ["$attendanceRecords.records.status", "present"] }, 1, 0] }
//                         }
//                     }
//                 },
//                 // Look up subject information
//                 {
//                     $lookup: {
//                         from: "subjects",
//                         localField: "_id",
//                         foreignField: "_id",
//                         as: "subjectInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$subjectInfo"
//                 },
//                 // Final projection
//                 {
//                     $project: {
//                         _id: 1,
//                         name: "$subjectInfo.name",
//                         totalLectures: 1,
//                         presentCount: 1,
//                         attendancePercentage: {
//                             $cond: [
//                                 { $eq: ["$totalLectures", 0] },
//                                 0,
//                                 {
//                                     $multiply: [
//                                         { $divide: ["$presentCount", "$totalLectures"] },
//                                         100
//                                     ]
//                                 }
//                             ]
//                         }
//                     }
//                 }
//             ];
//         } else if (classId) {
//             pipeline = [
//                 dateMatch,
//                 {
//                     $lookup: {
//                         from: "subjects",
//                         localField: "subject",
//                         foreignField: "_id",
//                         as: "subjectInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$subjectInfo"
//                 },
//                 {
//                     $match: {
//                         "subjectInfo.class": classId
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: "$subject",
//                         name: { $first: "$subjectInfo.name" },
//                         totalLectures: { $sum: 1 },
//                         records: { $push: "$records" }
//                     }
//                 },
//                 {
//                     $unwind: "$records"
//                 },
//                 {
//                     $unwind: "$records"
//                 },
//                 {
//                     $group: {
//                         _id: {
//                             subject: "$_id",
//                             student: "$records.student"
//                         },
//                         name: { $first: "$name" },
//                         totalLectures: { $first: "$totalLectures" },
//                         presentCount: {
//                             $sum: { $cond: [{ $eq: ["$records.status", "present"] }, 1, 0] }
//                         }
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "students",
//                         localField: "_id.student",
//                         foreignField: "_id",
//                         as: "studentInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$studentInfo"
//                 },
//                 {
//                     $group: {
//                         _id: "$_id.subject",
//                         name: { $first: "$name" },
//                         totalLectures: { $first: "$totalLectures" },
//                         students: {
//                             $push: {
//                                 name: "$studentInfo.name",
//                                 rollNumber: "$studentInfo.rollNumber",
//                                 presentCount: "$presentCount"
//                             }
//                         }
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "faculties",
//                         localField: "_id",
//                         foreignField: "subjects",
//                         as: "facultyInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$facultyInfo"
//                 },
//                 {
//                     $project: {
//                         _id: 1,
//                         name: 1,
//                         totalLectures: 1,
//                         students: 1,
//                         facultyName: "$facultyInfo.name"
//                     }
//                 }
//             ];
//         } else if (subjectId) {
//             pipeline = [
//                 dateMatch,
//                 {
//                     $match: {
//                         subject: subjectId
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: "$subject",
//                         totalLectures: { $sum: 1 },
//                         records: { $push: "$records" }
//                     }
//                 },
//                 {
//                     $unwind: "$records"
//                 },
//                 {
//                     $unwind: "$records"
//                 },
//                 {
//                     $group: {
//                         _id: {
//                             subject: "$_id",
//                             student: "$records.student"
//                         },
//                         totalLectures: { $first: "$totalLectures" },
//                         presentCount: {
//                             $sum: { $cond: [{ $eq: ["$records.status", "present"] }, 1, 0] }
//                         }
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "students",
//                         localField: "_id.student",
//                         foreignField: "_id",
//                         as: "studentInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$studentInfo"
//                 },
//                 {
//                     $lookup: {
//                         from: "subjects",
//                         localField: "_id.subject",
//                         foreignField: "_id",
//                         as: "subjectInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$subjectInfo"
//                 },
//                 {
//                     $lookup: {
//                         from: "faculties",
//                         localField: "subjectInfo.teacher",
//                         foreignField: "_id",
//                         as: "facultyInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$facultyInfo"
//                 },
//                 {
//                     $group: {
//                         _id: "$_id.subject",
//                         name: { $first: "$subjectInfo.name" },
//                         totalLectures: { $first: "$totalLectures" },
//                         students: {
//                             $push: {
//                                 name: "$studentInfo.name",
//                                 rollNumber: "$studentInfo.rollNumber",
//                                 presentCount: "$presentCount"
//                             }
//                         },
//                         facultyName: { $first: "$facultyInfo.name" }
//                     }
//                 }
//             ];
//         } else {
//             return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
//         }

//         const result = await Attendance.aggregate(pipeline);

//         if (!result || result.length === 0) {
//             return NextResponse.json({ error: "No data found" }, { status: 404 });
//         }

//         console.log("Attendance Report Generated Successfully", result);
//         return NextResponse.json(result, { status: 200 });
//     } catch (error) {
//         console.error("Error fetching attendance report:", error);
//         return NextResponse.json({ error: "Failed to Fetch Attendance Report" }, { status: 500 });
//     }
// }
// import { NextResponse } from "next/server";
// import { connectMongoDB } from "@/lib/connectDb";
// import Attendance from "@/models/attendance";
// import Student from "@/models/student";
// import Classes from "@/models/className";
// import Subject from "@/models/subject";
// export async function GET(req) {
//     try {
//         await connectMongoDB();
//         const { searchParams } = new URL(req.url);
//         const studentId = searchParams.get("studentId");
//         const classId = searchParams.get("classId");
//         const subjectId = searchParams.get("subjectId");
//         const startDate = new Date(searchParams.get("startDate"));
//         const endDate = new Date(searchParams.get("endDate"));

//         let pipeline = [];

//         const dateMatch = {
//             $match: {
//                 date: {
//                     $gte: startDate,
//                     $lte: endDate,
//                 },
//             },
//         };

//         if (studentId) {
//             // Fetch student information including class and batch
//             const student = await Student.findOne({ _id: studentId }).lean();
//             if (!student) {
//                 console.log("Student not found:", studentId);
//                 return NextResponse.json({ error: "Student not found" }, { status: 404 });
//             }

//             // Fetch class information
//             const classInfo = await Classes.findOne({ _id: student.class }).lean();
//             if (!classInfo) {
//                 console.log("Class not found for student:", studentId);
//                 return NextResponse.json({ error: "Class not found" }, { status: 404 });
//             }

//             // Get all subject IDs for the student (including class and batch subjects)
//             const classSubjects = classInfo.subjects || [];
//             const batchSubjects = classInfo.batches
//                 .filter(batch => batch.students.includes(studentId))
//                 .flatMap(batch => batch.subjects || []);
//             const subjectIds = [...new Set([...classSubjects, ...batchSubjects])];

//             console.log("Subject IDs:", subjectIds);

//             pipeline = [
//                 // Match lectures for the given date range and subjects
//                 {
//                     $match: {
//                         subject: { $in: subjectIds },
//                         date: { $gte: startDate, $lte: endDate }
//                     }
//                 },
//                 // Look up subject information
//                 {
//                     $lookup: {
//                         from: "subjects",
//                         localField: "subject",
//                         foreignField: "_id",
//                         as: "subjectInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$subjectInfo"
//                 },
//                 // Group by subject to get total lecture count
//                 {
//                     $group: {
//                         _id: "$subject",
//                         name: { $first: "$subjectInfo.name" },
//                         totalLectures: { $sum: 1 },
//                         attendanceRecords: { $push: "$$ROOT" }
//                     }
//                 },
//                 // Unwind attendance records
//                 {
//                     $unwind: "$attendanceRecords"
//                 },
//                 // Unwind student records within each attendance record
//                 {
//                     $unwind: "$attendanceRecords.records"
//                 },
//                 // Match only the records for the specific student
//                 {
//                     $match: {
//                         "attendanceRecords.records.student": studentId
//                     }
//                 },
//                 // Group again to count present lectures
//                 {
//                     $group: {
//                         _id: "$_id",
//                         name: { $first: "$name" },
//                         totalLectures: { $first: "$totalLectures" },
//                         presentCount: {
//                             $sum: { $cond: [{ $eq: ["$attendanceRecords.records.status", "present"] }, 1, 0] }
//                         }
//                     }
//                 },
//                 // Final projection
//                 {
//                     $project: {
//                         _id: 1,
//                         name: 1,
//                         totalLectures: 1,
//                         presentCount: 1,
//                         attendancePercentage: {
//                             $cond: [
//                                 { $eq: ["$totalLectures", 0] },
//                                 0,
//                                 {
//                                     $multiply: [
//                                         { $divide: ["$presentCount", "$totalLectures"] },
//                                         100
//                                     ]
//                                 }
//                             ]
//                         }
//                     }
//                 }
//             ];
//         } else if (classId) {
//             pipeline = [
//                 dateMatch,
//                 {
//                     $lookup: {
//                         from: "subjects",
//                         localField: "subject",
//                         foreignField: "_id",
//                         as: "subjectInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$subjectInfo"
//                 },
//                 {
//                     $match: {
//                         "subjectInfo.class": classId
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: "$subject",
//                         name: { $first: "$subjectInfo.name" },
//                         totalLectures: { $sum: 1 },
//                         records: { $push: "$records" }
//                     }
//                 },
//                 {
//                     $unwind: "$records"
//                 },
//                 {
//                     $unwind: "$records"
//                 },
//                 {
//                     $group: {
//                         _id: {
//                             subject: "$_id",
//                             student: "$records.student"
//                         },
//                         name: { $first: "$name" },
//                         totalLectures: { $first: "$totalLectures" },
//                         presentCount: {
//                             $sum: { $cond: [{ $eq: ["$records.status", "present"] }, 1, 0] }
//                         }
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "students",
//                         localField: "_id.student",
//                         foreignField: "_id",
//                         as: "studentInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$studentInfo"
//                 },
//                 {
//                     $group: {
//                         _id: "$_id.subject",
//                         name: { $first: "$name" },
//                         totalLectures: { $first: "$totalLectures" },
//                         students: {
//                             $push: {
//                                 name: "$studentInfo.name",
//                                 rollNumber: "$studentInfo.rollNumber",
//                                 presentCount: "$presentCount"
//                             }
//                         }
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "faculties",
//                         localField: "_id",
//                         foreignField: "subjects",
//                         as: "facultyInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$facultyInfo"
//                 },
//                 {
//                     $project: {
//                         _id: 1,
//                         name: 1,
//                         totalLectures: 1,
//                         students: 1,
//                         facultyName: "$facultyInfo.name"
//                     }
//                 }
//             ];
//         } else if (subjectId) {
//             pipeline = [
//                 dateMatch,
//                 {
//                     $match: {
//                         subject: subjectId
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: "$subject",
//                         totalLectures: { $sum: 1 },
//                         records: { $push: "$records" }
//                     }
//                 },
//                 {
//                     $unwind: "$records"
//                 },
//                 {
//                     $unwind: "$records"
//                 },
//                 {
//                     $group: {
//                         _id: {
//                             subject: "$_id",
//                             student: "$records.student"
//                         },
//                         totalLectures: { $first: "$totalLectures" },
//                         presentCount: {
//                             $sum: { $cond: [{ $eq: ["$records.status", "present"] }, 1, 0] }
//                         }
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "students",
//                         localField: "_id.student",
//                         foreignField: "_id",
//                         as: "studentInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$studentInfo"
//                 },
//                 {
//                     $lookup: {
//                         from: "subjects",
//                         localField: "_id.subject",
//                         foreignField: "_id",
//                         as: "subjectInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$subjectInfo"
//                 },
//                 {
//                     $lookup: {
//                         from: "faculties",
//                         localField: "subjectInfo.teacher",
//                         foreignField: "_id",
//                         as: "facultyInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$facultyInfo"
//                 },
//                 {
//                     $group: {
//                         _id: "$_id.subject",
//                         name: { $first: "$subjectInfo.name" },
//                         totalLectures: { $first: "$totalLectures" },
//                         students: {
//                             $push: {
//                                 name: "$studentInfo.name",
//                                 rollNumber: "$studentInfo.rollNumber",
//                                 presentCount: "$presentCount"
//                             }
//                         },
//                         facultyName: { $first: "$facultyInfo.name" }
//                     }
//                 }
//             ];
//         } else {
//             return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
//         }

//         const result = await Attendance.aggregate(pipeline);

//         if (!result || result.length === 0) {
//             return NextResponse.json({ error: "No data found" }, { status: 404 });
//         }

//         console.log("Attendance Report Generated Successfully", result);
//         return NextResponse.json(result, { status: 200 });
//     } catch (error) {
//         console.error("Error fetching attendance report:", error);
//         return NextResponse.json({ error: "Failed to Fetch Attendance Report" }, { status: 500 });
//     }
// }
// import { NextResponse } from "next/server";
// import { connectMongoDB } from "@/lib/connectDb";
// import Attendance from "@/models/attendance";
// import Classes from "@/models/className";

// export async function GET(req) {
//     try {
//         await connectMongoDB();
//         const { searchParams } = new URL(req.url);
//         const classId = searchParams.get("classId");
//         const startDate = new Date(searchParams.get("startDate"));
//         const endDate = new Date(searchParams.get("endDate"));

//         if (!classId) {
//             return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
//         }

//         // Fetch the class information to ensure it exists
//         const classInfo = await Classes.findOne({ _id: classId }).lean();
//         if (!classInfo) {
//             console.log("Class not found:", classId);
//             return NextResponse.json({ error: "Class not found" }, { status: 404 });
//         }

        // const pipeline = [
        //     {
        //         $match: {
        //             date: {
        //                 $gte: startDate,
        //                 $lte: endDate,
        //             }
        //         }
        //     },
        //     { $unwind: '$records' },
        //     {
        //         $match: {
        //             'records.status': { $in: ['present', 'absent'] }
        //         }
        //     },
        //     {
        //         $group: {
        //             _id: {
        //                 student: '$records.student',
        //                 subject: '$subject'
        //             },
        //             totalCount: { $sum: 1 },
        //             presentCount: {
        //                 $sum: {
        //                     $cond: [
        //                         { $eq: ['$records.status', 'present'] },
        //                         1,
        //                         0
        //                     ]
        //                 }
        //             }
        //         }
        //     },
        //     {
        //         $group: {
        //             _id: '$_id.student',
        //             subjects: {
        //                 $push: {
        //                     subject: '$_id.subject',
        //                     totalCount: '$totalCount',
        //                     presentCount: '$presentCount'
        //                 }
        //             }
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: 'students',
        //             localField: '_id',
        //             foreignField: '_id',
        //             as: 'studentInfo'
        //         }
        //     },
        //     {
        //         $unwind: '$studentInfo'
        //     },
        //     {
        //         $project: {
        //             _id: 0,
        //             student: {
        //                 _id: '$_id',
        //                 name: '$studentInfo.name',
        //                 rollNumber: '$studentInfo.rollNumber'
        //             },
        //             subjects: 1
        //         }
        //     }
        // ];

//         // Use aggregate with options directly
//         const result = await Attendance.aggregate(pipeline, { maxTimeMS: 60000, allowDiskUse: true });

//         if (!result || result.length === 0) {
//             return NextResponse.json({ error: "No data found" }, { status: 404 });
//         }

//         console.log("Attendance Report Generated Successfully", result);
//         return NextResponse.json(result, { status: 200 });
//     } catch (error) {
//         console.error("Error fetching attendance report:", error);
//         return NextResponse.json({ error: "Failed to Fetch Attendance Report" }, { status: 500 });
//     }
// }
// import { NextResponse } from "next/server";
// import { connectMongoDB } from "@/lib/connectDb";
// import Attendance from "@/models/attendance";
// import Student from "@/models/student";
// import Classes from "@/models/className";
// import Subject from "@/models/subject";

// export async function GET(req) {
//     try {
//         await connectMongoDB();
//         const { searchParams } = new URL(req.url);
//         const studentId = searchParams.get("studentId");
//         const classId = searchParams.get("classId");
//         const subjectId = searchParams.get("subjectId");
//         const startDate = new Date(searchParams.get("startDate"));
//         const endDate = new Date(searchParams.get("endDate"));

//         let pipeline = [];

//         const dateMatch = {
//             $match: {
//                 date: {
//                     $gte: startDate,
//                     $lte: endDate,
//                 },
//             },
//         };

//         if (studentId) {
//             const student = await Student.findOne({ _id: studentId }).lean();
//             if (!student) {
//                 console.log("Student not found:", studentId);
//                 return NextResponse.json({ error: "Student not found" }, { status: 404 });
//             }

//             const classInfo = await Classes.findOne({ _id: student.class }).lean();
//             if (!classInfo) {
//                 console.log("Class not found for student:", studentId);
//                 return NextResponse.json({ error: "Class not found" }, { status: 404 });
//             }

//             const classSubjects = classInfo.subjects || [];
//             const studentBatches = classInfo.batches.filter(batch => batch.students.includes(studentId));
//             const batchSubjects = studentBatches.flatMap(batch => batch.subjects || []);
//             const subjectIds = [...new Set([...classSubjects, ...batchSubjects])];

//             pipeline = [
//                 dateMatch,
//                 {
//                     $match: {
//                         subject: { $in: subjectIds }
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "subjects",
//                         localField: "subject",
//                         foreignField: "_id",
//                         as: "subjectInfo"
//                     }
//                 },
//                 { $unwind: "$subjectInfo" },
//                 { $unwind: "$records" },
//                 {
//                     $match: {
//                         "records.student": studentId
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: {
//                             subject: "$subject",
//                             batch: "$batch"
//                         },
//                         name: { $first: "$subjectInfo.name" },
//                         subType: { $first: "$subjectInfo.subType" },
//                         totalLectures: { $sum: 1 },
//                         presentCount: {
//                             $sum: { $cond: [{ $eq: ["$records.status", "present"] }, 1, 0] }
//                         }
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: "$_id.subject",
//                         name: { $first: "$name" },
//                         subType: { $first: "$subType" },
//                         batches: {
//                             $addToSet: {
//                                 batch: "$_id.batch",
//                                 totalLectures: "$totalLectures",
//                                 presentCount: "$presentCount"
//                             }
//                         }
//                     }
//                 },
//                 {
//                     $project: {
//                         _id: 1,
//                         name: 1,
//                         subType: 1,
//                         batches: 1,
//                         totalLectures: {
//                             $cond: [
//                                 { $eq: ["$subType", "theory"] },
//                                 { $sum: "$batches.totalLectures" },
//                                 { $max: "$batches.totalLectures" }
//                             ]
//                         },
//                         presentCount: {
//                             $cond: [
//                                 { $eq: ["$subType", "theory"] },
//                                 { $sum: "$batches.presentCount" },
//                                 { $max: "$batches.presentCount" }
//                             ]
//                         }
//                     }
//                 },
//                 {
//                     $project: {
//                         _id: 1,
//                         name: 1,
//                         subType: 1,
//                         batches: 1,
//                         totalLectures: 1,
//                         presentCount: 1,
//                         attendancePercentage: {
//                             $cond: [
//                                 { $eq: ["$totalLectures", 0] },
//                                 0,
//                                 {
//                                     $multiply: [
//                                         { $divide: ["$presentCount", "$totalLectures"] },
//                                         100
//                                     ]
//                                 }
//                             ]
//                         }
//                     }
//                 }
//             ];
//         } else if (subjectId) {
//             pipeline = [
//                 dateMatch,
//                 {
//                     $match: {
//                         subject: subjectId
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "subjects",
//                         localField: "subject",
//                         foreignField: "_id",
//                         as: "subjectInfo"
//                     }
//                 },
//                 { $unwind: "$subjectInfo" },
//                 { $unwind: "$records" },
//                 {
//                     $group: {
//                         _id: {
//                             subject: "$subject",
//                             batch: "$batch",
//                             student: "$records.student"
//                         },
//                         name: { $first: "$subjectInfo.name" },
//                         subType: { $first: "$subjectInfo.subType" },
//                         totalLectures: { $sum: 1 },
//                         presentCount: {
//                             $sum: { $cond: [{ $eq: ["$records.status", "present"] }, 1, 0] }
//                         }
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "students",
//                         localField: "_id.student",
//                         foreignField: "_id",
//                         as: "studentInfo"
//                     }
//                 },
//                 { $unwind: "$studentInfo" },
//                 {
//                     $group: {
//                         _id: {
//                             subject: "$_id.subject",
//                             batch: "$_id.batch"
//                         },
//                         name: { $first: "$name" },
//                         subType: { $first: "$subType" },
//                         totalLectures: { $first: "$totalLectures" },
//                         students: {
//                             $addToSet: {
//                                 name: "$studentInfo.name",
//                                 rollNumber: "$studentInfo.rollNumber",
//                                 presentCount: "$presentCount"
//                             }
//                         }
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: "$_id.subject",
//                         name: { $first: "$name" },
//                         subType: { $first: "$subType" },
//                         batches: {
//                             $addToSet: {
//                                 batch: "$_id.batch",
//                                 totalLectures: "$totalLectures",
//                                 students: "$students"
//                             }
//                         }
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "faculties",
//                         localField: "_id",
//                         foreignField: "subjects",
//                         as: "facultyInfo"
//                     }
//                 },
//                 { $unwind: "$facultyInfo" },
//                 {
//                     $project: {
//                         _id: 1,
//                         name: 1,
//                         subType: 1,
//                         batches: 1,
//                         facultyName: "$facultyInfo.name",
//                         totalLectures: {
//                             $cond: [
//                                 { $eq: ["$subType", "theory"] },
//                                 { $sum: "$batches.totalLectures" },
//                                 { $max: "$batches.totalLectures" }
//                             ]
//                         }
//                     }
//                 }
//             ];
//         } else if (classId) {
//             // Implement the class ID pipeline here if needed
//             return NextResponse.json({ error: "Class ID query not implemented" }, { status: 501 });
//         } else {
//             return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
//         }

//         const result = await Attendance.aggregate(pipeline);

//         if (!result || result.length === 0) {
//             return NextResponse.json({ error: "No data found" }, { status: 404 });
//         }

//         console.log("Attendance Report Generated Successfully", result);
//         return NextResponse.json(result, { status: 200 });
//     } catch (error) {
//         console.error("Error fetching attendance report:", error);
//         return NextResponse.json({ error: "Failed to Fetch Attendance Report" }, { status: 500 });
//     }
// // }
// import { NextResponse } from "next/server";
// import { connectMongoDB } from "@/lib/connectDb";
// import Attendance from "@/models/attendance";
// import Student from "@/models/student";

// export async function GET(req) {
//     try {
//         await connectMongoDB();
//         const { searchParams } = new URL(req.url);
//         const studentId = searchParams.get("studentId");
//         const classId = searchParams.get("classId");
//         const subjectId = searchParams.get("subjectId");
//         const startDate = new Date(searchParams.get("startDate"));
//         const endDate = new Date(searchParams.get("endDate"));

//         let pipeline = [];

//         if (studentId) {
//             const student = await Student.findOne({ _id: studentId }).lean();
//             if (!student) {
//                 console.log("Student not found:", studentId);
//                 return NextResponse.json({ error: "Student not found" }, { status: 404 });
//             }

//             pipeline = [
//                 {
//                     $match: {
//                         "records.student": studentId,
//                         date: {
//                             $gte: startDate,
//                             $lte: endDate
//                         }
//                     }
//                 },
//                 {
//                     $unwind: "$records"
//                 },
//                 {
//                     $group: {
//                         _id: {
//                             student: "$records.student",
//                             subject: "$subject",
//                             batch: "$batch"
//                         },
//                         presentCount: {
//                             $sum: {
//                                 $cond: [
//                                     { $eq: ["$records.status", "present"] },
//                                     1,
//                                     0
//                                 ]
//                             }
//                         },
//                         totalCount: { $sum: 1 }
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "students",
//                         localField: "_id.student",
//                         foreignField: "_id",
//                         as: "studentDetails"
//                     }
//                 },
//                 {
//                     $unwind: "$studentDetails"
//                 },
//                 {
//                     $group: {
//                         _id: {
//                             student: "$_id.student",
//                             batch: "$_id.batch"
//                         },
//                         name: { $first: "$studentDetails.name" },
//                         rollNumber: { $first: "$studentDetails.rollNumber" },
//                         subjects: {
//                             $push: {
//                                 subject: "$_id.subject",
//                                 presentCount: "$presentCount",
//                                 totalCount: "$totalCount"
//                             }
//                         }
//                     }
//                 },
//                 {
//                     $project: {
//                         _id: 0,
//                         student: "$_id.student",
//                         batch: "$_id.batch",
//                         name: 1,
//                         rollNumber: 1,
//                         subjects: 1
//                     }
//                 }
//             ];
//         } else if (classId) {
//             pipeline = [
//                 {
//                     $match: {
//                         date: {
//                             $gte: startDate,
//                             $lte: endDate,
//                         }
//                     }
//                 },
//                 { $unwind: '$records' },
//                 {
//                     $match: {
//                         'records.status': { $in: ['present', 'absent'] }
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: {
//                             student: '$records.student',
//                             subject: '$subject'
//                         },
//                         totalCount: { $sum: 1 },
//                         presentCount: {
//                             $sum: {
//                                 $cond: [
//                                     { $eq: ['$records.status', 'present'] },
//                                     1,
//                                     0
//                                 ]
//                             }
//                         }
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: '$_id.student',
//                         subjects: {
//                             $push: {
//                                 subject: '$_id.subject',
//                                 totalCount: '$totalCount',
//                                 presentCount: '$presentCount'
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
//                 {
//                     $unwind: '$studentInfo'
//                 },
//                 {
//                     $project: {
//                         _id: 0,
//                         student: {
//                             _id: '$_id',
//                             name: '$studentInfo.name',
//                             rollNumber: '$studentInfo.rollNumber'
//                         },
//                         subjects: 1
//                     }
//                 }
//             ];
//         } else if (subjectId) {
//             pipeline = [
//                 {
//                     $match: {
//                         date: {
//                             $gte: startDate,
//                             $lte: endDate
//                         },
//                         subject: subjectId
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: "$subject",
//                         totalLectures: { $sum: 1 },
//                         records: { $push: "$records" }
//                     }
//                 },
//                 {
//                     $unwind: "$records"
//                 },
//                 {
//                     $unwind: "$records"
//                 },
//                 {
//                     $group: {
//                         _id: {
//                             subject: "$_id",
//                             student: "$records.student"
//                         },
//                         totalLectures: { $first: "$totalLectures" },
//                         presentCount: {
//                             $sum: {
//                                 $cond: [
//                                     { $eq: ["$records.status", "present"] },
//                                     1,
//                                     0
//                                 ]
//                             }
//                         }
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "students",
//                         localField: "_id.student",
//                         foreignField: "_id",
//                         as: "studentInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$studentInfo"
//                 },
//                 {
//                     $lookup: {
//                         from: "subjects",
//                         localField: "_id.subject",
//                         foreignField: "_id",
//                         as: "subjectInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$subjectInfo"
//                 },
//                 {
//                     $lookup: {
//                         from: "faculties",
//                         localField: "subjectInfo.teacher",
//                         foreignField: "_id",
//                         as: "facultyInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$facultyInfo"
//                 },
//                 {
//                     $group: {
//                         _id: "$_id.subject",
//                         name: { $first: "$subjectInfo.name" },
//                         totalLectures: { $first: "$totalLectures" },
//                         students: {
//                             $push: {
//                                 name: "$studentInfo.name",
//                                 rollNumber: "$studentInfo.rollNumber",
//                                 presentCount: "$presentCount"
//                             }
//                         },
//                         facultyName: { $first: "$facultyInfo.name" }
//                     }
//                 }
//             ];
//         } else {
//             return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
//         }

//         const result = await Attendance.aggregate(pipeline).exec();

//         if (!result || result.length === 0) {
//             return NextResponse.json({ error: "No data found" }, { status: 404 });
//         }
//     console.log(result);
//         return NextResponse.json(result, { status: 200 });
//     } catch (error) {
//         console.error("Error fetching attendance report:", error);
//         return NextResponse.json({ error: "Failed to Fetch Attendance Report" }, { status: 500 });
//     }
// }
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

        if (studentId) {
            const student = await Student.findOne({ _id: studentId }).lean();
            if (!student) {
                console.log("Student not found:", studentId);
                return NextResponse.json({ error: "Student not found" }, { status: 404 });
            }

            pipeline = [
                { $unwind: '$records' },
                { $match: { 'records.student': studentId, date: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
                {
                    $group: {
                        _id: {
                            subject: '$subject',
                            batch: '$batch'
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
                        localField: '_id.subject',
                        foreignField: '_id',
                        as: 'subjectInfo'
                    }
                },
                { $unwind: '$subjectInfo' },
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
        } else if (subjectId) {
            const subject = await Subject.findOne({ _id: subjectId }).lean();
            if (!subject) {
                return NextResponse.json({ error: "Subject not found" }, { status: 404 });
            }

            if (subject.subType === "practical") {
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
            } else {
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
            }
        } else if (classId) {
            pipeline = [
                {
                    $match: {
                        date: {
                            $gte: startDate,
                            $lte: endDate,
                        }
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
                {
                    $unwind: '$studentInfo'
                },
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
        }else {
            return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
        }

        const result = await Attendance.aggregate(pipeline).exec();

        if (!result || result.length === 0) {
            return NextResponse.json({ error: "No data found" }, { status: 404 });
        }

        console.log(result);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("Error fetching attendance report:", error);
        return NextResponse.json({ error: "Failed to Fetch Attendance Report" }, { status: 500 });
    }
}
