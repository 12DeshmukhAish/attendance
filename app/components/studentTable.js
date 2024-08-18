"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { ChevronDownIcon } from "@/public/ChevronDownIcon";
import { departmentOptions } from "../utils/department";
import { toast } from 'sonner';
import { FaFileDownload, FaFileUpload } from "react-icons/fa";

import {
  Table,
  Tooltip,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Pagination, Select, SelectItem,
  Spinner
} from "@nextui-org/react";
import { capitalize } from "@/app/utils/utils";
import { PlusIcon } from "@/public/PlusIcon";
import { EditIcon } from "@/public/EditIcon";
import { DeleteIcon } from "@/public/DeleteIcon";
import { SearchIcon } from "@/public/SearchIcon";
import StudentModal from "./studentModal";
import * as XLSX from "xlsx";
import Image from "next/image"; // Import Image from next/image

const columns = [
  { uid: "_id", name: "ID", sortable: true },
  { uid: "rollNumber", name: "Roll Number", sortable: true },
  { uid: "name", name: "Name", sortable: true },
  { uid: "class", name: "Class", sortable: true },
  { uid: "department", name: "Department", sortable: true },
  { uid: "phoneNo", name: "Phone No", sortable: true },
  { uid: "email", name: "Email ID", sortable: true },
  { uid: "year", name: "Admission Year", sortable: true },
  { uid: "password", name: "Password", sortable: true },
  { uid: "actions", name: "Actions" },
];

const INITIAL_VISIBLE_COLUMNS = ["_id", "rollNumber", "name", "year", "department", "actions"];

export default function StudentTable() {
  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "rollNumber",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'view', 'edit', or 'add'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

  useEffect(() => {
    if (profile?.role !== "superadmin") {
      setSelectedDepartment(profile?.department);
    }
  }, [profile]);

  useEffect(() => {
    if (selectedDepartment) {
    fetchStudents();
      
    }
  }, [selectedDepartment]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/student${selectedDepartment ? `?department=${selectedDepartment}` : ''}`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Error fetching students');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        uploadStudents(jsonData);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const uploadStudents = async (studentsData) => {
    try {
      await axios.post('/api/upload', { students: studentsData });
      fetchStudents();
      toast.success('Students uploaded successfully');
    } catch (error) {
      console.error('Error uploading students:', error);
      toast.error('Error uploading students');
    }
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(students);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "student_data.xlsx");
  };

  const deleteStudent = async (_id) => {
    try {
      await axios.delete(`/api/student?_id=${_id}`);
      fetchStudents();
      toast.success('Student deleted successfully');
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error('Error deleting student');
    }
  };

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) => visibleColumns.has(column.uid));
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredStudents = [...students];

    if (filterValue) {
      filteredStudents = filteredStudents.filter((student) => {
        return (
          (student.name && student.name.toLowerCase().includes(filterValue.toLowerCase())) ||
          (student.rollNumber && student.rollNumber.toLowerCase().includes(filterValue.toLowerCase()))
        );
      });
    }

    return filteredStudents;
  }, [students, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      if (sortDescriptor.column === "rollNumber") {
        return parseInt(first) - parseInt(second);
      }
      return first < second ? -1 : first > second ? 1 : 0;
    });
  }, [items, sortDescriptor]);

  const renderCell = useCallback((student, columnKey) => {
    const cellValue = student[columnKey];
    switch (columnKey) {
      case "actions":
        return (
          <div className="relative flex items-center justify-items-center justify-center gap-2">
            <Tooltip content="Edit">
              <span
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                onClick={() => {
                  setModalMode("edit");
                  setSelectedStudent(student);
                  setModalOpen(true);
                }}
              >
                <EditIcon />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete">
              <span
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                onClick={() => deleteStudent(student._id)}
              >
                <DeleteIcon />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const onRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = useCallback((value) => {
    setFilterValue(value);
    setPage(1);
  }, []);

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedStudent(null);
  };

  const handleModalSubmit = async () => {
    fetchStudents();
    setModalOpen(false);
  };

  const openFileDialog = useCallback(() => {
    const fileInput = document.getElementById('upload-input');
    fileInput.click();
  }, []);

 
  const bottomContent = (
    <div className="flex justify-between items-center">
      <span className="text-default-400 text-small">Total {students.length} students</span>
      <label className="flex items-center text-default-400 text-small">
        Rows per page:
        <select
          className="bg-transparent outline-none text-default-400 text-small"
          onChange={onRowsPerPageChange}
          value={rowsPerPage}
        >
          {[5, 10, 15].map((rows) => (
            <option key={rows} value={rows}>
              {rows}
            </option>
          ))}
        </select>
      </label>
    </div>
  );

  const classNames = {
    wrapper: ["max-h-[382px]", "max-w-3xl"],
    th: ["bg-transparent", "text-default-500", "border-b", "border-divider"],
    td: [
      "group-data-[first=true]:first:before:rounded-none",
      "group-data-[first=true]:last:before:rounded-none",
      "group-data-[middle=true]:before:rounded-none",
      "group-data-[last=true]:first:before:rounded-none",
      "group-data-[last=true]:last:before:rounded-none",
    ],
  };

  return (
    <div>
      <div className="flex flex-col gap-4">
        {profile?.role === 'superadmin' && (
          <Select
            placeholder="Select a department"
            variant="bordered"
            size="sm"
            value={selectedDepartment}
            onChange={(value) =>
              setSelectedDepartment(value.target.value)}
            className="max-w-xs my-4"
          >
            {departmentOptions.map((department) => (
              <SelectItem key={department.key} value={department.label}>
                {department.label}
              </SelectItem>
            ))}
          </Select>
        )}
      </div>
      <div className="flex justify-between gap-3 items-end">
        <Input
          isClearable
          classNames={{
            base: "w-full sm:max-w-[44%]",
            inputWrapper: "border-1",
          }}
          placeholder="Search by name or roll number..."
          size="sm"
          startContent={<SearchIcon className="text-default-300" />}
          value={filterValue}
          variant="bordered"
          onClear={() => setFilterValue("")}
          onValueChange={onSearchChange}
        />
        <div className="flex gap-3">
          <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
              <Button
                endContent={<ChevronDownIcon className="text-small" />}
                size="sm"
                variant="flat"
              >
                Columns
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Table Columns"
              closeOnSelect={false}
              selectedKeys={visibleColumns}
              selectionMode="multiple"
              onSelectionChange={setVisibleColumns}
            >
              {columns.map((column) => (
                <DropdownItem key={column.uid} className="capitalize">
                  {capitalize(column.name)}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Button
            color="primary"
            startContent="Add New"
            endContent={<PlusIcon />}
            size="sm"
            onClick={() => {
              setModalMode("add");
              setModalOpen(true);
            }}
          >
            Add New
          </Button>
          <Button
            color="primary"
            variant="ghost"
            size="sm"
            onClick={openFileDialog}
            endContent={<FaFileUpload />}
          >
            Upload File
          </Button>
          <input
            id="upload-input"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <Button
            color="primary"
            size="sm"
            variant="ghost"
            onClick={downloadExcel}
            endContent={<FaFileDownload />}
          >
            Download
          </Button>
        </div>
      </div>
      <Table
        isCompact
        removeWrapper
        aria-label="Student table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={classNames}
        sortDescriptor={sortDescriptor}
        topContentPlacement="outside"
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          loadingContent={<Spinner label="Loading..." />}
          emptyContent={
            <div className="flex flex-col items-center justify-center">
              <Image
                src="/student.svg"
                alt="No students found"
                width={850}
                height={850}
              />
              <p>No students found</p>
            </div>
          }
          items={sortedItems}
        >
          {(student) => (
            <TableRow key={student._id}>
              {headerColumns.map((column) => (
                <TableCell key={column.uid}>
                  {renderCell(student, column.uid)}
                </TableCell>
              ))}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-between items-center">
        <Pagination
          total={pages}
          page={page}
          onChange={(newPage) => setPage(newPage)}
        />
      </div>
      <StudentModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        mode={modalMode}
        student={selectedStudent}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
