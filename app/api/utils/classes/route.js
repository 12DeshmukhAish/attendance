import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Classes from "@/models/className";
export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const department = searchParams.get("department");

        let filter = {};
        if (department) filter.department = department;

        console.log("Filter criteria:", filter);

        const classes = await Classes.find(filter).select('_id subjects');
          
        if (classes.length === 0) {
            console.log("No classes found for criteria:", filter);
            return NextResponse.json({ status: 404 });
        }
        console.log("Fetched Classes Successfully", classes);
        return NextResponse.json(classes, { status: 200 });
    } catch (error) {
        console.error("Error fetching classes:", error);
        return NextResponse.json({ error: "Failed to Fetch Classes" }, { status: 500 });
    }
}
