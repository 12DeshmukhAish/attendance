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
  SelectItem,
  Select,
  Switch,
  useDisclosure,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner
} from "@nextui-org/react";
import { capitalize } from "@/app/utils/utils";
import { PlusIcon } from "@/public/PlusIcon";
import { EditIcon } from "@/public/EditIcon";
import { DeleteIcon } from "@/public/DeleteIcon";
import { SearchIcon } from "@/public/SearchIcon";
import ClassModal from "./classModal";
import * as XLSX from "xlsx";
import { FaFileDownload } from "react-icons/fa";
import Image from "next/image";
import { departmentOptions } from "../utils/department";

const columns = [
  { uid: "_id", name: "Class ID", sortable: true },
  { uid: "teacher", name: "Class Coordinator" },
  { uid: "students", name: "Students" }, 
  { uid: "year", name: "Admission Year" },
  { uid: "department", name: "Department" },
  { uid: "actions", name: "Actions" },
];

const INITIAL_VISIBLE_COLUMNS = ["_id", "teacher", "students", "year", "department", "actions"];

export default function ClassTable() {
  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "className",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedClass, setSelectedClass] = useState(null);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [classToToggle, setClassToToggle] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      const parsedProfile = JSON.parse(storedProfile);
      setProfile(parsedProfile);
      if (parsedProfile.role !== "superadmin") {
        setSelectedDepartment(parsedProfile.department);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      fetchData();
    }
  }, [selectedDepartment]);
  const fetchData = useCallback(async () => {
    if (!selectedDepartment) return;

    setIsLoadingClasses(true);
    setIsLoadingTeachers(true);
    try {
      const [classesResponse, teachersResponse] = await Promise.all([
        axios.get(`/api/classes?department=${selectedDepartment}`, { timeout: 10000 }),
        axios.get('/api/fetchfaculty', { timeout: 10000 })
      ]);

      if (classesResponse.status === 200 && Array.isArray(classesResponse.data)) {
        setClasses(classesResponse.data);
      } else {
        setClasses([]);
        toast.error('Invalid class data received');
      }

      if (Array.isArray(teachersResponse.data)) {
        setTeachers(teachersResponse.data);
      } else {
        setTeachers([]);
        toast.error('Invalid teacher data received');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error fetching data. Please try again.');
    } finally {
      setIsLoadingClasses(false);
      setIsLoadingTeachers(false);
    }
  }, [selectedDepartment]);

  const handleSelectChange = useCallback((value) => {
    setSelectedDepartment(value);
  }, []);

  const openConfirmModal = useCallback((classId, currentStatus) => {
    setClassToToggle({ id: classId, currentStatus });
    onOpen();
  }, [onOpen]);
 const toggleClassStatus = useCallback(async () => {
    if (!classToToggle) return;

    try {
      setIsLoading(true);
      const response = await axios.post('/api/endofacademic', { classId: classToToggle.id }, { timeout: 10000 });
      if (response.status === 200) {
        setClasses(prevClasses =>
          prevClasses.map(cls =>
            cls._id === classToToggle.id ? { ...cls, isActive: !classToToggle.currentStatus } : cls
          )
        );
        toast.success(`Class ${!classToToggle.currentStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        throw new Error('Failed to update class status');
      }
    } catch (error) {
      console.error("Error toggling class status:", error);
      toast.error('Error updating class status. Please try again.');
    } finally {
      setIsLoading(false);
      onClose();
    }
  }, [classToToggle, onClose]);

  const deleteClass = useCallback(async (_id) => {
    try {
      setIsDeleting(true);
      await axios.delete(`/api/classes?_id=${_id}`, { timeout: 10000 });
      setClasses(prevClasses => prevClasses.filter(cls => cls._id !== _id));
      toast.success('Class deleted successfully');
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error('Error deleting class. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  }, []);
  const downloadExcel = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(classes);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Classes");
    XLSX.writeFile(workbook, "classes_data.xlsx");
  }, [classes]);
 
  const pages = Math.ceil((classes?.length || 0) / rowsPerPage);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredClasses = classes || [];

    if (hasSearchFilter) {
      filteredClasses = filteredClasses.filter((cls) => {
        return (
          (cls.name && cls.name.toLowerCase().includes(filterValue.toLowerCase())) ||
          (cls.teacher && cls.teacher.name && cls.teacher.name.toLowerCase().includes(filterValue.toLowerCase()))
        );
      });
    }

    return filteredClasses;
  }, [classes, filterValue, hasSearchFilter]);

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
        return <span>{cellValue && cellValue.name ? cellValue.name : 'N/A'}</span>;
      case "students":
        return <span>{cellValue ? cellValue.length : 0}</span>;
      default:
        return <span>{cellValue}</span>;
    }
  }, [deleteClass, openConfirmModal]);

  const renderHeader = useCallback((column) => {
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
  }, []);

  return (
    <>
      <div className="flex justify-between my-4 gap-3 items-end">
        {profile?.role !== "admin" && (
          <Select
            placeholder="Select department"
            name="department"
            className="w-[40%]"
            selectedKeys={[selectedDepartment]}
            onSelectionChange={(value) => handleSelectChange(value.currentKey)}
            variant="bordered"
            size="sm"
          >
            {departmentOptions.map((department) => (
              <SelectItem key={department.key} textValue={department.label}>
                {department.label}
              </SelectItem>
            ))}
          </Select>
        )}
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
          <Button
            color="primary"
            startContent={<PlusIcon />}
            size="sm"
            auto
            onClick={() => {
              setModalMode("add");
              setSelectedClass(null);
              setModalOpen(true);
            }}
          >
            Add Class
          </Button>
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
      {isLoadingClasses || isLoadingTeachers ? (
        <div className="flex justify-center items-center h-64">
          <Spinner label="Loading..." />
        </div>
      ) : sortedItems && sortedItems.length > 0 ? (
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
      ) : (
        <div className="flex flex-col items-center justify-center">
          <div className="my-auto mt-32">
            <Image src="/class.svg" alt="No classes found" width={800} height={800} />
          </div>
          <p className="mt-2 text-gray-500">No classes found</p>
        </div>
      )}
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
        onSubmit={fetchData}
        teachers={teachers}
      />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Confirm Status Change</ModalHeader>
          <ModalBody>
            Are you sure you want to {classToToggle?.currentStatus ? 'deactivate' : 'activate'} this class?
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose} isDisabled={isLoading}>
              Cancel
            </Button>
            <Button color="primary" onPress={toggleClassStatus} isDisabled={isLoading}>
              {isLoading ? <Spinner size="sm" /> : "Confirm"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}