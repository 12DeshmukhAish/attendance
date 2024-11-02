"use client"

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
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
  Chip,
  Tabs,
  Tab
} from "@nextui-org/react";
import { Calendar, Download, RefreshCcw } from "lucide-react";
import { DateRangePicker } from '@nextui-org/react';
import { getCurrentAcademicYear, getAcademicYears } from "@/app/utils/acadmicYears";
import { parseDate, getLocalTimeZone, CalendarDate } from "@internationalized/date";

export default function FacultyAttendance({ facultyId = '' }) {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('sem1');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [viewType, setViewType] = useState('summary');
  const [dateRange, setDateRange] = useState({
    start: parseDate(new Date().toISOString().split('T')[0]),
    end: parseDate(new Date().toISOString().split('T')[0])
  });
  const [classesWithSubjects, setClassesWithSubjects] = useState([]);
  const [isFilterDirty, setIsFilterDirty] = useState(false);

  useEffect(() => {
    setDateRange({
      start: parseDate(new Date().toISOString().split('T')[0]),
      end: parseDate(new Date().toISOString().split('T')[0])
    });
    setAttendanceData(null);
    setIsFilterDirty(true);
  }, [viewType]);

  const fetchFacultySubjects = useCallback(async () => {
    try {
      const response = await axios.get(
        `/api/v1/utils/faculty_subjects?facultyId=${facultyId}&semester=${selectedSemester}&academicYear=${academicYear}`
      );
      setClassesWithSubjects(response.data);

      if (response.data.length > 0) {
        setSelectedClass(response.data[0].classId);
        if (response.data[0].subjects.length > 0) {
          setSelectedSubject(response.data[0].subjects[0]._id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
      setError("Failed to fetch subjects. Please try again.");
    }
  }, [facultyId, selectedSemester, academicYear]);

  useEffect(() => {
    if (selectedSemester && academicYear) {
      fetchFacultySubjects();
    }
  }, [selectedSemester, academicYear, fetchFacultySubjects]);

  const getSubjectsForClass = useCallback(() => {
    const classData = classesWithSubjects.find(c => c.classId === selectedClass);
    return classData?.subjects || [];
  }, [classesWithSubjects, selectedClass]);

  const handleFilterChange = (type, value) => {
    switch (type) {
      case 'subject':
        setSelectedSubject(value);
        break;
      case 'viewType':
        setViewType(value);
        break;
      case 'dateRange':
        setDateRange(value);
        break;
      default:
        return;
    }
    setIsFilterDirty(true);
  };

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

  const fetchAttendance = useCallback(async () => {
    if (!selectedSubject) return;

    setLoading(true);
    setError(null);
    setAttendanceData(null);

    try {
      let url = `/api/v1/attendance/faculty-attendance?subjectId=${selectedSubject}&viewType=${viewType}`;

      if (viewType === 'dateWise') {
        const startDate = dateRange.start.toString();
        const endDate = dateRange.end.toString();
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await axios.get(url);
      setAttendanceData(response.data);
      setIsFilterDirty(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch attendance data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, viewType, dateRange]);

  const generateExcelReport = useCallback(() => {
    if (!attendanceData?.attendance) return;
  
    const wb = XLSX.utils.book_new();
    const subjectName = attendanceData.subjectInfo?.name || 'Subject';
    const subjectType = attendanceData.subjectInfo?.subType;
    const currentDate = new Date().toISOString().split('T')[0];
  
    const addStylesToSheet = (ws, headerRowIndex) => {
      ws['!cols'] = [
        { wch: 15 }, // Roll Number
        { wch: 25 }, // Student Name
        { wch: 15 }, // Total Lectures
        { wch: 15 }, // Present
        { wch: 15 }  // Attendance %
      ];
  
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let C = range.s.c; C <= range.e.c; C++) {
        const headerRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: C });
        if (!ws[headerRef]) continue;
        ws[headerRef].s = {
          font: { bold: true, color: { rgb: "000000" } },
          fill: { fgColor: { rgb: "E6F3FF" } },
          border: {
            top: { style: 'thin', color: { rgb: "000000" } },
            bottom: { style: 'thin', color: { rgb: "000000" } },
            left: { style: 'thin', color: { rgb: "000000" } },
            right: { style: 'thin', color: { rgb: "000000" } }
          }
        };
      }
    };
  
    if (viewType === 'summary') {
      if (subjectType === 'theory') {
        const wsData = [
          ['Subject Details'],
          ['Subject Name', subjectName],
          ['Type', 'Theory'],
          ['Total Students', attendanceData.summary.totalStudents],
          ['Average Attendance', `${attendanceData.summary.averageAttendance}%`],
          ['Students Below 75%', attendanceData.summary.belowThreshold],
          [],
          ['Roll Number', 'Student Name', 'Total Lectures', 'Present', 'Attendance %']
        ];
  
        const sortedAttendance = [...attendanceData.attendance]
          .sort((a, b) => compareRollNumbers(a.student.rollNumber, b.student.rollNumber));
  
        sortedAttendance.forEach(record => {
          wsData.push([
            record.student.rollNumber,
            record.student.name,
            record.totalLectures,
            record.presentCount,
            `${record.percentage.toFixed(2)}%`
          ]);
        });
  
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        addStylesToSheet(ws, 7);
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
      } else {
        Object.entries(attendanceData.attendance).forEach(([batchName, batchData]) => {
          const wsData = [
            ['Batch Details'],
            ['Subject Name', subjectName],
            ['Type', subjectType.toUpperCase()],
            ['Batch', batchName],
            ['Total Students', batchData.length],
            ['Average Attendance', `${(batchData.reduce((acc, curr) => acc + curr.percentage, 0) / batchData.length).toFixed(2)}%`],
            ['Students Below 75%', batchData.filter(s => s.percentage < 75).length],
            [],
            ['Roll Number', 'Student Name', 'Total Lectures', 'Present', 'Attendance %']
          ];
  
          const sortedBatchData = [...batchData]
            .sort((a, b) => compareRollNumbers(a.student.rollNumber, b.student.rollNumber));
  
          sortedBatchData.forEach(record => {
            wsData.push([
              record.student.rollNumber,
              record.student.name,
              record.totalLectures,
              record.presentCount,
              `${record.percentage.toFixed(2)}%`
            ]);
          });
  
          const ws = XLSX.utils.aoa_to_sheet(wsData);
          addStylesToSheet(ws, 8);
          XLSX.utils.book_append_sheet(wb, ws, `Batch ${batchName}`);
        });
      }
    } else if (viewType === 'dateWise') {
      const generateDateWiseSheet = (batchData, sheetName) => {
        if (!batchData || batchData.length === 0) return;
  
        const dates = batchData[0].sessions.map(session => ({
          date: new Date(session.date).toLocaleDateString(),
          session: session.session
        }));
  
        const wsData = [
          ['Subject Details'],
          ['Subject Name', subjectName],
          ['Type', subjectType.toUpperCase()],
          ['Date Range', `${dateRange.start.toString()} to ${dateRange.end.toString()}`],
          [],
          ['Roll Number', 'Student Name', ...dates.map(d => `${d.date} (S${d.session})`), 'Present', 'Total', 'Attendance %']
        ];
  
        const sortedStudents = batchData.sort((a, b) => compareRollNumbers(a.student.rollNumber, b.student.rollNumber));
  
        sortedStudents.forEach(student => {
          const row = [
            student.student.rollNumber,
            student.student.name,
            ...student.sessions.map(session => session.status === 'present' ? 'P' : 'A'),
            student.presentCount,
            student.totalLectures,
            `${student.percentage.toFixed(2)}%`
          ];
          wsData.push(row);
        });
  
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        addStylesToSheet(ws, 5);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      };
  
      if (subjectType === 'theory') {
        generateDateWiseSheet(attendanceData.attendance, 'Date-wise Attendance');
      } else {
        Object.entries(attendanceData.attendance).forEach(([batchName, batchData]) => {
          generateDateWiseSheet(batchData, `Batch ${batchName}`);
        });
      }
    }
  
    const filename = `${subjectName}_${subjectType}_${viewType}_Attendance_${currentDate}.xlsx`;
    XLSX.writeFile(wb, filename);
  }, [attendanceData, viewType, dateRange]);

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

  const renderDateWiseTable = (batchData) => {
    if (!batchData || !Array.isArray(batchData) || batchData.length === 0) {
      return <div>No attendance data available</div>;
    }

    const dates = batchData[0]?.sessions?.map(session => ({
      date: session.date,
      session: session.session
    })) || [];

    const students = batchData.sort((a, b) => compareRollNumbers(a.student.rollNumber, b.student.rollNumber));

    return (
      <div className="overflow-x-auto">
        <Table aria-label="Date-wise Attendance Table">
          <TableHeader>
            <TableColumn sticky>Roll No</TableColumn>
            <TableColumn sticky>Name</TableColumn>
            {dates.map((date, index) => (
              <TableColumn key={`${date.date}-${date.session}`}>
                <div className="text-sm">
                  <div>{new Date(date.date).toLocaleDateString()}</div>
                  <div className="text-xs text-default-500">
                    Session {date.session}
                  </div>
                </div>
              </TableColumn>
            ))}
            <TableColumn sticky="right">Present/Total</TableColumn>
            <TableColumn sticky="right">Overall %</TableColumn>
          
          </TableHeader>
          <TableBody>
            {students.map(student => {
              const studentAttendance = student.sessions?.map(session => session.status) || [];

              return (
                <TableRow key={student.student._id}>
                  <TableCell>{student.student.rollNumber}</TableCell>
                  <TableCell>{student.student.name}</TableCell>
                  {studentAttendance.map((status, index) => (
                    <TableCell key={`${dates[index]?.date}-${dates[index]?.session}`}>
                      <Chip
                        size="sm"
                        color={status === 'present' ? "success" : "danger"}
                        variant="flat"
                      >
                        {status === 'present' ? 'P' : 'A'}
                      </Chip>
                    </TableCell>
                  ))}
                  <TableCell>{student.presentCount}/{student.totalLectures}</TableCell>
                  <TableCell>
                    <Chip
                      color={student.percentage >= 75 ? "success" : "danger"}
                      variant="flat"
                    >
                      {student.percentage.toFixed(1)}%
                    </Chip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderDropdown = (label, value, options, onSelect) => (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="bordered">
          {label}: {value}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={`${label} selection`}
        onAction={(key) => onSelect(key)}
        selectedKeys={[value]}
      >
        {options.map((option) => (
          <DropdownItem key={option.key}>{option.label}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full">
          <h1 className="text-2xl font-bold">Faculty Attendance Report</h1>
          {attendanceData?.subjectInfo && (
            <div className="flex gap-2 items-center">
              <Chip color="primary" variant="flat">
                {attendanceData.subjectInfo.name}
              </Chip>
              <Chip variant="flat">
                Semester {selectedSemester?.toUpperCase()}
              </Chip>
            </div>
          )}
        </div>

        <div className="mb-4 flex flex-wrap gap-4">
          {renderDropdown(
            "Academic Year",
            academicYear,
            getAcademicYears(10).map(year => ({ key: year.value, label: year.label })),
            setAcademicYear
          )}
          {renderDropdown(
            "Semester",
            selectedSemester,
            [{ key: "sem1", label: "Semester 1" }, { key: "sem2", label: "Semester 2" }],
            setSelectedSemester
          )}
          {renderDropdown(
            "Class",
            selectedClass,
            classesWithSubjects.map(cls => ({ key: cls.classId, label: `${cls.classId} (${cls.department})` })),
            (key) => {
              setSelectedClass(key);
              const classData = classesWithSubjects.find(c => c.classId === key);
              if (classData?.subjects.length > 0) {
                setSelectedSubject(classData.subjects[0]._id);
              }
            }
          )}
          {renderDropdown(
            "Subject",
            selectedSubject,
            getSubjectsForClass().map(subject => ({ key: subject._id, label: subject.name })),
            setSelectedSubject
          )}
          <Dropdown>
            <DropdownTrigger>
              <Button variant="bordered">
                View: {viewType === 'summary' ? 'Summary' : 'Date-wise'}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="View type selection"
              onAction={(key) => handleFilterChange('viewType', key)}
              selectedKeys={[viewType]}
            >
              <DropdownItem key="summary">Summary</DropdownItem>
              <DropdownItem key="dateWise">Date-wise</DropdownItem>
            </DropdownMenu>
          </Dropdown>

          {viewType === 'dateWise' && (
            <DateRangePicker
              label="Select Date Range"
              value={dateRange}
              className="max-w-xs"
              onChange={(newRange) => handleFilterChange('dateRange', newRange)}
            />
          )}

          <Button
            color="primary"
            isDisabled={!isFilterDirty || loading}
            onClick={fetchAttendance}
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
          <div className="flex justify-center p-8">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-danger text-center p-4">{error}</div>
        ) : attendanceData ? (
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
            {attendanceData.subjectInfo.subType === 'theory' ? (
              viewType === 'summary' ? renderSummaryTable(attendanceData.attendance) : renderDateWiseTable(attendanceData.attendance)
            ) : (
              <Tabs>
                {Object.entries(attendanceData.attendance || {}).map(([batchName, batchData]) => (
                  <Tab key={batchName} title={batchName}>
                    {viewType === 'summary' ? renderSummaryTable(batchData) : renderDateWiseTable(batchData)}
                  </Tab>
                ))}
              </Tabs>
            )}
          </>
        ) : (
          <div className="text-center p-4">Select filters and click Fetch Attendance to view data</div>
        )}
      </CardBody>
    </Card>
  );
}