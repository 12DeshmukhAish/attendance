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
  const [isTableVisible, setIsTableVisible] = useState(false);

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

      console.log(response.data);


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


  const handleTakeAttendance = () => {
    setIsTableVisible(true);
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

      console.log(response.data);


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
    finally{
      setSelectedBatch(null)
      setIsTableVisible(false)
      setSelectedKeys(new Set())
      setSelectedContents([])
      setSelectedSession([])
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
            <Button color="primary" variant="shadow" className="mx-4" onClick={handleTakeAttendance}>
              Take Attendance
            </Button>
          </div>
        )}
      </div>

      {selectedSubject !== "Subject" && subjectDetails && isTableVisible && (
        <div className="flex gap-4 mb-4">
          <div className="w-1/2 h-[70vh]">
            <h2>Course Content</h2>
            <Table aria-label="Course Content Table" 
              className="h-[70vh]"
              >
              <TableHeader>
                <TableColumn>Select</TableColumn>
                <TableColumn>Title</TableColumn>
                <TableColumn>Description</TableColumn>
                <TableColumn>Proposed Date</TableColumn>
                <TableColumn>Completed Date</TableColumn>
                <TableColumn>References</TableColumn>
                {/* <TableColumn>Course Outcomes</TableColumn>
                <TableColumn>Program  Outcomes</TableColumn> */}
                <TableColumn>Status</TableColumn>
              </TableHeader>
              <TableBody>
                {subjectDetails.content && subjectDetails.content.map((content, index) => (
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
                    <TableCell>{content.proposedDate}</TableCell>
                    <TableCell>{content.completedDate}</TableCell>
                    <TableCell>

                      {content.references && content.references.map((ref, refIndex) => (
                        <div key={refIndex}>
                          <a href={ref} target="_blank" rel="noopener noreferrer">{ref}</a>
                        </div>

                      ))}
                    </TableCell>
                    <TableCell>{content.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="w-1/2 h-[70vh]">
            <h2>Students List</h2>
            <Table
              aria-label="Attendance Table"
              selectionMode="multiple"
              selectedKeys={selectedKeys}
              onSelectionChange={setSelectedKeys}
              className="h-[70vh]"
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
            <div className="w-full flex justify-center ">
              <Button className="max-w-[50%] my-2 justify-center" color="primary" onPress={updateAttendance}>
                Submit Attendance
              </Button>
            </div>
          </div>
        </div>
      )}
      {!isTableVisible && (
        <div className="mt-8 flex flex-col items-center gap-3 ">
          <Image
            alt="No data found"
            src="/update.svg"
            width={500}
            height={500}
            className="object-contain"
          />
          <p className="text-2xl">No Students Found</p>

        </div>
      )}
    </div>
  );
}
