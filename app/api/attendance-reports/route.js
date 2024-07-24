import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Attendance from "@/models/attendance";
import Student from "@/models/student";
import Subject from "@/models/subject";
// export async function GET(req) {
//     try {
//         await connectMongoDB();
//         const { searchParams } = new URL(req.url);
//         const studentId = searchParams.get("studentId");
//         const classId = searchParams.get("classId");
//         const subjectId = searchParams.get("subjectId");
//         const startDate = new Date(searchParams.get("startDate"));
//         const endDate = new Date(searchParams.get("endDate"));

//         let pipeline = [];

//         const dateMatch = {
//             $match: {
//                 date: {
//                     $gte: startDate,
//                     $lte: endDate,
//                 },
//             },
//         };

//         if (studentId) {
//             const student = await Student.findOne({ _id: studentId }).lean();
//             if (!student) {
//                 console.log("Student not found:", studentId);
//                 return NextResponse.json({ error: "Student not found" }, { status: 404 });
//             }
    
//             console.log("Student found:", student);
    
//             // Get all subject IDs for the student
//             const subjectIds = student.subjects;
    
//             console.log("Subject IDs:", subjectIds);
    
//             pipeline = [
//                 // Match lectures for the given date range and subjects
//                 {
//                     $match: {
//                         subject: { $in: subjectIds },
//                         date: { $gte: startDate, $lte: endDate }
//                     }
//                 },
//                 // Group by subject to get total lecture count
//                 {
//                     $group: {
//                         _id: "$subject",
//                         totalLectures: { $sum: 1 },
//                         attendanceRecords: { $push: "$$ROOT" }
//                     }
//                 },
//                 // Unwind attendance records
//                 {
//                     $unwind: "$attendanceRecords"
//                 },
//                 // Unwind student records within each attendance record
//                 {
//                     $unwind: "$attendanceRecords.records"
//                 },
//                 // Match only the records for the specific student
//                 {
//                     $match: {
//                         "attendanceRecords.records.student": studentId
//                     }
//                 },
//                 // Group again to count present lectures
//                 {
//                     $group: {
//                         _id: "$_id",
//                         totalLectures: { $first: "$totalLectures" },
//                         presentCount: {
//                             $sum: { $cond: [{ $eq: ["$attendanceRecords.records.status", "present"] }, 1, 0] }
//                         }
//                     }
//                 },
//                 // Look up subject information
//                 {
//                     $lookup: {
//                         from: "subjects",
//                         localField: "_id",
//                         foreignField: "_id",
//                         as: "subjectInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$subjectInfo"
//                 },
//                 // Final projection
//                 {
//                     $project: {
//                         _id: 1,
//                         name: "$subjectInfo.name",
//                         totalLectures: 1,
//                         presentCount: 1,
//                         attendancePercentage: {
//                             $cond: [
//                                 { $eq: ["$totalLectures", 0] },
//                                 0,
//                                 {
//                                     $multiply: [
//                                         { $divide: ["$presentCount", "$totalLectures"] },
//                                         100
//                                     ]
//                                 }
//                             ]
//                         }
//                     }
//                 }
//             ];
//         } else if (classId) {
//             pipeline = [
//                 dateMatch,
//                 {
//                     $lookup: {
//                         from: "subjects",
//                         localField: "subject",
//                         foreignField: "_id",
//                         as: "subjectInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$subjectInfo"
//                 },
//                 {
//                     $match: {
//                         "subjectInfo.class": classId
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: "$subject",
//                         name: { $first: "$subjectInfo.name" },
//                         totalLectures: { $sum: 1 },
//                         records: { $push: "$records" }
//                     }
//                 },
//                 {
//                     $unwind: "$records"
//                 },
//                 {
//                     $unwind: "$records"
//                 },
//                 {
//                     $group: {
//                         _id: {
//                             subject: "$_id",
//                             student: "$records.student"
//                         },
//                         name: { $first: "$name" },
//                         totalLectures: { $first: "$totalLectures" },
//                         presentCount: {
//                             $sum: { $cond: [{ $eq: ["$records.status", "present"] }, 1, 0] }
//                         }
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "students",
//                         localField: "_id.student",
//                         foreignField: "_id",
//                         as: "studentInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$studentInfo"
//                 },
//                 {
//                     $group: {
//                         _id: "$_id.subject",
//                         name: { $first: "$name" },
//                         totalLectures: { $first: "$totalLectures" },
//                         students: {
//                             $push: {
//                                 name: "$studentInfo.name",
//                                 rollNumber: "$studentInfo.rollNumber",
//                                 presentCount: "$presentCount"
//                             }
//                         }
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "faculties",
//                         localField: "_id",
//                         foreignField: "subjects",
//                         as: "facultyInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$facultyInfo"
//                 },
//                 {
//                     $project: {
//                         _id: 1,
//                         name: 1,
//                         totalLectures: 1,
//                         students: 1,
//                         facultyName: "$facultyInfo.name"
//                     }
//                 }
//             ];
//         } else if (subjectId) {
//             pipeline = [
//                 dateMatch,
//                 {
//                     $match: {
//                         subject: subjectId
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: "$subject",
//                         totalLectures: { $sum: 1 },
//                         records: { $push: "$records" }
//                     }
//                 },
//                 {
//                     $unwind: "$records"
//                 },
//                 {
//                     $unwind: "$records"
//                 },
//                 {
//                     $group: {
//                         _id: {
//                             subject: "$_id",
//                             student: "$records.student"
//                         },
//                         totalLectures: { $first: "$totalLectures" },
//                         presentCount: {
//                             $sum: { $cond: [{ $eq: ["$records.status", "present"] }, 1, 0] }
//                         }
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "students",
//                         localField: "_id.student",
//                         foreignField: "_id",
//                         as: "studentInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$studentInfo"
//                 },
//                 {
//                     $lookup: {
//                         from: "subjects",
//                         localField: "_id.subject",
//                         foreignField: "_id",
//                         as: "subjectInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$subjectInfo"
//                 },
//                 {
//                     $lookup: {
//                         from: "faculties",
//                         localField: "subjectInfo.teacher",
//                         foreignField: "_id",
//                         as: "facultyInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$facultyInfo"
//                 },
//                 {
//                     $group: {
//                         _id: "$_id.subject",
//                         name: { $first: "$subjectInfo.name" },
//                         totalLectures: { $first: "$totalLectures" },
//                         students: {
//                             $push: {
//                                 name: "$studentInfo.name",
//                                 rollNumber: "$studentInfo.rollNumber",
//                                 presentCount: "$presentCount"
//                             }
//                         },
//                         facultyName: { $first: "$facultyInfo.name" }
//                     }
//                 }
//             ];
//         } else {
//             return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
//         }

//         const result = await Attendance.aggregate(pipeline);

//         if (!result || result.length === 0) {
//             return NextResponse.json({ error: "No data found" }, { status: 404 });
//         }

//         console.log("Attendance Report Generated Successfully", result);
//         return NextResponse.json(result, { status: 200 });
//     } catch (error) {
//         console.error("Error fetching attendance report:", error);
//         return NextResponse.json({ error: "Failed to Fetch Attendance Report" }, { status: 500 });
//     }
// }
// import { NextResponse } from "next/server";
// import { connectMongoDB } from "@/lib/connectDb";
// import Attendance from "@/models/attendance";
// import Student from "@/models/student";
// import Subject from "@/models/subject";
// import Classes from "@/models/className";

// export async function GET(req) {
//     try {
//         await connectMongoDB();
//         const { searchParams } = new URL(req.url);
//         const studentId = searchParams.get("studentId");
//         const classId = searchParams.get("classId");
//         const subjectId = searchParams.get("subjectId");
//         const batchId = searchParams.get("batchId");
//         const startDate = new Date(searchParams.get("startDate"));
//         const endDate = new Date(searchParams.get("endDate"));

//         let pipeline = [];

//         const dateMatch = {
//             $match: {
//                 date: {
//                     $gte: startDate,
//                     $lte: endDate,
//                 },
//             },
//         };

//         if (studentId) {
//             const student = await Student.findOne({ _id: studentId }).lean();
//             if (!student) {
//                 console.log("Student not found:", studentId);
//                 return NextResponse.json({ error: "Student not found" }, { status: 404 });
//             }

//             const subjectIds = student.subjects;

//             pipeline = [
//                 // Match lectures for the given date range and subjects
//                 {
//                     $match: {
//                         subject: { $in: subjectIds },
//                         date: { $gte: startDate, $lte: endDate }
//                     }
//                 },
//                 // If batch is provided, include it in the match criteria
//                 ...(batchId ? [{ $match: { batch: batchId } }] : []),
//                 // Group by subject to get total lecture count
//                 {
//                     $group: {
//                         _id: "$subject",
//                         totalLectures: { $sum: 1 },
//                         attendanceRecords: { $push: "$$ROOT" }
//                     }
//                 },
//                 // Unwind attendance records
//                 {
//                     $unwind: "$attendanceRecords"
//                 },
//                 // Unwind student records within each attendance record
//                 {
//                     $unwind: "$attendanceRecords.records"
//                 },
//                 // Match only the records for the specific student
//                 {
//                     $match: {
//                         "attendanceRecords.records.student": studentId
//                     }
//                 },
//                 // Group again to count present lectures
//                 {
//                     $group: {
//                         _id: "$_id",
//                         totalLectures: { $first: "$totalLectures" },
//                         presentCount: {
//                             $sum: { $cond: [{ $eq: ["$attendanceRecords.records.status", "present"] }, 1, 0] }
//                         }
//                     }
//                 },
//                 // Look up subject information
//                 {
//                     $lookup: {
//                         from: "subjects",
//                         localField: "_id",
//                         foreignField: "_id",
//                         as: "subjectInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$subjectInfo"
//                 },
//                 // Final projection
//                 {
//                     $project: {
//                         _id: 1,
//                         name: "$subjectInfo.name",
//                         totalLectures: 1,
//                         presentCount: 1,
//                         attendancePercentage: {
//                             $cond: [
//                                 { $eq: ["$totalLectures", 0] },
//                                 0,
//                                 {
//                                     $multiply: [
//                                         { $divide: ["$presentCount", "$totalLectures"] },
//                                         100
//                                     ]
//                                 }
//                             ]
//                         }
//                     }
//                 }
//             ];
//         } else if (classId) {
//             pipeline = [
//                 dateMatch,
//                 {
//                     $lookup: {
//                         from: "subjects",
//                         localField: "subject",
//                         foreignField: "_id",
//                         as: "subjectInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$subjectInfo"
//                 },
//                 {
//                     $match: {
//                         "subjectInfo.class": classId
//                     }
//                 },
//                 // If batch is provided, include it in the match criteria
//                 ...(batchId ? [{ $match: { batch: batchId } }] : []),
//                 {
//                     $group: {
//                         _id: "$subject",
//                         name: { $first: "$subjectInfo.name" },
//                         totalLectures: { $sum: 1 },
//                         records: { $push: "$records" }
//                     }
//                 },
//                 {
//                     $unwind: "$records"
//                 },
//                 {
//                     $unwind: "$records"
//                 },
//                 {
//                     $group: {
//                         _id: {
//                             subject: "$_id",
//                             student: "$records.student"
//                         },
//                         name: { $first: "$name" },
//                         totalLectures: { $first: "$totalLectures" },
//                         presentCount: {
//                             $sum: { $cond: [{ $eq: ["$records.status", "present"] }, 1, 0] }
//                         }
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "students",
//                         localField: "_id.student",
//                         foreignField: "_id",
//                         as: "studentInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$studentInfo"
//                 },
//                 {
//                     $group: {
//                         _id: "$_id.subject",
//                         name: { $first: "$name" },
//                         totalLectures: { $first: "$totalLectures" },
//                         students: {
//                             $push: {
//                                 name: "$studentInfo.name",
//                                 rollNumber: "$studentInfo.rollNumber",
//                                 presentCount: "$presentCount"
//                             }
//                         }
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "faculties",
//                         localField: "_id",
//                         foreignField: "subjects",
//                         as: "facultyInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$facultyInfo"
//                 },
//                 {
//                     $project: {
//                         _id: 1,
//                         name: 1,
//                         totalLectures: 1,
//                         students: 1,
//                         facultyName: "$facultyInfo.name"
//                     }
//                 }
//             ];
//         } else if (subjectId) {
//             pipeline = [
//                 dateMatch,
//                 {
//                     $match: {
//                         subject: subjectId
//                     }
//                 },
//                 // If batch is provided, include it in the match criteria
//                 ...(batchId ? [{ $match: { batch: batchId } }] : []),
//                 {
//                     $group: {
//                         _id: "$subject",
//                         totalLectures: { $sum: 1 },
//                         records: { $push: "$records" }
//                     }
//                 },
//                 {
//                     $unwind: "$records"
//                 },
//                 {
//                     $unwind: "$records"
//                 },
//                 {
//                     $group: {
//                         _id: {
//                             subject: "$_id",
//                             student: "$records.student"
//                         },
//                         totalLectures: { $first: "$totalLectures" },
//                         presentCount: {
//                             $sum: { $cond: [{ $eq: ["$records.status", "present"] }, 1, 0] }
//                         }
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "students",
//                         localField: "_id.student",
//                         foreignField: "_id",
//                         as: "studentInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$studentInfo"
//                 },
//                 {
//                     $lookup: {
//                         from: "subjects",
//                         localField: "_id.subject",
//                         foreignField: "_id",
//                         as: "subjectInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$subjectInfo"
//                 },
//                 {
//                     $lookup: {
//                         from: "faculties",
//                         localField: "subjectInfo.teacher",
//                         foreignField: "_id",
//                         as: "facultyInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$facultyInfo"
//                 },
//                 {
//                     $group: {
//                         _id: "$_id.subject",
//                         name: { $first: "$subjectInfo.name" },
//                         totalLectures: { $first: "$totalLectures" },
//                         students: {
//                             $push: {
//                                 name: "$studentInfo.name",
//                                 rollNumber: "$studentInfo.rollNumber",
//                                 presentCount: "$presentCount"
//                             }
//                         },
//                         facultyName: { $first: "$facultyInfo.name" }
//                     }
//                 }
//             ];
//         } else {
//             return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
//         }

//         const result = await Attendance.aggregate(pipeline);

//         if (!result || result.length === 0) {
//             return NextResponse.json({ error: "No data found" }, { status: 404 });
//         }

//         console.log("Attendance Report Generated Successfully", result);
//         return NextResponse.json(result, { status: 200 });
//     } catch (error) {
//         console.error("Error fetching attendance report:", error);
//         return NextResponse.json({ error: "Failed to Fetch Attendance Report" }, { status: 500 });
//     }
// }
export async function GET(req) {
    try {
      await connectMongoDB();
      const { searchParams } = new URL(req.url);
      const studentId = searchParams.get("studentId");
      const classId = searchParams.get("classId");
      const batchIdsString = searchParams.get("batchIds");
      const subjectId = searchParams.get("subjectId");
      const startDate = new Date(searchParams.get("startDate"));
      const endDate = new Date(searchParams.get("endDate"));
  
      // Convert comma-separated batchIds to an array
      const batchIds = batchIdsString ? batchIdsString.split(',') : [];
      
      let pipeline = [];
  
      const dateMatch = {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      };
  
      if (studentId) {
        const student = await Student.findOne({ _id: studentId }).lean();
        if (!student) {
          console.log("Student not found:", studentId);
          return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }
  
        const subjectIds = student.subjects;
  
        pipeline = [
          dateMatch,
          {
            $match: {
              subject: { $in: subjectIds },
              ...(batchIds.length ? { batch: { $in: batchIds } } : {}),
            },
          },
          {
            $group: {
              _id: "$subject",
              totalLectures: { $sum: 1 },
              attendanceRecords: { $push: "$$ROOT" }
            }
          },
          {
            $unwind: "$attendanceRecords"
          },
          {
            $unwind: "$attendanceRecords.records"
          },
          {
            $match: {
              "attendanceRecords.records.student": studentId
            }
          },
          {
            $group: {
              _id: "$_id",
              totalLectures: { $first: "$totalLectures" },
              presentCount: {
                $sum: { $cond: [{ $eq: ["$attendanceRecords.records.status", "present"] }, 1, 0] }
              }
            }
          },
          {
            $lookup: {
              from: "subjects",
              localField: "_id",
              foreignField: "_id",
              as: "subjectInfo"
            }
          },
          {
            $unwind: "$subjectInfo"
          },
          {
            $project: {
              _id: 1,
              name: "$subjectInfo.name",
              totalLectures: 1,
              presentCount: 1,
              attendancePercentage: {
                $cond: [
                  { $eq: ["$totalLectures", 0] },
                  0,
                  {
                    $multiply: [
                      { $divide: ["$presentCount", "$totalLectures"] },
                      100
                    ]
                  }
                ]
              }
            }
          }
        ];
      } else if (subjectId) {
        pipeline = [
          dateMatch,
          {
            $match: {
              subject: subjectId
            }
          },
          ...(batchIds.length ? [{ $match: { batch: { $in: batchIds } } }] : []),
          {
            $group: {
              _id: "$subject",
              totalLectures: { $sum: 1 },
              records: { $push: "$records" }
            }
          },
          {
            $unwind: "$records"
          },
          {
            $unwind: "$records"
          },
          {
            $group: {
              _id: {
                subject: "$_id",
                student: "$records.student"
              },
              totalLectures: { $first: "$totalLectures" },
              presentCount: {
                $sum: { $cond: [{ $eq: ["$records.status", "present"] }, 1, 0] }
              }
            }
          },
          {
            $lookup: {
              from: "students",
              localField: "_id.student",
              foreignField: "_id",
              as: "studentInfo"
            }
          },
          {
            $unwind: "$studentInfo"
          },
          {
            $lookup: {
              from: "subjects",
              localField: "_id.subject",
              foreignField: "_id",
              as: "subjectInfo"
            }
          },
          {
            $unwind: "$subjectInfo"
          },
          {
            $lookup: {
              from: "faculties",
              localField: "subjectInfo.teacher",
              foreignField: "_id",
              as: "facultyInfo"
            }
          },
          {
            $unwind: "$facultyInfo"
          },
          {
            $group: {
              _id: "$_id.subject",
              name: { $first: "$subjectInfo.name" },
              totalLectures: { $first: "$totalLectures" },
              students: {
                $push: {
                  name: "$studentInfo.name",
                  rollNumber: "$studentInfo.rollNumber",
                  presentCount: "$presentCount"
                }
              },
              facultyName: { $first: "$facultyInfo.name" }
            }
          }
        ];
      } else if (classId) {
      pipeline = [
        dateMatch,
        {
          $lookup: {
            from: "subjects",
            localField: "subject",
            foreignField: "_id",
            as: "subjectInfo"
          }
        },
        { $unwind: "$subjectInfo" },
        {
          $match: {
            "subjectInfo.class": classId
          }
        },
        {
          $group: {
            _id: {
              subject: "$subject",
              batch: "$batch"
            },
            name: { $first: "$subjectInfo.name" },
            totalLectures: { $sum: 1 },
            records: { $push: "$records" }
          }
        },
        { $unwind: "$records" },
        { $unwind: "$records" },
        {
          $group: {
            _id: {
              subject: "$_id.subject",
              batch: "$_id.batch",
              student: "$records.student"
            },
            name: { $first: "$name" },
            totalLectures: { $first: "$totalLectures" },
            presentCount: {
              $sum: { $cond: [{ $eq: ["$records.status", "present"] }, 1, 0] }
            }
          }
        },
        {
          $lookup: {
            from: "students",
            localField: "_id.student",
            foreignField: "_id",
            as: "studentInfo"
          }
        },
        { $unwind: "$studentInfo" },
        {
          $group: {
            _id: "$_id.subject",
            name: { $first: "$name" },
            batches: {
              $addToSet: "$_id.batch"
            },
            totalLectures: {
              $push: {
                k: { $ifNull: ["$_id.batch", "all"] },
                v: "$totalLectures"
              }
            },
            students: {
              $push: {
                name: "$studentInfo.name",
                rollNumber: "$studentInfo.rollNumber",
                batch:  "$_id.batch" ,
                presentCount: "$presentCount"
              }
            }
          }
        },
        {
          $lookup: {
            from: "faculties",
            localField: "_id",
            foreignField: "subjects",
            as: "facultyInfo"
          }
        },
        { $unwind: "$facultyInfo" },
        {
          $project: {
            _id: 1,
            name: 1,
            batches: 1,
            totalLectures: { $arrayToObject: "$totalLectures" },
            students: 1,
            facultyName: "$facultyInfo.name"
          }
        }
      ];
    }  else {
        return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
      }
  
      const result = await Attendance.aggregate(pipeline);
  
      if (!result || result.length === 0) {
        return NextResponse.json({ error: "No data found" }, { status: 404 });
      }
      const processedResult = result.map(subject => {
        if (subject.batches.length === 1 && typeof subject.batches[0] === 'string' && subject.batches[0].includes(',')) {
          const theoryBatches = subject.batches[0].split(',');
          const lectureCount = subject.totalLectures[subject.batches[0]] || 0;
          
          subject.batches = theoryBatches;
          subject.totalLectures = theoryBatches.reduce((acc, batch) => {
            acc[batch] = lectureCount;
            return acc;
          }, {});
        }
        
        // Ensure all batches have a lecture count, even if it's 0
        subject.batches.forEach(batch => {
          if (!subject.totalLectures[batch]) {
            subject.totalLectures[batch] = 0;
          }
        });
  
        return subject;
      });
  
      console.log("Attendance Report Generated Successfully", processedResult);
      return NextResponse.json(processedResult, { status: 200 });
    } catch (error) {
      console.error("Error fetching attendance report:", error);
      return NextResponse.json({ error: "Failed to Fetch Attendance Report" }, { status: 500 });
    }
  }