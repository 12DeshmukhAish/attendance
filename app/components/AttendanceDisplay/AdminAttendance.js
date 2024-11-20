// "use client"

// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import {
//   Table,
//   TableHeader,
//   TableColumn,
//   TableBody,
//   TableRow,
//   TableCell,
//   Spinner,
//   Dropdown,
//   DropdownTrigger,
//   DropdownMenu,
//   DropdownItem,
//   Button,
//   Card,
//   CardBody,
//   CardHeader,
//   Tooltip,
//   Chip,
//   Tabs,
//   Tab
// } from "@nextui-org/react";
// import { Calendar, RefreshCcw, Download, AlertCircle } from "lucide-react";
// import * as XLSX from 'xlsx';
// import { getCurrentAcademicYear, getAcademicYears } from '@/app/utils/acadmicYears';
// import { departmentOptions } from '@/app/utils/department';

// export default function AdminAttendance({ adminId = '', department = '', role = '' }) {
//   const [attendanceData, setAttendanceData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [selectedClass, setSelectedClass] = useState('');
//   const [selectedSemester, setSelectedSemester] = useState('sem1');
//   const [classes, setClasses] = useState([]);
//   const [viewType, setViewType] = useState('cumulative');
//   const [selectedSubject, setSelectedSubject] = useState('');
//   const [selectedDepartment, setSelectedDepartment] = useState(department);
//   const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());

//   const fetchClasses = useCallback(async () => {
//     if (selectedDepartment && selectedSemester && academicYear) {
//       try {
//         setLoading(true);
//         const response = await axios.get(`/api/v1/utils/classes`, {
//           params: { department: selectedDepartment, academicYear, semester: selectedSemester }
//         });
        
//         if (response.data && Array.isArray(response.data.data)) {
//           const validClasses = response.data.data.filter(cls => cls && cls._id);
        
//           if (validClasses.length === 0) {
//             setError("No classes found for the selected criteria");
//             setClasses([]);
//             setSelectedClass('');
//             return;
//           }
    
//           setClasses(validClasses);
//           if (!selectedClass) {
//             setSelectedClass(validClasses[0]._id);
//           }
//         } else {
//           setError("Invalid data received from server");
//         }
//       } catch (err) {
//         console.error("Failed to fetch classes:", err);
//         setError("Failed to fetch classes. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     }
//   }, [selectedDepartment, selectedSemester, academicYear, selectedClass]);

//   const transformAttendanceData = useCallback((data) => {
//     if (!data) {
//       throw new Error("No data received");
//     }

//     // Handle individual subject view (summary format)
//     if (data.viewType === 'summary') {
//       return {
//         ...data,
//         summary: {
//           ...data.summary,
//           averageAttendance: parseFloat(data.summary.averageAttendance || 0)
//         },
//         attendance: Array.isArray(data.attendance) ? data.attendance : []
//       };
//     }

//     // Handle cumulative view
//     if (!data?.attendance || !Array.isArray(data.attendance)) {
//       throw new Error("Invalid attendance data format");
//     }

//     return {
//       ...data,
//       attendance: data.attendance.map(student => {
//         if (!student?.student?.rollNumber || !student?.student?.name) {
//           throw new Error("Invalid student data format");
//         }

//         const theorySubjects = Array.isArray(student.theorySubjects) ? student.theorySubjects : [];
//         const practicalSubjects = Array.isArray(student.practicalSubjects) ? student.practicalSubjects : [];

//         return {
//           ...student,
//           subjects: [
//             ...theorySubjects.map(subject => ({
//               name: subject.name || 'Unknown Subject',
//               total: parseInt(subject.totalLectures) || 0,
//               present: parseInt(subject.presentCount) || 0,
//               percentage: parseFloat(subject.percentage) || 0
//             })),
//             ...practicalSubjects.map(subject => ({
//               name: subject.name || 'Unknown Subject',
//               total: parseInt(subject.totalLectures) || 0,
//               present: parseInt(subject.presentCount) || 0,
//               percentage: parseFloat(subject.percentage) || 0
//             }))
//           ]
//         };
//       })
//     };
//   }, []);

//   const compareRollNumbers = (a, b) => {
//     const aMatch = a.match(/\d+/);
//     const bMatch = b.match(/\d+/);

//     if (aMatch && bMatch) {
//       const aNum = parseInt(aMatch[0]);
//       const bNum = parseInt(bMatch[0]);
//       if (aNum !== bNum) return aNum - bNum;
//     }

//     return a.localeCompare(b);
//   };

//   const handleApiError = useCallback((error, customMessage) => {
//     console.error(customMessage, error);
//     const errorMessage = error.response?.data?.error || error.message || customMessage;
//     setError(errorMessage);
//     setLoading(false);
//   }, []);

//   useEffect(() => {
//     setSelectedSubject('');
//     fetchClasses();
//   }, [fetchClasses, selectedSemester, academicYear]);

//   const fetchAttendance = useCallback(async () => {
//     if (!selectedClass) {
//       setError("Please select a class");
//       return;
//     }

//     if (viewType === 'individual' && !selectedSubject) {
//       setError("Please select a subject");
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const params = {
//         classId: selectedClass,
//         semester: selectedSemester,
//         department: selectedDepartment,
//         viewType: viewType === "individual" ? "summary" : viewType,
//         ...(viewType === 'individual' && { subjectId: selectedSubject })
//       };

//       const endpoint = viewType === 'individual' 
//         ? `/api/v1/attendance/faculty-attendance`
//         : '/api/v1/attendance/admin-attendance';

//       const response = await axios.get(endpoint, { params });
      
//       if (!response.data) {
//         throw new Error("No data received from server");
//       }
//       if (viewType === "cumulative") {
//         const transformedData = transformAttendanceData(response.data);
//         setAttendanceData(transformedData);
//       } else {
//         setAttendanceData(response.data);
//       }
//     } catch (err) {
//       handleApiError(err, "Failed to fetch attendance data");
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedClass, selectedSemester, selectedDepartment, viewType, selectedSubject, transformAttendanceData, handleApiError]);

//   const getAttendanceColor = (percentage) => {
//     if (typeof percentage !== 'number') return "text-gray-500";
//     if (percentage >= 75) return "text-green-500";
//     if (percentage >= 60) return "text-yellow-500";
//     return "text-red-500";
//   };
 
//   const renderSummaryTable = (batchData) => {
//     if (!batchData || !Array.isArray(batchData) || batchData.length === 0) {
//       return <div>No attendance data available</div>;
//     }

//     const sortedAttendance = [...batchData].sort((a, b) =>
//       compareRollNumbers(a.student.rollNumber, b.student.rollNumber)
//     );

//     return (
//       <Table aria-label="Attendance Summary Table">
//         <TableHeader>
//           <TableColumn>Roll Number</TableColumn>
//           <TableColumn>Student Name</TableColumn>
//           <TableColumn>Total Lectures</TableColumn>
//           <TableColumn>Present</TableColumn>
//           <TableColumn>Attendance %</TableColumn>
//         </TableHeader>
//         <TableBody>
//           {sortedAttendance.map((record) => (
//             <TableRow key={record._id}>
//               <TableCell>{record.student.rollNumber}</TableCell>
//               <TableCell>{record.student.name}</TableCell>
//               <TableCell>{record.totalLectures}</TableCell>
//               <TableCell>{record.presentCount}</TableCell>
//               <TableCell>
//                 <Chip
//                   color={record.percentage >= 75 ? "success" : "danger"}
//                   variant="flat"
//                 >
//                   {record.percentage.toFixed(2)}%
//                 </Chip>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     );
//   };

//   const renderAttendanceTable = () => {
//     if (!attendanceData?.attendance?.length) return null;
    
//     const theorySubjects = attendanceData.subjects?.filter(s => s.subType === 'theory') || [];
//     const practicalSubjects = attendanceData.subjects?.filter(s => s.subType === 'practical') || [];
//     const tgSubjects = attendanceData.subjects?.filter(s => s.subType === 'tg') || [];

//     return (
//       <div className="overflow-x-auto">
//         <table className="min-w-full bg-white border border-gray-300">
//           <thead>
//             <tr>
//               <th className="border px-4 py-2" rowSpan={2}>Roll No</th>
//               <th className="border px-4 py-2" rowSpan={2}>Student Name</th>
//               <th className="border px-4 py-2" colSpan={theorySubjects.length * 4}>Theory Subjects</th>
//               <th className="border px-4 py-2" colSpan={practicalSubjects.length * 4}>Practical Subjects</th>
//               <th className="border px-4 py-2" colSpan={tgSubjects.length * 4}>TG Subjects</th>
//               <th className="border px-4 py-2" colSpan={4}>Final Attendance</th>
//             </tr>
//             <tr>
//               {theorySubjects.map(subject => (
//                 <React.Fragment key={subject._id}>
//                   <th className="border px-4 py-2" colSpan={4}>{subject.name}</th>
//                 </React.Fragment>
//               ))}
//               {practicalSubjects.map(subject => (
//                 <React.Fragment key={subject._id}>
//                   <th className="border px-4 py-2" colSpan={4}>{subject.name}</th>
//                 </React.Fragment>
//               ))}
//               {tgSubjects.map(subject => (
//                 <React.Fragment key={subject._id}>
//                   <th className="border px-4 py-2" colSpan={4}>{subject.name}</th>
//                 </React.Fragment>
//               ))}
//               <th className="border px-4 py-2">Total</th>
//               <th className="border px-4 py-2">Present</th>
//               <th className="border px-4 py-2">%</th>
//             </tr>
//             <tr>
//               <th className="border px-4 py-2" colSpan={2}></th>
//               {[...theorySubjects, ...practicalSubjects, ...tgSubjects].map(() => (
//                 <React.Fragment key={`header-${Math.random()}`}>
//                   <th className="border px-4 py-2">Total</th>
//                   <th className="border px-4 py-2">Present</th>
//                   <th className="border px-4 py-2">Hours</th>
//                   <th className="border px-4 py-2">%</th>
//                 </React.Fragment>
//               ))}
//               <th className="border px-4 py-2" colSpan={3}></th>
//             </tr>
//           </thead>
//           <tbody>
//             {attendanceData.attendance.map((student) => (
//               <tr key={student._id}>
//                 <td className="border px-4 py-2">{student.student.rollNumber}</td>
//                 <td className="border px-4 py-2">{student.student.name}</td>
//                 {theorySubjects.map(subject => {
//                   const subjectData = student.subjects?.find(s => s.name === subject.name) || {};
//                   const hours = (subjectData.present || 0) * 1; // 1 hour per theory class
//                   return (
//                     <React.Fragment key={`theory-${subject._id}-${student._id}`}>
//                       <td className="border px-4 py-2">{subjectData.total || 0}</td>
//                       <td className="border px-4 py-2">{subjectData.present || 0}</td>
//                       <td className="border px-4 py-2">{hours}</td>
//                       <td className={`border px-4 py-2 ${getAttendanceColor(subjectData.percentage)}`}>
//                         {subjectData.percentage ? subjectData.percentage.toFixed(2) : '0.00'}%
//                       </td>
//                     </React.Fragment>
//                   );
//                 })}
//                 {practicalSubjects.map(subject => {
//                   const subjectData = student.subjects?.find(s => s.name === subject.name) || {};
//                   const hours = (subjectData.present || 0) * 2; // 2 hours per practical class
//                   return (
//                     <React.Fragment key={`practical-${subject._id}-${student._id}`}>
//                       <td className="border px-4 py-2">{subjectData.total || 0}</td>
//                       <td className="border px-4 py-2">{subjectData.present || 0}</td>
//                       <td className="border px-4 py-2">{hours}</td>
//                       <td className={`border px-4 py-2 ${getAttendanceColor(subjectData.percentage)}`}>
//                         {subjectData.percentage ? subjectData.percentage.toFixed(2) : '0.00'}%
//                       </td>
//                     </React.Fragment>
//                   );
//                 })}
//                 {tgSubjects.map(subject => {
//                   const subjectData = student.subjects?.find(s => s.name === subject.name) || {};
//                   const hours = (subjectData.present || 0) * 1; // 1 hour per TG class
//                   return (
//                     <React.Fragment key={`tg-${subject._id}-${student._id}`}>
//                       <td className="border px-4 py-2">{subjectData.total || 0}</td>
//                       <td className="border px-4 py-2">{subjectData.present || 0}</td>
//                       <td className="border px-4 py-2">{hours}</td>
//                       <td className={`border px-4  py-2 ${getAttendanceColor(subjectData.percentage)}`}>
//                         {subjectData.percentage ? subjectData.percentage.toFixed(2) : '0.00'}%
//                       </td>
//                     </React.Fragment>
//                   );
//                 })}
//                 <td className="border px-4 py-2">{student.totalLectures}</td>
//                 <td className="border px-4 py-2">{student.totalPresent}</td>
//                 <td className={`border px-4 py-2 ${getAttendanceColor(student.overallPercentage)}`}>
//                   {student.overallPercentage ? student.overallPercentage.toFixed(2) : '0.00'}%
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     );
//   };

//   const generateExcelReport = useCallback(() => {
//     if (!attendanceData?.attendance) return;

//     const attendance = Array.isArray(attendanceData.attendance) ? attendanceData.attendance : Object.values(attendanceData.attendance).flat();
    
//     if (attendance.length === 0) return;
  
//     if (viewType === 'individual') {
//       const wb = XLSX.utils.book_new();
//       const subjectType = attendanceData.subjectInfo?.subType;
//       const subjectName = attendanceData.subjectInfo?.name || 'Subject';
  
//       if (subjectType === 'practical' || subjectType === 'tg') {
//         // Handle practical and TG subjects with batch-wise data
//         Object.entries(attendanceData.attendance).forEach(([batchName, batchData]) => {
//           // Create summary data
//           const summaryData = [
//             ['Subject', subjectName],
//             ['Type', subjectType.toUpperCase()],
//             ['Batch', batchName],
//             ['Total Students', batchData.length],
//             ['Average Attendance', `${(batchData.reduce((acc, curr) => acc + curr.percentage, 0) / batchData.length).toFixed(2)}%`],
//             ['Below Threshold', batchData.filter(student => student.percentage < 75).length],
//             [''],  // Empty row for spacing
//           ];
  
//           // Create attendance data
//           const attendanceData = [
//             ['Roll Number', 'Student Name', 'Total Lectures', 'Present', 'Attendance %'],
//             ...batchData.map(student => [
//               student.student.rollNumber,
//               student.student.name,
//               student.totalLectures,
//               student.presentCount,
//               `${student.percentage.toFixed(2)}%`
//             ])
//           ];
  
//           // Combine summary and attendance data
//           const wsData = [...summaryData, ...attendanceData];
//           const ws = XLSX.utils.aoa_to_sheet(wsData);
  
//           // Set column widths
//           ws['!cols'] = [
//             { wch: 15 }, // First column
//             { wch: 25 }, // Second column
//             { wch: 15 }, // Third column
//             { wch: 15 }, // Fourth column
//             { wch: 15 }  // Fifth column
//           ];
  
//           // Add styles for summary section
//           const summaryRange = XLSX.utils.decode_range('A1:B6');
//           for (let R = summaryRange.s.r; R <= summaryRange.e.r; R++) {
//             for (let C = summaryRange.s.c; C <= summaryRange.e.c; C++) {
//               const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
//               if (!ws[cellRef]) continue;
//               ws[cellRef].s = {
//                 font: { bold: true },
//                 fill: { fgColor: { rgb: "EFEFEF" } }
//               };
//             }
//           }
  
//           // Add styles for header row
//           const headerRow = 8; // Row index of the attendance data header
//           const headerRange = XLSX.utils.decode_range(`A${headerRow}:E${headerRow}`);
//           for (let C = headerRange.s.c; C <= headerRange.e.c; C++) {
//             const cellRef = XLSX.utils.encode_cell({ r: headerRow - 1, c: C });
//             ws[cellRef].s = {
//               font: { bold: true },
//               fill: { fgColor: { rgb: "DDEBF7" } },
//               border: {
//                 top: { style: 'thin' },
//                 bottom: { style: 'thin' },
//                 left: { style: 'thin' },
//                 right: { style: 'thin' }
//               }
//             };
//           }
  
//           XLSX.utils.book_append_sheet(wb, ws, `Batch ${batchName}`);
//         });
//       } else {
//         // Handle theory subjects
//         // Create summary data
//         const summaryData = [
//           ['Subject', subjectName],
//           ['Type', 'THEORY'],
//           ['Total Students', attendance.length],
//           ['Average Attendance', `${(attendance.reduce((acc, curr) => acc + curr.percentage, 0) / attendance.length).toFixed(2)}%`],
//           ['Below Threshold', attendance.filter(student => student.percentage < 75).length],
//           [''],  // Empty row for spacing
//         ];
  
//         // Create attendance data
//         const attendanceData = [
//           ['Roll Number', 'Student Name', 'Total Lectures', 'Present', 'Attendance %'],
//           ...attendance.map(student => [
//             student.student.rollNumber,
//             student.student.name,
//             student.totalLectures,
//             student.presentCount,
//             `${student.percentage.toFixed(2)}%`
//           ])
//         ];
  
//         // Combine summary and attendance data
//         const wsData = [...summaryData, ...attendanceData];
//         const ws = XLSX.utils.aoa_to_sheet(wsData);
  
//         // Set column widths
//         ws['!cols'] = [
//           { wch: 15 }, // Roll Number
//           { wch: 25 }, // Student Name
//           { wch: 15 }, // Total Lectures
//           { wch: 15 }, // Present
//           { wch: 15 }  // Attendance %
//         ];
  
//         // Add styles for summary section
//         const summaryRange = XLSX.utils.decode_range('A1:B5');
//         for (let R = summaryRange.s.r; R <= summaryRange.e.r; R++) {
//           for (let C = summaryRange.s.c; C <= summaryRange.e.c; C++) {
//             const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
//             if (!ws[cellRef]) continue;
//             ws[cellRef].s = {
//               font: { bold: true },
//               fill: { fgColor: { rgb: "EFEFEF" } }
//             };
//           }
//         }
  
//         // Add styles for header row
//         const headerRow = 7; // Row index of the attendance data header
//         const headerRange = XLSX.utils.decode_range(`A${headerRow}:E${headerRow}`);
//         for (let C = headerRange.s.c; C <= headerRange.e.c; C++) {
//           const cellRef = XLSX.utils.encode_cell({ r: headerRow - 1, c: C });
//           ws[cellRef].s = {
//             font: { bold: true },
//             fill: { fgColor: { rgb: "DDEBF7" } },
//             border: {
//               top: { style: 'thin' },
//               bottom: { style: 'thin' },
//               left: { style: 'thin' },
//               right: { style: 'thin' }
//             }
//           };
//         }
  
//         XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
//       }
  
//       XLSX.writeFile(wb, `${subjectName}_Attendance_${new Date().toISOString().split('T')[0]}.xlsx`);
//       return;
//     }
  
//     // Rest of the cumulative view code remains the same...
//     const theorySubjects = attendanceData.subjects?.filter(s => s.subType === 'theory') || [];
//     const practicalSubjects = attendanceData.subjects?.filter(s => s.subType === 'practical') || [];
//     const tgSubjects = attendanceData.subjects?.filter(s => s.subType === 'tg') || [];
  
//     // Create headers with grouping
//     const headers = [
//       ['Student Information', '', 'Theory Subjects', '', '', '', ...Array(Math.max(0, (theorySubjects.length - 1) * 4)).fill(''),
//        'Practical Subjects', '', '', '', ...Array(Math.max(0, (practicalSubjects.length - 1) * 4)).fill(''),
//        'TG Subjects', '', '', '', ...Array(Math.max(0, (tgSubjects.length - 1) * 4)).fill(''),
//        'Final Attendance', '', '', ''],
//       ['Roll Number', 'Student Name', 
//        ...theorySubjects.map(subject => [subject.name, '', '', '']).flat(),
//        ...practicalSubjects.map(subject => [subject.name, '', '', '']).flat(),
//        ...tgSubjects.map(subject => [subject.name, '', '', '']).flat(),
//        'Overall', '', '', ''],
//       ['', '', 
//        ...theorySubjects.map(() => ['Total', 'Present', 'Hours', '%']).flat(),
//        ...practicalSubjects.map(() => ['Total', 'Present', 'Hours', '%']).flat(),
//        ...tgSubjects.map(() => ['Total', 'Present', 'Hours', '%']).flat(),
//        'Total', 'Present', 'Hours', '%']
//     ];
  
//     // Prepare data rows
//     const dataRows = attendance.map(student => {
//       const row = [
//         student.student.rollNumber,
//         student.student.name
//       ];
  
//       // Add theory subjects data
//       theorySubjects.forEach(subject => {
//         const subjectData = student.subjects?.find(s => s.name === subject.name) || {};
//         row.push(
//           subjectData.total || 0,
//           subjectData.present || 0,
//           (subjectData.present || 0) * 1,
//           subjectData.percentage ? `${subjectData.percentage.toFixed(2)}%` : '0.00%'
//         );
//       });
  
//       // Add practical subjects data
//       practicalSubjects.forEach(subject => {
//         const subjectData = student.subjects?.find(s => s.name === subject.name) || {};
//         row.push(
//           subjectData.total || 0,
//           subjectData.present || 0,
//           (subjectData.present || 0) * 2,
//           subjectData.percentage ? `${subjectData.percentage.toFixed(2)}%` : '0.00%'
//         );
//       });
  
//       // Add TG subjects data
//       tgSubjects.forEach(subject => {
//         const subjectData = student.subjects?.find(s => s.name === subject.name) || {};
//         row.push(
//           subjectData.total || 0,
//           subjectData.present || 0,
//           (subjectData.present || 0) * 1,
//           subjectData.percentage ? `${subjectData.percentage.toFixed(2)}%` : '0.00%'
//         );
//       });
  
//       // Add final attendance data
//       row.push(
//         student.totalLectures,
//         student.totalPresent,
//         student.totalHours,
//         student.overallPercentage ? `${student.overallPercentage.toFixed(2)}%` : '0.00%'
//       );
  
//       return row;
//     });
  
//     // Create workbook and worksheet
//     const wb = XLSX.utils.book_new();
//     const ws = XLSX.utils.aoa_to_sheet([...headers, ...dataRows]);
  
//     // Add style to headers
//     const range = XLSX.utils.decode_range(ws['!ref']);
//     const merges = [];
  
//     // Merge cells for main group headers
//     let currentCol = 2; // Start after student info columns
  
//     // Theory subjects
//     if (theorySubjects.length > 0) {
//       merges.push({
//         s: { r: 0, c: currentCol },
//         e: { r: 0, c: currentCol + (theorySubjects.length * 4) - 1 }
//       });
//       currentCol += theorySubjects.length * 4;
//     }
  
//     // Practical subjects
//     if (practicalSubjects.length > 0) {
//       merges.push({
//         s: { r: 0, c: currentCol },
//         e: { r: 0, c: currentCol + (practicalSubjects.length * 4) - 1 }
//       });
//       currentCol += practicalSubjects.length * 4;
//     }
  
//     // TG subjects
//     if (tgSubjects.length > 0) {
//       merges.push({
//         s: { r: 0, c: currentCol },
//         e: { r: 0, c: currentCol + (tgSubjects.length * 4) - 1 }
//       });
//     }
  
//     // Merge subject name cells
//     const allSubjects = [...theorySubjects, ...practicalSubjects, ...tgSubjects];
//     let subjectCol = 2;
//     allSubjects.forEach(() => {
//       merges.push({
//         s: { r: 1, c: subjectCol },
//         e: { r: 1, c: subjectCol + 3 }
//       });
//       subjectCol += 4;
//     });
  
//     ws['!merges'] = merges;
  
//     // Set column widths
//     ws['!cols'] = [
//       { wch: 15 }, // Roll Number
//       { wch: 25 }, // Student Name
//       ...Array(range.e.c - 1).fill({ wch: 12 }) // Other columns
//     ];
  
//     XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
//     XLSX.writeFile(wb, `Attendance_Report_${attendanceData.classInfo?.name || selectedClass}_${selectedSemester}_${new Date().toISOString().split('T')[0]}.xlsx`);
//   }, [attendanceData, selectedClass, selectedSemester, viewType]);

//   return (
//     <Card className="w-full">
//       <CardHeader className="flex flex-col gap-4">
//         <div className="flex justify-between items-center w-full">
//           <h1 className="text-2xl font-bold">Attendance Dashboard</h1>
//           {error && (
//             <div className="text-red-500 flex items-center">
//               <AlertCircle className="w-4 h-4 mr-2" />
//               {error}
//             </div>
//           )}
//         </div>
        
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//           {role === "superadmin" && (
//             <Dropdown>
//               <DropdownTrigger>
//                 <Button variant="bordered">
//                   {selectedDepartment || "Select Department"}
//                 </Button>
//               </DropdownTrigger>
//               <DropdownMenu
//                 aria-label="Department selection"
//                 onAction={(key) => setSelectedDepartment(key)}
//               >
//                 {departmentOptions.map((department) => (
//                   <DropdownItem key={department.key}>{department.label}</DropdownItem>
//                 ))}
//               </DropdownMenu>
//             </Dropdown>
//           )}
//           <Dropdown>
//             <DropdownTrigger>
//               <Button
//                 variant="bordered"
//                 startContent={<Calendar className="w-4 h-4" />}
//                 className="w-full"
//               >
//                 {academicYear || "Select Year"}
//               </Button>
//             </DropdownTrigger>
//             <DropdownMenu
//               items={getAcademicYears(10)}
//               selectedKeys={new Set([academicYear])}
//               onAction={(key) => setAcademicYear(key)}
//             >
//               {(item) => (
//                 <DropdownItem key={item.value}>
//                   {item.label}
//                 </DropdownItem>
//               )}
//             </DropdownMenu>
//           </Dropdown>
//           <Dropdown>
//             <DropdownTrigger>
//               <Button variant="bordered" className="w-full">
//                 {selectedSemester === 'sem1' ? 'Semester 1' : 'Semester 2'}
//               </Button>
//             </DropdownTrigger>
//             <DropdownMenu 
//               aria-label="Semester selection" 
//               onAction={(key) => setSelectedSemester(key)}
//               selectedKeys={new Set([selectedSemester])}
//             >
//               <DropdownItem key="sem1">Semester 1</DropdownItem>
//               <DropdownItem key="sem2">Semester 2</DropdownItem>
//             </DropdownMenu>
//           </Dropdown>
//           <Dropdown>
//             <DropdownTrigger>
//               <Button 
//                 variant="bordered"
//                 className="w-full"
//                 isDisabled={!classes.length}
//               >
//                 {selectedClass ? 
//                   classes.find(c => c._id === selectedClass)?.name || selectedClass 
//                   : "Select Class"}
//               </Button>
//             </DropdownTrigger>
//             <DropdownMenu 
//               selectedKeys={new Set([selectedClass])}
//               onAction={(key) => setSelectedClass(key)}
//             >
//               {classes.map((cls) => (
//                 <DropdownItem key={cls._id}>
//                   {cls.name || cls._id}
//                 </DropdownItem>
//               ))}
//             </DropdownMenu>
//           </Dropdown>
//           <Dropdown>
//             <DropdownTrigger>
//               <Button 
//                 variant="bordered"
//                 className="w-full"
//               >
//                 {viewType === 'cumulative' ? 'Cumulative View' : 'Individual Subject'}
//               </Button>
//             </DropdownTrigger>
//             <DropdownMenu 
//               selectedKeys={new Set([viewType])}
//               onAction={(key) => setViewType(key)}
//             >
//               <DropdownItem key="cumulative">Cumulative View</DropdownItem>
//               <DropdownItem key="individual">Individual Subject</DropdownItem>
//             </DropdownMenu>
//           </Dropdown>
//           {viewType === 'individual' && (
//             <Dropdown>
//               <DropdownTrigger>
//                 <Button 
//                   variant="bordered"
//                   className="w-full"
//                   isDisabled={!classes.find(c => c._id === selectedClass)?.subjects}
//                 >
//                   {selectedSubject ? 
//                     classes.find(c => c._id === selectedClass)?.subjects.find(s => s._id === selectedSubject)?.name || selectedSubject 
//                     : "Select Subject"}
//                 </Button>
//               </DropdownTrigger>
//               <DropdownMenu 
//                 selectedKeys={new Set([selectedSubject])}
//                 onAction={(key) => setSelectedSubject(key)}
//               >
//                 {classes.find(c => c._id === selectedClass)?.subjects.map((subject) => (
//                   <DropdownItem key={subject._id}>
//                     {subject.name}
//                   </DropdownItem>
//                 ))}
//               </DropdownMenu>
//             </Dropdown>
//           )}
//           <Button
//             color="primary"
//             onClick={fetchAttendance}
//             isDisabled={!selectedClass || (viewType === 'individual' && !selectedSubject)}
//             startContent={<RefreshCcw className="w-4 h-4" />}
//           >
//             Fetch Attendance
//           </Button>
//           <Button
//             color="secondary"
//             onClick={generateExcelReport}
//             isDisabled={!attendanceData?.attendance}
//             startContent={<Download className="w-4 h-4" />}
//           >
//             Download Report
//           </Button>
//         </div>
//       </CardHeader>

//       <CardBody>
//         {loading ? (
//           <div className="flex justify-center items-center min-h-[200px]">
//             <Spinner size="lg" />
//           </div>
//         ) : attendanceData?.attendance ? (
//           <>
//             {attendanceData.summary && (
//               <Card className="mb-4 bg-primary-50">
//                 <CardBody>
//                   <div className="flex gap-4 justify-around">
//                     <div className="text-center">
//                       <div className="text-sm text-default-600">Total Students</div>
//                       <div className="text-xl font-bold">{attendanceData.summary.totalStudents}</div>
//                     </div>
//                     <div className="text-center">
//                       <div className="text-sm text-default-600">Average Attendance</div>
//                       <div className="text-xl font-bold">{attendanceData.summary.averageAttendance}%</div>
//                     </div>
//                     <div className="text-center">
//                       <div className="text-sm text-default-600">Below Threshold</div>
//                       <div className="text-xl font-bold">{attendanceData.summary.belowThreshold}</div>
//                     </div>
//                   </div>
//                 </CardBody>
//               </Card>
//             )}
            
//             {viewType === 'cumulative' ? (
//               renderAttendanceTable()
//             ) : (
//               <>
//                 {attendanceData.subjectInfo?.subType === 'theory' ? (
//                   renderSummaryTable(attendanceData.attendance)
//                 ) : (
//                   <Tabs>
//                     {Object.entries(attendanceData.attendance || {}).map(([batchName, batchData]) => (
//                       <Tab key={batchName} title={`Batch ${batchName}`}>
//                         {renderSummaryTable(batchData)}
//                       </Tab>
//                     ))}
//                   </Tabs>
//                 )}
//               </>
//             )}
//           </>
//         ) : (
//           <div className="text-center p-8 text-gray-500">
//             Select filters and click Fetch Attendance to view data
//           </div>
//         )}
//       </CardBody>
//     </Card>
//   );
// }
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Card,
  CardBody,
  CardHeader,
  Tooltip,
  Chip,
  Tabs,
  Tab
} from "@nextui-org/react";
import { Calendar, RefreshCcw, Download, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getCurrentAcademicYear, getAcademicYears } from '@/app/utils/acadmicYears';
import { departmentOptions } from '@/app/utils/department';

export default function AdminAttendance({ adminId = '', department = '', role = '' }) {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('sem1');
  const [classes, setClasses] = useState([]);
  const [viewType, setViewType] = useState('cumulative');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(department);
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [selectedSubjectType, setSelectedSubjectType] = useState('');
  const fetchClasses = useCallback(async () => {
    if (selectedDepartment && selectedSemester && academicYear) {
      try {
        setLoading(true);
        const response = await axios.get(`/api/v1/utils/classes`, {
          params: { department: selectedDepartment, academicYear, semester: selectedSemester }
        });
        
        if (response.data && Array.isArray(response.data.data)) {
          const validClasses = response.data.data.filter(cls => cls && cls._id);
        
          if (validClasses.length === 0) {
            setError("No classes found for the selected criteria");
            setClasses([]);
            setSelectedClass('');
            return;
          }
    
          setClasses(validClasses);
          if (!selectedClass) {
            setSelectedClass(validClasses[0]._id);
          }
        } else {
          setError("Invalid data received from server");
        }
      } catch (err) {
        console.error("Failed to fetch classes:", err);
        setError("Failed to fetch classes. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  }, [selectedDepartment, selectedSemester, academicYear, selectedClass]);

  const transformAttendanceData = useCallback((data) => {
    if (!data) {
      throw new Error("No data received");
    }

    return {
      ...data,
      attendance: data.attendance.map(student => ({
        ...student,
        subjects: [
          ...student.theorySubjects.map(subject => ({
            ...subject,
            subType: 'theory'
          })),
          ...student.practicalSubjects.map(subject => ({
            ...subject,
            subType: 'practical'
          }))
        ]
      }))
    };
  }, []);

  const compareRollNumbers = (a, b) => {
    const aMatch = a.match(/\d+/);
    const bMatch = b.match(/\d+/);

    if (aMatch && bMatch) {
      const aNum = parseInt(aMatch[0]);
      const bNum = parseInt(bMatch[0]);
      if (aNum !== bNum) return aNum - bNum;
    }

    return a.localeCompare(b);
  };

  const handleApiError = useCallback((error, customMessage) => {
    console.error(customMessage, error);
    const errorMessage = error.response?.data?.error || error.message || customMessage;
    setError(errorMessage);
    setLoading(false);
  }, []);

  useEffect(() => {
    setSelectedSubject('');
    fetchClasses();
  }, [fetchClasses, selectedSemester, academicYear]);

   const fetchAttendance = useCallback(async () => {
    if (!selectedClass) {
      setError("Please select a class");
      return;
    }

    if (viewType === 'individual' && !selectedSubject) {
      setError("Please select a subject");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setAttendanceData(null)
      const params = {
        classId: selectedClass,
        semester: selectedSemester,
        department: selectedDepartment,
        viewType: viewType === "individual" ? "summary" : viewType,
        ...(viewType === 'individual' && { subjectId: selectedSubject })
      };

      const endpoint = viewType === 'individual' 
        ? `/api/v1/attendance/faculty-attendance`
        : '/api/v1/attendance/admin-attendance';

      const response = await axios.get(endpoint, { params });
      
      if (!response.data) {
        throw new Error("No data received from server");
      }
      if (viewType === "cumulative") {
        const transformedData = transformAttendanceData(response.data);
        setAttendanceData(transformedData);
      } else {
        setAttendanceData(response.data);
      }
    } catch (err) {
      handleApiError(err, "Failed to fetch attendance data");
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedSemester, selectedDepartment, viewType, selectedSubject, transformAttendanceData, handleApiError]);

  const getAttendanceColor = (percentage) => {
    if (typeof percentage !== 'number') return "text-gray-500";
    if (percentage >= 75) return "text-green-500";
    if (percentage >= 60) return "text-yellow-500";
    return "text-red-500";
  };
 
  const renderSummaryTable = (batchData) => {
    if (!batchData || !Array.isArray(batchData) || batchData.length === 0) {
      return <div>No attendance data available</div>;
    }

    const sortedAttendance = [...batchData].sort((a, b) =>
      compareRollNumbers(a.student.rollNumber, b.student.rollNumber)
    );

    return (
      <Table aria-label="Attendance Summary Table">
        <TableHeader>
          <TableColumn>Roll Number</TableColumn>
          <TableColumn>Student Name</TableColumn>
          <TableColumn>Total Lectures</TableColumn>
          <TableColumn>Present</TableColumn>
          <TableColumn>Attendance %</TableColumn>
        </TableHeader>
        <TableBody>
          {sortedAttendance.map((record) => (
            <TableRow key={record._id}>
              <TableCell>{record.student.rollNumber}</TableCell>
              <TableCell>{record.student.name}</TableCell>
              <TableCell>{record.totalLectures}</TableCell>
              <TableCell>{record.presentCount}</TableCell>
              <TableCell>
                <Chip
                  color={record.percentage >= 75 ? "success" : "danger"}
                  variant="flat"
                >
                  {record.percentage.toFixed(2)}%
                </Chip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };


  const renderAttendanceTable = () => {
    if (!attendanceData?.attendance?.length) return null;
    
    const theorySubjects = attendanceData.subjects?.filter(s => s.subType === 'theory') || [];
    const practicalSubjects = attendanceData.subjects?.filter(s => s.subType === 'practical') || [];

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="border px-4 py-2" rowSpan={2}>Roll No</th>
              <th className="border px-4 py-2" rowSpan={2}>Student Name</th>
              <th className="border px-4 py-2" colSpan={theorySubjects.length * 4}>Theory Subjects</th>
              <th className="border px-4 py-2" colSpan={practicalSubjects.length * 4}>Practical Subjects</th>
              <th className="border px-4 py-2" colSpan={3}>Final Attendance</th>
            </tr>
            <tr>
              {theorySubjects.map(subject => (
                <React.Fragment key={subject._id}>
                  <th className="border px-4 py-2" colSpan={4}>{subject.name}</th>
                </React.Fragment>
              ))}
              {practicalSubjects.map(subject => (
                <React.Fragment key={subject._id}>
                  <th className="border px-4 py-2" colSpan={4}>{subject.name}</th>
                </React.Fragment>
              ))}
              <th className="border px-4 py-2">Total</th>
              <th className="border px-4 py-2">Present</th>
              <th className="border px-4 py-2">%</th>
            </tr>
            <tr>
              <th className="border px-4 py-2" colSpan={2}></th>
              {[...theorySubjects, ...practicalSubjects].map(() => (
                <React.Fragment key={`header-${Math.random()}`}>
                  <th className="border px-4 py-2">Total</th>
                  <th className="border px-4 py-2">Present</th>
                  <th className="border px-4 py-2">Hours</th>
                  <th className="border px-4 py-2">%</th>
                </React.Fragment>
              ))}
              <th className="border px-4 py-2" colSpan={3}></th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.attendance.map((student) => (
              <tr key={student._id}>
                <td className="border px-4 py-2">{student.student.rollNumber}</td>
                <td className="border px-4 py-2">{student.student.name}</td>
                {theorySubjects.map(subject => {
                  const subjectData = student.subjects?.find(s => s.name === subject.name && s.subType === 'theory') || {};
                  const hours = (subjectData.presentCount || 0) * 1; // 1 hour per theory class
                  return (
                    <React.Fragment key={`theory-${subject._id}-${student._id}`}>
                      <td className="border px-4 py-2">{subjectData.totalLectures || 0}</td>
                      <td className="border px-4 py-2">{subjectData.presentCount || 0}</td>
                      <td className="border px-4 py-2">{hours}</td>
                      <td className={`border px-4 py-2 ${getAttendanceColor(subjectData.percentage)}`}>
                        {subjectData.percentage ? subjectData.percentage.toFixed(2) : '0.00'}%
                      </td>
                    </React.Fragment>
                  );
                })}
                {practicalSubjects.map(subject => {
                  const subjectData = student.subjects?.find(s => s.name === subject.name && s.subType === 'practical') || {};
                  const hours = (subjectData.presentCount || 0) * 2; // 2 hours per practical class
                  return (
                    <React.Fragment key={`practical-${subject._id}-${student._id}`}>
                      <td className="border px-4 py-2">{subjectData.totalLectures || 0}</td>
                      <td className="border px-4 py-2">{subjectData.presentCount || 0}</td>
                      <td className="border px-4 py-2">{hours}</td>
                      <td className={`border px-4 py-2 ${getAttendanceColor(subjectData.percentage)}`}>
                        {subjectData.percentage ? subjectData.percentage.toFixed(2) : '0.00'}%
                      </td>
                    </React.Fragment>
                  );
                })}
                <td className="border px-4 py-2">{student.totalLectures}</td>
                <td className="border px-4 py-2">{student.totalPresent}</td>
                <td className={`border px-4 py-2 ${getAttendanceColor(student.overallPercentage)}`}>
                  {student.overallPercentage ? student.overallPercentage.toFixed(2) : '0.00'}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const generateExcelReport = useCallback(() => {
    if (!attendanceData?.attendance) return;
     if (viewType === 'individual') {
      const wb = XLSX.utils.book_new();
      const subjectType = attendanceData.subjectInfo?.subType;
      const subjectName = attendanceData.subjectInfo?.name || 'Subject';
  
      if (subjectType === 'practical' || subjectType === 'tg') {
        // Handle practical and TG subjects with batch-wise data
        Object.entries(attendanceData.attendance).forEach(([batchName, batchData]) => {
          // Create summary data
          const summaryData = [
            ['Subject', subjectName],
            ['Type', subjectType.toUpperCase()],
            ['Batch', batchName],
            ['Total Students', batchData.length],
            ['Average Attendance', `${(batchData.reduce((acc, curr) => acc + curr.percentage, 0) / batchData.length).toFixed(2)}%`],
            ['Below Threshold', batchData.filter(student => student.percentage < 75).length],
            [''],  // Empty row for spacing
          ];
  
          // Create attendance data
          const attendanceData = [
            ['Roll Number', 'Student Name', 'Total Lectures', 'Present', 'Attendance %'],
            ...batchData.map(student => [
              student.student.rollNumber,
              student.student.name,
              student.totalLectures,
              student.presentCount,
              `${student.percentage.toFixed(2)}%`
            ])
          ];
  
          // Combine summary and attendance data
          const wsData = [...summaryData, ...attendanceData];
          const ws = XLSX.utils.aoa_to_sheet(wsData);
  
          // Set column widths
          ws['!cols'] = [
            { wch: 15 }, // First column
            { wch: 25 }, // Second column
            { wch: 15 }, // Third column
            { wch: 15 }, // Fourth column
            { wch: 15 }  // Fifth column
          ];
  
          // Add styles for summary section
          const summaryRange = XLSX.utils.decode_range('A1:B6');
          for (let R = summaryRange.s.r; R <= summaryRange.e.r; R++) {
            for (let C = summaryRange.s.c; C <= summaryRange.e.c; C++) {
              const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
              if (!ws[cellRef]) continue;
              ws[cellRef].s = {
                font: { bold: true },
                fill: { fgColor: { rgb: "EFEFEF" } }
              };
            }
          }
  
          // Add styles for header row
          const headerRow = 8; // Row index of the attendance data header
          const headerRange = XLSX.utils.decode_range(`A${headerRow}:E${headerRow}`);
          for (let C = headerRange.s.c; C <= headerRange.e.c; C++) {
            const cellRef = XLSX.utils.encode_cell({ r: headerRow - 1, c: C });
            ws[cellRef].s = {
              font: { bold: true },
              fill: { fgColor: { rgb: "DDEBF7" } },
              border: {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' }
              }
            };
          }
  
          XLSX.utils.book_append_sheet(wb, ws, `Batch ${batchName}`);
        });
      } else {
        // Handle theory subjects
        // Create summary data
        const summaryData = [
          ['Subject', subjectName],
          ['Type', 'THEORY'],
          ['Total Students', attendance.length],
          ['Average Attendance', `${(attendance.reduce((acc, curr) => acc + curr.percentage, 0) / attendance.length).toFixed(2)}%`],
          ['Below Threshold', attendance.filter(student => student.percentage < 75).length],
          [''],  // Empty row for spacing
        ];
  
        // Create attendance data
        const attendanceData = [
          ['Roll Number', 'Student Name', 'Total Lectures', 'Present', 'Attendance %'],
          ...attendance.map(student => [
            student.student.rollNumber,
            student.student.name,
            student.totalLectures,
            student.presentCount,
            `${student.percentage.toFixed(2)}%`
          ])
        ];
  
        // Combine summary and attendance data
        const wsData = [...summaryData, ...attendanceData];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
  
        // Set column widths
        ws['!cols'] = [
          { wch: 15 }, // Roll Number
          { wch: 25 }, // Student Name
          { wch: 15 }, // Total Lectures
          { wch: 15 }, // Present
          { wch: 15 }  // Attendance %
        ];
  
        // Add styles for summary section
        const summaryRange = XLSX.utils.decode_range('A1:B5');
        for (let R = summaryRange.s.r; R <= summaryRange.e.r; R++) {
          for (let C = summaryRange.s.c; C <= summaryRange.e.c; C++) {
            const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
            if (!ws[cellRef]) continue;
            ws[cellRef].s = {
              font: { bold: true },
              fill: { fgColor: { rgb: "EFEFEF" } }
            };
          }
        }
  
        // Add styles for header row
        const headerRow = 7; // Row index of the attendance data header
        const headerRange = XLSX.utils.decode_range(`A${headerRow}:E${headerRow}`);
        for (let C = headerRange.s.c; C <= headerRange.e.c; C++) {
          const cellRef = XLSX.utils.encode_cell({ r: headerRow - 1, c: C });
          ws[cellRef].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "DDEBF7" } },
            border: {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' }
            }
          };
        }
  
        XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
      }
  
      XLSX.writeFile(wb, `${subjectName}_Attendance_${new Date().toISOString().split('T')[0]}.xlsx`);
      return;
    }

    const theorySubjects = attendanceData.subjects?.filter(s => s.subType === 'theory') || [];
    const practicalSubjects = attendanceData.subjects?.filter(s => s.subType === 'practical') || [];

    const headers = [
      ['Student Information', '', 'Theory Subjects', '', '', '', ...Array(Math.max(0, (theorySubjects.length - 1) * 4)).fill(''),
       'Practical Subjects', '', '', '', ...Array(Math.max(0, (practicalSubjects.length - 1) * 4)).fill(''),
       'Final Attendance', '', ''],
      ['Roll Number', 'Student Name', 
       ...theorySubjects.map(subject => [subject.name, '', '', '']).flat(),
       ...practicalSubjects.map(subject => [subject.name, '', '', '']).flat(),
       'Overall', '', ''],
      ['', '', 
       ...theorySubjects.map(() => ['Total', 'Present', 'Hours', '%']).flat(),
       ...practicalSubjects.map(() => ['Total', 'Present', 'Hours', '%']).flat(),
       'Total', 'Present', '%']
    ];

    const dataRows = attendanceData.attendance.map(student => {
      const row = [
        student.student.rollNumber,
        student.student.name
      ];

      theorySubjects.forEach(subject => {
        const subjectData = student.subjects?.find(s => s.name === subject.name && s.subType === 'theory') || {};
        row.push(
          subjectData.totalLectures || 0,
          subjectData.presentCount || 0,
          (subjectData.presentCount || 0) * 1,
          subjectData.percentage ? `${subjectData.percentage.toFixed(2)}%` : '0.00%'
        );
      });

      practicalSubjects.forEach(subject => {
        const subjectData = student.subjects?.find(s => s.name === subject.name && s.subType === 'practical') || {};
        row.push(
          subjectData.totalLectures || 0,
          subjectData.presentCount || 0,
          (subjectData.presentCount || 0) * 2,
          subjectData.percentage ? `${subjectData.percentage.toFixed(2)}%` : '0.00%'
        );
      });

      row.push(
        student.totalLectures,
        student.totalPresent,
        student.overallPercentage ? `${student.overallPercentage.toFixed(2)}%` : '0.00%'
      );

      return row;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...dataRows]);

    const range = XLSX.utils.decode_range(ws['!ref']);
    const merges = [];

    let currentCol = 2;
    if (theorySubjects.length > 0) {
      merges.push({
        s: { r: 0, c: currentCol },
        e: { r: 0, c: currentCol + (theorySubjects.length * 4) - 1 }
      });
      currentCol += theorySubjects.length * 4;
    }

    if (practicalSubjects.length > 0) {
      merges.push({
        s: { r: 0, c: currentCol },
        e: { r: 0, c: currentCol + (practicalSubjects.length * 4) - 1 }
      });
    }

    const allSubjects = [...theorySubjects, ...practicalSubjects];
    let subjectCol = 2;
    allSubjects.forEach(() => {
      merges.push({
        s: { r: 1, c: subjectCol },
        e: { r: 1, c: subjectCol + 3 }
      });
      subjectCol += 4;
    });

    ws['!merges'] = merges;

    ws['!cols'] = [
      { wch: 15 },
      { wch: 25 },
      ...Array(range.e.c - 1).fill({ wch: 12 })
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
    XLSX.writeFile(wb, `Attendance_Report_${attendanceData.classInfo?.name || selectedClass}_${selectedSemester}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [attendanceData, selectedClass, selectedSemester]);

 
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full">
          <h1 className="text-2xl font-bold">Attendance Dashboard</h1>
          {error && (
            <div className="text-red-500 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {role === "superadmin" && (
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered">
                  {selectedDepartment || "Select Department"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Department selection"
                onAction={(key) => setSelectedDepartment(key)}
              >
                {departmentOptions.map((department) => (
                  <DropdownItem key={department.key}>{department.label}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          )}
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                startContent={<Calendar className="w-4 h-4" />}
                className="w-full"
              >
                {academicYear || "Select Year"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              items={getAcademicYears(10)}
              selectedKeys={new Set([academicYear])}
              onAction={(key) => setAcademicYear(key)}
            >
              {(item) => (
                <DropdownItem key={item.value}>
                  {item.label}
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
          <Dropdown>
            <DropdownTrigger>
              <Button variant="bordered" className="w-full">
                {selectedSemester === 'sem1' ? 'Semester 1' : 'Semester 2'}
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Semester selection" 
              onAction={(key) => setSelectedSemester(key)}
              selectedKeys={new Set([selectedSemester])}
            >
              <DropdownItem key="sem1">Semester 1</DropdownItem>
              <DropdownItem key="sem2">Semester 2</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="bordered"
                className="w-full"
                isDisabled={!classes.length}
              >
                {selectedClass ? 
                  classes.find(c => c._id === selectedClass)?.name || selectedClass 
                  : "Select Class"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              selectedKeys={new Set([selectedClass])}
              onAction={(key) => setSelectedClass(key)}
            >
              {classes.map((cls) => (
                <DropdownItem key={cls._id}>
                  {cls.name || cls._id}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="bordered"
                className="w-full"
              >
                {viewType === 'cumulative' ? 'Cumulative View' : 'Individual Subject'}
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              selectedKeys={new Set([viewType])}
              onAction={(key) => setViewType(key)}
            >
              <DropdownItem key="cumulative">Cumulative View</DropdownItem>
              <DropdownItem key="individual">Individual Subject</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          {viewType === 'individual' && (
            <>
            <Dropdown>
            <DropdownTrigger>
                  <Button 
                    variant="bordered"
                    className="w-full"
                  >
                    {selectedSubjectType ? selectedSubjectType : "Select Subject Type"}
                  </Button>
                </DropdownTrigger>
            <DropdownMenu 
             selectedKeys={new Set([selectedSubjectType])}
             onAction={(key) => {
               setSelectedSubjectType(key);
                 setSelectedSubject('');
             }}
            >
              <DropdownItem key="theory">Theory</DropdownItem>
              <DropdownItem key="practical">Practical</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Dropdown>
                <DropdownTrigger>
                  <Button 
                    variant="bordered"
                    className="w-full"
                    isDisabled={!selectedSubjectType || !classes.find(c => c._id === selectedClass)?.subjects}
                  >
                    {selectedSubject ? 
                      classes.find(c => c._id === selectedClass)?.subjects.find(s => s._id === selectedSubject)?.name || selectedSubject 
                      : "Select Subject"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu 
                  selectedKeys={new Set([selectedSubject])}
                  onAction={(key) => setSelectedSubject(key)}
                >
                  {classes.find(c => c._id === selectedClass)?.subjects
                    .filter(subject => subject.subType === selectedSubjectType)
                    .map((subject) => (
                      <DropdownItem key={subject._id}>
                        {subject.name}
                      </DropdownItem>
                    ))}
                </DropdownMenu>
              </Dropdown>
            
            </>
          )}
          <Button
            color="primary"
            onClick={fetchAttendance}
            isDisabled={!selectedClass || (viewType === 'individual' && !selectedSubject)}
            startContent={<RefreshCcw className="w-4 h-4" />}
          >
            Fetch Attendance
          </Button>
          <Button
            color="secondary"
            onClick={generateExcelReport}
            isDisabled={!attendanceData?.attendance}
            startContent={<Download className="w-4 h-4" />}
          >
            Download Report
          </Button>
        </div>
      </CardHeader>

      <CardBody>
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Spinner size="lg" />
          </div>
        ) : attendanceData?.attendance ? (
          <>
            {attendanceData.summary && (
              <Card className="mb-4 bg-primary-50">
                <CardBody>
                  <div className="flex gap-4 justify-around">
                    <div className="text-center">
                      <div className="text-sm text-default-600">Total Students</div>
                      <div className="text-xl font-bold">{attendanceData.summary.totalStudents}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-default-600">Average Attendance</div>
                      <div className="text-xl font-bold">{attendanceData.summary.averageAttendance}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-default-600">Below Threshold</div>
                      <div className="text-xl font-bold">{attendanceData.summary.belowThreshold}</div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
            
            {viewType === 'cumulative' ? (
              renderAttendanceTable()
            ) : (
              <>
                {attendanceData.subjectInfo?.subType === 'theory' ? (
                  renderSummaryTable(attendanceData.attendance)
                ) : (
                  <Tabs>
                    {Object.entries(attendanceData.attendance || {}).map(([batchName, batchData]) => (
                      <Tab key={batchName} title={`Batch ${batchName}`}>
                        {renderSummaryTable(batchData)}
                      </Tab>
                    ))}
                  </Tabs>
                )}
              </>
            )}
          </>
        ) : (
          <div className="text-center p-8 text-gray-500">
            Select filters and click Fetch Attendance to view data
          </div>
        )}
      </CardBody>
    </Card>
  );
}