"use client"
import React, { useState, useEffect } from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Checkbox, CheckboxGroup } from "@nextui-org/react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import axios from 'axios';
import { DatePicker } from "@nextui-org/date-picker";
import Image from "next/image";

export default function UpdateAttendance() {
  const [selectedSubject, setSelectedSubject] = useState("Subject");
  const [students, setStudents] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedContents, setSelectedContents] = useState([]);
  const [sessions] = useState([1, 2, 3, 4, 5, 6, 7]);
  const [profile, setProfile] = useState(null);
  const [subjectDetails, setSubjectDetails] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isTableVisible, setIsTableVisible] = useState(false);

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

  useEffect(() => {
    if (selectedSubject !== "Subject") {
      fetchSubjectData();
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedSubject !== "Subject" && selectedBatch && selectedDate && selectedSession) {
      fetchSubjectAttendance();
    }
  }, [selectedSubject, selectedBatch, selectedDate, selectedSession]);

  const fetchSubjectData = async () => {
    try {
      const response = await axios.get(`/api/utils/subjectBatch?subjectId=${selectedSubject}`);
      const { subject } = response.data;
      setSubjectDetails(subject);
      setBatches(subject.batch);
    } catch (error) {
      console.error('Error fetching subject data:', error);
    }
  };

  const fetchSubjectAttendance = async () => {
    try {
      const response = await axios.get(`/api/update?subjectId=${selectedSubject}&date=${selectedDate.toISOString().split("T")[0]}&session=${selectedSession}&batchId=${selectedBatch || ''}`);
      const { students, attendanceRecord } = response.data;

      students.sort((a, b) => parseInt(a.rollNumber) - parseInt(b.rollNumber));

      setStudents(students);
      setAttendanceRecord(attendanceRecord);
      if (attendanceRecord) {
        setSelectedKeys(new Set(attendanceRecord.records.map(r => r.status === "present" ? r.student : null).filter(Boolean)));
        setSelectedContents(attendanceRecord.contents || []);
      } else {
        setSelectedKeys(new Set());
        setSelectedContents([]);
      }
      setIsTableVisible(true);
    } catch (error) {
      console.error('Error fetching subject attendance:', error);
    }
  };

  const updateAttendance = async () => {
    if (!selectedSubject || !selectedDate || !selectedSession) {
      alert("Please select subject, date, and session");
      return;
    }

    let presentStudentIds = Array.from(selectedKeys);
    const attendanceData = students.map(student => ({
      student: student._id,
      status: presentStudentIds.includes(student._id) ? 'present' : 'absent'
    }));

    try {
      const response = await axios.put(`/api/attendance`, {
        subject: selectedSubject,
        date: selectedDate.toISOString().split("T")[0],
        session: selectedSession,
        batchId: selectedBatch,
        attendanceRecords: attendanceData,
        contents: selectedContents
      });

      console.log('Attendance updated successfully:', response.data);
      alert("Attendance updated successfully");
      fetchSubjectAttendance();
    } catch (error) {
      console.error('Failed to update attendance:', error);
      alert("Failed to update attendance");
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
            {profile && profile.subjects.map((subject) => (
              <DropdownItem key={subject}>{subject}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
        />

        <Dropdown>
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
            onSelectionChange={(keys) => setSelectedSession(parseInt(Array.from(keys)[0]))}
          >
            {sessions.map((session) => (
              <DropdownItem key={session.toString()}>Session {session}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        {batches?.length > 0 && (
          <Dropdown>
            <DropdownTrigger>
              <Button variant="bordered" className="capitalize">
                {selectedBatch ? `Batch ${selectedBatch}` : "Select Batch"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Batch selection"
              variant="flat"
              disallowEmptySelection
              selectionMode="single"
              selectedKeys={selectedBatch ? new Set([selectedBatch]) : new Set()}
              onSelectionChange={(keys) => setSelectedBatch(Array.from(keys)[0])}
            >
              {batches.map((batch) => (
                <DropdownItem key={batch}>{batch}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        )}

        <Button color="primary" variant="shadow" onClick={fetchSubjectAttendance}>
          Fetch Attendance
        </Button>
      </div>

      {isTableVisible && (
        <div className="flex gap-4 mb-4">
          <div className="w-1/2">
            <h2>Course Content</h2>
            <Table aria-label="Course Content Table">
              <TableHeader>
                <TableColumn>Select</TableColumn>
                <TableColumn>Title</TableColumn>
                <TableColumn>Description</TableColumn>
                <TableColumn>Status</TableColumn>
              </TableHeader>
              <TableBody>
                {subjectDetails && subjectDetails.content && subjectDetails.content.map((content, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Checkbox
                        isSelected={selectedContents.includes(content.title)}
                        onChange={() => {
                          setSelectedContents(prev =>
                            prev.includes(content.title)
                              ? prev.filter(item => item !== content.title)
                              : [...prev, content.title]
                          );
                        }}
                        isDisabled={content.status === 'covered'}
                      />
                    </TableCell>
                    <TableCell>{content.title}</TableCell>
                    <TableCell>{content.description}</TableCell>
                    <TableCell>{content.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="w-1/2">
            <h2>Students List</h2>
            <Table
              aria-label="Attendance Table"
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
          </div>
        </div>
      )}

      {isTableVisible && (
        <Button color="primary" className="max-w-[50%] mx-auto" variant="shadow" onClick={updateAttendance}>
          Update Attendance
        </Button>
      )}

      {!students.length && !isTableVisible && (
        <div className="flex justify-center mt-4">
          <Image src="/update.svg" alt="Update Attendance Illustration" width={700} height={300} />
        </div>
      )}
    </div>
  );
}