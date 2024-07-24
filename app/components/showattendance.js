// // "use client";
// // import React, { useState, useEffect } from "react";
// // import axios from "axios";
// // import Image from "next/image";
// // import {
// //   Table,
// //   TableHeader,
// //   TableColumn,
// //   TableBody,
// //   TableRow,
// //   TableCell,
// //   Dropdown,
// //   DropdownTrigger,
// //   DropdownMenu,
// //   DropdownItem,
// //   Button,
// //   Spinner,
// //   DateRangePicker,
// //   Select,
// //   SelectItem,
// // } from "@nextui-org/react";
// // import { today, getLocalTimeZone } from "@internationalized/date";
// // import { departmentOptions } from "../utils/department";
// // import * as XLSX from "xlsx";

// // const AttendanceDisplay = () => {
// //   const [attendanceData, setAttendanceData] = useState(null);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState(null);
// //   const [selectedSubject, setSelectedSubject] = useState("");
// //   const [selectedClass, setSelectedClass] = useState("");
// //   const [viewType, setViewType] = useState("individual");
// //   const [selectedDepartment, setSelectedDepartment] = useState("");
// //   const [userProfile, setUserProfile] = useState(null);
// //   const [classes, setClasses] = useState([]);
// //   const [dateRange, setDateRange] = useState({
// //     start: today(getLocalTimeZone()).subtract({ weeks: 2 }),
// //     end: today(getLocalTimeZone()),
// //   });

// //   const fetchClasses = async () => {
// //     if (userProfile?.role === "admin" || userProfile?.role === "superadmin") {
// //       try {
// //         // Corrected URL construction using a string literal with template strings
// //         const response = await axios.get(`/api/classes?department=${selectedDepartment}`);
// //         setClasses(response.data);
// //       } catch (error) {
// //         console.error('Error fetching classes:', error);
// //       }
// //     }
// //   };


// //   useEffect(() => {
// //     const storedProfile = sessionStorage.getItem("userProfile");
// //     if (storedProfile) {
// //       const profile = JSON.parse(storedProfile);
// //       setUserProfile(profile);
// //       if (profile.role === "admin") {
// //         setSelectedDepartment(profile.department);
// //       }
// //     }
// //   }, []);

// //   const handleSelectChange = (value) => {
// //     setSelectedDepartment(value);
// //   };

// //   useEffect(() => {
// //     if (userProfile?.role === "admin" || userProfile?.role === "superadmin") {
// //       fetchClasses();
// //     }
// //   }, [selectedDepartment, userProfile]);

// //   const fetchAttendance = async () => {
// //     setLoading(true);
// //     setError(null);

// //     try {
// //       let url = "/api/attendance-reports?";

// //       if (userProfile.role === "student") {
// //         url += `studentId=${userProfile._id}`;
// //       } else if (userProfile.role === "faculty") {
// //         url += `subjectId=${selectedSubject}`;
// //       } else if (userProfile.role === "admin" || userProfile.role === "superadmin") {
// //         url += `classId=${selectedClass}`;
// //         if (viewType === "individual" && selectedSubject) {
// //           url += `&subjectId=${selectedSubject}`;
// //         }
// //       }

// //       url += `&startDate=${dateRange.start.toString()}&endDate=${dateRange.end.toString()}`;

// //       const response = await axios.get(url);
// //       setAttendanceData(response.data);
// //     } catch (err) {
// //       setError("Failed to fetch attendance data");
// //       console.error(err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };


// //   useEffect(() => {
// //     if (userProfile) {
// //       if (
// //         userProfile.role === "student" ||
// //         (userProfile.role === "faculty" && selectedSubject) ||
// //         ((userProfile.role === "admin" || userProfile.role === "superadmin") &&
// //           selectedClass &&
// //           (viewType === "cumulative" || (viewType === "individual" && selectedSubject)))
// //       ) {
// //         fetchAttendance();
// //       }
// //     }
// //   }, [userProfile, selectedSubject, selectedClass, viewType, dateRange]);

// //   const generateExcelReport = () => {
// //     if (!attendanceData) return;

// //     let wsData = [];

// //     if (userProfile.role === "student") {
// //       // Header
// //       wsData.push(["Subject", "Total Lectures", "Present", "Attendance %"]);

// //       // Data
// //       attendanceData.forEach((subject) => {
// //         wsData.push([
// //           subject.name,
// //           subject.totalLectures,
// //           subject.presentCount,
// //           ((subject.presentCount / subject.totalLectures) * 100).toFixed(2) + "%"
// //         ]);
// //       });

// //       // Total row
// //       const totalLectures = attendanceData.reduce((sum, subject) => sum + subject.totalLectures, 0);
// //       const totalPresent = attendanceData.reduce((sum, subject) => sum + subject.presentCount, 0);
// //       wsData.push([
// //         "Total",
// //         totalLectures,
// //         totalPresent,
// //         ((totalPresent / totalLectures) * 100).toFixed(2) + "%"
// //       ]);

// //     } else if (userProfile.role === "faculty") {
// //       // Header
// //       wsData.push(["Student Name", "Roll Number", "Total Lectures", "Present", "Attendance %"]);

// //       // Data
// //       attendanceData[0].students
// //         .sort((a, b) => parseInt(a.rollNumber, 10) - parseInt(b.rollNumber, 10))
// //         .forEach((student) => {
// //           wsData.push([
// //             student.name,
// //             student.rollNumber,
// //             attendanceData[0].totalLectures,
// //             student.presentCount,
// //             ((student.presentCount / attendanceData[0].totalLectures) * 100).toFixed(2) + "%"
// //           ]);
// //         });

// //     } else if (userProfile.role === "admin" || userProfile.role === "superadmin") {
// //       if (viewType === "cumulative") {
// //         // Header row 1 (Subject names and faculty names)
// //         const header1 = ["", ""];
// //         attendanceData.forEach((subject) => {
// //           header1.push(subject.name, "", "");
// //         });
// //         header1.push("Total Attendance", "", "");
// //         wsData.push(header1);

// //         // Header row 2 (Faculty names)
// //         const header2 = ["", ""];
// //         attendanceData.forEach((subject) => {
// //           header2.push(`Faculty: ${subject.facultyName}`, "", "");
// //         });
// //         header2.push("", "", "");
// //         wsData.push(header2);

// //         // Header row 3 (Subcolumns)
// //         const header3 = ["Roll No", "Student Name"];
// //         attendanceData.forEach(() => {
// //           header3.push("Total", "Present", "%");
// //         });
// //         header3.push("Total", "Present", "%");
// //         wsData.push(header3);

// //         // Data rows
// //         attendanceData[0].students
// //           .sort((a, b) => parseInt(a.rollNumber, 10) - parseInt(b.rollNumber, 10))
// //           .forEach((student) => {
// //             const row = [student.rollNumber, student.name];
// //             let totalPresent = 0;
// //             let totalLectures = 0;

// //             attendanceData.forEach((subject) => {
// //               const studentData = subject.students.find((s) => s.rollNumber === student.rollNumber);
// //               totalLectures += subject.totalLectures;
// //               const present = studentData ? studentData.presentCount : 0;
// //               totalPresent += present;
// //               row.push(
// //                 subject.totalLectures,
// //                 present,
// //                 ((present / subject.totalLectures) * 100).toFixed(2) + "%"
// //               );
// //             });

// //             row.push(
// //               totalLectures,
// //               totalPresent,
// //               ((totalPresent / totalLectures) * 100).toFixed(2) + "%"
// //             );
// //             wsData.push(row);
// //           });
// //       } else if (viewType === "individual") {
// //         // Header
// //         wsData.push(["Student Name", "Roll Number", "Total Lectures", "Present", "Attendance %"]);

// //         // Data
// //         attendanceData[0].students
// //           .sort((a, b) => parseInt(a.rollNumber, 10) - parseInt(b.rollNumber, 10))
// //           .forEach((student) => {
// //             wsData.push([
// //               student.name,
// //               student.rollNumber,
// //               attendanceData[0].totalLectures,
// //               student.presentCount,
// //               ((student.presentCount / attendanceData[0].totalLectures) * 100).toFixed(2) + "%"
// //             ]);
// //           });
// //       }
// //     }

// //     const ws = XLSX.utils.aoa_to_sheet(wsData);

// //     // Set column widths
// //     const colWidths = wsData[0].map(() => ({ wch: 15 })); // Default width of 15 for all columns
// //     ws['!cols'] = colWidths;

// //     // Apply styles
// //     const range = XLSX.utils.decode_range(ws['!ref']);
// //     for (let R = range.s.r; R <= range.e.r; ++R) {
// //       for (let C = range.s.c; C <= range.e.c; ++C) {
// //         const cellRef = XLSX.utils.encode_cell({r: R, c: C});
// //         if (!ws[cellRef]) continue;
// //         ws[cellRef].s = {
// //           border: {
// //             top: { style: 'thin' },
// //             bottom: { style: 'thin' },
// //             left: { style: 'thin' },
// //             right: { style: 'thin' }
// //           },
// //           alignment: { vertical: 'center', horizontal: 'center' }
// //         };
// //         if (R === 0 || (userProfile.role === "admin" || userProfile.role === "superadmin") && viewType === "cumulative" && R < 3) {
// //           ws[cellRef].s.font = { bold: true };
// //           ws[cellRef].s.fill = { fgColor: { rgb: "EEEEEE" } };
// //         }
// //       }
// //     }

// //     // Merge cells for subject names and faculty names in admin/superadmin cumulative view
// //     if ((userProfile.role === "admin" || userProfile.role === "superadmin") && viewType === "cumulative") {
// //       attendanceData.forEach((_, index) => {
// //         const col = index * 3 + 2; // Starting from column C (index 2)
// //         ws['!merges'] = ws['!merges'] || [];
// //         // Merge cells for subject name
// //         ws['!merges'].push({ s: { r: 0, c: col }, e: { r: 0, c: col + 2 } });
// //         // Merge cells for faculty name
// //         ws['!merges'].push({ s: { r: 1, c: col }, e: { r: 1, c: col + 2 } });
// //       });

// //       // Merge cells for "Total Attendance"
// //       const totalCol = attendanceData.length * 3 + 2;
// //       ws['!merges'].push({ s: { r: 0, c: totalCol }, e: { r: 1, c: totalCol + 2 } });
// //     }

// //     const wb = XLSX.utils.book_new();
// //     XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");

// //     XLSX.writeFile(wb, "Attendance_Report.xlsx");
// //   };
// //   const renderStudentAttendance = () => {
// //     const totalLectures = attendanceData?.reduce((sum, subject) => sum + subject.totalLectures, 0);
// //     const totalPresent = attendanceData?.reduce((sum, subject) => sum + subject.presentCount, 0);

// //     return (
// //       <Table aria-label="Student Attendance Table">
// //         <TableHeader>
// //           <TableColumn>Subject</TableColumn>
// //           <TableColumn>Total Lectures</TableColumn>
// //           <TableColumn>Present</TableColumn>
// //           <TableColumn>Attendance %</TableColumn>
// //         </TableHeader>
// //         <TableBody>
// //           {attendanceData?.map((subject) => (
// //             <TableRow key={subject._id}>
// //               <TableCell>{subject.name}</TableCell>
// //               <TableCell>{subject.totalLectures}</TableCell>
// //               <TableCell>{subject.presentCount}</TableCell>
// //               <TableCell>{((subject.presentCount / subject.totalLectures) * 100).toFixed(2)}%</TableCell>
// //             </TableRow>
// //           ))}
// //           <TableRow>
// //             <TableCell><b>Total</b></TableCell>
// //             <TableCell><b>{totalLectures}</b></TableCell>
// //             <TableCell><b>{totalPresent}</b></TableCell>
// //             <TableCell><b>{((totalPresent / totalLectures) * 100).toFixed(2)}%</b></TableCell>
// //           </TableRow>
// //         </TableBody>
// //       </Table>
// //     );
// //   };



// // const renderFacultyAttendance = () => (
// //   <Table aria-label="Faculty Attendance Table">
// //     <TableHeader>
// //       <TableColumn>Student Name</TableColumn>
// //       <TableColumn>Roll Number</TableColumn>
// //       <TableColumn>Total Lectures</TableColumn>
// //       <TableColumn>Present</TableColumn>
// //       <TableColumn>Attendance %</TableColumn>
// //     </TableHeader>
// //     <TableBody>
// //       {attendanceData[0].students
// //         .slice()
// //         .sort((a, b) => parseInt(a.rollNumber, 10) - parseInt(b.rollNumber, 10))
// //         .map((student) => (
// //           <TableRow key={student._id}>
// //             <TableCell>{student.name}</TableCell>
// //             <TableCell>{student.rollNumber}</TableCell>
// //             <TableCell>{attendanceData[0].totalLectures}</TableCell>
// //             <TableCell>{student.presentCount}</TableCell>
// //             <TableCell>{((student.presentCount / attendanceData[0].totalLectures) * 100).toFixed(2)}%</TableCell>
// //           </TableRow>
// //         ))}
// //     </TableBody>
// //   </Table>
// // );

// // const renderAdminAttendance = () => {
// //   const totalLectures = attendanceData.reduce((sum, subject) => sum + subject.totalLectures, 0);
// //   return (
// //     <div>
// //       {viewType === "cumulative" ? (
// //         <div className="overflow-x-auto">
// //           <table className="min-w-full border-collapse block md:table">
// //             <thead>
// //               <tr className="bg-gray-100">
// //                 <th className="border px-4 py-2">Roll No</th>
// //                 <th className="border px-4 py-2">Student Name</th>
// //                 {attendanceData.map((subject) => (
// //                   <th key={subject._id} className="border px-4 py-2" colSpan="3">
// //                     {subject.name}<br />
// //                     Faculty: {subject.facultyName}
// //                     <div className="flex justify-between mt-1">
// //                       <span>Total</span>
// //                       <span>Present</span>
// //                       <span>%</span>
// //                     </div>
// //                   </th>
// //                 ))}
// //                 <th className="border px-4 py-2" colSpan="3">
// //                   Total Attendance
// //                   <div className="flex justify-between mt-1">
// //                     <span>Total</span>
// //                     <span>Present</span>
// //                     <span>%</span>
// //                   </div>
// //                 </th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {attendanceData[0].students
// //                 .slice()
// //                 .sort((a, b) => parseInt(a.rollNumber, 10) - parseInt(b.rollNumber, 10))
// //                 .map((student) => (
// //                   <tr key={student.rollNumber}>
// //                     <td className="border px-4 py-2">{student.rollNumber}</td>
// //                     <td className="border px-4 py-2">{student.name}</td>
// //                     {attendanceData.map((subject) => {
// //                       const studentData = subject.students.find((s) => s.rollNumber === student.rollNumber);
// //                       return (
// //                         <React.Fragment key={subject._id}>
// //                           <td className="border px-4 py-2 text-center">{subject.totalLectures}</td>
// //                           <td className="border px-4 py-2 text-center">{studentData ? studentData.presentCount : 0}</td>
// //                           <td className="border px-4 py-2 text-center">
// //                             {studentData ? ((studentData.presentCount / subject.totalLectures) * 100).toFixed(2) : "NaN"}%
// //                           </td>
// //                         </React.Fragment>
// //                       );
// //                     })}
// //                     <td className="border px-4 py-2 text-center">
// //                       {totalLectures}
// //                     </td>
// //                     <td className="border px-4 py-2 text-center">
// //                       {attendanceData.reduce((sum, subject) => {
// //                         const studentData = subject.students.find((s) => s.rollNumber === student.rollNumber);
// //                         return sum + (studentData ? studentData.presentCount : 0);
// //                       }, 0)}
// //                     </td>
// //                     <td className="border px-4 py-2 text-center">
// //                       {((attendanceData.reduce((sum, subject) => {
// //                         const studentData = subject.students.find((s) => s.rollNumber === student.rollNumber);
// //                         return sum + (studentData ? studentData.presentCount : 0);
// //                       }, 0) / totalLectures) * 100).toFixed(2)}%
// //                     </td>
// //                   </tr>
// //                 ))}
// //             </tbody>
// //           </table>
// //         </div>
// //       ) : (
// //         <Table aria-label="Individual Attendance Table">
// //           <TableHeader>
// //             <TableColumn>Student Name</TableColumn>
// //             <TableColumn>Roll Number</TableColumn>
// //             <TableColumn>Total Lectures</TableColumn>
// //             <TableColumn>Present</TableColumn>
// //             <TableColumn>Total Percentage</TableColumn>
// //           </TableHeader>
// //           <TableBody>
// //             {attendanceData[0].students
// //               .slice()
// //               .sort((a, b) => parseInt(a.rollNumber, 10) - parseInt(b.rollNumber, 10))
// //               .map((student) => (
// //                 <TableRow key={student._id}>
// //                   <TableCell>{student.name}</TableCell>
// //                   <TableCell>{student.rollNumber}</TableCell>
// //                   <TableCell>{attendanceData[0].totalLectures}</TableCell>
// //                   <TableCell>{student.presentCount}</TableCell>
// //                   <TableCell>{((student.presentCount / attendanceData[0].totalLectures) * 100).toFixed(2)}%</TableCell>
// //                 </TableRow>
// //               ))}
// //           </TableBody>
// //         </Table>
// //       )}
// //     </div>
// //   );
// // };  if (!userProfile) {
// //     return <div>Loading please wait...</div>;
// //   }

// //   return (
// //     <div className="p-4">
// //       <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
// //         <div className="mb-4 md:mb-0">
// //           <h1 className="text-2xl font-bold mb-2">Attendance Report</h1>
// //           <p className="text-gray-600">User: {userProfile.name} ({userProfile.role})</p>
// //         </div>
// //         <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
// //           {userProfile?.role === "superadmin" && (
// //             <Select
// //               placeholder="Select department"
// //               name="department"
// //               className=" w-[40%] "
// //               selectedKeys={[selectedDepartment]}
// //               onSelectionChange={(value) => handleSelectChange(value.currentKey)}
// //               variant="bordered"
// //               size="sm"
// //             >
// //               {departmentOptions.map((department) => (
// //                 <SelectItem key={department.key} textValue={department.label}>
// //                   {department.label}
// //                 </SelectItem>
// //               ))}
// //             </Select>
// //           )}
// //           {(userProfile.role === "admin" || userProfile.role === "superadmin") && (
// //             <>
// //               <Dropdown>
// //                 <DropdownTrigger>
// //                   <Button variant="bordered">
// //                     {selectedClass ? selectedClass : "Select Class"}
// //                   </Button>
// //                 </DropdownTrigger>
// //                 <DropdownMenu aria-label="Class selection" onAction={(key) => setSelectedClass(key)}>
// //                   {classes.map((classItem) => (
// //                     <DropdownItem key={classItem._id}>{classItem._id}</DropdownItem>
// //                   ))}
// //                 </DropdownMenu>
// //               </Dropdown>
// //               <Dropdown>
// //                 <DropdownTrigger>
// //                   <Button variant="bordered">{viewType === "cumulative" ? "Cumulative View" : "Individual View"}</Button>
// //                 </DropdownTrigger>
// //                 <DropdownMenu aria-label="View type selection" onAction={(key) => setViewType(key)}>
// //                   <DropdownItem key="cumulative">Cumulative View</DropdownItem>
// //                   <DropdownItem key="individual">Individual View</DropdownItem>
// //                 </DropdownMenu>
// //               </Dropdown>
// //               {viewType === "individual" && (
// //                 <Dropdown>
// //                   <DropdownTrigger>
// //                     <Button variant="bordered">
// //                       {selectedSubject ? selectedSubject : "Select Subject"}
// //                     </Button>
// //                   </DropdownTrigger>
// //                   <DropdownMenu aria-label="Subject selection" onAction={(key) => setSelectedSubject(key)}>
// //                     {classes.find((c) => c._id === selectedClass)?.subjects.map((subject) => (
// //                       <DropdownItem key={subject}>{subject}</DropdownItem>
// //                     ))}
// //                   </DropdownMenu>
// //                 </Dropdown>
// //               )}
// //             </>
// //           )}
// //           {userProfile?.role === "faculty" && (
// //             <Dropdown>
// //               <DropdownTrigger>
// //                 <Button variant="bordered">
// //                   {selectedSubject || "Select Subject"}
// //                 </Button>
// //               </DropdownTrigger>
// //               <DropdownMenu aria-label="Subject selection" onAction={(key) => setSelectedSubject(key)}>
// //                 {userProfile.subjects.map((subject) => (
// //                   <DropdownItem key={subject}>{subject}</DropdownItem>
// //                 ))}
// //               </DropdownMenu>
// //             </Dropdown>
// //           )}
// //         </div>
// //       </div>

// //       <div className="mb-8 flex items-center gap-10 w-full justify-end ">
// //         <div className="w-full">
// //           <h2 className="text-xl font-semibold ">Select Date Range</h2>
// //           <DateRangePicker
// //             aria-label="Date Range"
// //             value={dateRange}
// //             onChange={setDateRange}
// //           // className="w-50"
// //           />
// //         </div>
// //         <div className="w-[10%]">  <Button variant="ghost" color="primary" size="sm" onClick={generateExcelReport} className="mb-8">
// //           Download Report
// //         </Button>
// //         </div>
// //       </div>



// //       {loading ? (
// //         <div className="flex justify-center items-center">
// //           <Spinner size="large" />
// //         </div>
// //       ) : error ? (
// //         <div className="text-red-500">{error}</div>
// //       ) : attendanceData ? (
// //         <div>
// //           {userProfile.role === "student" && renderStudentAttendance()}
// //           {userProfile.role === "faculty" && renderFacultyAttendance()}
// //           {(userProfile.role === "admin" || userProfile.role === "superadmin") && renderAdminAttendance()}
// //         </div>
// //       ) : (
// //         <div>No attendance data available</div>
// //       )}
// //       {!attendanceData && (
// //         <div className="flex justify-center mt-8">
// //           <Image src="/report.svg" alt="Report Image" width={800} height={500} />
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default AttendanceDisplay;
// "use client";
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Image from "next/image";
// import {
//   Table,
//   TableHeader,
//   TableColumn,
//   TableBody,
//   TableRow,
//   TableCell,
//   Dropdown,
//   DropdownTrigger,
//   DropdownMenu,
//   DropdownItem,
//   Button,
//   Spinner,
//   DateRangePicker,
//   Select,
//   SelectItem,
// } from "@nextui-org/react";
// import { today, getLocalTimeZone } from "@internationalized/date";
// import { departmentOptions } from "../utils/department";
// import * as XLSX from "xlsx";

// const AttendanceDisplay = () => {
//   const [attendanceData, setAttendanceData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [selectedSubject, setSelectedSubject] = useState("");
//   const [selectedClass, setSelectedClass] = useState("");
//   const [viewType, setViewType] = useState("individual");
//   const [selectedDepartment, setSelectedDepartment] = useState("");
//   const [userProfile, setUserProfile] = useState(null);
//   const [classes, setClasses] = useState([]);
//   const [dateRange, setDateRange] = useState({
//     start: today(getLocalTimeZone()).subtract({ weeks: 2 }),
//     end: today(getLocalTimeZone()),
//   });
//   const [batches, setBatches] = useState([]);
//   const [selectedBatch, setSelectedBatch] = useState("");

//   const fetchClasses = async () => {
//     if (userProfile?.role === "admin" || userProfile?.role === "superadmin") {
//       try {
//         // Corrected URL construction using a string literal with template strings
//         const response = await axios.get(`/api/classes?department=${selectedDepartment}`);
//         setClasses(response.data);
//       } catch (error) {
//         console.error('Error fetching classes:', error);
//       }
//     }
//   };

//   useEffect(() => {
//     const storedProfile = sessionStorage.getItem("userProfile");
//     if (storedProfile) {
//       const profile = JSON.parse(storedProfile);
//       setUserProfile(profile);
//       if (profile.role === "admin") {
//         setSelectedDepartment(profile.department);
//       }
//     }
//   }, []);

//   const handleSelectChange = (value) => {
//     setSelectedDepartment(value);
//   };

//   useEffect(() => {
//     if (userProfile?.role === "admin" || userProfile?.role === "superadmin") {
//       fetchClasses();
//     }
//   }, [selectedDepartment, userProfile]);

//   useEffect(() => {
//     if (selectedClass) {
//       const selectedClassData = classes.find(c => c._id === selectedClass);
//       if (selectedClassData) {
//         setBatches(selectedClassData.batches || []);
//       }
//     }
//   }, [selectedClass, classes]);

//   const fetchAttendance = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       let url = "/api/attendance-reports?";

//       if (userProfile.role === "student") {
//         url += `studentId=${userProfile._id}`;
//       } else if (userProfile.role === "faculty") {
//         url += `subjectId=${selectedSubject}`;
//       } else if (userProfile.role === "admin" || userProfile.role === "superadmin") {
//         url += `classId=${selectedClass}`;
//         if (viewType === "individual" && selectedSubject) {
//           url += `&subjectId=${selectedSubject}`;
//         }
//       }

//       if (selectedBatch) {
//         url += `&batchId=${selectedBatch}`;
//       }

//       url += `&startDate=${dateRange.start.toString()}&endDate=${dateRange.end.toString()}`;

//       const response = await axios.get(url);
//       setAttendanceData(response.data);
//     } catch (err) {
//       setError("Failed to fetch attendance data");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };


//   useEffect(() => {
//     if (userProfile) {
//       if (
//         userProfile.role === "student" ||
//         (userProfile.role === "faculty" && selectedSubject) ||
//         ((userProfile.role === "admin" || userProfile.role === "superadmin") &&
//           selectedClass &&
//           (viewType === "cumulative" || (viewType === "individual" && selectedSubject)))
//       ) {
//         fetchAttendance();
//       }
//     }
//   }, [userProfile, selectedSubject, selectedClass, viewType, dateRange, selectedBatch]);

//   const generateExcelReport = () => {
//     if (!attendanceData) return;

//     let wsData = [];

//     if (userProfile.role === "student") {
//       // Header
//       wsData.push(["Subject", "Total Lectures", "Present", "Attendance %"]);

//       // Data
//       attendanceData.forEach((subject) => {
//         wsData.push([
//           subject.name,
//           subject.totalLectures,
//           subject.presentCount,
//           ((subject.presentCount / subject.totalLectures) * 100).toFixed(2) + "%"
//         ]);
//       });

//       // Total row
//       const totalLectures = attendanceData.reduce((sum, subject) => sum + subject.totalLectures, 0);
//       const totalPresent = attendanceData.reduce((sum, subject) => sum + subject.presentCount, 0);
//       wsData.push([
//         "Total",
//         totalLectures,
//         totalPresent,
//         ((totalPresent / totalLectures) * 100).toFixed(2) + "%"
//       ]);

//     } else if (userProfile.role === "faculty") {
//       // Header
//       wsData.push(["Student Name", "Roll Number", "Total Lectures", "Present", "Attendance %"]);

//       // Data
//       attendanceData[0].students
//         .sort((a, b) => parseInt(a.rollNumber, 10) - parseInt(b.rollNumber, 10))
//         .forEach((student) => {
//           wsData.push([
//             student.name,
//             student.rollNumber,
//             attendanceData[0].totalLectures,
//             student.presentCount,
//             ((student.presentCount / attendanceData[0].totalLectures) * 100).toFixed(2) + "%"
//           ]);
//         });

//     } else if (userProfile.role === "admin" || userProfile.role === "superadmin") {
//       if (viewType === "cumulative") {
//         // Header row 1 (Subject names and faculty names)
//         const header1 = ["", ""];
//         attendanceData.forEach((subject) => {
//           header1.push(subject.name, "", "");
//         });
//         header1.push("Total Attendance", "", "");
//         wsData.push(header1);

//         // Header row 2 (Faculty names)
//         const header2 = ["", ""];
//         attendanceData.forEach((subject) => {
//           header2.push(`Faculty: ${subject.facultyName}`, "", "");
//         });
//         header2.push("", "", "");
//         wsData.push(header2);

//         // Header row 3 (Subcolumns)
//         const header3 = ["Roll No", "Student Name"];
//         attendanceData.forEach(() => {
//           header3.push("Total", "Present", "%");
//         });
//         header3.push("Total", "Present", "%");
//         wsData.push(header3);

//         // Data rows
//         attendanceData[0].students
//           .sort((a, b) => parseInt(a.rollNumber, 10) - parseInt(b.rollNumber, 10))
//           .forEach((student) => {
//             const row = [student.rollNumber, student.name];
//             let totalPresent = 0;
//             let totalLectures = 0;

//             attendanceData.forEach((subject) => {
//               const studentData = subject.students.find((s) => s.rollNumber === student.rollNumber);
//               totalLectures += subject.totalLectures;
//               const present = studentData ? studentData.presentCount : 0;
//               totalPresent += present;
//               row.push(
//                 subject.totalLectures,
//                 present,
//                 ((present / subject.totalLectures) * 100).toFixed(2) + "%"
//               );
//             });

//             row.push(
//               totalLectures,
//               totalPresent,
//               ((totalPresent / totalLectures) * 100).toFixed(2) + "%"
//             );
//             wsData.push(row);
//           });
//       } else if (viewType === "individual") {
//         // Header
//         wsData.push(["Student Name", "Roll Number", "Total Lectures", "Present", "Attendance %"]);

//         // Data
//         attendanceData[0].students
//           .sort((a, b) => parseInt(a.rollNumber, 10) - parseInt(b.rollNumber, 10))
//           .forEach((student) => {
//             wsData.push([
//               student.name,
//               student.rollNumber,
//               attendanceData[0].totalLectures,
//               student.presentCount,
//               ((student.presentCount / attendanceData[0].totalLectures) * 100).toFixed(2) + "%"
//             ]);
//           });
//       }
//     }

//     const ws = XLSX.utils.aoa_to_sheet(wsData);

//     // Set column widths
//     const colWidths = wsData[0].map(() => ({ wch: 15 })); // Default width of 15 for all columns
//     ws['!cols'] = colWidths;

//     // Apply styles
//     const range = XLSX.utils.decode_range(ws['!ref']);
//     for (let R = range.s.r; R <= range.e.r; ++R) {
//       for (let C = range.s.c; C <= range.e.c; ++C) {
//         const cellRef = XLSX.utils.encode_cell({r: R, c: C});
//         if (!ws[cellRef]) continue;
//         ws[cellRef].s = {
//           border: {
//             top: { style: 'thin' },
//             bottom: { style: 'thin' },
//             left: { style: 'thin' },
//             right: { style: 'thin' }
//           },
//           alignment: { vertical: 'center', horizontal: 'center' }
//         };
//         if (R === 0 || (userProfile.role === "admin" || userProfile.role === "superadmin") && viewType === "cumulative" && R < 3) {
//           ws[cellRef].s.font = { bold: true };
//           ws[cellRef].s.fill = { fgColor: { rgb: "EEEEEE" } };
//         }
//       }
//     }

//     // Merge cells for subject names and faculty names in admin/superadmin cumulative view
//     if ((userProfile.role === "admin" || userProfile.role === "superadmin") && viewType === "cumulative") {
//       attendanceData.forEach((_, index) => {
//         const col = index * 3 + 2; // Starting from column C (index 2)
//         ws['!merges'] = ws['!merges'] || [];
//         // Merge cells for subject name
//         ws['!merges'].push({ s: { r: 0, c: col }, e: { r: 0, c: col + 2 } });
//         // Merge cells for faculty name
//         ws['!merges'].push({ s: { r: 1, c: col }, e: { r: 1, c: col + 2 } });
//       });

//       // Merge cells for "Total Attendance"
//       const totalCol = attendanceData.length * 3 + 2;
//       ws['!merges'].push({ s: { r: 0, c: totalCol }, e: { r: 1, c: totalCol + 2 } });
//     }

//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");

//     XLSX.writeFile(wb, "Attendance_Report.xlsx");
//   };

//   const renderStudentAttendance = () => {
//     const totalLectures = attendanceData?.reduce((sum, subject) => sum + subject.totalLectures, 0);
//     const totalPresent = attendanceData?.reduce((sum, subject) => sum + subject.presentCount, 0);

//     return (
//       <Table aria-label="Student Attendance Table">
//         <TableHeader>
//           <TableColumn>Subject</TableColumn>
//           <TableColumn>Total Lectures</TableColumn>
//           <TableColumn>Present</TableColumn>
//           <TableColumn>Attendance %</TableColumn>
//         </TableHeader>
//         <TableBody>
//           {attendanceData?.map((subject) => (
//             <TableRow key={subject._id}>
//               <TableCell>{subject.name}</TableCell>
//               <TableCell>{subject.totalLectures}</TableCell>
//               <TableCell>{subject.presentCount}</TableCell>
//               <TableCell>{((subject.presentCount / subject.totalLectures) * 100).toFixed(2)}%</TableCell>
//             </TableRow>
//           ))}
//           <TableRow>
//             <TableCell><b>Total</b></TableCell>
//             <TableCell><b>{totalLectures}</b></TableCell>
//             <TableCell><b>{totalPresent}</b></TableCell>
//             <TableCell><b>{((totalPresent / totalLectures) * 100).toFixed(2)}%</b></TableCell>
//           </TableRow>
//         </TableBody>
//       </Table>
//     );
//   };

//   const renderFacultyAttendance = () => (
//     <Table aria-label="Faculty Attendance Table">
//       <TableHeader>
//         <TableColumn>Student Name</TableColumn>
//         <TableColumn>Roll Number</TableColumn>
//         <TableColumn>Total Lectures</TableColumn>
//         <TableColumn>Present</TableColumn>
//         <TableColumn>Attendance %</TableColumn>
//       </TableHeader>
//       <TableBody>
//         {attendanceData[0].students
//           .sort((a, b) => parseInt(a.rollNumber, 10) - parseInt(b.rollNumber, 10))
//           .map((student) => (
//             <TableRow key={student._id}>
//               <TableCell>{student.name}</TableCell>
//               <TableCell>{student.rollNumber}</TableCell>
//               <TableCell>{attendanceData[0].totalLectures}</TableCell>
//               <TableCell>{student.presentCount}</TableCell>
//               <TableCell>{((student.presentCount / attendanceData[0].totalLectures) * 100).toFixed(2)}%</TableCell>
//             </TableRow>
//           ))}
//       </TableBody>
//     </Table>
//   );

//   const renderAdminAttendance = () => {
//     const totalLectures = attendanceData.reduce((sum, subject) => sum + subject.totalLectures, 0);
//     return (
//       <div>
//         {viewType === "cumulative" ? (
//           <div className="overflow-x-auto">
//             <table className="min-w-full border-collapse block md:table">
//               <thead>
//                 <tr className="bg-gray-100">
//                   <th className="border px-4 py-2">Roll No</th>
//                   <th className="border px-4 py-2">Student Name</th>
//                   {attendanceData.map((subject) => (
//                     <th key={subject._id} className="border px-4 py-2" colSpan="3">
//                       {subject.name}<br />
//                       Faculty: {subject.facultyName}
//                       <div className="flex justify-between mt-1">
//                         <span>Total</span>
//                         <span>Present</span>
//                         <span>%</span>
//                       </div>
//                     </th>
//                   ))}
//                   <th className="border px-4 py-2" colSpan="3">
//                     Total Attendance
//                     <div className="flex justify-between mt-1">
//                       <span>Total</span>
//                       <span>Present</span>
//                       <span>%</span>
//                     </div>
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {attendanceData[0].students
//                   .slice()
//                   .sort((a, b) => parseInt(a.rollNumber, 10) - parseInt(b.rollNumber, 10))
//                   .map((student) => (
//                     <tr key={student.rollNumber}>
//                       <td className="border px-4 py-2">{student.rollNumber}</td>
//                       <td className="border px-4 py-2">{student.name}</td>
//                       {attendanceData.map((subject) => {
//                         const studentData = subject.students.find((s) => s.rollNumber === student.rollNumber);
//                         return (
//                           <React.Fragment key={subject._id}>
//                             <td className="border px-4 py-2 text-center">{subject.totalLectures}</td>
//                             <td className="border px-4 py-2 text-center">{studentData ? studentData.presentCount : 0}</td>
//                             <td className="border px-4 py-2 text-center">
//                               {studentData ? ((studentData.presentCount / subject.totalLectures) * 100).toFixed(2) : "NaN"}%
//                             </td>
//                           </React.Fragment>
//                         );
//                       })}
//                       <td className="border px-4 py-2 text-center">
//                         {totalLectures}
//                       </td>
//                       <td className="border px-4 py-2 text-center">
//                         {attendanceData.reduce((sum, subject) => {
//                           const studentData = subject.students.find((s) => s.rollNumber === student.rollNumber);
//                           return sum + (studentData ? studentData.presentCount : 0);
//                         }, 0)}
//                       </td>
//                       <td className="border px-4 py-2 text-center">
//                         {((attendanceData.reduce((sum, subject) => {
//                           const studentData = subject.students.find((s) => s.rollNumber === student.rollNumber);
//                           return sum + (studentData ? studentData.presentCount : 0);
//                         }, 0) / totalLectures) * 100).toFixed(2)}%
//                       </td>
//                     </tr>
//                   ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <Table aria-label="Individual Attendance Table">
//             <TableHeader>
//               <TableColumn>Student Name</TableColumn>
//               <TableColumn>Roll Number</TableColumn>
//               <TableColumn>Total Lectures</TableColumn>
//               <TableColumn>Present</TableColumn>
//               <TableColumn>Total Percentage</TableColumn>
//             </TableHeader>
//             <TableBody>
//               {attendanceData[0].students
//                 .slice()
//                 .sort((a, b) => parseInt(a.rollNumber, 10) - parseInt(b.rollNumber, 10))
//                 .map((student) => (
//                   <TableRow key={student._id}>
//                     <TableCell>{student.name}</TableCell>
//                     <TableCell>{student.rollNumber}</TableCell>
//                     <TableCell>{attendanceData[0].totalLectures}</TableCell>
//                     <TableCell>{student.presentCount}</TableCell>
//                     <TableCell>{((student.presentCount / attendanceData[0].totalLectures) * 100).toFixed(2)}%</TableCell>
//                   </TableRow>
//                 ))}
//             </TableBody>
//           </Table>
//         )}
//       </div>
//     );
//   };

//   if (!userProfile) {
//     return <div>Loading please wait...</div>;
//   }

//   return (
//     <div className="p-4">
//       <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
//         <div className="mb-4 md:mb-0">
//           <h1 className="text-2xl font-bold mb-2">Attendance Report</h1>
//           <p className="text-gray-600">User: {userProfile.name} ({userProfile.role})</p>
//         </div>
//         <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
//           {userProfile?.role === "superadmin" && (
//             <Select
//               placeholder="Select department"
//               name="department"
//               className=" w-[40%] "
//               selectedKeys={[selectedDepartment]}
//               onSelectionChange={(value) => handleSelectChange(value.currentKey)}
//               variant="bordered"
//               size="sm"
//             >
//               {departmentOptions.map((department) => (
//                 <SelectItem key={department.key} textValue={department.label}>
//                   {department.label}
//                 </SelectItem>
//               ))}
//             </Select>
//           )}
//           {(userProfile.role === "admin" || userProfile.role === "superadmin") && (
//             <>
//               <Dropdown>
//                 <DropdownTrigger>
//                   <Button variant="bordered">
//                     {selectedClass ? selectedClass : "Select Class"}
//                   </Button>
//                 </DropdownTrigger>
//                 <DropdownMenu aria-label="Class selection" onAction={(key) => setSelectedClass(key)}>
//                   {classes.map((classItem) => (
//                     <DropdownItem key={classItem._id}>{classItem._id}</DropdownItem>
//                   ))}
//                 </DropdownMenu>
//               </Dropdown>
//               <Dropdown>
//                 <DropdownTrigger>
//                   <Button variant="bordered">{viewType === "cumulative" ? "Cumulative View" : "Individual View"}</Button>
//                 </DropdownTrigger>
//                 <DropdownMenu aria-label="View type selection" onAction={(key) => setViewType(key)}>
//                   <DropdownItem key="cumulative">Cumulative View</DropdownItem>
//                   <DropdownItem key="individual">Individual View</DropdownItem>
//                 </DropdownMenu>
//               </Dropdown>
//               {viewType === "individual" && (
//                 <Dropdown>
//                   <DropdownTrigger>
//                     <Button variant="bordered">
//                       {selectedSubject ? selectedSubject : "Select Subject"}
//                     </Button>
//                   </DropdownTrigger>
//                   <DropdownMenu aria-label="Subject selection" onAction={(key) => setSelectedSubject(key)}>
//                     {classes.find((c) => c._id === selectedClass)?.subjects.map((subject) => (
//                       <DropdownItem key={subject}>{subject}</DropdownItem>
//                     ))}
//                   </DropdownMenu>
//                 </Dropdown>
//               )}
//               <Dropdown>
//                 <DropdownTrigger>
//                   <Button variant="bordered">
//                     {selectedBatch ? `Batch ${selectedBatch}` : "Select Batch"}
//                   </Button>
//                 </DropdownTrigger>
//                 <DropdownMenu aria-label="Batch selection" onAction={(key) => setSelectedBatch(key)}>
//                   {batches.map((batch) => (
//                     <DropdownItem key={batch._id}>{batch._id}</DropdownItem>
//                   ))}
//                 </DropdownMenu>
//               </Dropdown>
//             </>
//           )}
//           {userProfile?.role === "faculty" && (
//             <Dropdown>
//               <DropdownTrigger>
//                 <Button variant="bordered">
//                   {selectedSubject || "Select Subject"}
//                 </Button>
//               </DropdownTrigger>
//               <DropdownMenu aria-label="Subject selection" onAction={(key) => setSelectedSubject(key)}>
//                 {userProfile.subjects.map((subject) => (
//                   <DropdownItem key={subject}>{subject}</DropdownItem>
//                 ))}
//               </DropdownMenu>
//             </Dropdown>
//           )}
//         </div>
//       </div>

//       <div className="mb-8 flex items-center gap-10 w-full justify-end ">
//         <div className="w-full">
//           <h2 className="text-xl font-semibold ">Select Date Range</h2>
//           <DateRangePicker
//             aria-label="Date Range"
//             value={dateRange}
//             onChange={setDateRange}
//           // className="w-50"
//           />
//         </div>
//         <div className="w-[10%]">  <Button variant="ghost" color="primary" size="sm" onClick={generateExcelReport} className="mb-8">
//           Download Report
//         </Button>
//         </div>
//       </div>

//       {loading ? (
//         <div className="flex justify-center items-center">
//           <Spinner size="large" />
//         </div>
//       ) : error ? (
//         <div className="text-red-500">{error}</div>
//       ) : attendanceData ? (
//         <div>
//           {userProfile.role === "student" && renderStudentAttendance()}
//           {userProfile.role === "faculty" && renderFacultyAttendance()}
//           {(userProfile.role === "admin" || userProfile.role === "superadmin") && renderAdminAttendance()}
//         </div>
//       ) : (
//         <div>No attendance data available</div>
//       )}
//       {!attendanceData && (
//         <div className="flex justify-center mt-8">
//           <Image src="/report.svg" alt="Report Image" width={800} height={500} />
//         </div>
//       )}
//     </div>
//   );
// };

// export default AttendanceDisplay;
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Spinner,
  DateRangePicker,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { today, getLocalTimeZone } from "@internationalized/date";
import { departmentOptions } from "../utils/department";
import * as XLSX from "xlsx";

const AttendanceDisplay = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [viewType, setViewType] = useState("individual");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: today(getLocalTimeZone()).subtract({ weeks: 2 }),
    end: today(getLocalTimeZone()),
  });
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");

  const fetchClasses = async () => {
    if (userProfile?.role === "admin" || userProfile?.role === "superadmin") {
      try {
        const response = await axios.get(`/api/classes?department=${selectedDepartment}`);
        setClasses(response.data);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    }
  };

  useEffect(() => {
    const storedProfile = sessionStorage.getItem("userProfile");
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      setUserProfile(profile);
      if (profile.role === "admin") {
        setSelectedDepartment(profile.department);
      }
    }
  }, []);

  const handleSelectChange = (value) => {
    setSelectedDepartment(value);
  };

  useEffect(() => {
    if (userProfile?.role === "admin" || userProfile?.role === "superadmin") {
      fetchClasses();
    }
  }, [selectedDepartment, userProfile]);

  useEffect(() => {
    if (selectedClass) {
      const selectedClassData = classes.find(c => c._id === selectedClass);
      if (selectedClassData) {
        setBatches([{ _id: "all", name: "All Batches" }, ...(selectedClassData.batches || [])]);
      }
    }
  }, [selectedClass, classes]);

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = "/api/attendance-reports?";

      if (userProfile.role === "student") {
        url += `studentId=${userProfile._id}`;
      } else if (userProfile.role === "faculty") {
        url += `subjectId=${selectedSubject}`;
      } else if (userProfile.role === "admin" || userProfile.role === "superadmin") {
        url += `classId=${selectedClass}`;
        if (viewType === "individual" && selectedSubject) {
          url += `&subjectId=${selectedSubject}`;
        }
      }

      if (selectedBatches.length > 0) {
        if (selectedBatches.includes("all")) {
          url += `&allBatches=true`;
        } else {
          url += `&batchIds=${selectedBatches.join(',')}`;
        }
      }

      url += `&startDate=${dateRange.start.toString()}&endDate=${dateRange.end.toString()}`;

      const response = await axios.get(url);
      setAttendanceData(response.data);
    } catch (err) {
      setError("Failed to fetch attendance data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (userProfile) {
      if (
        userProfile.role === "student" ||
        (userProfile.role === "faculty" && selectedSubject) ||
        ((userProfile.role === "admin" || userProfile.role === "superadmin") &&
          selectedClass &&
          (viewType === "cumulative" || (viewType === "individual" && selectedSubject)))
      ) {
        fetchAttendance();
      }
    }
  }, [userProfile, selectedSubject, selectedClass, viewType, dateRange, selectedBatch]);

  const generateExcelReport = () => {
    if (!attendanceData) return;

    let wsData = [];

    if (userProfile.role === "student") {
      // Header
      wsData.push(["Subject", "Total Lectures", "Present", "Attendance %"]);

      // Data
      attendanceData.forEach((subject) => {
        wsData.push([
          subject.name,
          subject.totalLectures,
          subject.presentCount,
          ((subject.presentCount / subject.totalLectures) * 100).toFixed(2) + "%"
        ]);
      });

      // Total row
      const totalLectures = attendanceData.reduce((sum, subject) => sum + subject.totalLectures, 0);
      const totalPresent = attendanceData.reduce((sum, subject) => sum + subject.presentCount, 0);
      wsData.push([
        "Total",
        totalLectures,
        totalPresent,
        ((totalPresent / totalLectures) * 100).toFixed(2) + "%"
      ]);

    } else if (userProfile.role === "faculty") {
      // Header
      wsData.push(["Student Name", "Roll Number", "Total Lectures", "Present", "Attendance %"]);

      // Data
      attendanceData[0].students
        .sort((a, b) => parseInt(a.rollNumber, 10) - parseInt(b.rollNumber, 10))
        .forEach((student) => {
          wsData.push([
            student.name,
            student.rollNumber,
            attendanceData[0].totalLectures,
            student.presentCount,
            ((student.presentCount / attendanceData[0].totalLectures) * 100).toFixed(2) + "%"
          ]);
        });

    } else if (userProfile.role === "admin" || userProfile.role === "superadmin") {
      if (viewType === "cumulative") {
        // Header row 1 (Subject names and faculty names)
        const header1 = ["Roll No", "Student Name", "Batch"];
        attendanceData.forEach((subject) => {
          header1.push(subject.name, "", "");
        });
        header1.push("Total Attendance", "", "");
        wsData.push(header1);
  
        // Header row 2 (Faculty names)
        const header2 = ["", "", ""];
        attendanceData.forEach((subject) => {
          header2.push(`Faculty: ${subject.facultyName}`, "", "");
        });
        header2.push("", "", "");
        wsData.push(header2);
  
        // Header row 3 (Subcolumns)
        const header3 = ["", "", ""];
        attendanceData.forEach(() => {
          header3.push("Total", "Present", "%");
        });
        header3.push("Total", "Present", "%");
        wsData.push(header3);
  
        // Data rows
        const allStudents = attendanceData[0].students;
        allStudents
          .sort((a, b) => parseInt(a.rollNumber, 10) - parseInt(b.rollNumber, 10))
          .forEach((student) => {
            const row = [student.rollNumber, student.name, student.batch];
            let totalPresent = 0;
            let totalLectures = 0;
  
            attendanceData.forEach((subject) => {
              const studentData = subject.students.find((s) => s.rollNumber === student.rollNumber);
              const batchTotalLectures = subject.totalLectures[student.batch] || 0;
              totalLectures += batchTotalLectures;
              const present = studentData ? studentData.presentCount : 0;
              totalPresent += present;
              row.push(
                batchTotalLectures,
                present,
                batchTotalLectures > 0 ? ((present / batchTotalLectures) * 100).toFixed(2) + "%" : "N/A"
              );
            });
  
            row.push(
              totalLectures,
              totalPresent,
              totalLectures > 0 ? ((totalPresent / totalLectures) * 100).toFixed(2) + "%" : "N/A"
            );
            wsData.push(row);
          });
      } else if (viewType === "individual") {
        // Header
        wsData.push(["Student Name", "Roll Number", "Batch", "Total Lectures", "Present", "Attendance %"]);
  
        // Data
        attendanceData[0].students
          .sort((a, b) => parseInt(a.rollNumber, 10) - parseInt(b.rollNumber, 10))
          .forEach((student) => {
            const totalLectures = attendanceData[0].totalLectures[student.batch] || 0;
            wsData.push([
              student.name,
              student.rollNumber,
              student.batch,
              totalLectures,
              student.presentCount,
              totalLectures > 0 ? ((student.presentCount / totalLectures) * 100).toFixed(2) + "%" : "N/A"
            ]);
          });
      }
    }
  
    const ws = XLSX.utils.aoa_to_sheet(wsData);
  
    // Set column widths
    const colWidths = wsData[0].map(() => ({ wch: 15 })); // Default width of 15 for all columns
    ws['!cols'] = colWidths;
  
    // Apply styles
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({r: R, c: C});
        if (!ws[cellRef]) continue;
        ws[cellRef].s = {
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          },
          alignment: { vertical: 'center', horizontal: 'center' }
        };
        if (R < 3) {
          ws[cellRef].s.font = { bold: true };
          ws[cellRef].s.fill = { fgColor: { rgb: "EEEEEE" } };
        }
      }
    }
  
    // Merge cells for subject names and faculty names in admin/superadmin cumulative view
    if ((userProfile.role === "admin" || userProfile.role === "superadmin") && viewType === "cumulative") {
      attendanceData.forEach((_, index) => {
        const col = index * 3 + 3; // Starting from column D (index 3)
        ws['!merges'] = ws['!merges'] || [];
        // Merge cells for subject name
        ws['!merges'].push({ s: { r: 0, c: col }, e: { r: 0, c: col + 2 } });
        // Merge cells for faculty name
        ws['!merges'].push({ s: { r: 1, c: col }, e: { r: 1, c: col + 2 } });
      });
  
      // Merge cells for "Total Attendance"
      const totalCol = attendanceData.length * 3 + 3;
      ws['!merges'].push({ s: { r: 0, c: totalCol }, e: { r: 1, c: totalCol + 2 } });
    }
  
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
  
    XLSX.writeFile(wb, "Attendance_Report.xlsx");
  };
  const renderStudentAttendance = () => {
    const totalLectures = attendanceData?.reduce((sum, subject) => sum + subject.totalLectures, 0);
    const totalPresent = attendanceData?.reduce((sum, subject) => sum + subject.presentCount, 0);

    return (
      <Table aria-label="Student Attendance Table">
        <TableHeader>
          <TableColumn>Subject</TableColumn>
          <TableColumn>Total Lectures</TableColumn>
          <TableColumn>Present</TableColumn>
          <TableColumn>Attendance %</TableColumn>
        </TableHeader>
        <TableBody>
          {attendanceData?.map((subject) => (
            <TableRow key={subject._id}>
              <TableCell>{subject.name}</TableCell>
              <TableCell>{subject.totalLectures}</TableCell>
              <TableCell>{subject.presentCount}</TableCell>
              <TableCell>{((subject.presentCount / subject.totalLectures) * 100).toFixed(2)}%</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell><b>Total</b></TableCell>
            <TableCell><b>{totalLectures}</b></TableCell>
            <TableCell><b>{totalPresent}</b></TableCell>
            <TableCell><b>{((totalPresent / totalLectures) * 100).toFixed(2)}%</b></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  };

  const renderFacultyAttendance = () => (
    <Table aria-label="Faculty Attendance Table">
      <TableHeader>
        <TableColumn>Student Name</TableColumn>
        <TableColumn>Roll Number</TableColumn>
        <TableColumn>Total Lectures</TableColumn>
        <TableColumn>Present</TableColumn>
        <TableColumn>Attendance %</TableColumn>
      </TableHeader>
      <TableBody>
        {attendanceData[0].students
          .sort((a, b) => parseInt(a.rollNumber, 10) - parseInt(b.rollNumber, 10))
          .map((student) => (
            <TableRow key={student._id}>
              <TableCell>{student.name}</TableCell>
              <TableCell>{student.rollNumber}</TableCell>
              <TableCell>{attendanceData[0].totalLectures}</TableCell>
              <TableCell>{student.presentCount}</TableCell>
              <TableCell>{((student.presentCount / attendanceData[0].totalLectures) * 100).toFixed(2)}%</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
  const renderAdminAttendance = () => {
    return (
      <div>
        {viewType === "cumulative" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse block md:table">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">Roll No</th>
                  <th className="border px-4 py-2">Student Name</th>
                  <th className="border px-4 py-2">Batch</th>
                  {attendanceData.map((subject) => (
                    <th key={subject._id} className="border px-4 py-2" colSpan="3">
                      {subject.name}<br />
                      Faculty: {subject.facultyName}
                      <div className="flex justify-between mt-1">
                        <span>Total</span>
                        <span>Present</span>
                        <span>%</span>
                      </div>
                    </th>
                  ))}
                  <th className="border px-4 py-2" colSpan="3">
                    Total Attendance
                    <div className="flex justify-between mt-1">
                      <span>Total</span>
                      <span>Present</span>
                      <span>%</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendanceData[0].students
                  .slice()
                  .sort((a, b) => parseInt(a.rollNumber, 10) - parseInt(b.rollNumber, 10))
                  .map((student) => (
                    <tr key={student.rollNumber}>
                      <td className="border px-4 py-2">{student.rollNumber}</td>
                      <td className="border px-4 py-2">{student.name}</td>
                      <td className="border px-4 py-2">{student.batch}</td>
                      {attendanceData.map((subject) => {
                        const studentData = subject.students.find((s) => s.rollNumber === student.rollNumber);
                        const totalLectures = subject.totalLectures[student.batch] || 0;
                        return (
                          <React.Fragment key={subject._id}>
                            <td className="border px-4 py-2 text-center">{totalLectures}</td>
                            <td className="border px-4 py-2 text-center">{studentData ? studentData.presentCount : 0}</td>
                            <td className="border px-4 py-2 text-center">
                              {totalLectures > 0 ? ((studentData ? studentData.presentCount : 0) / totalLectures * 100).toFixed(2) : "N/A"}%
                            </td>
                          </React.Fragment>
                        );
                      })}
                      <td className="border px-4 py-2 text-center">
                        {attendanceData.reduce((sum, subject) => sum + (subject.totalLectures[student.batch] || 0), 0)}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {attendanceData.reduce((sum, subject) => {
                          const studentData = subject.students.find((s) => s.rollNumber === student.rollNumber);
                          return sum + (studentData ? studentData.presentCount : 0);
                        }, 0)}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {(() => {
                          const totalLectures = attendanceData.reduce((sum, subject) => sum + (subject.totalLectures[student.batch] || 0), 0);
                          const totalPresent = attendanceData.reduce((sum, subject) => {
                            const studentData = subject.students.find((s) => s.rollNumber === student.rollNumber);
                            return sum + (studentData ? studentData.presentCount : 0);
                          }, 0);
                          return totalLectures > 0 ? ((totalPresent / totalLectures) * 100).toFixed(2) + "%" : "N/A";
                        })()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Table aria-label="Individual Attendance Table">
            <TableHeader>
              <TableColumn>Student Name</TableColumn>
              <TableColumn>Roll Number</TableColumn>
              <TableColumn>Batch</TableColumn>
              <TableColumn>Total Lectures</TableColumn>
              <TableColumn>Present</TableColumn>
              <TableColumn>Total Percentage</TableColumn>
            </TableHeader>
            <TableBody>
              {attendanceData[0].students
                .slice()
                .sort((a, b) => parseInt(a.rollNumber, 10) - parseInt(b.rollNumber, 10))
                .map((student) => {
                  const totalLectures = attendanceData[0].totalLectures[student.batch] || 0;
                  return (
                    <TableRow key={student._id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.rollNumber}</TableCell>
                      <TableCell>{student.batch}</TableCell>
                      <TableCell>{totalLectures}</TableCell>
                      <TableCell>{student.presentCount}</TableCell>
                      <TableCell>{totalLectures > 0 ? ((student.presentCount / totalLectures) * 100).toFixed(2) + "%" : "N/A"}</TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        )}
      </div>
    );
  };
  if (!userProfile) {
    return <div>Loading please wait...</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold mb-2">Attendance Report</h1>
          <p className="text-gray-600">User: {userProfile.name} ({userProfile.role})</p>
        </div>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          {userProfile?.role === "superadmin" && (
            <Select
              placeholder="Select department"
              name="department"
              className=" w-[40%] "
              selectedKeys={[selectedDepartment]}
              onSelectionChange={(value) => handleSelectChange(value.currentKey)}
              variant="bordered"
              size="sm"
            >
              {departmentOptions.map((department) => (
                <SelectItem key={department.key} textValue={department.label}>
                  {department.label}
                </SelectItem>
              ))}
            </Select>
          )}
          {(userProfile.role === "admin" || userProfile.role === "superadmin") && (
            <>
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="bordered">
                    {selectedClass ? selectedClass : "Select Class"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Class selection" onAction={(key) => setSelectedClass(key)}>
                  {classes.map((classItem) => (
                    <DropdownItem key={classItem._id}>{classItem._id}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="bordered">{viewType === "cumulative" ? "Cumulative View" : "Individual View"}</Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="View type selection" onAction={(key) => setViewType(key)}>
                  <DropdownItem key="cumulative">Cumulative View</DropdownItem>
                  <DropdownItem key="individual">Individual View</DropdownItem>
                </DropdownMenu>
              </Dropdown>
              {viewType === "individual" && (
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="bordered">
                      {selectedSubject ? selectedSubject : "Select Subject"}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Subject selection" onAction={(key) => setSelectedSubject(key)}>
                    {classes.find((c) => c._id === selectedClass)?.subjects.map((subject) => (
                      <DropdownItem key={subject}>{subject}</DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              )}
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="bordered">
                    {selectedBatches.length > 0 ? (selectedBatches.includes("all") ? "All Batches" : `Selected Batches (${selectedBatches.length})`) : "Select Batches"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Batch selection"
                  selectionMode="multiple"
                  selectedKeys={selectedBatches}
                  onSelectionChange={(keys) => setSelectedBatches(Array.from(keys))}
                >
                  {batches.map((batch) => (
                    <DropdownItem key={batch._id}>{batch._id === "all" ? "All Batches" : `Batch ${batch._id}`}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </>
          )}
          {userProfile?.role === "faculty" && (
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered">
                  {selectedSubject || "Select Subject"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Subject selection" onAction={(key) => setSelectedSubject(key)}>
                {userProfile.subjects.map((subject) => (
                  <DropdownItem key={subject}>{subject}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          )}
        </div>
      </div>

      <div className="mb-8 flex items-center gap-10 w-full justify-end ">
        <div className="w-full">
          <h2 className="text-xl font-semibold ">Select Date Range</h2>
          <DateRangePicker
            aria-label="Date Range"
            value={dateRange}
            onChange={setDateRange}
          // className="w-50"
          />
        </div>
        <div className="w-[10%]">  <Button variant="ghost" color="primary" size="sm" onClick={generateExcelReport} className="mb-8">
          Download Report
        </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <Spinner size="large" />
        </div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : attendanceData ? (
        <div>
          {userProfile.role === "student" && renderStudentAttendance()}
          {userProfile.role === "faculty" && renderFacultyAttendance()}
          {(userProfile.role === "admin" || userProfile.role === "superadmin") && renderAdminAttendance()}
        </div>
      ) : (
        <div>No attendance data available</div>
      )}
      {!attendanceData && (
        <div className="flex justify-center mt-8">
          <Image src="/report.svg" alt="Report Image" width={800} height={500} />
        </div>
      )}
    </div>
  );
};

export default AttendanceDisplay;
