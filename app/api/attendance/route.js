import { connectMongoDB } from '@/lib/connectDb';
import Attendance from '@/models/attendance';
import Subject from '@/models/subject';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { subject, session, contents, batchId, attendanceRecords, pointsDiscussed } = data;
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

                const subjectDoc = await Subject.findById(subject);

                // Handle TG (Teacher Guardian) type subject
                if (subjectDoc.subType === 'tg') {
                    if (pointsDiscussed && pointsDiscussed.length > 0) {
                        await Subject.findByIdAndUpdate(
                            subject,
                            {
                                $push: {
                                    tgSessions: {
                                        date: date,
                                        pointsDiscussed: pointsDiscussed
                                    }
                                }
                            }
                        );
                    }
                }

                // Handle practical subjects (course content is batch-specific)
                if (subjectDoc.subType === 'practical' && contents && contents.length > 0) {
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
                                "content.$[elem].batchStatus.$[batch].status": "covered",
                                "content.$[elem].batchStatus.$[batch].completedDate": indianFormattedDate
                            }
                        },
                        {
                            arrayFilters: [
                                { "elem._id": { $in: contents } },
                                { "batch.batchId": batchId, "batch.status": { $ne: "covered" } }
                            ]
                        }
                    );
                }

                // Handle theory subjects (course content is common for all)
                if (subjectDoc.subType === 'theory' && contents && contents.length > 0) {
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
                            arrayFilters: [
                                { "elem._id": { $in: contents }, "elem.status": { $ne: "covered" } }
                            ]
                        }
                    );
                }

                await Subject.findByIdAndUpdate(
                    subject,
                    { $addToSet: { reports: attendanceRecord._id } }
                );

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
        const { date, subject, session, batchId, attendanceRecords, contents, pointsDiscussed } = data;

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

            let attendanceRecord = await Attendance.findOneAndUpdate(
                filter,
                {
                    $set: {
                        date: attendanceDate,
                        records: attendanceRecords,
                        ...(batchId && { batch: batchId })
                    }
                },
                { upsert: true, new: true, runValidators: true }
            );

            const subjectDoc = await Subject.findById(subject);

            // Handle TG (Teacher Guardian) subjects
            if (subjectDoc.subType === 'tg' && pointsDiscussed && pointsDiscussed.length > 0) {
                const existingSessionIndex = subjectDoc.tgSessions.findIndex(
                    s => s.date.toDateString() === attendanceDate.toDateString()
                );

                if (existingSessionIndex !== -1) {
                    subjectDoc.tgSessions[existingSessionIndex].pointsDiscussed = pointsDiscussed;
                } else {
                    subjectDoc.tgSessions.push({ date: attendanceDate, pointsDiscussed });
                }
            }

            // Handle practical subjects (batch-specific course content)
            if (subjectDoc.subType === 'practical' && contents && contents.length > 0) {
                const indianFormattedDate = attendanceDate.toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });

                subjectDoc.content.forEach(content => {
                    if (contents.includes(content._id.toString())) {
                        const batchStatus = content.batchStatus.find(bs => bs.batchId === batchId);
                        if (batchStatus && batchStatus.status !== 'covered') {
                            batchStatus.status = 'covered';
                            batchStatus.completedDate = indianFormattedDate;
                        } else if (!batchStatus) {
                            content.batchStatus.push({
                                batchId: batchId,
                                status: 'covered',
                                completedDate: indianFormattedDate
                            });
                        }
                    }
                });
            }

            // Handle theory subjects (common course content)
            if (subjectDoc.subType === 'theory' && contents && contents.length > 0) {
                const indianFormattedDate = attendanceDate.toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });

                subjectDoc.content.forEach(content => {
                    if (contents.includes(content._id.toString()) && content.status !== 'covered') {
                        content.status = 'covered';
                        content.completedDate = indianFormattedDate;
                    }
                });
            }

            await subjectDoc.save();

            return attendanceRecord;
        });

        const attendanceRecordsResult = await Promise.all(sessionPromises);

        return NextResponse.json({ message: "Attendance Updated/Created Successfully", attendance: attendanceRecordsResult }, { status: 200 });
    } catch (error) {
        console.error("Error updating/creating attendance:", error);
        return NextResponse.json({ error: "Failed to Update/Create Attendance" }, { status: 500 });
    }
}
