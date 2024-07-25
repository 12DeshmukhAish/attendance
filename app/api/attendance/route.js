import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Attendance from "@/models/attendance";
import Subject from "@/models/subject";
import Student from "@/models/student";

// // export async function POST(req) {
// //     try {
// //         await connectMongoDB();
// //         const data = await req.json();
// //         const { subject, session, presentStudents, contents } = data;

// //         if (data) {
// //             const date = new Date();
// //             const attendanceRecord = await Attendance.findOneAndUpdate(
// //                 { date, subject, session },
// //                 { 
// //                     $setOnInsert: { date, subject, session },
// //                     $set: { records: presentStudents.map(student => ({ student, status: 'present' })) }
// //                 },
// //                 { upsert: true, new: true, runValidators: true }
// //             );

// //             await Subject.findByIdAndUpdate(
// //                 subject,
// //                 { $addToSet: { reports: attendanceRecord._id } }
// //             );

// //             // Update content status to covered and set completed date
// //             if (contents && contents.length > 0) {
// //                 await Subject.updateOne(
// //                     { _id: subject },
// //                     { 
// //                         $set: { 
// //                             "content.$[elem].status": "covered",
// //                             "content.$[elem].completedDate": date
// //                         }
// //                     },
// //                     {
// //                         arrayFilters: [{ "elem.title": { $in: contents }, "elem.status": { $ne: "covered" } }]
// //                     }
// //                 );
// //             }

// //             console.log("Attendance Recorded Successfully", attendanceRecord);
// //             return NextResponse.json({ message: "Attendance Recorded Successfully", attendance: attendanceRecord }, { status: 200 });
// //         } else {
// //             return NextResponse.json({ message: "Invalid Input Data" }, { status: 400 });
// //         }
// //     } catch (error) {
// //         console.error("Error recording attendance:", error);
// //         return NextResponse.json({ error: "Failed to Record Attendance" }, { status: 500 });
// //     }
// // }
// // export async function PUT(req) {
// //     try {
// //         await connectMongoDB();
// //         const data = await req.json();
// //         const { _id, date, subject, records, coveredContents } = data; // Include coveredContents in the request data

// //         // Validate and update each record if needed
// //         const validatedRecords = records.map(record => ({
// //             student: record.student,
// //             status: record.status || 'absent' // Assuming default status if not provided
// //         }));

// //         const existingAttendance = await Attendance.findByIdAndUpdate(_id, {
// //             date,
// //             subject,
// //             records: validatedRecords
// //         }, { new: true });

// //         if (!existingAttendance) {
// //             return NextResponse.json({ error: "Attendance record not found" });
// //         }

// //         // Update content status to covered
// //         if (coveredContents && coveredContents.length > 0) {
// //             await Subject.updateOne(
// //                 { _id: subject },
// //                 { 
// //                     $set: { "content.$[elem].status": "covered" }
// //                 },
// //                 {
// //                     arrayFilters: [{ "elem.name": { $in: coveredContents } }]
// //                 }
// //             );
// //         }

// //         console.log("Attendance Updated Successfully", existingAttendance);
// //         return NextResponse.json({ message: "Attendance Updated Successfully", attendance: existingAttendance });
// //     } catch (error) {
// //         console.error("Error updating attendance:", error);
// //         return NextResponse.json({ error: "Failed to Update Attendance" });
// //     }
// // }

// // export async function DELETE(req) {
// //     try {
// //         await connectMongoDB();
// //         const { searchParams } = new URL(req.url);
// //         const _id = searchParams.get("_id");
// //         const deletedAttendance = await Attendance.findByIdAndDelete(_id);

// //         if (!deletedAttendance) {
// //             return NextResponse.json({ error: "Attendance record not found" }, { status: 404 });
// //         }

// //         console.log("Attendance Record Deleted Successfully", deletedAttendance);
// //         return NextResponse.json({ message: "Attendance Record Deleted Successfully" }, { status: 200 });
// //     } catch (error) {
// //         console.error("Error deleting attendance record:", error);
// //         return NextResponse.json({ error: "Failed to Delete Attendance Record" }, { status: 500 });
// //     }
// // }
// import { NextResponse } from "next/server";
// import { connectMongoDB } from "@/lib/connectDb";
// import Attendance from "@/models/attendance";
// import Subject from "@/models/subject";
// import Classes from "@/models/className"; // Import the Classes model

// export async function POST(req) {
//     try {
//         await connectMongoDB();
//         const data = await req.json();
//         const { subject, session, presentStudents, contents, batch } = data; // Include batch in the request data

//         if (data) {
//             const date = new Date();

//             // Verify if the batch contains the subject reference
//             const classData = await Classes.findOne({ "batches._id": batch, "subjects": subject });
//             if (!classData) {
//                 return NextResponse.json({ message: "Batch does not contain the subject reference" }, { status: 400 });
//             }

//             const attendanceRecord = await Attendance.findOneAndUpdate(
//                 { date, subject, session, batch }, // Include batch in the query
//                 { 
//                     $setOnInsert: { date, subject, session, batch },
//                     $set: { records: presentStudents.map(student => ({ student, status: 'present' })) }
//                 },
//                 { upsert: true, new: true, runValidators: true }
//             );

//             await Subject.findByIdAndUpdate(
//                 subject,
//                 { $addToSet: { reports: attendanceRecord._id } }
//             );

//             // Update content status to covered and set completed date
//             if (contents && contents.length > 0) {
//                 await Subject.updateOne(
//                     { _id: subject },
//                     { 
//                         $set: { 
//                             "content.$[elem].status": "covered",
//                             "content.$[elem].completedDate": date
//                         }
//                     },
//                     {
//                         arrayFilters: [{ "elem.title": { $in: contents }, "elem.status": { $ne: "covered" } }]
//                     }
//                 );
//             }

//             console.log("Attendance Recorded Successfully", attendanceRecord);
//             return NextResponse.json({ message: "Attendance Recorded Successfully", attendance: attendanceRecord }, { status: 200 });
//         } else {
//             return NextResponse.json({ message: "Invalid Input Data" }, { status: 400 });
//         }
//     } catch (error) {
//         console.error("Error recording attendance:", error);
//         return NextResponse.json({ error: "Failed to Record Attendance" }, { status: 500 });
//     }
// }

// export async function PUT(req) {
//     try {
//         await connectMongoDB();
//         const data = await req.json();
//         const { _id, date, subject, records, coveredContents, batch } = data; // Include batch in the request data

//         // Validate and update each record if needed
//         const validatedRecords = records.map(record => ({
//             student: record.student,
//             status: record.status || 'absent' // Assuming default status if not provided
//         }));

//         const existingAttendance = await Attendance.findByIdAndUpdate(_id, {
//             date,
//             subject,
//             records: validatedRecords,
//             batch // Include batch in the update
//         }, { new: true });

//         if (!existingAttendance) {
//             return NextResponse.json({ error: "Attendance record not found" });
//         }

//         // Update content status to covered
//         if (coveredContents && coveredContents.length > 0) {
//             await Subject.updateOne(
//                 { _id: subject },
//                 { 
//                     $set: { "content.$[elem].status": "covered" }
//                 },
//                 {
//                     arrayFilters: [{ "elem.name": { $in: coveredContents } }]
//                 }
//             );
//         }

//         console.log("Attendance Updated Successfully", existingAttendance);
//         return NextResponse.json({ message: "Attendance Updated Successfully", attendance: existingAttendance });
//     } catch (error) {
//         console.error("Error updating attendance:", error);
//         return NextResponse.json({ error: "Failed to Update Attendance" });
//     }
// }

// export async function DELETE(req) {
//     try {
//         await connectMongoDB();
//         const { searchParams } = new URL(req.url);
//         const _id = searchParams.get("_id");
//         const deletedAttendance = await Attendance.findByIdAndDelete(_id);

//         if (!deletedAttendance) {
//             return NextResponse.json({ error: "Attendance record not found" }, { status: 404 });
//         }

//         console.log("Attendance Record Deleted Successfully", deletedAttendance);
//         return NextResponse.json({ message: "Attendance Record Deleted Successfully" }, { status: 200 });
//     } catch (error) {
//         console.error("Error deleting attendance record:", error);
//         return NextResponse.json({ error: "Failed to Delete Attendance Record" }, { status: 500 });
//     }
// }

// import { NextResponse } from "next/server";
// import { connectMongoDB } from "@/lib/connectDb";
// import Attendance from "@/models/attendance";
// import Classes from "@/models/className";
// import Student from "@/models/student";
// import Subject from "@/models/subject";
export async function POST(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { subject, session, contents, batchId, attendanceRecords } = data;
        console.log(data);
        const sessions =data.session
        if (subject && sessions && Array.isArray(sessions) && attendanceRecords) {
            const date = new Date();
            const attendanceResults = [];

            for (const session of sessions) {
                const filter = { date, subject, session };
                if (batchId) {
                    filter.batch = batchId;
                }

                const attendanceRecord = await Attendance.findOneAndUpdate(
                    filter,
                    {
                        $setOnInsert: { date, subject, session, ...(batchId && { batch: batchId }) },
                        $set: { records: attendanceRecords }
                    },
                    { upsert: true, new: true, runValidators: true }
                );

                await Subject.findByIdAndUpdate(
                    subject,
                    { $addToSet: { reports: attendanceRecord._id } }
                );

                attendanceResults.push(attendanceRecord);
            }

            // Update content status to covered and set completed date
            if (contents && contents.length > 0) {
                await Subject.updateOne(
                    { _id: subject },
                    {
                        $set: {
                            "content.$[elem].status": "covered",
                            "content.$[elem].completedDate": date
                        }
                    },
                    {
                        arrayFilters: [{ "elem.title": { $in: contents }, "elem.status": { $ne: "covered" } }]
                    }
                );
            }

            console.log("Attendance Recorded Successfully", attendanceResults);
            return NextResponse.json({ message: "Attendance Recorded Successfully", attendance: attendanceResults }, { status: 200 });
        } else {
            return NextResponse.json({ message: "Invalid Input Data" }, { status: 400 });
        }
    } catch (error) {
        console.error("Error recording attendance:", error);
        return NextResponse.json({ error: "Failed to Record Attendance" }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");
        const classId = searchParams.get("classId");
        const subjectId = searchParams.get("subjectId");
        const batchId = searchParams.get("batchId");
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

            const subjectIds = student.subjects;

            pipeline = [
                {
                    $match: {
                        subject: { $in: subjectIds },
                        date: { $gte: startDate, $lte: endDate }
                    }
                },
                ...(batchId ? [{ $match: { batch: batchId } }] : []),
                {
                    $group: {
                        _id: "$subject",
                        totalLectures: { $sum: 1 },
                        attendanceRecords: { $push: "$$ROOT" }
                    }
                },
                {
                    $unwind: "$attendanceRecords"
                },
                {
                    $unwind: "$attendanceRecords.records"
                },
                {
                    $match: {
                        "attendanceRecords.records.student": studentId
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        totalLectures: { $first: "$totalLectures" },
                        presentCount: {
                            $sum: { $cond: [{ $eq: ["$attendanceRecords.records.status", "present"] }, 1, 0] }
                        }
                    }
                },
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
                ...(batchId ? [{ $match: { batch: batchId } }] : []),
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
                ...(batchId ? [{ $match: { batch: batchId } }] : []),
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
// export async function GET(req) {
//     try {
//         await connectMongoDB();
//         const { searchParams } = new URL(req.url);
//         const studentId = searchParams.get("studentId");
//         const classId = searchParams.get("classId");
//         const subjectId = searchParams.get("subjectId");
//         const batchIds = searchParams.get("batchIds");
//         const allBatches = searchParams.get("allBatches");
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

//             const subjectIds = student.subjects;

//             pipeline = [
//                 {
//                     $match: {
//                         subject: { $in: subjectIds },
//                         date: { $gte: startDate, $lte: endDate }
//                     }
//                 },
//                 ...(batchIds ? [{ $match: { batch: { $in: batchIds.split(",") } } }] : []),
//                 {
//                     $group: {
//                         _id: "$subject",
//                         totalLectures: { $sum: 1 },
//                         attendanceRecords: { $push: "$$ROOT" }
//                     }
//                 },
//                 {
//                     $unwind: "$attendanceRecords"
//                 },
//                 {
//                     $unwind: "$attendanceRecords.records"
//                 },
//                 {
//                     $match: {
//                         "attendanceRecords.records.student": studentId
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: "$_id",
//                         totalLectures: { $first: "$totalLectures" },
//                         presentCount: {
//                             $sum: { $cond: [{ $eq: ["$attendanceRecords.records.status", "present"] }, 1, 0] }
//                         }
//                     }
//                 },
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
//         } else if (subjectId) {
//             pipeline = [
//                 dateMatch,
//                 {
//                     $match: {
//                         subject: subjectId
//                     }
//                 },
//                 ...(batchIds ? [{ $match: { batch: { $in: batchIds.split(",") } } }] : []),
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
//         } else if (classId) {
//             let batchMatch = {};
//             if (batchIds) {
//                 const batchIdArray = batchIds.split(',');
//                 batchMatch = { $match: { batch: { $in: batchIdArray } } };
//             } else if (!allBatches) {
//                 return NextResponse.json({ error: "Please specify batch(es) or select all batches" }, { status: 400 });
//             }

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
//                 { $unwind: "$subjectInfo" },
//                 {
//                     $match: {
//                         "subjectInfo.class": classId
//                     }
//                 },
//                 ...(Object.keys(batchMatch).length ? [batchMatch] : []),
//                 {
//                     $group: {
//                         _id: {
//                             subject: "$subject",
//                             batch: "$batch"
//                         },
//                         name: { $first: "$subjectInfo.name" },
//                         totalLectures: { $sum: 1 },
//                         records: { $push: "$records" }
//                     }
//                 },
//                 { $unwind: "$records" },
//                 { $unwind: "$records" },
//                 {
//                     $group: {
//                         _id: {
//                             subject: "$_id.subject",
//                             batch: "$_id.batch",
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
//                 { $unwind: "$studentInfo" },
//                 {
//                     $group: {
//                         _id: "$_id.subject",
//                         name: { $first: "$name" },
//                         totalLectures: {
//                             $push: {
//                                 k: "$_id.batch",
//                                 v: "$totalLectures"
//                             }
//                         },
//                         students: {
//                             $push: {
//                                 name: "$studentInfo.name",
//                                 rollNumber: "$studentInfo.rollNumber",
//                                 batch: "$_id.batch",
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
//                 { $unwind: "$facultyInfo" },
//                 {
//                     $project: {
//                         _id: 1,
//                         name: 1,
//                         totalLectures: {
//                             $arrayToObject: {
//                                 $let: {
//                                     vars: {
//                                         totalLecturesArray: {
//                                             $map: {
//                                                 input: "$totalLectures",
//                                                 as: "lecture",
//                                                 in: {
//                                                     k: "$$lecture.k",
//                                                     v: "$$lecture.v"
//                                                 }
//                                             }
//                                         }
//                                     },
//                                     in: {
//                                         $arrayToObject: "$$totalLecturesArray"
//                                     }
//                                 }
//                             }
//                         },
//                         students: 1,
//                         facultyName: "$facultyInfo.name"
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
