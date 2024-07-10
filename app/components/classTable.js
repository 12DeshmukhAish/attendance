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
  { uid: "_id", name: "Class ID", sortable: true },
  { uid: "teacher", name: "Class Coordinator" },
  { uid: "students", name: "Students" },
  { uid: "passOutYear", name: "Pass Out Year" },
  { uid: "year", name: "Acadmic Year" },
  { uid: "department", name: "Department" },
  { uid: "actions", name: "Actions" },
];

const INITIAL_VISIBLE_COLUMNS = ["_id", "teacher","students", "passOutYear","year", "department","actions"];

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
  const [profile, setProfile] = useState(null);
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

  const pages = classes? Math.ceil(classes?.length / rowsPerPage):0;

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
          (cls.name && cls.name.toLowerCase().includes(filterValue.toLowerCase())) ||
          (cls.teacher && teachers.find(teacher => teacher._id === cls.teacher)?.name.toLowerCase().includes(filterValue.toLowerCase()))
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
      case "teacher":
        return (
          <span>{teachers.find(teacher => teacher._id === cellValue)?.name}</span>
        );
      case "students":
        return (
          <span>
            {cellValue? cellValue.length+1 :0}
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
      <div className="flex justify-between my-4 gap-3 items-end">
        <Input
          isClearable
          classNames={{
            base: "w-full sm:max-w-[44%]",
            inputWrapper: "border-1",
          }}
          placeholder="Search by name, email, or faculty ID..."
          size="sm"
          startContent={<SearchIcon className="text-default-300" />}
          value={filterValue}
          variant="bordered"
          onClear={() => setFilterValue("")}
          onChange={(e) => setFilterValue(e.target.value)}
        />
        <div className="gap-4 items-center flex">
          <Button color="primary"
            startContent="Add New"
            size="sm"
            auto
            onClick={() => {
              setModalMode("add");
              setSelectedClass(null);
              setModalOpen(true);

            }}>
            <PlusIcon /> Add Class
          </Button>
          <Button color="primary" variant="ghost" size="sm" auto onClick={downloadExcel}>
            Download
          </Button>
        </div>
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
