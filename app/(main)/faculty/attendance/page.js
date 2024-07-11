"use client"
import React, { useState, useEffect } from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, CheckboxGroup, Checkbox } from "@nextui-org/react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import axios from 'axios';
import {DatePicker} from "@nextui-org/date-picker"; // Make sure to install this package


export default function App() {
  const [selectedSubject, setSelectedSubject] = useState("Subject");
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [selectedContents, setSelectedContents] = useState([]);
  const [sessions] = useState([1, 2, 3, 4, 5, 6, 7]);
  const [profile, setProfile] = useState(null);
  const [subjectDetails, setSubjectDetails] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [existingAttendance, setExistingAttendance] = useState(null);

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

  const subjectOptions = profile ? profile.subjects.map(sub => ({ _id: sub, name: sub })) : [];

  useEffect(() => {
    if (selectedSubject !== "Subject") {
      fetchSubjectDetails(selectedSubject);
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (isUpdateMode && selectedSubject !== "Subject") {
      fetchAttendanceForDate();
    }
  }, [isUpdateMode, selectedSubject, selectedDate]);

  const fetchSubjectDetails = async (subjectId) => {
    try {
      const response = await axios.get(`/api/subject?_id=${subjectId}`);
      const { subject, students } = response.data;
      setSubjectDetails(subject);
      setStudents(students || []);
    } catch (error) {
      console.error('Error fetching subject details:', error);
    }
  };

  const fetchAttendanceForDate = async () => {
    try {
      const response = await axios.get('/api/attendance', {
        params: {
          subject: selectedSubject,
          date: selectedDate.toISOString().split('T')[0]
        }
      });
      setExistingAttendance(response.data);
      if (response.data) {
        setSelectedSessions(response.data.sessions);
        setSelectedContents(response.data.contents);
        setSelectedKeys(new Set(response.data.records.map(record => record.student)));
      } else {
        setSelectedSessions([]);
        setSelectedContents([]);
        setSelectedKeys(new Set());
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleTakeAttendance = () => {
    setIsTableVisible(true);
  };

  const handleSessionChange = (session) => {
    setSelectedSessions(prev =>
      prev.includes(session)
        ? prev.filter(s => s !== session)
        : [...prev, session]
    );
  };

  const submitAttendance = async () => {
    if (selectedSubject === "Subject") {
      alert("Please select a subject");
      return;
    }

    if (selectedSessions.length === 0) {
      alert("Please select at least one session");
      return;
    }

    let selectedStudents = [];
    if (selectedKeys instanceof Set) {
      if (selectedKeys.has("all")) {
        selectedStudents = students.map(student => student._id);
      } else {
        selectedStudents = Array.from(selectedKeys);
      }
    } else {
      selectedStudents = selectedKeys.includes("all")
        ? students.map(student => student._id)
        : selectedKeys;
    }

    const attendanceData = {
      date: selectedDate,
      subject: selectedSubject,
      sessions: selectedSessions,
      records: selectedStudents.map(studentId => ({
        student: studentId,
        status: 'present'
      })),
      contents: selectedContents
    };

    try {
      let response;
      if (isUpdateMode && existingAttendance) {
        response = await axios.put(`/api/attendance/${existingAttendance._id}`, attendanceData);
      } else {
        response = await axios.post('/api/attendance', attendanceData);
      }
      console.log('Attendance submitted successfully:', response.data);
      alert(isUpdateMode ? "Attendance updated successfully" : "Attendance submitted successfully");
    } catch (error) {
      console.error('Failed to submit attendance:', error);
      alert("Failed to submit attendance");
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex space-x-4 mb-4 items-center">
        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered" className="capitalize">
              {selectedSubject}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Subject selection"
            variant="flat"
            disallowEmptySelection
            selectionMode="single"
            selectedKeys={new Set([selectedSubject])}
            onSelectionChange={(keys) => setSelectedSubject(Array.from(keys)[0])}
          >
            {subjectOptions.map((option) => (
              <DropdownItem key={option._id}>{option.name}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        <DatePicker
          selected={selectedDate}
          onChange={date => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
        />

        <Button color="primary" variant="shadow" onClick={() => setIsUpdateMode(!isUpdateMode)}>
          {isUpdateMode ? "Take New Attendance" : "Update Attendance"}
        </Button>

        {!isUpdateMode && (
          <Button color="primary" variant="shadow" onClick={handleTakeAttendance}>
            Take Attendance
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        {sessions.map(session => (
          <Checkbox
            key={session}
            isSelected={selectedSessions.includes(session)}
            onValueChange={() => handleSessionChange(session)}
          >
            {session}
          </Checkbox>
        ))}
      </div>

      {selectedSubject !== "Subject" && subjectDetails && (
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

      {(isTableVisible || isUpdateMode) && (
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
              <TableColumn>Status</TableColumn>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>{student.rollNumber}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button color="primary" variant="shadow" onClick={submitAttendance}>
            {isUpdateMode ? "Update Attendance" : "Submit Attendance"}
          </Button>
        </div>
      )}
    </div>
  );
}