"use client"
import React, { useState, useEffect } from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, CheckboxGroup, Checkbox } from "@nextui-org/react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import axios from 'axios';
import { DatePicker } from "@nextui-org/date-picker";
import Image from "next/image";

export default function App() {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedContents, setSelectedContents] = useState([]);
  const [sessions] = useState([1, 2, 3, 4, 5, 6, 7]);
  const [profile, setProfile] = useState(null);
  const [subjectDetails, setSubjectDetails] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceRecord, setAttendanceRecord] = useState(null);

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      const parsedProfile = JSON.parse(storedProfile);
      setProfile(parsedProfile);
      if (parsedProfile.subjects.length === 1) {
        setSelectedSubject(parsedProfile.subjects[0]);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedSubject && selectedDate && selectedSession) {
      console.log(selectedSession, selectedSubject, selectedDate);
      console.log('Fetching attendance for:', { selectedSubject, selectedDate, selectedSession });
      fetchSubjectAttendance();
    }
  }, [selectedSubject, selectedDate, selectedSession]);

  const fetchSubjectAttendance = async () => {
    try {
      const response = await axios.get(`/api/update?subjectId=${selectedSubject}&date=${selectedDate}&session=${selectedSession}`);
      const { subject, students, attendanceRecord } = response.data;
      console.log(response.data);
      setSubjectDetails(subject);
      setStudents(students);
      setAttendanceRecord(attendanceRecord);
      if (attendanceRecord) {
        setSelectedKeys(new Set(attendanceRecord.records.map(r => r.student)));
        setSelectedContents(attendanceRecord.contents || []);
      } else {
        setSelectedKeys(new Set());
        setSelectedContents([]);
      }
    } catch (error) {
      console.error('Error fetching subject attendance:', error);
    }
  };

  const updateAttendance = async () => {
    if (!selectedSubject || !selectedDate || !selectedSession) {
      alert("Please select subject, date, and session");
      return;
    }

    const attendanceData = students.map(student => ({
      studentId: student._id,
      status: selectedKeys.has(student._id) ? 'present' : 'absent'
    }));

    try {
      console.log(attendanceData);
      const response = await axios.put(`/api/update`, {
        subjectId: selectedSubject,
        // date: selectedDate.toISOString().split('T')[0],
        session: selectedSession,
        attendanceData
      });

      console.log('Attendance updated successfully:', response.data);
      alert("Attendance updated successfully");
      fetchSubjectAttendance(); // Refresh the data
    } catch (error) {
      console.error('Failed to update attendance:', error);
      alert("Failed to update attendance");
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-4">
        {profile && profile.subjects.length > 1 && (
          <Dropdown>
            <DropdownTrigger>
              <Button variant="bordered" className="capitalize">
                {selectedSubject ? selectedSubject : "Select Subject"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Subject selection"
              variant="flat"
              disallowEmptySelection
              selectionMode="single"
              selectedKeys={selectedSubject ? new Set([selectedSubject]) : new Set()}
              onSelectionChange={(keys) => setSelectedSubject(Array.from(keys)[0])}
            >
              {profile.subjects.map((subject) => (
                <DropdownItem key={subject}>{subject}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        )}
        <div className="max-w-[60%]">
          <DatePicker
            selected={selectedDate}
            onChange={date => {
              console.log('Date changed:', date);
              setSelectedDate(date);
            }}
            dateFormat="yyyy-MM-dd"
          />
        </div>
        <div className="max-w-[60%]">
          <Dropdown >
            <DropdownTrigger>
              <Button variant="bordered" className="capitalize">
                {selectedSession ? `Session ${selectedSession}` : "Select Session"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Session selection"
              variant="flat"
              disallowEmptySelection
              selectionMode="single"
              selectedKeys={selectedSession ? new Set([selectedSession.toString()]) : new Set()}
              onSelectionChange={(keys) => {
                const session = parseInt(Array.from(keys)[0]);
                console.log('Session changed:', session);
                setSelectedSession(session);
              }}
            >
              {sessions.map((session) => (
                <DropdownItem key={session.toString()}>Session {session}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
      {subjectDetails && (
        <div className="mb-4">
          <h2>Subject Content</h2>
          <CheckboxGroup
            value={selectedContents}
            onChange={setSelectedContents}
          >
            {subjectDetails.content && subjectDetails.content
              .filter(content => content.status !== "covered")
              .map((content, index) => (
                <Checkbox key={index} value={content.name}>
                  {index + 1} {content.name}
                </Checkbox>
              ))}
          </CheckboxGroup>
        </div>
      )}

      {students.length > 0 && (
        <div className="flex flex-col gap-3 mt-4">
          <Table
            aria-label="Attendance table"
            selectionMode="multiple"
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
          >
            <TableHeader>
              <TableColumn>Roll Number</TableColumn>
              <TableColumn>Name</TableColumn>

            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>{student.rollNumber}</TableCell>
                  <TableCell>{student.name}</TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button className="max-w-[50%] mx-auto" color="primary" variant="shadow" onClick={updateAttendance}>
            Update Attendance
          </Button>
        </div>
      )}
      {!students &&
        <div>
          <Image src="/update.svg"></Image>
        </div>
      }
    </div>
  );
}