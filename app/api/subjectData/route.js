import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";
import Faculty from "@/models/faculty";
import Classes from "@/models/className";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const department = searchParams.get("department");
        let filter = {};
        if (department) filter.department = department;

        console.log("Filter criteria:", filter);
        await connectMongoDB();
        const subjects = await Subject.find(filter).select("_id name class teacher subType batch");
        const teachers = await Faculty.find().select('name _id');
        const classes = await Classes.find(filter).select('_id batches._id');
        console.log(subjects,classes);
        return NextResponse.json({ subjects, teachers ,classes}, { status: 200 });
    } catch (error) {
        console.error("Error fetching subjects and teachers:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
