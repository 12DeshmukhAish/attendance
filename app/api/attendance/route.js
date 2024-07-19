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
