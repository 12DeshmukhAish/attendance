import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";
import { parse, format, utcToZonedTime } from 'date-fns-tz';
// Update the PUT API handler
export async function PUT(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");

        if (!_id) {
            return NextResponse.json({ error: "Subject ID is required" }, { status: 400 });
        }

        const data = await req.json();
        console.log(data);

        let updateData = {};
        
        if (data.content) {
            updateData.content = data.content.map((item) => ({
                ...item,
                proposedDate: item.proposedDate ? formatDate(item.proposedDate) : undefined,
                completedDate: item.completedDate ? formatDate(item.completedDate) : undefined,
                batchStatus: item.batchStatus?.map(batch => ({
                    ...batch,
                    proposedDate: batch.proposedDate ? formatDate(batch.proposedDate) : undefined,
                    completedDate: batch.completedDate ? formatDate(batch.completedDate) : undefined
                }))
            }));
        }
        
        if (data.tgSessions) {
            updateData.tgSessions = data.tgSessions.map((session) => ({
                ...session,
                date: formatDate(session.date),
                pointsDiscussed: Array.isArray(session.pointsDiscussed) ? session.pointsDiscussed : [session.pointsDiscussed]
            }));
        }

        const existingSubject = await Subject.findByIdAndUpdate(_id, updateData, { new: true });

        if (!existingSubject) {
            return NextResponse.json({ error: "Subject not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Subject updated successfully", subject: existingSubject }, { status: 200 });
    } catch (error) {
        console.error("Error updating subject:", error);
        return NextResponse.json({ error: "Failed to update subject", details: error.message }, { status: 500 });
    }
}
