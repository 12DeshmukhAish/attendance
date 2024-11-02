import React, { useMemo } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react"

const sortByRollNumber = (a, b) => {
  const rollA = a.rollNumber || a.student?.rollNumber || ''
  const rollB = b.rollNumber || b.student?.rollNumber || ''

  const [, numA, alphaA] = rollA.match(/^(\d*)(.*)$/) || []
  const [, numB, alphaB] = rollB.match(/^(\d*)(.*)$/) || []

  const numComparison = (parseInt(numA, 10) || 0) - (parseInt(numB, 10) || 0)
  if (numComparison !== 0) return numComparison

  return alphaA.localeCompare(alphaB)
}

export default function AttendanceTable({ attendanceData, userProfile, viewType }) {
  const sortedAttendanceData = useMemo(() => {
    if (!attendanceData) return []
    return Array.isArray(attendanceData) ? [...attendanceData].sort(sortByRollNumber) : attendanceData
  }, [attendanceData])

  const groupSubjectsByType = useMemo(() => {
    if (!sortedAttendanceData || !Array.isArray(sortedAttendanceData) || sortedAttendanceData.length === 0) return {}

    const subjectTypes = ['theory', 'practical', 'tg']
    return sortedAttendanceData.reduce((acc, data) => {
      data.subjects?.forEach(subject => {
        const type = subjectTypes.find(t => subject.subjectType === t) || 'other'
        if (!acc[type]) acc[type] = new Set()
        acc[type].add(subject.subject)
      })
      return acc
    }, {})
  }, [sortedAttendanceData])

  const renderStudentAttendance = () => {
    const totalLectures = sortedAttendanceData?.reduce((sum, subject) => sum + subject.totalLectures, 0)
    const totalPresent = sortedAttendanceData?.reduce((sum, subject) => sum + subject.presentCount, 0)

    return (
      <Table aria-label="Student Attendance Table">
        <TableHeader>
          <TableColumn>Subject</TableColumn>
          <TableColumn>Total Lectures</TableColumn>
          <TableColumn>Present</TableColumn>
          <TableColumn>Attendance %</TableColumn>
        </TableHeader>
        <TableBody>
          {sortedAttendanceData?.map((subject) => (
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
    )
  }

  

  const renderFacultyAttendance = () => (
    <div>
      {sortedAttendanceData.map((subjectData, index) => (
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
                .sort(sortByRollNumber)
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
  )

  const renderAdminAttendance = () => {
    if (viewType === "cumulative") {
      return (
        <div className="overflow-x-auto">
          {sortedAttendanceData.length > 0 ? (
            <table className="min-w-full border-collapse block md:table">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">Roll No</th>
                  <th className="border px-4 py-2">Student Name</th>
                  {Object.entries(groupSubjectsByType).map(([type, subjects]) => (
                    <React.Fragment key={type}>
                      <th className="border px-4 py-2" colSpan={subjects.size * 3}>
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
                  {Object.entries(groupSubjectsByType).flatMap(([type, subjects]) =>
                    Array.from(subjects).map(subject => (
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
                  let overallTotalLectures = 0
                  let overallTotalPresent = 0

                  return (
                    <tr key={studentData.student._id}>
                      <td className="border px-4 py-2">{studentData.student.rollNumber}</td>
                      <td className="border px-4 py-2">{studentData.student.name}</td>
                      {Object.entries(groupSubjectsByType).flatMap(([type, subjects]) =>
                        Array.from(subjects).map(subject => {
                          const subjectData = studentData.subjects.find(s => s.subject === subject && s.subjectType === type)
                          if (subjectData) {
                            overallTotalLectures += subjectData.totalCount
                            overallTotalPresent += subjectData.presentCount
                            return (
                              <React.Fragment key={`${type}-${subject}`}>
                                <td className="border px-4 py-2 text-center">{subjectData.totalCount}</td>
                                <td className="border px-4 py-2 text-center">{subjectData.presentCount}</td>
                                <td className="border px-4 py-2 text-center">
                                  {((subjectData.presentCount / subjectData.totalCount) * 100).toFixed(2)}%
                                </td>
                              </React.Fragment>
                            )
                          } else {
                            return (
                              <React.Fragment key={`${type}-${subject}`}>
                                <td className="border px-4 py-2 text-center">-</td>
                                <td className="border px-4 py-2 text-center">-</td>
                                <td className="border px-4 py-2 text-center">-</td>
                              </React.Fragment>
                            )
                          }
                        })
                      )}
                      <td className="border px-4 py-2 text-center">{overallTotalLectures}</td>
                      <td className="border px-4 py-2 text-center">{overallTotalPresent}</td>
                      <td className="border px-4 py-2 text-center">
                        {overallTotalLectures > 0 ? ((overallTotalPresent / overallTotalLectures) * 100).toFixed(2) : '0.00'}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <p>No attendance data available for cumulative view.</p>
          )}
        </div>
      )
    } else {
      return (
        <div>
          {Array.isArray(sortedAttendanceData) && sortedAttendanceData.length > 0 ? (
            sortedAttendanceData.map((subjectData, index) => (
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
                      .sort(sortByRollNumber)
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
      )
    }
  }

  if (userProfile.role === "student") {
    return renderStudentAttendance()
  } else if (userProfile.role === "faculty" && !userProfile?.classes) {
    return renderFacultyAttendance()
  } else if (userProfile.role === "admin" || userProfile.role === "superadmin" || userProfile?.classes) {
    return renderAdminAttendance()
  } else {
    return <div>Invalid user role</div>
  }
}