import Faculty from "@/models/faculty";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const department = searchParams.get("department");

        let filter = {};
        if (department) filter.department = department;
        console.log("Filter criteria:", filter);
            const faculty = await Faculty.find().select("name _id").lean();
            if (!faculty) {
                return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
            }
            console.log("Fetched Faculty Successfully", faculty);
            return NextResponse.json(faculty, { status: 200 });
    } catch (error) {
        console.error("Error fetching faculties:", error);
        return NextResponse.json({ error: "Failed to Fetch Faculties" }, { status: 500 });
    }
}