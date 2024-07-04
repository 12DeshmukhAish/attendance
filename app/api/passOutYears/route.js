import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Student from "@/models/student";

export async function GET(req) {
    try {
        await connectMongoDB();
        const passOutYears = await Student.distinct("passOutYear");
        return NextResponse.json(passOutYears, { status: 200 });
    } catch (error) {
        console.error("Error fetching pass-out years:", error);
        return NextResponse.json({ error: "Failed to Fetch Pass-out Years" }, { status: 500 });
    }
}
