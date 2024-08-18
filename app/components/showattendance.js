"use client";
import React, { useState, useEffect,useMemo } from "react";
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
} from "@nextui-org/react";
import { today, getLocalTimeZone } from "@internationalized/date";
import { departmentOptions } from "../utils/department";
import * as XLSX from "xlsx";
import { Loader2 } from "lucide-react";

const AttendanceDisplay = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [viewType, setViewType] = useState("individual");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedInactiveSubject, setSelectedInactiveSubject] = useState("");
  const [dateRange, setDateRange] = useState({
    start: today(getLocalTimeZone()).subtract({ weeks: 2 }),
    end: today(getLocalTimeZone()),
  });
  const fetchClasses = async () => {
    if ((userProfile?.role === "admin" || userProfile?.role === "superadmin") && selectedDepartment) {
      try {
        setLoading(true);
        const response = await axios.get(`/api/utils/classes?department=${selectedDepartment}`);
        setClasses(response.data || []);
      } catch (error) {
        console.error('Error fetching classes:', error);
        setError("Failed to fetch classes. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if ((userProfile?.role === "admin" || userProfile?.role === "superadmin") && selectedDepartment) {
      fetchClasses();
    }
  }, [userProfile, selectedDepartment]);

  const classOptions = useMemo(() => {
    return Array.isArray(classes) ? classes : [];
  }, [classes]);



  useEffect(() => {
    const storedProfile = sessionStorage.getItem("userProfile");
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      if (profile && profile.classes) {
        console.log(profile);
        setSelectedClass(profile.classes)

      }
      setUserProfile(profile);
      if (profile.role === "admin") {
        setSelectedDepartment(profile.department);
      }
      if (profile.role === "faculty" && profile.classes) {
        setSelectedClass(profile.classes);
      }
    }
  }, []);

  const handleSelectChange = (value) => {
    setSelectedDepartment(value);
  };
  useEffect(() => {
    if ((userProfile?.role === "admin" || userProfile?.role === "superadmin") && selectedDepartment) {
      fetchClasses();
    }
  }, [userProfile, selectedDepartment]);

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = "/api/attendance-reports?";

      if (userProfile.role === "student") {
        url += `studentId=${userProfile._id}`;
      } else if (userProfile.role === "faculty") {
        if (userProfile.classes && viewType === "cumulative") {
          url += `classId=${userProfile.classes}`;
        } else if (selectedSubject) {
          url += `subjectId=${selectedSubject}`;
        } else {
          setError("No subject selected for faculty");
          setLoading(false);
          return;
        }
      } else if (userProfile.role === "admin" || userProfile.role === "superadmin") {
        url += `classId=${selectedClass}`;
        if (viewType === "individual" && selectedSubject) {
          url += `&subjectId=${selectedSubject}`;
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
    setSelectedClass(""); // Reset selected class when department changes
  }, [selectedDepartment]);

  useEffect(() => {
    if (userProfile) {
      if (
        userProfile.role === "student" ||
        (userProfile.role === "faculty" &&
          ((selectedSubject && viewType === "individual") ||
            (userProfile.classes && viewType === "cumulative"))) ||
        ((userProfile.role === "admin" || userProfile.role === "superadmin") &&
          selectedClass &&
          (viewType === "cumulative" || (viewType === "individual" && selectedSubject)))
      ) {
        fetchAttendance();
      }
    }
  }, [userProfile, selectedSubject, selectedClass, viewType, dateRange]);
  const generateExcelReport = () => {
    if (!attendanceData) return;
    const wb = XLSX.utils.book_new();
    const createSheet = (data, sheetName) => {
      let wsData = [];

      if (viewType === "cumulative") {
        // Handle cumulative view
        const subjects = Array.from(new Set(data.flatMap(d => d.subjects?.map(s => s.subject) || [])));

        wsData.push(["Roll Number", "Student Name", ...subjects.flatMap(s => [s, "", ""]), "Final Attendance", "", ""]);
        wsData.push(["", "", ...subjects.flatMap(() => ["Total", "Present", "%"]), "Total", "Present", "%"]);

        // Sort data by roll number
        data.sort((a, b) => {
          const rollA = parseInt(a.student.rollNumber, 10);
          const rollB = parseInt(b.student.rollNumber, 10);
          return rollA - rollB;
        });

        data.forEach((studentData) => {
          let row = [studentData.student.rollNumber, studentData.student.name];
          let totalLectures = 0;
          let totalPresent = 0;

          subjects.forEach((subject) => {
            const subjectData = studentData.subjects.find(s => s.subject === subject);
            if (subjectData) {
              row.push(subjectData.totalCount, subjectData.presentCount, ((subjectData.presentCount / subjectData.totalCount) * 100).toFixed(2));
              totalLectures += subjectData.totalCount;
              totalPresent += subjectData.presentCount;
            } else {
              row.push("-", "-", "-");
            }
          });

          row.push(totalLectures, totalPresent, ((totalPresent / totalLectures) * 100).toFixed(2));
          wsData.push(row);
        });
      } else {
        // Handle individual view (existing code)
        wsData.push(["Roll Number", "Student Name", "Total Lectures", "Present", "Attendance %"]);

        data.students.sort((a, b) => parseInt(a.rollNumber, 10) - parseInt(b.rollNumber, 10))
          .forEach((student) => {
            wsData.push([
              student.rollNumber,
              student.name,
              data.totalLectures,
              student.presentCount,
              ((student.presentCount / data.totalLectures) * 100).toFixed(2) + "%"
            ]);
          });
      }

      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Set column widths
      const colWidths = wsData[0].map((_, i) => ({ wch: Math.max(...wsData.map(row => String(row[i]).length)) + 2 }));
      ws['!cols'] = colWidths;

      // Apply styles
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[cellRef]) continue;
          ws[cellRef].s = {
            border: {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' }
            },
            alignment: { vertical: 'center', horizontal: 'center' },
            font: { name: 'Arial', sz: 11 }
          };
          if (R === 0 || R === 1) {
            ws[cellRef].s.font.bold = true;
            ws[cellRef].s.fill = { fgColor: { rgb: "EEEEEE" } };
          }
        }
      }

      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    };

    if (userProfile.role === "student") {
      createSheet({ students: attendanceData, totalLectures: attendanceData.reduce((sum, subject) => sum + subject.totalLectures, 0) }, "Student Report");
    } else if (userProfile.role === "faculty" || (userProfile.role === "admin" || userProfile.role === "superadmin")) {
      if (viewType === "cumulative") {
        createSheet(attendanceData, "Cumulative Report");
      } else if (Array.isArray(attendanceData)) {
        attendanceData.forEach((batchData, index) => {
          createSheet(batchData, `Batch ${index + 1}`);
        });
      } else {
        createSheet(attendanceData, "Attendance Report");
      }
    }

    // Generate a unique filename with timestamp
    const fileName = `Attendance_Report_${new Date().toISOString().replace(/[:.]/g, "-")}.xlsx`;

    // Use writeFile with type 'base64' for better browser compatibility
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
    const blob = new Blob([s2ab(atob(wbout))], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  // Helper function to convert string to ArrayBuffer
  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

  const renderStudentAttendance = () => {
    const totalLectures = attendanceData?.reduce((sum, subject) => sum + subject.totalLectures, 0);
    const totalPresent = attendanceData?.reduce((sum, subject) => sum + subject.presentCount, 0);

    return (
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Student Attendance Summary</h2>


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
      </div>
    );
  };


  const renderFacultyAttendance = () => (
    <div>
      {attendanceData.map((subjectData, index) => (
        <div key={index} className="my-8">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Subject: {subjectData.name}</h3>
          <p className="text-md my-1 text-gray-600">Faculty: <span className="font-medium">{subjectData.facultyName}</span></p>
          <p className="text-md my-1 text-gray-600">Batch: <span className="font-medium">{subjectData.batch}</span></p>
          <p className="text-md my-10 text-gray-600">Total Lectures: <span className="font-medium">{subjectData.totalLectures}</span></p>
          <Table aria-label={`Attendance Table for ${subjectData.name}`}>
            <TableHeader>
              <TableColumn>Roll Number</TableColumn>
              <TableColumn>Student Name</TableColumn>
              <TableColumn>Present</TableColumn>
              <TableColumn>Attendance %</TableColumn>
            </TableHeader>
            <TableBody>
              {subjectData.students
                .slice()
                .sort((a, b) => parseInt(a.rollNumber, 10) - parseInt(b.rollNumber, 10))
                .map((student) => (
                  <TableRow key={student.rollNumber}>
                    <TableCell>{student.rollNumber}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.presentCount}</TableCell>
                    <TableCell>
                      {((student.presentCount / subjectData.totalLectures) * 100).toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
  const renderAdminAttendance = () => {
    let sortedAttendanceData;
    let subjectsByType;
    if (viewType === "cumulative" && Array.isArray(attendanceData)) {
      sortedAttendanceData = [...attendanceData].sort((a, b) => {
        const rollA = a.student?.rollNumber || '';
        const rollB = b.student?.rollNumber || '';

        // Try to extract numeric part from the beginning of the string
        const numA = parseInt(rollA.match(/^\d+/)?.[0] || '0', 10);
        const numB = parseInt(rollB.match(/^\d+/)?.[0] || '0', 10);

        if (numA !== numB) {
          // If numeric parts are different, sort by them
          return numA - numB;
        } else {
          // If numeric parts are same or both are non-numeric, sort alphabetically
          return rollA.localeCompare(rollB, undefined, { numeric: true, sensitivity: 'base' });
        }
      });
      // Group subjects by type
      subjectsByType = sortedAttendanceData.reduce((acc, data) => {
        data.subjects.forEach(subject => {
          if (!acc[subject.subjectType]) {
            acc[subject.subjectType] = new Set();
          }
          acc[subject.subjectType].add(subject.subject);
        });
        return acc;
      }, {});

      // Sort subject types
      const subjectTypeOrder = ['theory', 'practical', 'tg'];
      subjectsByType = Object.fromEntries(
        subjectTypeOrder
          .filter(type => subjectsByType[type])
          .map(type => [type, Array.from(subjectsByType[type])])
      );
    }

    return (
      <div>
        {viewType === "cumulative" ? (
          <div className="overflow-x-auto">
            {sortedAttendanceData && subjectsByType ? (
              <table className="min-w-full border-collapse block md:table">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2">Roll No</th>
                    <th className="border px-4 py-2">Student Name</th>
                    {Object.entries(subjectsByType).map(([type, subjects]) => (
                      <React.Fragment key={type}>
                        <th className="border px-4 py-2" colSpan={subjects.length * 3}>
                          {type.charAt(0).toUpperCase() + type.slice(1)} Subjects
                        </th>
                      </React.Fragment>
                    ))}
                    <th className="border px-4 py-2" colSpan="3">
                      Final Attendance
                    </th>
                  </tr>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2"></th>
                    <th className="border px-4 py-2"></th>
                    {Object.entries(subjectsByType).flatMap(([type, subjects]) =>
                      subjects.map(subject => (
                        <th key={`${type}-${subject}`} className="border px-4 py-2" colSpan="3">
                          {subject}
                          <div className="flex justify-between mt-1">
                            <span>Total</span>
                            <span>Present</span>
                            <span>%</span>
                          </div>
                        </th>
                      ))
                    )}
                    <th className="border px-4 py-2" colSpan="3">
                      <div className="flex justify-between mt-1">
                        <span>Total</span>
                        <span>Present</span>
                        <span>%</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAttendanceData.map((studentData) => {
                    let overallTotalLectures = 0;
                    let overallTotalPresent = 0;

                    return (
                      <tr key={studentData.student._id}>
                        <td className="border px-4 py-2">{studentData.student.rollNumber}</td>
                        <td className="border px-4 py-2">{studentData.student.name}</td>
                        {Object.entries(subjectsByType).flatMap(([type, subjects]) =>
                          subjects.map(subject => {
                            const subjectData = studentData.subjects.find(s => s.subject === subject && s.subjectType === type);
                            if (subjectData) {
                              overallTotalLectures += subjectData.totalCount;
                              overallTotalPresent += subjectData.presentCount;
                              return (
                                <React.Fragment key={`${type}-${subject}`}>
                                  <td className="border px-4 py-2 text-center">{subjectData.totalCount}</td>
                                  <td className="border px-4 py-2 text-center">{subjectData.presentCount}</td>
                                  <td className="border px-4 py-2 text-center">
                                    {((subjectData.presentCount / subjectData.totalCount) * 100).toFixed(2)}%
                                  </td>
                                </React.Fragment>
                              );
                            } else {
                              return (
                                <React.Fragment key={`${type}-${subject}`}>
                                  <td className="border px-4 py-2 text-center">-</td>
                                  <td className="border px-4 py-2 text-center">-</td>
                                  <td className="border px-4 py-2 text-center">-</td>
                                </React.Fragment>
                              );
                            }
                          })
                        )}
                        <td className="border px-4 py-2 text-center">{overallTotalLectures}</td>
                        <td className="border px-4 py-2 text-center">{overallTotalPresent}</td>
                        <td className="border px-4 py-2 text-center">
                          {overallTotalLectures > 0 ? ((overallTotalPresent / overallTotalLectures) * 100).toFixed(2) : '0.00'}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p>No attendance data available for cumulative view.</p>
            )}
          </div>
        ) : (
          <div>
            {Array.isArray(attendanceData) && attendanceData.length > 0 ? (
              attendanceData.map((subjectData, index) => (
                <div key={index}>
                  <h3>Subject: {subjectData.name}</h3>
                  <p>Faculty: {subjectData.facultyName}</p>
                  <p>Batch: {subjectData.batch}</p>
                  <p>Total Lectures: {subjectData.totalLectures}</p>
                  <Table aria-label={`Attendance Table for ${subjectData.name}`}>
                    <TableHeader>
                      <TableColumn>Roll Number</TableColumn>
                      <TableColumn>Student Name</TableColumn>
                      <TableColumn>Present</TableColumn>
                      <TableColumn>Attendance %</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {subjectData.students
                        .slice()
                        .sort((a, b) => parseInt(a.rollNumber, 10) - parseInt(b.rollNumber, 10))
                        .map((student) => (
                          <TableRow key={student.rollNumber}>
                            <TableCell>{student.rollNumber}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.presentCount}</TableCell>
                            <TableCell>
                              {((student.presentCount / subjectData.totalLectures) * 100).toFixed(2)}%
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              ))
            ) : (
              <p>No attendance data available for individual view.</p>
            )}
          </div>
        )}
      </div>
    );
  };

  console.log(userProfile);


  if (!userProfile) {
    return <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  }
  return (
    <div className="p-4">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Attendance Report</h1>
          <p className="text-lg text-gray-600">User: <span className="font-semibold">{userProfile.name}</span> ({userProfile.role})</p>
        </div>


        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          {userProfile?.role === "superadmin" && (
            <Dropdown >
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
          {(userProfile?.role === "admin" || userProfile?.role === "superadmin") && (
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered" disabled={classOptions.length === 0}>
                  {selectedClass || "Select Class"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Class selection"
                onAction={(key) => setSelectedClass(key)}
                items={classOptions}
              >
                {(item) => (
                  <DropdownItem key={item._id}>{item._id}</DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>
          )}
          {(userProfile.role === "admin" || userProfile.role === "superadmin" || userProfile?.classes) && (
            <>
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="bordered">{viewType === "cumulative" ? "Cumulative View" : "Individual View"}</Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="View type selection" onAction={(key) => {
                  setAttendanceData(null)
                  setViewType(key)
                  // setSelectedClass(userProfile?.classes)
                }}>
                  <DropdownItem key="cumulative">Cumulative View</DropdownItem>
                  <DropdownItem key="individual">Individual View</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </>
          )}
          {userProfile?.role === "faculty" && viewType === "individual" && (
            <>
              {userProfile.subjects && (<Dropdown>
                <DropdownTrigger>
                  <Button variant="bordered">
                    {selectedSubject ? `Current: ${selectedSubject}` : "Select Current Year Subject"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Subject selection"
                  onAction={(key) => {
                    setSelectedSubject(key);
                    setSelectedInactiveSubject(""); // Clear inactive subject when selecting an active one
                  }}
                >
                  {userProfile.subjects?.map((subject) => (
                    <DropdownItem key={subject}>{subject}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              )}
              {userProfile.inactiveSubjects && (
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="bordered">
                      {selectedInactiveSubject ? `Previous: ${selectedInactiveSubject}` : "Select Previous Year Subject"}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Inactive subject selection"
                    onAction={(key) => {
                      setSelectedInactiveSubject(key);
                      setSelectedSubject(""); // Clear active subject when selecting an inactive one
                    }}
                  >
                    {userProfile.inactiveSubjects?.map((subject) => (
                      <DropdownItem key={subject}>{subject}</DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              )}
            </>
          )}
          {(userProfile.role === "admin" || userProfile.role === "superadmin" || !userProfile?.classes) && (
            <>
              {viewType === "individual" && (
                <Dropdown >
                  <DropdownTrigger>
                    <Button variant="bordered">
                      {selectedSubject ? selectedSubject : "Select Subject"}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu className="max-h-48 overflow-y-auto" aria-label="Subject selection" onAction={(key) => setSelectedSubject(key)}>
                    {classOptions && classOptions?.find((c) => c._id === selectedClass)?.subjects.map((subject) => (
                      <DropdownItem key={subject}>{subject}</DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mb-8 flex items-center  gap-10 w-full justify-center ">
        <div className="w-full">
          <h2 className="text-lg font-semibold ">Select Date Range</h2>
          <DateRangePicker
            aria-label="Date Range"
            value={dateRange}
            onChange={setDateRange}
            className="max-w-[50%]"
            variant="bordered"
          />
        </div>
        <div className="w-[10%] mt-4">  <Button variant="ghost" color="primary" size="sm" onClick={generateExcelReport} className="mb-8">
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
          {(userProfile.role === "faculty" && !userProfile?.classes) && renderFacultyAttendance()}
          {(userProfile.role === "admin" || userProfile.role === "superadmin" || userProfile?.classes) && renderAdminAttendance()}
        </div>
      ) : (
        <div>No attendance data available</div>
      )}
      {!attendanceData && (
        <div className="flex justify-center mt-8">
          <Image src="/report.svg" alt="Report Image" width={600} height={600} />
        </div>
      )}
    </div>
  );
};

export default AttendanceDisplay;