"use client"
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { ChevronDownIcon } from "@/public/ChevronDownIcon";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Pagination,
} from '@nextui-org/react';
import { capitalize } from "@/app/utils/utils";
import { PlusIcon } from "@/public/PlusIcon";
import { EditIcon } from "@/public/EditIcon";
import { DeleteIcon } from "@/public/DeleteIcon";
import { SearchIcon } from "@/public/SearchIcon";
import SubjectModal from './subjectModal';
import * as XLSX from 'xlsx';
import Image from 'next/image';

const columns = [
  { uid: "_id", name: "ID", sortable: true },
  { uid: "name", name: "Subject Name", sortable: true },
  { uid: "class", name: "Class" },
  { uid: "teacher", name: "Teacher" },
  { uid: "department", name: "Department" },
  { uid: "actions", name: "Actions" },
];

const INITIAL_VISIBLE_COLUMNS = ["_id", "name", "class", "teacher", "actions"];

export default function SubjectTable() {
  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortDescriptor, setSortDescriptor] = useState({ column: "name", direction: "ascending" });
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'view', 'edit', or 'add'
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/subjectData');
      setSubjects(response.data.subjects || []);
      setTeachers(response.data.teachers || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const deleteSubject = async (_id) => {
    try {
      await axios.delete(`/api/subject?_id=${_id}`);
      fetchData();
      toast.success('Subject deleted successfully');
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast.error('Error deleting subject');
    }
  };

  const pages = Math.ceil(subjects.length / rowsPerPage);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) => visibleColumns.has(column.uid));
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    if (!Array.isArray(subjects)) {
      return [];
    }
    let filteredSubjects = [...subjects];

    if (hasSearchFilter) {
      filteredSubjects = filteredSubjects.filter((subject) => {
        return (
          (subject.name && subject.name.toLowerCase().includes(filterValue.toLowerCase())) ||
          (subject.teacher && teachers.find(teacher => teacher._id === subject.teacher)?.name.toLowerCase().includes(filterValue.toLowerCase()))
        );
      });
    }

    return filteredSubjects;
  }, [subjects, filterValue, teachers]);

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

  const renderCell = useCallback((subject, columnKey) => {
    const cellValue = subject[columnKey];
    switch (columnKey) {
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <span
              className="text-lg text-default-500 cursor-pointer active:opacity-50"
              onClick={() => {
                setModalMode("edit");
                setSelectedSubject(subject);
                setModalOpen(true);
              }}
            >
              <EditIcon />
            </span>
            <span
              className="text-lg text-danger cursor-pointer active:opacity-50"
              onClick={() => deleteSubject(subject._id)}
            >
              <DeleteIcon />
            </span>
          </div>
        );
      case "teacher":
        return (
          <span>{teachers.find(teacher => teacher._id === cellValue)?.name}</span>
        );
      default:
        return <span>{cellValue}</span>;
    }
  }, [teachers]);

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
          classNames={{ base: "w-full sm:max-w-[44%]", inputWrapper: "border-1" }}
          placeholder="Search by name, class, or teacher..."
          size="sm"
          startContent={<SearchIcon className="text-default-300" />}
          value={filterValue}
          variant="bordered"
          onClear={() => setFilterValue("")}
          onChange={(e) => setFilterValue(e.target.value)}
        />
        <div className="gap-4 items-center flex">
          <Button
            color="primary"
            startContent="Add New"
            size="sm"
            auto
            onClick={() => {
              setModalMode("add");
              setSelectedSubject(null);
              setModalOpen(true);
            }}
          >
            <PlusIcon /> Add Subject
          </Button>
        </div>
      </div>
      {sortedItems.length > 0 ? (
        <Table aria-label="Subject Table" sortDescriptor={sortDescriptor} onSortChange={setSortDescriptor}>
          <TableHeader columns={headerColumns}>
            {(column) => <TableColumn key={column.uid}>{renderHeader(column)}</TableColumn>}
          </TableHeader>
          <TableBody items={sortedItems}>
            {(item) => (
              <TableRow key={item._id}>
                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>
      ) : (
        <div className="flex flex-col items-center justify-center mt-4">
          <Image src="/subject.svg" alt="No subjects found" width={450} height={450} />
          <p className="mt-2 text-gray-500">No subjects found</p>
        </div>
      )}
      <Pagination total={pages} initialPage={1} onChange={(page) => setPage(page)} className="mt-4" />
      <SubjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        subjectData={selectedSubject}
        onSubmit={fetchData}
        teachers={teachers}
      />
    </>
  );
}
