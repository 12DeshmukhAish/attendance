import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";
import { parse, format } from 'date-fns';

export async function PUT(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");

        // Validate Subject ID
        if (!_id) {
            return NextResponse.json({ error: "Subject ID is required" }, { status: 400 });
        }

        // Parse request data
        const data = await req.json();

        // Find the subject in the database
        const subject = await Subject.findById(_id);

        // Return 404 if subject not found
        if (!subject) {
            return NextResponse.json({ error: "Subject not found" }, { status: 404 });
        }

        // Initialize update data
        let updateData = {};

        // Handle 'content' field updates based on subject subtype
        if (data.content) {
            const { content } = data;

            // Handle tgSessions if present
            if (content.tgSessions) {
                updateData.tgSessions = content.tgSessions.map(session => ({
                    ...session,
                    date: session.date ? formatDate(session.date) : undefined,
                    pointsDiscussed: Array.isArray(session.pointsDiscussed) ?
                        session.pointsDiscussed :
                        (typeof session.pointsDiscussed === 'string' ? session.pointsDiscussed.split(',').map(point => point.trim()) : [])
                }));
            }

            // Handle general content updates
            if (Array.isArray(content)) {
                updateData.content = content.map(item => {
                    const formattedItem = {
                        ...item,
                        proposedDate: item.proposedDate ? formatDate(item.proposedDate) : undefined,
                        completedDate: subject.subType === 'theory' || subject.subType === 'tg' ?
                            (item.completedDate ? formatDate(item.completedDate) : undefined) :
                            undefined
                    };

                    // For practical subjects, handle batchStatus as an array of objects
                    if (subject.subType === 'practical' && Array.isArray(item.batchStatus)) {
                        formattedItem.batchStatus = item.batchStatus.map(batch => ({
                            ...batch,
                            completedDate: batch.completedDate ? formatDate(batch.completedDate) : undefined
                        }));
                    }

                    return formattedItem;
                });
            } else {
                // Handle case where content is not an array (for theory or TG subjects)
                updateData.content = {
                    ...content,
                    proposedDate: content.proposedDate ? formatDate(content.proposedDate) : undefined,
                    completedDate: subject.subType === 'theory' || subject.subType === 'tg' ?
                        (content.completedDate ? formatDate(content.completedDate) : undefined) :
                        undefined
                };
            }
        }

        // Update the subject with new data
        const updatedSubject = await Subject.findByIdAndUpdate(_id, updateData, { new: true });

        // Return success response
        return NextResponse.json({
            message: "Subject updated successfully",
            subject: updatedSubject
        }, { status: 200 });

    } catch (error) {
        console.error("Error updating subject:", error);
        return NextResponse.json({ error: "Failed to update subject", details: error.message }, { status: 500 });
    }
}

// Helper function to format date
function formatDate(dateString) {
    if (!dateString) return undefined;
    try {
        const parsedDate = parse(dateString, 'dd-MM-yyyy', new Date());
        return format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
    } catch (error) {
        console.error("Error parsing date:", error);
        return dateString; // Return original string if parsing fails
    }
}
