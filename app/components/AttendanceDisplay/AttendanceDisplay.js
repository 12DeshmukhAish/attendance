'use client'

import React, { useState, useEffect } from 'react'
import { Spinner } from "@nextui-org/react"
import StudentAttendance from './StudentAttendance'
import FacultyAttendance from './FacultyAttendance'
import AdminAttendance from './AdminAttendance'

export default function AttendanceDisplay() {
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedProfile = sessionStorage.getItem("userProfile")
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile))
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Spinner size="large" />
        <p>Loading, please wait...</p>
      </div>
    );
  }
  
  // if (!userProfile) {
  //   return <div>Please log in to view attendance.</div>
  // }

  switch (userProfile.role) {
    case 'student':
      return <StudentAttendance studentId={userProfile._id} />
    case 'faculty':
      return <FacultyAttendance facultyId={userProfile._id} />
    case 'admin':
      return <AdminAttendance adminId={userProfile._id}  department={userProfile.department} />
    case 'superadmin':
      return <AdminAttendance role={userProfile.role}/>
    default:
      return <div>Invalid user role</div>
  }
}