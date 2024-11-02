import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Faculty from "@/models/faculty";

export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query");

        if (!query) {
            return NextResponse.json({ error: "Search query is required" }, { status: 400 });
        }

        // Create a regex pattern that matches the query in name, email, or phone
        const searchPattern = new RegExp(query, 'i');

        const faculty = await Faculty.find({
            $or: [
                { name: searchPattern },
                { email: searchPattern },
                { phone: searchPattern }
            ]
        }).select('_id name email phone department').limit(10);

        if (faculty.length === 0) {
            return NextResponse.json({ message: "No faculty members found" }, { status: 404 });
        }

        return NextResponse.json(faculty, { status: 200 });
    } catch (error) {
        console.error("Error searching faculty:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}