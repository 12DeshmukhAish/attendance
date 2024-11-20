import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Attendance from "@/models/attendance";
import Subject from "@/models/subject";
import Classes from "@/models/className";
import Student from "@/models/student";
export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const department = searchParams.get("department");
        const classId = searchParams.get("classId");
        const semester = searchParams.get("semester");
        const subjectId = searchParams.get("subjectId");

        if (!classId || !semester) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        // Fetch class data with students
        const classData = await Classes.findOne({ 
            _id: classId,
            isActive: true,
            ...(department && { department })
        }).populate('students');

        if (!classData) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        // If subjectId is provided, fetch single subject, otherwise fetch all subjects
        const subjectQuery = subjectId 
            ? { _id: subjectId, isActive: true }
            : { _id: { $in: classData.subjects[semester] }, isActive: true };

        const subjects = await Subject.find(subjectQuery);

        if (subjects.length === 0) {
            return NextResponse.json({ error: "No subjects found for the given criteria" }, { status: 404 });
        }

        const subjectIds = subjects.map(s => s._id);

        // Fetch attendance data
        const attendanceData = await Attendance.aggregate([
            {
                $match: {
                    subject: { $in: subjectIds }
                }
            },
            { $unwind: '$records' },
            {
                $group: {
                    _id: {
                        student: '$records.student',
                        subject: '$subject'
                    },
                    totalLectures: { $sum: 1 },
                    presentCount: {
                        $sum: { $cond: [{ $eq: ['$records.status', 'present'] }, 1, 0] }
                    }
                }
            }
        ]);

        // Process attendance data based on whether it's for a single subject or all subjects
        let processedData;
        
        if (subjectId) {
            // Individual subject view
            processedData = classData.students.map(student => {
                const attendance = attendanceData.find(a => 
                    a._id.student.toString() === student._id.toString() && 
                    a._id.subject.toString() === subjectId
                ) || { totalLectures: 0, presentCount: 0 };

                return {
                    _id: student._id,
                    student: {
                        name: student.name,
                        rollNumber: student.rollNumber
                    },
                    totalLectures: attendance.totalLectures,
                    presentCount: attendance.presentCount,
                    percentage: attendance.totalLectures > 0 
                        ? (attendance.presentCount / attendance.totalLectures) * 100
                        : 0
                };
            });
        } else {
            // Cumulative view
            processedData = classData.students.map(student => {
                const studentAttendance = {
                    _id: student._id,
                    student: {
                        name: student.name,
                        rollNumber: student.rollNumber
                    },
                    theorySubjects: [],
                    practicalSubjects: [],
                    totalLectures: 0,
                    totalPresent: 0
                };

                subjects.forEach(subject => {
                    const attendance = attendanceData.find(a => 
                        a._id.student.toString() === student._id.toString() && 
                        a._id.subject.toString() === subject._id.toString()
                    ) || { totalLectures: 0, presentCount: 0 };

                    const subjectAttendance = {
                        name: subject.name,
                        totalLectures: attendance.totalLectures,
                        presentCount: attendance.presentCount,
                        percentage: attendance.totalLectures > 0 
                            ? (attendance.presentCount / attendance.totalLectures) * 100
                            : 0
                    };

                    if (subject.subType === 'theory' || subject.subType === 'tg') {
                        studentAttendance.theorySubjects.push(subjectAttendance);
                    } else if (subject.subType === 'practical') {
                        studentAttendance.practicalSubjects.push(subjectAttendance);
                    }

                    studentAttendance.totalLectures += attendance.totalLectures;
                    studentAttendance.totalPresent += attendance.presentCount;
                });

                studentAttendance.overallPercentage = studentAttendance.totalLectures > 0
                    ? (studentAttendance.totalPresent / studentAttendance.totalLectures) * 100
                    : 0;

                return studentAttendance;
            });
        }

        const response = {
            classInfo: {
                class: classId,
                semester,
                department: classData.department,
                name: classData.name || classId
            },
            subjects: subjects.map(s => ({
                _id: s._id,
                name: s.name,
                subType: s.subType
            })),
            attendance: processedData.sort((a, b) => 
                a.student.rollNumber.localeCompare(b.student.rollNumber)
            )
        };

        // Add summary for cumulative view
        if (!subjectId) {
            response.summary = {
                totalStudents: processedData.length,
                averageAttendance: processedData.reduce((sum, student) => 
                    sum + student.overallPercentage, 0) / processedData.length,
                belowThreshold: processedData.filter(student => 
                    student.overallPercentage < 75).length
            };
        }
        console.log(response);
        
        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error("Error fetching admin attendance:", error);
        return NextResponse.json({ 
            error: "Failed to fetch attendance data",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined 
        }, { status: 500 });
    }
}
// import { NextResponse } from "next/server";
// import { connectMongoDB } from "@/lib/connectDb";
// import Attendance from "@/models/attendance";
// import Subject from "@/models/subject";
// import Classes from "@/models/className";
// import Student from "@/models/student";

// export async function GET(req) {
//     try {
//         await connectMongoDB();
//         const { searchParams } = new URL(req.url);
//         const department = searchParams.get("department");
//         const classId = searchParams.get("classId");
//         const semester = searchParams.get("semester");
//         const subjectId = searchParams.get("subjectId");

//         if (!classId || !semester) {
//             return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
//         }

//         // Fetch class data with students
//         const classData = await Classes.findOne({ 
//             _id: classId,
//             isActive: true,
//             ...(department && { department })
//         }).populate('students');

//         if (!classData) {
//             return NextResponse.json({ error: "Class not found" }, { status: 404 });
//         }

//         // If subjectId is provided, fetch single subject, otherwise fetch all subjects
//         const subjectQuery = subjectId 
//             ? { _id: subjectId, isActive: true }
//             : { _id: { $in: classData.subjects[semester] }, isActive: true };

//         const subjects = await Subject.find(subjectQuery);

//         if (subjects.length === 0) {
//             return NextResponse.json({ error: "No subjects found for the given criteria" }, { status: 404 });
//         }

//         const subjectIds = subjects.map(s => s._id);

//         // Fetch attendance data with detailed aggregation
//         const attendanceData = await Attendance.aggregate([
//             {
//                 $match: {
//                     subject: { $in: subjectIds }
//                 }
//             },
//             { $unwind: '$records' },
//             {
//                 $group: {
//                     _id: {
//                         student: '$records.student',
//                         subject: '$subject'
//                     },
//                     totalLectures: { $sum: 1 },
//                     presentCount: {
//                         $sum: { $cond: [{ $eq: ['$records.status', 'present'] }, 1, 0] }
//                     }
//                 }
//             }
//         ]);

//         // Process attendance data
//         let processedData;
        
//         if (subjectId) {
//             // Individual subject view
//             processedData = classData.students.map(student => {
//                 const attendance = attendanceData.find(a => 
//                     a._id.student.toString() === student._id.toString() && 
//                     a._id.subject.toString() === subjectId
//                 ) || { totalLectures: 0, presentCount: 0 };

//                 return {
//                     _id: student._id,
//                     student: {
//                         name: student.name,
//                         rollNumber: student.rollNumber
//                     },
//                     totalLectures: attendance.totalLectures,
//                     presentCount: attendance.presentCount,
//                     percentage: attendance.totalLectures > 0 
//                         ? ((attendance.presentCount / attendance.totalLectures) * 100).toFixed(2)
//                         : '0.00'
//                 };
//             });
//         } else {
//             // Comprehensive cumulative view
//             processedData = classData.students.map(student => {
//                 const studentSubjectAttendance = subjects.map(subject => {
//                     const attendance = attendanceData.find(a => 
//                         a._id.student.toString() === student._id.toString() && 
//                         a._id.subject.toString() === subject._id.toString()
//                     ) || { totalLectures: 0, presentCount: 0 };

//                     return {
//                         subjectId: subject._id,
//                         subjectName: subject.name,
//                         subType: subject.subType,
//                         totalLectures: attendance.totalLectures,
//                         presentCount: attendance.presentCount,
//                         percentage: attendance.totalLectures > 0 
//                             ? ((attendance.presentCount / attendance.totalLectures) * 100).toFixed(2)
//                             : '0.00'
//                     };
//                 });

//                 // Separate theory and practical subjects
//                 const theorySubjects = studentSubjectAttendance.filter(s => 
//                     s.subType === 'theory' || s.subType === 'tg'
//                 );
//                 const practicalSubjects = studentSubjectAttendance.filter(s => 
//                     s.subType === 'practical'
//                 );

//                 // Calculate overall attendance
//                 const calculateOverallAttendance = (subjects) => {
//                     const totalLectures = subjects.reduce((sum, s) => sum + s.totalLectures, 0);
//                     const totalPresent = subjects.reduce((sum, s) => sum + s.presentCount, 0);
//                     return totalLectures > 0 
//                         ? ((totalPresent / totalLectures) * 100).toFixed(2)
//                         : '0.00';
//                 };

//                 return {
//                     _id: student._id,
//                     student: {
//                         name: student.name,
//                         rollNumber: student.rollNumber
//                     },
//                     theorySubjects,
//                     practicalSubjects,
//                     theoryAttendancePercentage: calculateOverallAttendance(theorySubjects),
//                     practicalAttendancePercentage: calculateOverallAttendance(practicalSubjects),
//                     overallAttendancePercentage: calculateOverallAttendance([
//                         ...theorySubjects, 
//                         ...practicalSubjects
//                     ])
//                 };
//             });
//         }

//         // Prepare response
//         const response = {
//             classInfo: {
//                 class: classId,
//                 semester,
//                 department: classData.department,
//                 name: classData.name || classId
//             },
//             subjects: subjects.map(s => ({
//                 _id: s._id,
//                 name: s.name,
//                 subType: s.subType
//             })),
//             attendance: processedData.sort((a, b) => 
//                 a.student.rollNumber.localeCompare(b.student.rollNumber)
//             )
//         };

//         // Add summary for cumulative view
//         if (!subjectId) {
//             response.summary = {
//                 totalStudents: processedData.length,
//                 averageOverallAttendance: (processedData.reduce((sum, student) => 
//                     sum + parseFloat(student.overallAttendancePercentage), 0) / processedData.length).toFixed(2),
//                 averageTheoryAttendance: (processedData.reduce((sum, student) => 
//                     sum + parseFloat(student.theoryAttendancePercentage), 0) / processedData.length).toFixed(2),
//                 averagePracticalAttendance: (processedData.reduce((sum, student) => 
//                     sum + parseFloat(student.practicalAttendancePercentage), 0) / processedData.length).toFixed(2),
//                 belowOverallThreshold: processedData.filter(student => 
//                     parseFloat(student.overallAttendancePercentage) < 75).length,
//                 belowTheoryThreshold: processedData.filter(student => 
//                     parseFloat(student.theoryAttendancePercentage) < 75).length,
//                 belowPracticalThreshold: processedData.filter(student => 
//                     parseFloat(student.practicalAttendancePercentage) < 75).length
//             };
//         }
        
//         return NextResponse.json(response, { status: 200 });
//     } catch (error) {
//         console.error("Error fetching admin attendance:", error);
//         return NextResponse.json({ 
//             error: "Failed to fetch attendance data",
//             details: process.env.NODE_ENV === 'development' ? error.message : undefined 
//         }, { status: 500 });
//     }
// }