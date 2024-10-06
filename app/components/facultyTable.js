"use client";
import { departmentOptions } from "../utils/department";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import Image from "next/image";
import { ChevronDownIcon } from "@/public/ChevronDownIcon";
import { FaFileDownload, FaFileUpload } from "react-icons/fa";
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
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Select,
  SelectItem,
  Spinner,
} from "@nextui-org/react";
import { capitalize } from "@/app/utils/utils";
import { PlusIcon } from "@/public/PlusIcon";
import { EditIcon } from "@/public/EditIcon";
import { DeleteIcon } from "@/public/DeleteIcon";
import { SearchIcon } from "@/public/SearchIcon";
import FacultyModal from "./facultyModal";
import * as XLSX from "xlsx";

const columns = [
  { uid: "_id", name: "Faculty ID", sortable: true },
  { uid: "name", name: "Name", sortable: true },
  { uid: "department", name: "Department", sortable: true },
  { uid: "email", name: "Email", sortable: true },
  { uid: "password", name: "Password", sortable: true },
  { uid: "actions", name: "Actions" },
];

const INITIAL_VISIBLE_COLUMNS = ["_id", "name", "department", "email", "actions"];

export default function FacultyTable() {
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
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [faculty, setFaculty] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      console.log("Raw stored profile:", storedProfile);
      try {
        const parsedProfile = JSON.parse(storedProfile);
        console.log("Parsed profile:", parsedProfile);
        setProfile(parsedProfile);
      } catch (error) {
        console.error("Error parsing profile:", error);
      }
    }
  }, []);

  useEffect(() => {
    console.log("Updated profile state:", profile);
    if (profile && profile?.role === "admin") {
      console.log(profile);
      setSelectedDepartment(profile.department);
      console.log(selectedDepartment);
    }
  }, [profile]);

  useEffect(() => {
    if (profile && selectedDepartment) {
      fetchFaculty();
    }
  }, [selectedDepartment]);


  const fetchFaculty = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`/api/faculty${selectedDepartment ? `?department=${selectedDepartment}` : ''}`);
      let facultyData = response.data;

      if (profile.role !== "superadmin") {
        facultyData = facultyData.filter(member => !member.isAdmin);
      }
  
      setFaculty(facultyData);
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching faculty:', error);
    } finally {
      setIsLoading(false)
    }
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(faculty);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Faculty");
    XLSX.writeFile(workbook, "faculty_data.xlsx");
  };

  const deleteFaculty = async (_id) => {
    try {
      await axios.delete(`/api/faculty?_id=${_id}`);
      fetchFaculty();
      toast.success('Faculty deleted successfully');
    } catch (error) {
      console.error("Error deleting faculty:", error);
      toast.error('Error deleting faculty');
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
        uploadFaculty(jsonData);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const uploadFaculty = async (facultyData) => {
    try {
      await axios.post('/api/faculty/upload', { faculty: facultyData });
      fetchFaculty();
      toast.success('Faculty uploaded successfully');
    } catch (error) {
      console.error('Error uploading faculty:', error);
      toast.error('Error uploading faculty');
    }
  };

  

  const pages = Math.ceil(faculty.length / rowsPerPage);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) => visibleColumns.has(column.uid));
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    if (!Array.isArray(faculty)) {
      return [];
    }
    let filteredFaculty = [...faculty];

    if (hasSearchFilter) {
      filteredFaculty = filteredFaculty.filter((member) => {
        return (
          (member.name && member.name.toLowerCase().includes(filterValue.toLowerCase())) ||
          (member.email && member.email.toLowerCase().includes(filterValue.toLowerCase())) ||
          (member.facultyId && member.facultyId.toLowerCase().includes(filterValue.toLowerCase()))
        );
      });
    }

    return filteredFaculty;
  }, [faculty, filterValue]);

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

  const renderCell = useCallback((facultyMember, columnKey) => {
    const cellValue = facultyMember[columnKey];
    switch (columnKey) {
      case "actions":
        return (
          <div className="relative flex items-center justify-items-center justify-center gap-2">
            <Tooltip content="Edit" >
              <span
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                onClick={() => {
                  setModalMode("edit");
                  setSelectedFaculty(facultyMember);
                  setModalOpen(true);
                }}
              >
                <EditIcon />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete">
              <span
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                onClick={() => deleteFaculty(facultyMember._id)}
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
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedFaculty(null);
  };

  const handleModalSubmit = async () => {
    handleModalClose();
    fetchFaculty();
  };

  const topContent = useMemo(() => {
    return (
        <div className="flex flex-col gap-4">
        
        <div className="flex justify-between gap-3 items-end">
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
          onClick={() => document.getElementById('upload-input').click()}
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
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {faculty.length} users</span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    faculty.length,
  ]);

  const bottomContent = useMemo(() => {
    const selectedKeysText = selectedKeys === "all" ?
      "All items selected" :
      `${selectedKeys.size} of ${items.length} selected`;

    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          showControls
          classNames={{
            cursor: "bg-foreground text-background",
          }}
          color="default"
          page={page}
          total={pages}
          variant="light"
          onChange={setPage}
        />
        <span className="text-small text-default-400">
          {selectedKeysText}
        </span>
      </div>
    );
  }, [selectedKeys, items.length, page, pages]);

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
    <>
    <div className="flex flex-col gap-4">
        {profile?.role !== 'admin' && (
            <Select
              placeholder="Select a department"
              variant="bordered"
              size="sm"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
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
    
      <Table
        isCompact
        removeWrapper
        aria-label="Faculty table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        checkboxesProps={{
          classNames: {
            wrapper: "after:bg-foreground after:text-background text-background ",
          },
        }}
        classNames={classNames}
        selectedKeys={selectedKeys}
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={setSelectedKeys}
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
            <div className="flex justify-center items-center w-full h-full">
              <Image src="/faculty.svg" alt="No Content" width={600} height={600} />
            </div>
          }
          items={sortedItems}
        >
          {(facultyMember) => (
            <TableRow key={facultyMember?._id}>
              {(columnKey) => <TableCell>{renderCell(facultyMember, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <FacultyModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        mode={modalMode}
        faculty={selectedFaculty}
        onSubmit={handleModalSubmit}
      />
    </>
  );
}