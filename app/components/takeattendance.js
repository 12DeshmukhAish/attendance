"use client"
import React, { useState } from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";

export default function App() {
  const [selectedDepartment, setSelectedDepartment] = useState("Department");
  const [selectedClass, setSelectedClass] = useState("Class ");
  const [selectedSubject, setSelectedSubject] = useState("Subject ");
  const [selectedType, setSelectedType] = useState("Type");
  const [isTableVisible, setIsTableVisible] = useState(false);

  const departmentOptions = [
    { key: "Department", label: "Department" },
    { key: "CSE", label: "CSE" },
    { key: "ENTC", label: "ENTC" },
    { key: "Civil", label: "Civil" },
    { key: "Electrical", label: "Electrical" },
    { key: "Mechanical", label: "Mechanical" },
  ];

  const classOptions = [
    { key: "Class", label: "Class" },
    { key: "SE", label: "SE" },
    { key: "TE", label: "TE" },
    { key: "BE", label: "BE" },
  ];

  const subjectOptions = [
    { key: "Subject 1", label: "Subject 1" },
    { key: "Subject 2", label: "Subject 2" },
    { key: "Subject 3", label: "Subject 3" },
  ];

  const typeOptions = [
    { key: "Theory", label: "Theory" },
    { key: "Practical", label: "Practical" },
  ];

  const handleTakeAttendance = () => {
    setIsTableVisible(true);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Dropdowns */}
      <div className="flex space-x-4 mb-4">
        {/* Department Dropdown */}
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

        {/* Class Dropdown */}
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

        {/* Subject Dropdown */}
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
              <DropdownItem key={option.key}>{option.label}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        {/* Type Dropdown */}
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

        {/* Take Attendance Button */}
        <Button color="primary" variant="shadow" onClick={handleTakeAttendance}>
          Take Attendance
        </Button>
      </div>

      {/* Table */}
      {isTableVisible && (
        <div className="flex flex-col gap-3 mt-4">
          <Table
            selectionMode="multiple"
            defaultSelectedKeys={["2", "3"]}
            aria-label="Example static collection table"
          >
            <TableHeader>
              <TableColumn>ROLL NO.</TableColumn>
              <TableColumn>NAME</TableColumn>
            </TableHeader>
            <TableBody>
              <TableRow key="1">
                <TableCell>1</TableCell>
                <TableCell>Tony Reichert</TableCell>
              </TableRow>
              <TableRow key="2">
                <TableCell>2</TableCell>
                <TableCell>Zoey Lang</TableCell>
              </TableRow>
              <TableRow key="3">
                <TableCell>3</TableCell>
                <TableCell>Jane Fisher</TableCell>
              </TableRow>
              <TableRow key="4">
                <TableCell>4</TableCell>
                <TableCell>William Howard</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
