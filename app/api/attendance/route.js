import { NextResponse } from "next/server";
// import { connectMongoDB } from "@/lib/connectDb";
// import Attendance from "@/models/attendance";
// import Subject from "@/models/subject";
// import Student from "@/models/student";

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
        const { subject, session, presentStudents, contents, batch } = data;
console.log(batch);
console.log(data);  
   if (data) {
            const date = new Date();

            // Ensure batch is a string if required
            const batchString = Array.isArray(batch) ? batch.join(',') : batch;

            const attendanceRecord = await Attendance.findOneAndUpdate(
                { date, subject, session, batch: batchString },
                { 
                    $setOnInsert: { date, subject, session, batch: batchString },
                    $set: { records: presentStudents.map(student => ({ student, status: 'present' })) }
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
export async function PUT(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { date, subject, session, batchId, attendanceRecords } = data;
        console.log("Received data:", data);

        if (!date || !Date.parse(date)) {
            return NextResponse.json({ message: "Invalid date format" }, { status: 400 });
        }

        const attendanceDate = new Date(date);
        console.log("Parsed attendance date:", attendanceDate);

        // Create a date range for the entire day in UTC
        const startOfDay = new Date(Date.UTC(attendanceDate.getUTCFullYear(), attendanceDate.getUTCMonth(), attendanceDate.getUTCDate()));
        const endOfDay = new Date(startOfDay);
        endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

        let filter = {
            date: { $gte: startOfDay, $lt: endOfDay },
            subject,
            session
        };

        if (batchId) {
            filter.batch = batchId;
        }

        console.log("Query filter:", JSON.stringify(filter));

        // First, try to find the document without updating
        let attendanceRecord = await Attendance.findOne(filter);

        if (!attendanceRecord) {
            console.log("No matching record found. Attempting to find without date filter.");
            // If not found, try without the date filter
            delete filter.date;
            attendanceRecord = await Attendance.findOne(filter);
        }

        if (!attendanceRecord) {
            console.log("Still no matching record found. Returning 404.");
            return NextResponse.json({ message: "Attendance Record Not Found" }, { status: 404 });
        }

        // If found, now update the record
        attendanceRecord = await Attendance.findOneAndUpdate(
            { _id: attendanceRecord._id },
            { $set: { records: attendanceRecords, date: attendanceDate } },
            { new: true, runValidators: true }
        );

        console.log("Attendance Updated Successfully", attendanceRecord);
        return NextResponse.json({ message: "Attendance Updated Successfully", attendance: attendanceRecord }, { status: 200 });
    } catch (error) {
        console.error("Error updating attendance:", error);
        return NextResponse.json({ error: "Failed to Update Attendance" }, { status: 500 });
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


export async function GET(req) {
    try {
        await connectMongoDB();
        const { date, subject, session, batchId } = req.query;

        if (subject && session) {
            const filter = { subject, session };
            if (date) {
                filter.date = new Date(date);
            }
            if (batchId) {
                filter.batch = batchId;
            }

            const attendanceRecord = await Attendance.findOne(filter);

            if (!attendanceRecord) {
                return NextResponse.json({ message: "Attendance Record Not Found" }, { status: 404 });
            }

            console.log("Attendance Fetched Successfully", attendanceRecord);
            return NextResponse.json({ message: "Attendance Fetched Successfully", attendance: attendanceRecord }, { status: 200 });
        } else {
            return NextResponse.json({ message: "Invalid Query Parameters" }, { status: 400 });
        }
    } catch (error) {
        console.error("Error fetching attendance:", error);
        return NextResponse.json({ error: "Failed to Fetch Attendance" }, { status: 500 });
    }
}
