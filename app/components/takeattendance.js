"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Checkbox, CheckboxGroup } from "@nextui-org/react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import axios from 'axios';
import Image from 'next/image';

export default function App() {
  const [selectedSubject, setSelectedSubject] = useState("Subject");
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [selectedSession, setSelectedSession] = useState([]);
  const [selectedContentIds, setSelectedContentIds] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subjectDetails, setSubjectDetails] = useState(null);
  const [batches, setBatches] = useState([]);
  const [availableSessions, setAvailableSessions] = useState([]);

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

  const subjectOptions = useMemo(() =>
    profile ? profile.subjects.map(sub => ({ _id: sub, name: sub })) : []
    , [profile]);



const fetchAvailableSessions = async (subjectId, batchId) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await axios.get(`/api/utils/available-sessions?subjectId=${subjectId}&batchId=${batchId || ''}&date=${today}`);
    setAvailableSessions(response.data.availableSessions);
  } catch (error) {
    console.error('Error fetching available sessions:', error);
  }
};

useEffect(() => {
  if (selectedSubject !== "Subject") {
    fetchSubjectDetails(selectedSubject);
    fetchAvailableSessions(selectedSubject, selectedBatch);
  }
}, [selectedSubject, selectedBatch]);
  const fetchSubjectDetails = async (subjectId) => {
    try {
      const response = await axios.get(`/api/utils/batches?_id=${subjectId}&batchId=${selectedBatch || ''}`);
      const { subject, batches, students } = response.data;
      console.log("Received subject details:", subject);
      console.log("Received batches:", batches);
      console.log("Received students:", students);
      setSubjectDetails(subject);
      setBatches(batches || []);
      setStudents(students || []);
    } catch (error) {
      console.error('Error fetching subject details:', error);
    }
  };

  const handleTakeAttendance = () => {
    setIsTableVisible(true);
  };

  const submitAttendance = async () => {
    if (selectedSubject === "Subject") {
      alert("Please select a subject");
      return;
    }

    if (selectedSession.length === 0) {
      alert("Please select at least one session");
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
    const attendanceRecords = students.map(student => ({
      student: student._id,
      status: presentStudentIds.includes(student._id) ? 'present' : 'absent'
    }));

    const attendanceData = {
      subject: selectedSubject,
      session: selectedSession,
      attendanceRecords,
      contents: selectedContentIds,
      batchId: selectedBatch
    };

    try {
      const response = await axios.post('/api/attendance', attendanceData);
      console.log('Attendance submitted successfully:', response.data);
      alert("Attendance submitted successfully");
      fetchSubjectDetails(selectedSubject);
    } catch (error) {
      console.error('Failed to submit attendance:', error);
      alert("Failed to submit attendance");
    } finally {
      setSelectedBatch(null);
      setIsTableVisible(false);
      setSelectedKeys(new Set());
      setSelectedContentIds([]);
      setSubjectDetails(null)
      setSelectedSession([]);
      setSelectedSubject("Subject")
    }
  };

  const CourseContentTable = useMemo(() => {
    if (!subjectDetails || !subjectDetails.content) return null;

    return (
      <Table aria-label="Course Content Table" className="max-h-[75vh]">
        <TableHeader>
          <TableColumn>Select</TableColumn>
          <TableColumn>Title</TableColumn>
          <TableColumn>Description</TableColumn>
          <TableColumn>Proposed Date</TableColumn>
          <TableColumn>Completed Date</TableColumn>
          <TableColumn>References</TableColumn>
          <TableColumn>CO</TableColumn>
          <TableColumn>PO:</TableColumn>
          <TableColumn>Status</TableColumn>
        </TableHeader>
        <TableBody>
          {subjectDetails.content.map((content) => (
            <TableRow key={content._id}>
              <TableCell>
                <Checkbox
                  isSelected={selectedContentIds.includes(content._id)}
                  onChange={() => {
                    setSelectedContentIds(prev =>
                      prev.includes(content._id)
                        ? prev.filter(id => id !== content._id)
                        : [...prev, content._id]
                    );
                  }}
                  isDisabled={content.status === 'covered'}
                />
              </TableCell>
              <TableCell>{content.title}</TableCell>
              <TableCell>{content.description}</TableCell>
              <TableCell>{content.proposedDate}</TableCell>
              <TableCell>{content.completedDate}</TableCell>
              <TableCell>{content.references} </TableCell>
              <TableCell>{content.courseOutcomes} </TableCell>
              <TableCell>{content.programOutcomes} </TableCell>
              <TableCell>{content.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }, [subjectDetails, selectedContentIds]);
  const StudentListTable = useMemo(() => {
    return (
      <Table
        aria-label="Attendance Table"
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        className="max-h-[75vh]"
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
    );
  }, [students, selectedKeys]);

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
        {subjectDetails?.subType !== "theory" &&
          < Dropdown >
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
              {batches && batches.map((batch) => (
                <DropdownItem key={batch}>{batch}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        }
        <CheckboxGroup
          orientation="horizontal"
          label="Select Sessions"
          value={selectedSession}
          onChange={setSelectedSession}
        >
          {availableSessions.map(session => (
            <Checkbox key={session} value={session.toString()}>
              {session}
            </Checkbox>
          ))}
        </CheckboxGroup>

        <Button color="primary" variant="shadow" onClick={handleTakeAttendance}>
          Take Attendance
        </Button>
      </div>

      {
        selectedSubject !== "Subject" && subjectDetails && isTableVisible && (
          <div className="flex gap-4 mb-4">
            <div className="w-1/2">
              <h2>Course Content</h2>
              {CourseContentTable}
            </div>
            <div className="w-1/2">
              <h2>Students List</h2>
              {StudentListTable}
            </div>
          </div>
        )
      }

      {
        isTableVisible && selectedSubject && subjectDetails && (
          <Button color="primary" className="max-w-[50%] mx-auto" variant="shadow" onClick={submitAttendance}>
            Submit Attendance
          </Button>
        )
      }

      {
        !students.length && !isTableVisible && (
          <div className="flex justify-center mt-4">
            <Image src="/attendance.svg" alt="Attendance Illustration" width={700} height={300} />
          </div>
        )
      }
    </div >
  );
}