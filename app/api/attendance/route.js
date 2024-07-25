import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Attendance from "@/models/attendance";
import Subject from "@/models/subject";
import Student from "@/models/student";

export async function POST(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { subject, session, contents, batchId, attendanceRecords } = data;
        console.log(data);
        if (subject && session && attendanceRecords) {
            const date = new Date();
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
