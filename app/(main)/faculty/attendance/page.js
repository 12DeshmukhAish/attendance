"use client";
import React, { useState, useEffect } from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Checkbox, CheckboxGroup } from "@nextui-org/react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import axios from 'axios';
import { DatePicker } from "@nextui-org/date-picker";
import Image from "next/image";
import { parseAbsoluteToLocal } from "@internationalized/date";

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
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);

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
    if (selectedSubject) {
      fetchSubjectData();
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedSubject && selectedDate && selectedSession) {
      if (subjectDetails && (subjectDetails.subType === 'practical' || subjectDetails.subType === 'tg')) {
        if (selectedBatch) {
          fetchSubjectAttendance();
        }
      } else {
        fetchSubjectAttendance();
      }
    }
  }, [selectedSubject, selectedDate, selectedSession, selectedBatch, subjectDetails]);

  const fetchSubjectData = async () => {
    try {
      const response = await axios.get(`/api/utils/subjectBatch?subjectId=${selectedSubject}`);
      const { subject } = response.data;
      setSubjectDetails(subject);
      if (subject.subType === 'practical' || subject.subType === 'tg') {
        setBatches(subject.batch);
      } else {
        setBatches([]);
        setSelectedBatch(null);
      }
    } catch (error) {
      console.error('Error fetching subject data:', error);
    }
  };

  const fetchSubjectAttendance = async () => {
    try {
      const response = await axios.get(`/api/update`, {
        params: {
          subjectId: selectedSubject,
          date: selectedDate.toISOString().split("T")[0],
          session: selectedSession,
          batchId: subjectDetails.subType === 'theory' ? undefined : selectedBatch
        }
      });
      const { students, attendanceRecord } = response.data;

      students.sort((a, b) => parseInt(a.rollNumber) - parseInt(b.rollNumber));

      setStudents(students);
      setAttendanceRecord(attendanceRecord);
      if (attendanceRecord) {
        setSelectedKeys(new Set(attendanceRecord.records.map(r => r.status === "present" && r.student)));
        setSelectedContents(attendanceRecord.contents || []);
      } else {
        setSelectedKeys(new Set());
        setSelectedContents([]);
      }
    } catch (error) {
      console.error('Error fetching subject attendance:', error);
    }
  };

  const convertToDate = (customDate) => {
    const { year, month, day } = customDate;
    return new Date(year, month - 1, day + 1);
  };

  const updateAttendance = async () => {
    if (!selectedSubject || !selectedDate || !selectedSession) {
      alert("Please select subject, date, and session");
      return;
    }

    let presentStudentIds = [];
    if (selectedKeys instanceof Set) {
      if (selectedKeys.has("all")) {
        presentStudentIds = students.map(student => student._id);
      } else {
        presentStudentIds = Array.from(selectedKeys);
      }
    } else {
      presentStudentIds = selectedKeys.includes("all")
        ? students.map(student => student._id)
        : selectedKeys;
    }
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
        attendanceRecords: attendanceData
      });

      alert("Attendance updated successfully");
      fetchSubjectAttendance();
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
            onChange={date => setSelectedDate(convertToDate(date))}
            dateFormat="yyyy-MM-dd"
          />
        </div>
        <div className="max-w-[60%]">
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
        </div>
        {batches && (
          <div className="max-w-[60%]">
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
          </div>
        )}
      </div>
      {subjectDetails && (
        <div className="mb-4">
          <h2>Course Content</h2>
          <Table aria-label="Course Content Table">
            <TableHeader>
              <TableColumn>Select</TableColumn>
              <TableColumn>Title</TableColumn>
              <TableColumn>Description</TableColumn>
              <TableColumn>Proposed Date</TableColumn>
              <TableColumn>Completed Date</TableColumn>
              <TableColumn>References</TableColumn>
              <TableColumn>Status</TableColumn>
            </TableHeader>
            <TableBody>
              {subjectDetails.content && subjectDetails.content
                .filter(content => content.status !== "covered")
                .map((content, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Checkbox
                        isSelected={selectedContents.includes(content.name)}
                        onChange={() => {
                          setSelectedContents(prev =>
                            prev.includes(content.name)
                              ? prev.filter(item => item !== content.name)
                              : [...prev, content.name]
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell>{content.name}</TableCell>
                    <TableCell>{content.description}</TableCell>
                    <TableCell>{content.proposedDate}</TableCell>
                    <TableCell>{content.completedDate}</TableCell>
                    <TableCell>
                      {content.references.map((ref, idx) => (
                        <a key={idx} href={ref} target="_blank" rel="noopener noreferrer" className="underline">{ref}</a>
                      ))}
                    </TableCell>
                    <TableCell>{content.status}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}
      {students.length > 0 && (
        <div>
          <h2>Students List</h2>
          <Table aria-label="Students List Table">
            <TableHeader>
              <TableColumn>Roll Number</TableColumn>
              <TableColumn>Full Name</TableColumn>
              <TableColumn>Profile Photo</TableColumn>
              <TableColumn>Attendance</TableColumn>
            </TableHeader>
            <TableBody>
              {students.map((student, index) => (
                <TableRow key={index}>
                  <TableCell>{student.rollNumber}</TableCell>
                  <TableCell>{student.fullName}</TableCell>
                  <TableCell>
                    <Image
                      src={student.profilePhoto}
                      alt={`${student.fullName}'s profile photo`}
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      isSelected={selectedKeys.has(student._id)}
                      onChange={() => {
                        const updatedSelectedKeys = new Set(selectedKeys);
                        if (selectedKeys.has(student._id)) {
                          updatedSelectedKeys.delete(student._id);
                        } else {
                          updatedSelectedKeys.add(student._id);
                        }
                        setSelectedKeys(updatedSelectedKeys);
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button className="mt-4" onClick={updateAttendance}>Update Attendance</Button>
        </div>
      )}
    </div>
  );
}
