"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
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
  const [dateRange, setDateRange] = useState({
    start: today(getLocalTimeZone()).subtract({ weeks: 2 }),
    end: today(getLocalTimeZone()),
  });

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
  const handleSelectChange = ( value) => {
    setSelectedDepartment(value);
  };

  useEffect(() => {
    if (userProfile?.role === "admin" || userProfile?.role === "superadmin") {
      fetchClasses();
    }
  }, [selectedDepartment, userProfile]);
  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = "/api/attendance-reports?";
      if (userProfile.role === "student") {
        url += `studentId=${userProfile._id}`;
      } else if (userProfile.role === "faculty") {
        url += `subjectId=${selectedSubject}`;
      } else if (userProfile.role === "admin" ||userProfile.role === "superadmin") {
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
    if (userProfile) {
      if (userProfile.role === "student" ||
          (userProfile.role === "faculty" && selectedSubject) ||
          ((userProfile.role === "admin" || userProfile.role === "superadmin") && selectedClass && (viewType === "cumulative" || (viewType === "individual" && selectedSubject)))) {
        fetchAttendance();
      }
    }
  }, [userProfile, selectedSubject, selectedClass, viewType, dateRange]);

  const renderStudentAttendance = () => {
    const totalLectures = attendanceData.reduce((sum, subject) => sum + subject.totalLectures, 0);
    const totalPresent = attendanceData.reduce((sum, subject) => sum + subject.presentCount, 0);

    return (
      <Table aria-label="Student Attendance Table">
        <TableHeader>
          <TableColumn>Subject</TableColumn>
          <TableColumn>Total Lectures</TableColumn>
          <TableColumn>Present</TableColumn>
          <TableColumn>Attendance %</TableColumn>
        </TableHeader>
        <TableBody>
          {attendanceData.map((subject) => (
            <TableRow key={subject._id}>
              <TableCell>{subject.name}</TableCell>
              <TableCell>{subject.totalLectures}</TableCell>
              <TableCell>{subject.presentCount}</TableCell>
              <TableCell>{((subject.presentCount / subject.totalLectures) * 100).toFixed(2)}%</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell><strong>Total</strong></TableCell>
            <TableCell><strong>{totalLectures}</strong></TableCell>
            <TableCell><strong>{totalPresent}</strong></TableCell>
            <TableCell><strong>{((totalPresent / totalLectures) * 100).toFixed(2)}%</strong></TableCell>
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
        <TableColumn>Present</TableColumn>
        <TableColumn>Attendance %</TableColumn>
      </TableHeader>
      <TableBody>
        {attendanceData[0].students.map((student) => (
          <TableRow key={student._id}>
            <TableCell>{student.name}</TableCell>
            <TableCell>{student.rollNumber}</TableCell>
            <TableCell>{student.presentCount}</TableCell>
            <TableCell>{((student.presentCount / attendanceData[0].totalLectures) * 100).toFixed(2)}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderAdminAttendance = () => {
    const totalLectures = attendanceData.reduce((sum, subject) => sum + subject.totalLectures, 0);

    if (viewType === "cumulative") {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Roll No</th>
                <th className="border px-4 py-2">Student Name</th>
                {attendanceData.map((subject) => (
                  <th key={subject._id} className="border px-4 py-2">
                    {subject.name}<br />
                    Faculty: {subject.facultyName}
                  </th>
                ))}
                <th className="border px-4 py-2">Total Attendance</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData[0].students.map((student) => (
                <tr key={student.rollNumber}>
                  <td className="border px-4 py-2">{student.rollNumber}</td>
                  <td className="border px-4 py-2">{student.name}</td>
                  {attendanceData.map((subject) => {
                    const studentData = subject.students.find((s) => s.rollNumber === student.rollNumber);
                    return (
                      <td key={subject._id} className="border px-4 py-2">
                        <div>Present: {studentData ? studentData.presentCount : 0}</div>
                        <div>Total: {subject.totalLectures}</div>
                        <div>{studentData ? ((studentData.presentCount / subject.totalLectures) * 100).toFixed(2) : "NaN"}%</div>
                      </td>
                    );
                  })}
                  <td className="border px-4 py-2">
                    {attendanceData.reduce((sum, subject) => {
                      const studentData = subject.students.find((s) => s.rollNumber === student.rollNumber);
                      return sum + (studentData ? studentData.presentCount : 0);
                    }, 0)}
                    /
                    {totalLectures}
                    ({((attendanceData.reduce((sum, subject) => {
                      const studentData = subject.students.find((s) => s.rollNumber === student.rollNumber);
                      return sum + (studentData ? studentData.presentCount : 0);
                    }, 0) / totalLectures) * 100).toFixed(2)}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      return (
        <Table aria-label="Individual Attendance Table">
          <TableHeader>
            <TableColumn>Student Name</TableColumn>
            <TableColumn>Roll Number</TableColumn>
            <TableColumn>Total Lectures</TableColumn>
            <TableColumn>Present</TableColumn>
            <TableColumn>Total Percentage</TableColumn>
          </TableHeader>
          <TableBody>
            {attendanceData[0].students.map((student) => (
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
    }
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
          {(userProfile.role === "admin" ||userProfile.role === "superadmin") && (
            <>
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="bordered">
                    {selectedClass ? userProfile.classes.find((c) => c === selectedClass) : "Select Class"}
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
                      {selectedSubject ? userProfile.subjects.find((s) => s === selectedSubject) : "Select Subject"}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Subject selection" onAction={(key) => setSelectedSubject(key)}>
                    {userProfile.subjects.map((subject) => (
                      <DropdownItem key={subject}>{subject}</DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              )}
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

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Select Date Range</h2>
        <DateRangePicker
          aria-label="Date Range"
          value={dateRange}
          onChange={setDateRange}
        />
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
          {userProfile.role === "admin" && renderAdminAttendance()}
        </div>
      ) : (
        <div>No attendance data available</div>
      )}
    </div>
  );
};

export default AttendanceDisplay;
