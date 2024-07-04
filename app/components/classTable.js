"use client"
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { ChevronDownIcon } from "@/public/ChevronDownIcon";
import { toast } from 'sonner';
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
  Pagination,
} from "@nextui-org/react";
import { capitalize } from "@/app/utils/utils";
import { PlusIcon } from "@/public/PlusIcon";
import { EditIcon } from "@/public/EditIcon";
import { DeleteIcon } from "@/public/DeleteIcon";
import { SearchIcon } from "@/public/SearchIcon";
import ClassModal from "./classModal";
import * as XLSX from "xlsx";

const columns = [
  { uid: "name", name: "Class Name", sortable: true },
  { uid: "teacher", name: "Class Coordinator" },
  { uid: "students", name: "Students" },
  { uid: "actions", name: "Actions" },
];

const INITIAL_VISIBLE_COLUMNS = ["name", "teacher", "students", "actions"];

export default function ClassTable() {
  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "className",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'view', 'edit', or 'add'
  const [selectedClass, setSelectedClass] = useState(null);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
    fetchStudents();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get('/api/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('/api/faculty');
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(classes);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Classes");
    XLSX.writeFile(workbook, "classes_data.xlsx");
  };

  const deleteClass = async (_id) => {
    try {
      await axios.delete(`/api/classes?_id=${_id}`);
      fetchClasses();
      toast.success('Class deleted successfully');
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error('Error deleting class');
    }
  };

  const pages = Math.ceil(classes.length / rowsPerPage);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) => visibleColumns.has(column.uid));
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    if (!Array.isArray(classes)) {
      return [];
    }
    let filteredClasses = [...classes];

    if (hasSearchFilter) {
      filteredClasses = filteredClasses.filter((cls) => {
        return (
          (cls.className && cls.className.toLowerCase().includes(filterValue.toLowerCase())) ||
          (cls.classCoordinator && teachers.find(teacher => teacher._id === cls.classCoordinator)?.name.toLowerCase().includes(filterValue.toLowerCase()))
        );
      });
    }

    return filteredClasses;
  }, [classes, filterValue, teachers]);

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

  const renderCell = useCallback((cls, columnKey) => {
    const cellValue = cls[columnKey];
    switch (columnKey) {
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit">
              <span
                className="text-lg text-default-500 cursor-pointer active:opacity-50"
                onClick={() => {
                  setModalMode("edit");
                  setSelectedClass(cls);
                  setModalOpen(true);
                }}
              >
                <EditIcon />
              </span>
            </Tooltip>
            <Tooltip content="Delete">
              <span
                className="text-lg text-danger cursor-pointer active:opacity-50"
                onClick={() => deleteClass(cls._id)}
              >
                <DeleteIcon />
              </span>
            </Tooltip>
          </div>
        );
      case "classCoordinator":
        return (
          <span>{teachers.find(teacher => teacher._id === cellValue)?.name}</span>
        );
      case "students":
        return (
          <span>
            {cellValue
              .map((studentId) =>
                students.find(student => student._id === studentId)?.name
              )
              .join(", ")}
          </span>
        );
      default:
        return <span>{cellValue}</span>;
    }
  }, [teachers, students]);

  const renderHeader = (column) => {
    const columnName = capitalize(column.name);
    return (
      <div className="flex justify-between items-center">
        {columnName}
        {column.sortable && (
          <ChevronDownIcon
            onClick={() => {
              setSortDescriptor((prev) => ({
                column: column.uid,
                direction:
                  prev.column === column.uid && prev.direction === "ascending"
                    ? "descending"
                    : "ascending",
              }));
            }}
          />
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Input
          clearable
          placeholder="Search..."
          contentLeft={<SearchIcon />}
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
        />
        <Button color="primary" auto onClick={() => {
          setModalMode("add");
          setSelectedClass(null);
          setModalOpen(true);
        }}>
          <PlusIcon /> Add Class
        </Button>
        <Button color="secondary" auto onClick={downloadExcel}>
          Export to Excel
        </Button>
      </div>
      <Table
        aria-label="Class Table"
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn key={column.uid}>
              {renderHeader(column)}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={sortedItems}>
          {(item) => (
            <TableRow key={item._id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Pagination
        total={pages}
        initialPage={1}
        onChange={(page) => setPage(page)}
        className="mt-4"
      />
      <ClassModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        classData={selectedClass}
        onSubmit={fetchClasses}
        teachers={teachers}
        students={students}
      />
    </>
  );
}
