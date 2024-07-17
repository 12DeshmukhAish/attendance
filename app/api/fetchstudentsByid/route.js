import { connectMongoDB } from "@/lib/connectDb";
import Student from "@/models/student";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const passOutYear = searchParams.get("passOutYear");
        const year = searchParams.get("year");
        const department = searchParams.get("department");

        let filter = {};
        // if (passOutYear) filter.passOutYear = passOutYear;
        if (year) filter.year = year;
        if (department && department !== "FE") filter.department = department;

        const students = await Student.find(filter).select("_id name").lean();
        console.log(students);
        return NextResponse.json(students, { status: 200 });
    } catch (error) {
        console.error("Error fetching students:", error);
        return NextResponse.json({ error: "Failed to Fetch Students" }, { status: 500 });
    }
}
