"use client"
import React, { useState, useEffect } from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import axios from 'axios';
import { DateRangePicker } from "@nextui-org/react";
import { parseDate, getLocalTimeZone } from "@internationalized/date";
import { useDateFormatter } from "@react-aria/i18n";

export default function App() {
  const [selectedDepartment, setSelectedDepartment] = useState("Department");
  const [selectedClass, setSelectedClass] = useState("Class");
  const [selectedSubject, setSelectedSubject] = useState("Subject");
  const [selectedType, setSelectedType] = useState("Type");
  const [classOptions, setClassOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [isReportVisible, setIsReportVisible] = useState(false);
  const currentDate = new Date();
  const pastDate = new Date();
  pastDate.setDate(currentDate.getDate() - 14);

  const [dateRange, setDateRange] = useState({
    start: parseDate(pastDate.toISOString().split('T')[0]),
    end: parseDate(currentDate.toISOString().split('T')[0]),
  });


  let formatter = useDateFormatter({ dateStyle: "long" });

  const departmentOptions = [
    { key: "Department", label: "Department" },
    { key: "CSE", label: "CSE" },
    { key: "ENTC", label: "ENTC" },
    { key: "Civil", label: "Civil" },
    { key: "Electrical", label: "Electrical" },
    { key: "Mechanical", label: "Mechanical" },
  ];

  const reportColumns = [
    { key: "name", label: "STUDENT NAME" },
    { key: "presentCount", label: "PRESENT COUNT" },
    { key: "attendancePercentage", label: "ATTENDANCE PERCENTAGE" },
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
      fetchSubjects(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedSubject !== "Subject") {
      fetchReport(selectedSubject);
    }
  }, [selectedSubject, dateRange]);

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
      const params = {
        department: selectedDepartment !== "Department" ? selectedDepartment : undefined,
        subType: selectedType !== "Type" ? selectedType : undefined,
        class: selectedClass !== "Class" ? selectedClass : undefined
      };
      const response = await axios.get('/api/subject', { params });
      setSubjectOptions(response.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchReport = async (subjectId) => {
    try {
      const params = {
        subjectId,
        startDate: dateRange.start.toString(),
        endDate: dateRange.end.toString()
      };
      const response = await axios.get('/api/attendance', { params });
      setReportData(response.data);
      setIsReportVisible(true);
    } catch (error) {
      console.error('Failed to fetch attendance report:', error);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      
      <div className="flex space-x-4 mb-4">
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
        <div className="flex flex-row gap-2">
        <DateRangePicker
          label="Date range"
          value={dateRange}
          onChange={setDateRange}
          variant="bordered"
          size="sm"
        />
        <p className="text-default-500 text-sm">
          Selected date:{" "}
          {dateRange
            ? formatter.formatRange(
                dateRange.start.toDate(getLocalTimeZone()),
                dateRange.end.toDate(getLocalTimeZone())
              )
            : "--"}
        </p>
      </div>

      </div>

      {isReportVisible && reportData && (
        <div>
          <h2>Subject: {reportData.subjectName}</h2>
          <h3>Teacher: {reportData.teacherName}</h3>
          <p>Total Lectures: {reportData.totalLectures}</p>
          <Table
            aria-label="Attendance Report Table"
            shadow={false}
            color="secondary"
            className="table w-full"
          >
            <TableHeader columns={reportColumns}>
              {(column) => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              )}
            </TableHeader>
            <TableBody items={reportData.students}>
              {(item) => (
                <TableRow key={item.name}>
                  {(columnKey) => (
                    <TableCell>
                      {columnKey === 'attendancePercentage' 
                        ? `${item[columnKey].toFixed(2)}%` 
                        : item[columnKey]}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}