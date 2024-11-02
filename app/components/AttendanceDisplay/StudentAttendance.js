'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react"
import { getCurrentAcademicYear, getAcademicYears, isValidAcademicYear } from '@/app/utils/acadmicYears'

export default function StudentAttendance({ studentId }) {
  const [attendanceData, setAttendanceData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedSemester, setSelectedSemester] = useState('sem1')
  const [academicYear, setAcademicYear] = useState('')
  const [academicYears, setAcademicYears] = useState([])
  const [studentInfo, setStudentInfo] = useState(null)

  useEffect(() => {
    const currentYear = getCurrentAcademicYear()
    setAcademicYear(currentYear)
    setAcademicYears(getAcademicYears(5))
  }, [])

  const fetchAttendance = async () => {
    if (!isValidAcademicYear(academicYear)) {
      setError("Invalid academic year")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`/api/v1/attendance/student-attendance?studentId=${studentId}&academicYear=${academicYear}&semester=${selectedSemester}`)
      setAttendanceData(response.data.attendance) // Access the attendance array from the response
      setStudentInfo(response.data.studentInfo) // Store student info separately
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch attendance data")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFetchAttendance = () => {
    if (academicYear && selectedSemester) {
      fetchAttendance()
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Attendance Report</h1>
      {studentInfo && (
        <div className="mb-4">
          <p className="text-md">Name: {studentInfo.name}</p>
          <p className="text-md">Roll Number: {studentInfo.rollNumber}</p>
        </div>
      )}
      <div className="mb-4 flex space-x-4 items-center">
        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered">
              {selectedSemester === 'sem1' ? 'Semester 1' : 'Semester 2'}
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Semester selection" onAction={(key) => setSelectedSemester(key)}>
            <DropdownItem key="sem1">Semester 1</DropdownItem>
            <DropdownItem key="sem2">Semester 2</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered">
              {academicYear || 'Select Academic Year'}
            </Button>
          </DropdownTrigger>
          <DropdownMenu 
            aria-label="Academic Year selection" 
            onAction={(key) => setAcademicYear(key)}
            items={academicYears}
          >
            {(item) => (
              <DropdownItem key={item.value}>
                {item.label}
              </DropdownItem>
            )}
          </DropdownMenu>
        </Dropdown>
        <Button color="primary" onClick={handleFetchAttendance}>
          Fetch Attendance
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 rounded bg-red-50">{error}</div>
      ) : attendanceData && attendanceData.length > 0 ? (
        <Table aria-label="Student Attendance Table">
          <TableHeader>
            <TableColumn>Subject</TableColumn>
            <TableColumn>Type</TableColumn>
            <TableColumn>Total Lectures</TableColumn>
            <TableColumn>Present</TableColumn>
            <TableColumn>Attendance %</TableColumn>
          </TableHeader>
          <TableBody>
            {attendanceData.map((subject) => (
              <TableRow key={subject.subjectId}>
                <TableCell>{subject.subjectName}</TableCell>
                <TableCell>{subject.subjectType}</TableCell>
                <TableCell>{subject.totalLectures}</TableCell>
                <TableCell>{subject.presentCount}</TableCell>
                <TableCell>
                  <span className={`${parseFloat(subject.percentage) < 75 ? 'text-red-500' : 'text-green-500'}`}>
                    {subject.percentage}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center p-4 bg-gray-50 rounded">
          {attendanceData === null 
            ? "Select semester and academic year to view attendance" 
            : "No attendance records found for the selected period"}
        </div>
      )}
    </div>
  )
}