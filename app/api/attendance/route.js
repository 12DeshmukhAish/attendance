import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Attendance from "@/models/attendance";
import Subject from "@/models/subject";

export async function POST(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { subject, session, presentStudents, contents } = data;

        if (data) {
            const date = new Date();
            const attendanceRecord = await Attendance.findOneAndUpdate(
                { date, subject, session },
                { 
                    $setOnInsert: { date, subject, session },
                    $set: { records: presentStudents.map(student => ({ student, status: 'present' })) }
                },
                { upsert: true, new: true, runValidators: true }
            );

            // Update the subject's reports array with the new attendance report reference
            await Subject.findByIdAndUpdate(
                subject,
                { $addToSet: { reports: attendanceRecord._id } }
            );

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

            console.log("Attendance Recorded Successfully", attendanceRecord);
            return NextResponse.json({ message: "Attendance Recorded Successfully", attendance: attendanceRecord }, { status: 200 });
        } else {
            return NextResponse.json({ message: "Invalid Input Data" }, { status: 400 });
        }
    } catch (error) {
        console.error("Error recording attendance:", error);
        return NextResponse.json({ error: "Failed to Record Attendance" }, { status: 500 });
    }
}
export async function PUT(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { _id, date, subject, records, coveredContents } = data; // Include coveredContents in the request data

        // Validate and update each record if needed
        const validatedRecords = records.map(record => ({
            student: record.student,
            status: record.status || 'absent' // Assuming default status if not provided
        }));

        const existingAttendance = await Attendance.findByIdAndUpdate(_id, {
            date,
            subject,
            records: validatedRecords
        }, { new: true });

        if (!existingAttendance) {
            return NextResponse.json({ error: "Attendance record not found" });
        }

        // Update content status to covered
        if (coveredContents && coveredContents.length > 0) {
            await Subject.updateOne(
                { _id: subject },
                { 
                    $set: { "content.$[elem].status": "covered" }
                },
                {
                    arrayFilters: [{ "elem.name": { $in: coveredContents } }]
                }
            );
        }

        console.log("Attendance Updated Successfully", existingAttendance);
        return NextResponse.json({ message: "Attendance Updated Successfully", attendance: existingAttendance });
    } catch (error) {
        console.error("Error updating attendance:", error);
        return NextResponse.json({ error: "Failed to Update Attendance" });
    }
}

export async function DELETE(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");
        const deletedAttendance = await Attendance.findByIdAndDelete(_id);

        if (!deletedAttendance) {
            return NextResponse.json({ error: "Attendance record not found" }, { status: 404 });
        }

        console.log("Attendance Record Deleted Successfully", deletedAttendance);
        return NextResponse.json({ message: "Attendance Record Deleted Successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting attendance record:", error);
        return NextResponse.json({ error: "Failed to Delete Attendance Record" }, { status: 500 });
    }
}

// export async function GET(req) {
//     try {
//         await connectMongoDB();
//         const { searchParams } = new URL(req.url);
//         const subjectId = searchParams.get("subjectId");
//         const startDate = new Date(searchParams.get("startDate"));
//         const endDate = new Date(searchParams.get("endDate"));

//         const pipeline = [
//             {
//                 $match: {
//                     subject: subjectId,
//                     date: {
//                         $gte: startDate,
//                         $lte: endDate
//                     }
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$subject",
//                     totalLectures: { $sum: 1 },
//                     records: { $push: "$records" }
//                 }
//             },
//             {
//                 $unwind: "$records"
//             },
//             {
//                 $unwind: "$records"
//             },
//             {
//                 $group: {
//                     _id: {
//                         subject: "$_id",
//                         student: "$records.student"
//                     },
//                     totalLectures: { $first: "$totalLectures" },
//                     presentCount: {
//                         $sum: {
//                             $cond: [{ $eq: ["$records.status", "present"] }, 1, 0]
//                         }
//                     }
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "students",
//                     localField: "_id.student",
//                     foreignField: "_id",
//                     as: "studentInfo"
//                 }
//             },
//             {
//                 $unwind: "$studentInfo"
//             },
//             {
//                 $lookup: {
//                     from: "subjects",
//                     localField: "_id.subject",
//                     foreignField: "_id",
//                     as: "subjectInfo"
//                 }
//             },
//             {
//                 $unwind: "$subjectInfo"
//             },
//             {
//                 $lookup: {
//                     from: "faculties",
//                     localField: "subjectInfo.teacher",
//                     foreignField: "_id",
//                     as: "teacherInfo"
//                 }
//             },
//             {
//                 $unwind: "$teacherInfo"
//             },
//             {
//                 $group: {
//                     _id: "$_id.subject",
//                     subjectName: { $first: "$subjectInfo.name" },
//                     teacherName: { $first: "$teacherInfo.name" },
//                     totalLectures: { $first: "$totalLectures" },
//                     students: {
//                         $push: {
//                             name: "$studentInfo.name",
//                             presentCount: "$presentCount",
//                             attendancePercentage: {
//                                 $multiply: [{ $divide: ["$presentCount", "$totalLectures"] }, 100]
//                             }
//                         }
//                     }
//                 }
//             }
//         ];

//         const [result] = await Attendance.aggregate(pipeline);

//         if (!result) {
//             return NextResponse.json({ error: "No data found" }, { status: 404 });
//         }

//         const formattedResult = {
//             subjectName: result.subjectName,
//             teacherName: result.teacherName,
//             totalLectures: result.totalLectures,
//             students: result.students
//         };

//         console.log("Aggregated Attendance Report Successfully", formattedResult);
//         return NextResponse.json(formattedResult, { status: 200 });
//     } catch (error) {
//         console.error("Error fetching aggregated attendance report:", error);
//         return NextResponse.json({ error: "Failed to Fetch Aggregated Attendance Report" }, { status: 500 });
//     }
// }
// export async function PUT(req, res) {
//     try {
//         await connectMongoDB();
//         const data = await req.json();
//         const { _id, date, subject, records, coveredContents } = data; // Include coveredContents in the request data

//         // Validate and update each record if needed
//         const validatedRecords = records.map(record => ({
//             student: record.student,
//             status: record.status || 'absent' // Assuming default status if not provided
//         }));
//         const existingAttendance = await Attendance.findByIdAndUpdate(_id, {
//             date : date ? new Date(date) : new Date(),
//             subject,
//             records: validatedRecords
//         }, { new: true });

//         if (!existingAttendance) {
//             return res.status(404).json({ error: "Attendance record not found" });
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
//         return res.status(200).json({ message: "Attendance Updated Successfully", attendance: existingAttendance });
//     } catch (error) {
//         console.error("Error updating attendance:", error);
//         return res.status(500).json({ error: "Failed to Update Attendance" });
//     }
// }


// export async function GET(req, res) {
//     try {
//         await connectMongoDB();
//         const { searchParams } = new URL(req.url, `http://localhost:${process.env.PORT || 3000}/`);
//         const subjectId = searchParams.get("subjectId");
//         const startDate = new Date(searchParams.get("startDate"));
//         const endDate = new Date(searchParams.get("endDate"));

//         // Query attendance records within the specified date range for the subject
//         const query = {
//             subject: subjectId,
//             // date: {
//             //     $gte: startDate,
//             //     $lte: endDate
//             // }
//         };

//         const attendances = await Attendance.find(query)
//             .populate({
//                 path: 'subject',
//                 model: 'Subject',
//                 select: 'name teacher',
//                 populate: {
//                     path: 'teacher',
//                     model: 'Faculty',
//                     select: 'name'
//                 }
//             })
//             .populate({
//                 path: 'records.student',
//                 model: 'Student',
//                 select: 'name'
//             })
//             .exec();

//         if (attendances.length === 0) {
//             return NextResponse.json({ error: "No attendance records found" },{status:404});
//         }

//         const formattedAttendances = attendances.map(attendance => ({
//             date: attendance.date,
//             subject: attendance.subject.name,
//             teacher: attendance.subject.teacher.name,
//             records: attendance.records.map(record => ({
//                 student: record.student.name,
//                 status: record.status
//             }))
//         }));

//         console.log("Attendance Reports Fetched Successfully", formattedAttendances);
//         return NextResponse.json(formattedAttendances,{status:200});
//     } catch (error) {
//         console.error("Error fetching attendance reports:", error);
//         return NextResponse.json({ error: "Failed to fetch attendance reports" },{status:500});
//     }
// }
