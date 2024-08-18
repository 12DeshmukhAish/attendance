import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";
import Classes from "@/models/className";
import Faculty from "@/models/faculty";
import Student from "@/models/student";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get("_id");
  const selectedBatchId = searchParams.get("batchId");
  console.log(subjectId);

  try {
    await connectMongoDB();
    let subject = null;
    let batches = [];
    let students = [];

    if (subjectId) {
      subject = await Subject.findById(subjectId).lean();
      if (subject) {
        if (subject.subType === 'practical' || subject.subType === 'tg') {
          if (subject.batch && subject.batch.length > 0) {
            batches = subject.batch;

            if (selectedBatchId) {
              const classDoc = await Classes.findById(subject.class).lean();
              if (classDoc) {
                const selectedBatch = classDoc.batches.find(batch => batch._id.toString() === selectedBatchId);
                if (selectedBatch) {
                  students = await Student.find({
                    _id: { $in: selectedBatch.students },
                    subjects: subjectId
                  }).select('_id rollNumber name').lean();
                }
              }
            }
          }
        } else {
          students = await Student.find({ class: subject.class, subjects: subjectId })
            .select('_id rollNumber name').lean();
        }

        // Include content for non-TG subjects
        if (subject.subType !== 'tg') {
          subject.content = subject.content || [];
        }

        // Include TG sessions for TG subjects
        if (subject.subType === 'tg') {
          subject.tgSessions = subject.tgSessions || [];
        }
      }
    } else {
      subject = await Subject.find().lean();
    }

    const teachers = await Faculty.find().select('_id name').lean();
    
    return NextResponse.json({ 
      subject, 
      batches, 
      students, 
      teachers,
      message: "Data fetched successfully"
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching subjects and teachers:", error);
    return NextResponse.json({ error: "Failed to fetch data", details: error.message }, { status: 500 });
  }
}