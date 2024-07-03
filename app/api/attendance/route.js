import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Attendance from "@/models/attendance";

export async function POST(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { date, subject, records } = data;

        // Validate that each record has a student and status
        const validatedRecords = records.map(record => ({
            student: record.student,
            status: record.status || 'absent' // Assuming default status if not provided
        }));

        const newAttendance = new Attendance({
            date,
            subject,
            records: validatedRecords
        });

        await newAttendance.save();
        console.log("Attendance Recorded Successfully", newAttendance);
        return NextResponse.json({ message: "Attendance Recorded Successfully", attendance: newAttendance });
    } catch (error) {
        console.error("Error recording attendance:", error);
        return NextResponse.json({ error: "Failed to Record Attendance" });
    }
}

export async function PUT(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { _id, date, subject, records } = data;

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

        console.log("Attendance Updated Successfully", existingAttendance);
        return NextResponse.json({ message: "Attendance Updated Successfully", attendance: existingAttendance });
    } catch (error) {
        console.error("Error updating attendance:", error);
        return NextResponse.json({ error: "Failed to Update Attendance" });
    }
}

export async function GET(req) {
    try {
        await connectMongoDB();
        const attendances = await Attendance.find();

        console.log("Fetched Attendance Records Successfully", attendances);
        return NextResponse.json(attendances, { status: 200 });
    } catch (error) {
        console.error("Error fetching attendance records:", error);
        return NextResponse.json({ error: "Failed to Fetch Attendance Records" }, { status: 500 });
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
