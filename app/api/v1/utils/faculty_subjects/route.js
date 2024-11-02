// /api/v1/faculty/subjects.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";
import Classes from "@/models/className";
import { getCurrentAcademicYear } from "@/app/utils/acadmicYears";

export async function GET(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const facultyId = searchParams.get("facultyId");
    const semester = searchParams.get("semester")?.replace(/\D/g, ''); // Extract number from sem1/sem2
    const academicYear = searchParams.get("academicYear") || getCurrentAcademicYear();

    if (!facultyId || !semester) {
      return NextResponse.json(
        { error: "Faculty ID and semester are required" },
        { status: 400 }
      );
    }

    // First, get all subjects taught by the faculty
    const subjects = await Subject.find({
      teacher: facultyId,
      sem: `sem${semester}`,
      academicYear: academicYear,
      isActive: true
    }).lean();

    // Get unique class IDs from subjects
    const classIds = [...new Set(subjects.map(subject => subject.class))];

    // Fetch class details
    const classes = await Classes.find({
      _id: { $in: classIds },
      isActive: true
    }).lean();

    // Create a map of classes for easier lookup
    const classMap = classes.reduce((acc, cls) => {
      acc[cls._id] = cls;
      return acc;
    }, {});

    // Group subjects by class and include class details
    const groupedSubjects = subjects.reduce((acc, subject) => {
      const classId = subject.class;
      const classDetails = classMap[classId];

      if (!classDetails) return acc;

      if (!acc[classId]) {
        acc[classId] = {
          classId: classId,
          department: classDetails.department,
          year: classDetails.year,
          subjects: []
        };
      }

      acc[classId].subjects.push({
        _id: subject._id,
        name: subject.name,
        subType: subject.subType,
        batch: subject.batch
      });

      return acc;
    }, {});

    const response = Object.values(groupedSubjects);
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching faculty subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects", details: error.message },
      { status: 500 }
    );
  }
}
