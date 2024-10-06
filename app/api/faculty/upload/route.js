import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Faculty from "@/models/faculty";
import mongoose from "mongoose";

export async function POST(req) {
    let session;
    try {
        await connectMongoDB();
        session = await mongoose.startSession();
        session.startTransaction();

        const data = await req.json();
        const { faculty } = data;
        console.log("Original data:", data);

        // Trim and process faculty data
        const processedFaculty = faculty.map(member => ({
            ...member,
            name: member.name.trim(),
            email: member.email.trim().toLowerCase(),
            // Trim all other fields except name and email
            ...Object.fromEntries(
                Object.entries(member)
                    .filter(([key]) => key !== 'name' && key !== 'email')
                    .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
            )
        }));

        console.log("Processed data:", processedFaculty);

        // Use updateMany with upsert option to update existing faculty or insert new ones
        const bulkOps = processedFaculty.map(member => ({
            updateOne: {
                filter: { _id: member._id },
                update: { $set: member },
                upsert: true
            }
        }));

        const result = await Faculty.bulkWrite(bulkOps, { session });
        
        await session.commitTransaction();
        session.endSession();

        console.log("Faculty Uploaded Successfully");
        console.log(result);
        return NextResponse.json({ message: "Faculty Uploaded Successfully", result }, { status: 201 });
    } catch (error) {
        console.error("Error uploading faculty:", error);
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        return NextResponse.json({ error: "Failed to Upload Faculty" }, { status: 500 });
    }
}