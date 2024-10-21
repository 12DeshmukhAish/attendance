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

        // Special handling for TG subjects
        if (subject.subType === 'tg') {
            if (data.tgSessions) {
                // Handle direct tgSessions update
                updateData.tgSessions = data.tgSessions.map(session => ({
                    date: formatDate(session.date),
                    pointsDiscussed: Array.isArray(session.pointsDiscussed) 
                        ? session.pointsDiscussed 
                        : session.pointsDiscussed.split(',').map(point => point.trim()),
                    _id: session._id // Preserve _id if it exists
                }));
            } else if (data.content?.tgSessions) {
                // Handle tgSessions nested in content
                updateData.tgSessions = data.content.tgSessions.map(session => ({
                    date: formatDate(session.date),
                    pointsDiscussed: Array.isArray(session.pointsDiscussed) 
                        ? session.pointsDiscussed 
                        : session.pointsDiscussed.split(',').map(point => point.trim()),
                    _id: session._id // Preserve _id if it exists
                }));
            }
            
            // Clear content for TG subjects
            updateData.content = [];
        } else {
            // Handle content updates for non-TG subjects
            if (data.content) {
                if (Array.isArray(data.content)) {
                    updateData.content = data.content.map(item => ({
                        ...item,
                        proposedDate: formatDate(item.proposedDate),
                        completedDate: subject.subType === 'theory' 
                            ? formatDate(item.completedDate) 
                            : undefined,
                        batchStatus: subject.subType === 'practical' && Array.isArray(item.batchStatus)
                            ? item.batchStatus.map(batch => ({
                                ...batch,
                                completedDate: formatDate(batch.completedDate)
                            }))
                            : undefined
                    }));
                } else {
                    updateData.content = {
                        ...data.content,
                        proposedDate: formatDate(data.content.proposedDate),
                        completedDate: subject.subType === 'theory' 
                            ? formatDate(data.content.completedDate) 
                            : undefined
                    };
                }
            }
        }

        // Perform the update with proper options
        const updatedSubject = await Subject.findByIdAndUpdate(
            _id,
            { $set: updateData },
            { 
                new: true,
                runValidators: true,
                context: 'query' // Important for running validators in update
            }
        );

        // Return success response
        return NextResponse.json({
            message: "Subject updated successfully",
            subject: updatedSubject
        }, { status: 200 });

    } catch (error) {
        console.error("Error updating subject:", error);
        return NextResponse.json({ 
            error: "Failed to update subject", 
            details: error.message 
        }, { status: 500 });
    }
}

// Helper function to format date
function formatDate(dateString) {
    if (!dateString) return undefined;
    
    try {
        // Handle various date formats
        let parsedDate;
        if (typeof dateString === 'string') {
            if (dateString.includes('T')) {
                // If it's already in ISO format
                parsedDate = new Date(dateString);
            } else {
                // If it's in dd-MM-yyyy format
                parsedDate = parse(dateString, 'dd-MM-yyyy', new Date());
            }
        } else {
            parsedDate = new Date(dateString);
        }

        // Return ISO string format
        return parsedDate.toISOString();
    } catch (error) {
        console.error("Error parsing date:", error);
        return dateString; // Return original string if parsing fails
    }
}