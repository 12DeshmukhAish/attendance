import { connectMongoDB } from '@/lib/connectDb';
import Attendance from '@/models/attendance';
import Subject from '@/models/subject';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { subject, session, contents, batchId, attendanceRecords } = data;
        console.log(data);

        if (subject && session && attendanceRecords) {
            const date = new Date();
            const sessions = Array.isArray(session) ? session : [session];

            const attendanceRecordsPromises = sessions.map(async (sess) => {
                const filter = { date, subject, session: sess };
                if (batchId) {
                    filter.batch = batchId;
                }

                const attendanceRecord = await Attendance.findOneAndUpdate(
                    filter,
                    {
                        $setOnInsert: { date, subject, session: sess, ...(batchId && { batch: batchId }) },
                        $set: { records: attendanceRecords }
                    },
                    { upsert: true, new: true, runValidators: true }
                );

                await Subject.findByIdAndUpdate(
                    subject,
                    { $addToSet: { reports: attendanceRecord._id } }
                );

                // Update content status to covered and set completed date in Indian format
                if (contents && contents.length > 0) {
                    const indianFormattedDate = date.toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    });

                    await Subject.updateOne(
                        { _id: subject },
                        {
                            $set: {
                                "content.$[elem].status": "covered",
                                "content.$[elem].completedDate": indianFormattedDate
                            }
                        },
                        {
                            arrayFilters: [{ "elem._id": { $in: contents }, "elem.status": { $ne: "covered" } }]
                        }
                    );
                }

                return attendanceRecord;
            });

            const attendanceRecordsResult = await Promise.all(attendanceRecordsPromises);

            console.log("Attendance Recorded Successfully", attendanceRecordsResult);
            return NextResponse.json({ message: "Attendance Recorded Successfully", attendance: attendanceRecordsResult }, { status: 200 });
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
        const { date, subject, session, batchId, attendanceRecords, contents } = data;

        if (!date || !Date.parse(date) || !subject || !session || !attendanceRecords) {
            return NextResponse.json({ message: "Invalid Input Data" }, { status: 400 });
        }

        const attendanceDate = new Date(date);
        const startOfDay = new Date(Date.UTC(attendanceDate.getUTCFullYear(), attendanceDate.getUTCMonth(), attendanceDate.getUTCDate()));
        const endOfDay = new Date(startOfDay);
        endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

        const sessions = Array.isArray(session) ? session : [session];

        const sessionPromises = sessions.map(async (sess) => {
            const filter = {
                date: { $gte: startOfDay, $lt: endOfDay },
                subject,
                session: sess
            };

            if (batchId) {
                filter.batch = batchId;
            }

            let attendanceRecord = await Attendance.findOne(filter);

            if (!attendanceRecord) {
                attendanceRecord = new Attendance({
                    date: attendanceDate,
                    subject,
                    session: sess,
                    records: attendanceRecords,
                    ...(batchId && { batch: batchId })
                });
            } else {
                attendanceRecord.date = attendanceDate;
                attendanceRecord.records = attendanceRecords;
            }

            await attendanceRecord.save();

            await Subject.findByIdAndUpdate(
                subject,
                { $addToSet: { reports: attendanceRecord._id } }
            );

            // Update content status to covered and set completed date in Indian format
            if (contents && contents.length > 0) {
                const indianFormattedDate = attendanceDate.toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });

                await Subject.updateOne(
                    { _id: subject },
                    {
                        $set: {
                            "content.$[elem].status": "covered",
                            "content.$[elem].completedDate": indianFormattedDate
                        }
                    },
                    {
                        arrayFilters: [{ "elem._id": { $in: contents }, "elem.status": { $ne: "covered" } }]
                    }
                );
            }

            return attendanceRecord;
        });

        const attendanceRecordsResult = await Promise.all(sessionPromises);

        return NextResponse.json({ message: "Attendance Updated/Created Successfully", attendance: attendanceRecordsResult }, { status: 200 });
    } catch (error) {
        console.error("Error updating/creating attendance:", error);
        return NextResponse.json({ error: "Failed to Update/Create Attendance" }, { status: 500 });
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

