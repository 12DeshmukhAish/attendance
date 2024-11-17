import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Faculty from "@/models/faculty";
import Subject from "@/models/subject";
import Classes from "@/models/className";
import Student from "@/models/student";
import mongoose from "mongoose";

export async function POST(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { facultyId, name, department, email, password, isAdmin } = data;
        if(!department){
            console.log("department is not found",department);
            return NextResponse.json({error:"department is missing"})
          }
        console.log(data);
        const newFaculty = new Faculty({
            _id: facultyId,
            name,
            department,
            email,
            password,
            isAdmin,
        });

        await newFaculty.save();
        console.log(newFaculty);
        console.log("Faculty Registered Successfully", newFaculty);
        return NextResponse.json({ message: "Faculty Registered Successfully", faculty: newFaculty }, { status: 201 });
    } catch (error) {
        console.error("Error creating faculty:", error);
        return NextResponse.json({ error: "Failed to Register" }, { status: 500 });
    }
}


export async function PUT(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { 
            _id, 
            facultyId, 
            name, 
            department, 
            email, 
            password, 
            isAdmin,
            defaultAcademicYear,
            defaultSemester 
        } = data;

        if (!department) {
            console.log("department is not found", department);
            return NextResponse.json({ error: "department is missing" });
        }

        const updateData = {
            facultyId,
            name,
            department,
            email,
            password,
            isAdmin,
        };

        // Only include default settings if they are provided
        if (defaultAcademicYear) {
            updateData.defaultAcademicYear = defaultAcademicYear;
        }
        if (defaultSemester) {
            updateData.defaultSemester = defaultSemester;
        }

        const existingFaculty = await Faculty.findByIdAndUpdate(
            _id,
            updateData,
            { new: true }
        );

        if (!existingFaculty) {
            return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
        }

        console.log("Faculty Updated Successfully", existingFaculty);
        return NextResponse.json({ 
            message: "Faculty Updated Successfully", 
            faculty: existingFaculty 
        }, { status: 200 });

    } catch (error) {
        console.error("Error updating faculty:", error);
        return NextResponse.json({ error: "Failed to Update" }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");
        const department = searchParams.get("department");

        let filter = {};
        if (department) filter.department = department;

        console.log("Filter criteria:", filter);

        if (_id) {
            const faculty = await Faculty.findById(_id).lean();
            if (!faculty) {
                return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
            }

            // Fetch all subjects for the faculty
            const allSubjects = await Subject.find({
                _id: { $in: faculty.subjects }
            }).select('_id name isActive').lean();

            // Separate active and inactive subjects
            const activeSubjects = allSubjects.filter(subject => subject.isActive).map(subject=>subject._id);;
            const inactiveSubjectIds = allSubjects
                .filter(subject => !subject.isActive)
                .map(subject => subject._id);

            faculty.subjects = activeSubjects;
            if (inactiveSubjectIds.length > 0) {
                faculty.inactiveSubjects = inactiveSubjectIds;
            }

            console.log("Fetched Faculty Successfully", faculty);
            return NextResponse.json(faculty, { status: 200 });
        } else {
            const faculties = await Faculty.find(filter).lean();

            // Fetch subjects for all faculties
            const facultiesWithSubjects = await Promise.all(faculties.map(async (faculty) => {
                const allSubjects = await Subject.find({
                    _id: { $in: faculty.subjects }
                }).select('_id name isActive').lean();

                // Separate active and inactive subjects
                const activeSubjects = allSubjects.filter(subject => subject.isActive).map(subject=>subject._id);
                const inactiveSubjectIds = allSubjects
                    .filter(subject => !subject.isActive)
                    .map(subject => subject._id);

                    console.log(activeSubjects);
                    
                const result = {
                    ...faculty,
                    subjects: activeSubjects
                };

                if (inactiveSubjectIds.length > 0) {
                    result.inactiveSubjects = inactiveSubjectIds;
                }

                return result;
            }));

            console.log("Fetched Faculties Successfully", facultiesWithSubjects);
            return NextResponse.json(facultiesWithSubjects, { status: 200 });
        }
    } catch (error) {
        console.error("Error fetching faculties:", error);
        return NextResponse.json({ error: "Failed to Fetch Faculties" }, { status: 500 });
    }
}
export async function DELETE(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");

        // Start a session for transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Find the faculty to be deleted
            const deletedFaculty = await Faculty.findById(_id).session(session);

            if (!deletedFaculty) {
                await session.abortTransaction();
                session.endSession();
                return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
            }

            // Get the subjects taught by this faculty
            const subjectIds = deletedFaculty.subjects;

            // Remove faculty reference from subjects
            await Subject.updateMany(
                { _id: { $in: subjectIds } },
                { $unset: { teacher: "" } },
                { session }
            );

            // Remove subjects from classes
            await Classes.updateMany(
                { subjects: { $in: subjectIds } },
                { $pull: { subjects: { $in: subjectIds } } },
                { session }
            );

            // Remove teacher reference from classes
            await Classes.updateMany(
                { teacher: _id },
                { $unset: { teacher: "" } },
                { session }
            );

            // Remove subjects from students
            await Student.updateMany(
                { subjects: { $in: subjectIds } },
                { $pull: { subjects: { $in: subjectIds } } },
                { session }
            );

            // Delete the faculty
            await Faculty.findByIdAndDelete(_id, { session });

            // Commit the transaction
            await session.commitTransaction();
            session.endSession();

            console.log("Faculty and related references deleted successfully");
            return NextResponse.json({ message: "Faculty and related references deleted successfully" }, { status: 200 });
        } catch (error) {
            // If an error occurs, abort the transaction
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    } catch (error) {
        console.error("Error deleting faculty and references:", error);
        return NextResponse.json({ error: "Failed to delete faculty and references" }, { status: 500 });
    }
}