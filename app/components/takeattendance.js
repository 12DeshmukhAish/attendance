"use client"
import React, { useState, useEffect } from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import axios from 'axios';

export default function App() {
  const [selectedDepartment, setSelectedDepartment] = useState("Department");
  const [selectedClass, setSelectedClass] = useState("Class");
  const [selectedSubject, setSelectedSubject] = useState("Subject");
  const [selectedType, setSelectedType] = useState("Type");
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [classOptions, setClassOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [students, setStudents] = useState([]);

  const departmentOptions = [
    { key: "Department", label: "Department" },
    { key: "CSE", label: "CSE" },
    { key: "ENTC", label: "ENTC" },
    { key: "Civil", label: "Civil" },
    { key: "Electrical", label: "Electrical" },
    { key: "Mechanical", label: "Mechanical" },
  ];

  const typeOptions = [
    { key: "Theory", label: "Theory" },
    { key: "Practical", label: "Practical" },
  ];

  useEffect(() => {
    if (selectedDepartment !== "Department") {
      fetchClasses(selectedDepartment);
    }
  }, [selectedDepartment]);

  useEffect(() => {
    if (selectedClass !== "Class") {
      console.log(selectedClass);
      fetchSubjects(selectedClass);
      fetchStudents(selectedClass);
    }
  }, [selectedClass]);

  const fetchClasses = async (department) => {
    try {
      const response = await axios.get(`/api/classes?department=${department}`);
      setClassOptions(response.data.map(cls => ({ key: cls._id, label: cls.name })));
    } catch (error) {
      console.error('Failed to fetch classes', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const params = {};
      if (selectedDepartment) {
        params.department = selectedDepartment;
      }
      if (selectedType!=="Type") {
        params.subType = selectedType;
      }
      if (selectedClass) {
        params.class = selectedClass;
      }

      const response = await axios.get('/api/subject', { params });
      setSubjectOptions(response.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const response = await axios.get(`/api/fetchstudents?classId=${classId}`);
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch students', error);
    }
  };

  const handleTakeAttendance = () => {
    setIsTableVisible(true);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex space-x-4 mb-4">
        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered" className="capitalize">
              {selectedDepartment}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Department selection"
            variant="flat"
            disallowEmptySelection
            selectionMode="single"
            selectedKeys={new Set([selectedDepartment])}
            onSelectionChange={(keys) => setSelectedDepartment(Array.from(keys)[0])}
          >
            {departmentOptions.map((option) => (
              <DropdownItem key={option.key}>{option.label}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered" className="capitalize">
              {selectedClass}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Class selection"
            variant="flat"
            disallowEmptySelection
            selectionMode="single"
            selectedKeys={new Set([selectedClass])}
            onSelectionChange={(keys) => setSelectedClass(Array.from(keys)[0])}
          >
            {classOptions.map((option) => (
              <DropdownItem key={option.key}>{option.label}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered" className="capitalize">
              {selectedType}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Type selection"
            variant="flat"
            disallowEmptySelection
            selectionMode="single"
            selectedKeys={new Set([selectedType])}
            onSelectionChange={(keys) => setSelectedType(Array.from(keys)[0])}
          >
            {typeOptions.map((option) => (
              <DropdownItem key={option.key}>{option.label}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

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

        <Button color="primary" variant="shadow" onClick={handleTakeAttendance}>
          Take Attendance
        </Button>
      </div>

      {isTableVisible && (
        <div className="flex flex-col gap-3 mt-4">
          <Table
            selectionMode="multiple"
            aria-label="Students table"
          >
            <TableHeader>
              <TableColumn>ROLL NO.</TableColumn>
              <TableColumn>NAME</TableColumn>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>{student.rollNo}</TableCell>
                  <TableCell>{student.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
