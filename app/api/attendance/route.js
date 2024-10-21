import { connectMongoDB } from '@/lib/connectDb';
import Attendance from '@/models/attendance';
import Subject from '@/models/subject';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { subject, session, batchId, attendanceRecords, pointsDiscussed } = data;

        if (!subject || !session || !attendanceRecords) {
            return NextResponse.json({ message: "Invalid Input Data" }, { status: 400 });
        }

        const date = new Date();
        const sessions = Array.isArray(session) ? session : [session];
        
        // Get the subject document
        const subjectDoc = await Subject.findById(subject);
        if (!subjectDoc) {
            return NextResponse.json({ message: "Subject not found" }, { status: 404 });
        }

        const attendanceRecordsPromises = sessions.map(async (sess) => {
            // Create attendance record
            const filter = { 
                date, 
                subject, 
                session: sess,
                ...(batchId && { batch: batchId })
            };

            const attendanceRecord = await Attendance.findOneAndUpdate(
                filter,
                {
                    $setOnInsert: filter,
                    $set: { records: attendanceRecords }
                },
                { upsert: true, new: true, runValidators: true }
            );

            // Handle TG sessions
            if (subjectDoc.subType === 'tg' && pointsDiscussed) {
                const formattedDate = date.toISOString().split('T')[0];
                const formattedPoints = Array.isArray(pointsDiscussed) ? pointsDiscussed : [pointsDiscussed];

                // Check if a session already exists for this date
                const existingSession = (subjectDoc.tgSessions || []).find(session => 
                    session.date === formattedDate
                );

                let updateQuery;
                if (existingSession) {
                    // Update existing session
                    updateQuery = {
                        $set: {
                            "tgSessions.$[elem].pointsDiscussed": formattedPoints
                        }
                    };
                    await Subject.findOneAndUpdate(
                        { _id: subject },
                        updateQuery,
                        {
                            arrayFilters: [{ "elem.date": formattedDate }],
                            new: true,
                            runValidators: true
                        }
                    );
                } else {
                    // Add new session
                    updateQuery = {
                        $push: {
                            tgSessions: {
                                $each: [{
                                    date: formattedDate,
                                    pointsDiscussed: formattedPoints
                                }],
                                $position: 0
                            }
                        }
                    };
                    await Subject.findOneAndUpdate(
                        { _id: subject },
                        updateQuery,
                        { new: true, runValidators: true }
                    );
                }
            }

            // Add attendance record reference
            await Subject.findByIdAndUpdate(
                subject,
                { $addToSet: { reports: attendanceRecord._id } }
            );

            return attendanceRecord;
        });

        const attendanceRecordsResult = await Promise.all(attendanceRecordsPromises);
        
        return NextResponse.json({ 
            message: "Attendance Recorded Successfully", 
            attendance: attendanceRecordsResult 
        }, { status: 200 });

    } catch (error) {
        console.error("Error recording attendance:", error);
        return NextResponse.json({ 
            error: "Failed to Record Attendance",
            details: error.message 
        }, { status: 500 });
    }
}
export async function PUT(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { date, subject, session, batchId, attendanceRecords, contents, pointsDiscussed } = data;

        console.log(data);
        
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

            // Fetch the subject document
            const subjectDoc = await Subject.findById(subject);
            if (!subjectDoc) {
                throw new Error('Subject not found');
            }
        console.log(subjectDoc);

            // Handle different subject types separately
            switch (subjectDoc.subType) {
                case 'tg':
                    if (pointsDiscussed && pointsDiscussed.length > 0) {
                        const formattedDate = attendanceDate.toISOString().split('T')[0];
                        const updateQuery = {
                            $set: {}
                        };

                        // Check if a session already exists for this date
                        const existingSessionIndex = (subjectDoc.tgSessions || []).findIndex(session => {
                            const sessionDate = new Date(session.date);
                            return sessionDate.toISOString().split('T')[0] === formattedDate;
                        });

                        if (existingSessionIndex !== -1) {
                            // Update existing session
                            updateQuery.$set[`tgSessions.${existingSessionIndex}.pointsDiscussed`] = pointsDiscussed;
                        } else {
                            // Add new session
                            updateQuery.$push = {
                                tgSessions: {
                                    date: formattedDate,
                                    pointsDiscussed
                                }
                            };
                        }

                        await Subject.findByIdAndUpdate(subject, updateQuery, { new: true, runValidators: true });
                    }
                    break;

                case 'practical':
                    if (contents && contents.length > 0 && batchId) {
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
                            { _id: subject, "content._id": { $in: contents } },
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
                    break;

                case 'theory':
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
                                arrayFilters: [
                                    { "elem._id": { $in: contents }, "elem.status": { $ne: "covered" } }
                                ]
                            }
                        );
                    }
                    break;
            }

            await Subject.findByIdAndUpdate(
                subject,
                { $addToSet: { reports: attendanceRecord._id } }
            );

            return attendanceRecord;
        });

        const attendanceRecordsResult = await Promise.all(sessionPromises);
        return NextResponse.json({
            message: "Attendance Updated/Created Successfully",
            attendance: attendanceRecordsResult
        }, { status: 200 });

    } catch (error) {
        console.error("Error updating/creating attendance:", error);
        return NextResponse.json({
            error: "Failed to Update/Create Attendance",
            details: error.message
        }, { status: 500 });
    }
}