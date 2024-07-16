"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { ChevronDownIcon } from "@/public/ChevronDownIcon";
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
  Pagination, Select, SelectItem
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
  { uid: "passOutYear", name: "Pass Out Year", sortable: true },
  { uid: "department", name: "Department", sortable: true },
  { uid: "phoneNo", name: "Phone No", sortable: true },
  { uid: "email", name: "Email ID", sortable: true },
  { uid: "year", name: "Acadmic Year", sortable: true },
  { uid: "password", name: "Password", sortable: true },
  { uid: "actions", name: "Actions" },
];
import { departmentOptions } from "../utils/department";

const INITIAL_VISIBLE_COLUMNS = ["_id", "rollNumber", "name", "year", "department", "actions"];

export default function StudentTable() {
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [visibleColumns, setVisibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "_id",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'view', 'edit', or 'add'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

  useEffect(() => {
    fetchStudents(selectedDepartment);
  }, [selectedDepartment]);

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

  useEffect(() => {
    if (profile?.role !== "superadmin") {
      setSelectedDepartment(profile?.department[0]);
    }
  }, [profile]);

  const handleSelectChange = ( value) => {
    setSelectedDepartment(value);
  };

  const fetchStudents = async (selectedDepartment) => {
    setLoading(true); // Set loading to true
    try {
      if (selectedDepartment) {
        const response = await axios.get(`/api/student?department=${selectedDepartment}`);
        setStudents(response.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false); // Set loading to false
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

  const pages = Math.ceil(students.length / rowsPerPage);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) => visibleColumns.has(column.uid));
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    if (!Array.isArray(students)) {
      return [];
    }
    let filteredStudents = [...students];

    if (hasSearchFilter) {
      filteredStudents = filteredStudents.filter((student) => {
        return (
          (student.name && student.name.toLowerCase().includes(filterValue.toLowerCase())) ||
          (student.rollNumber && student.rollNumber.toLowerCase().includes(filterValue.toLowerCase()))
        );
      });
    }

    return filteredStudents;
  }, [students, filterValue]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback((student, columnKey) => {
    const cellValue = student[columnKey];
    switch (columnKey) {
      case "actions":
        return (
          <div className="relative flex items-center justify-items-center  justify-center gap-2">
            <Tooltip content="Edit student">
              <span
                className="cursor-pointer text-lg text-default-400"
                onClick={() => {
                  setSelectedStudent(student);
                  setModalMode("edit");
                  setModalOpen(true);
                }}
              >
                <EditIcon className="text-default-400" />
              </span>
            </Tooltip>
            <Tooltip
              color="danger"
              content="Delete student"
              onClick={() => deleteStudent(student._id)}
            >
              <span className="cursor-pointer text-lg text-danger">
                <DeleteIcon className="text-danger" />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const handleClear = () => {
    setFilterValue("");
  };

  const handleSearchChange = (e) => {
    setFilterValue(e.target.value);
  };

  return (
    <div className="w-full flex justify-center items-center p-3 md:p-6">
      <div className="w-full">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
            <div className="w-full md:w-1/2">
              <Input
                isClearable
                placeholder="Search by name or roll number"
                startContent={<SearchIcon />}
                value={filterValue}
                onClear={handleClear}
                onChange={handleSearchChange}
              />
            </div>
            {profile?.role === "superadmin" && (
              <Select
                className="capitalize"
                placeholder="Select a Department"
                onChange={(e)=>handleSelectChange(e.target.value)}
                selectedKeys={selectedDepartment}
              >
                {departmentOptions.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {capitalize(option.label)}
                  </SelectItem>
                ))}
              </Select>
            )}
            
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
            <div className="flex w-full items-center gap-3 md:w-auto">
              <Button
                color="primary"
                onClick={() => {
                  setModalMode("add");
                  setModalOpen(true);
                }}
                startContent={<PlusIcon />}
              >
                Add Student
              </Button>
              <Button
                
                color="primary"
                size="sm"
              variant="ghost"
                onClick={downloadExcel}
                startContent={<FaFileDownload />}
              >
                Excel
              </Button>
            
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                style={{ display: "none" }}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button
                  as="span"
                  
                  color="primary"
                  size="sm"
              variant="ghost"
                  startContent={<FaFileUpload />}
                >
                  Upload
                </Button>
              </label>
            </div>
          </div>
        </div>
        {loading ? ( // Display loader if loading is true
          <div className="flex justify-center items-center mt-6">
            <div className="loader"></div>
          </div>
        ) : (
          <div className="w-full mt-6">
            <Table
              aria-label="Student table with pagination, sorting and filtering"
              sortDescriptor={sortDescriptor}
              onSortChange={setSortDescriptor}
              selectedKeys={selectedKeys}
              onSelectionChange={setSelectedKeys}
              className="w-full min-w-[800px] max-w-full"
            >
              <TableHeader columns={headerColumns}>
                {(column) => (
                  <TableColumn
                    key={column.uid}
                    allowsSorting={column.sortable}
                    className="bg-gray-200"
                  >
                    {column.name}
                  </TableColumn>
                )}
              </TableHeader>
              <TableBody items={sortedItems}>
                {(item) => (
                  <TableRow key={item._id}>
                    {(columnKey) => (
                      <TableCell className="py-2">
                        {renderCell(item, columnKey)}
                      </TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="flex justify-center items-center mt-4">
              <Pagination
                page={page}
                onPageChange={setPage}
                total={pages}
                className="mt-4"
              />
            </div>
          </div>
        )}
      </div>
      <StudentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        student={selectedStudent}
        fetchStudents={fetchStudents}
        selectedDepartment={selectedDepartment}
      />
    </div>
  );
}
