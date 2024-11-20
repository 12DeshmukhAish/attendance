import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Classes from "@/models/className";
import Subject from "@/models/subject";
export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const department = searchParams.get("department");
        const year = searchParams.get("academicYear");
        const semester = searchParams.get("semester");

        // Build base filter
        let filter = {};
        if (department) filter.department = department;
        if (year) filter.year = year;

        if(!semester || !department || !year){
            return NextResponse.json("Missing daata ",{status:400})
        }
        console.log("Filter criteria:", filter);

        // Create projection based on semester
        let projection = { _id: 1 };
        if (semester === "sem1") {
            projection["subjects.sem1"] = 1;
        } else if (semester === "sem2") {
            projection["subjects.sem2"] = 1;
        } else {
            // If no semester specified, get both
            projection["subjects"] = 1;
        }

        // Fetch classes with populate for the specific semester's subjects
        const classes = await Classes.find(filter)
            .select(projection)
            .populate({
                path: semester === "sem1" ? "subjects.sem1" : 
                      semester === "sem2" ? "subjects.sem2" : 
                      "subjects.sem1 subjects.sem2",
                select: "name subType" // Add or modify fields you want from the Subject model
            });

        if (classes.length === 0) {
            console.log("No classes found for criteria:", filter);
            return NextResponse.json({ 
                message: "No classes found",
                status: 404 
            });
        }

        // Transform the response to make it cleaner
        const transformedClasses = classes.map(cls => {
            const classObj = cls.toObject();
            return {
                _id: classObj._id,
                subjects: semester === "sem1" ? classObj.subjects?.sem1 :
                         semester === "sem2" ? classObj.subjects?.sem2 :
                         {
                             sem1: classObj.subjects?.sem1,
                             sem2: classObj.subjects?.sem2
                         }
            };
        });
        console.log(transformedClasses);
        
        console.log("Fetched Classes Successfully");
        return NextResponse.json({
            status: 200,
            data: transformedClasses
        });

    } catch (error) {
        console.error("Error fetching classes:", error);
        return NextResponse.json({ 
            error: "Failed to Fetch Classes",
            message: error.message 
        }, { 
            status: 500 
        });
    }
}