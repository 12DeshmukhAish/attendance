import React, { useState, useEffect } from "react";
import { Modal, Button, Checkbox, Input, Select, SelectItem, ModalBody, ModalContent, ModalHeader, ModalFooter } from "@nextui-org/react";
import { toast } from "sonner";
import axios from "axios";
import { departmentOptions } from "../utils/department";

const ClassModal = ({ isOpen, onClose, mode, classData, onSubmit, teachers }) => {
  const [formData, setFormData] = useState({
    _id: "",
    className: "",
    classCoordinator: "",
    passOutYear: "",
    year: "",
    department: ""
  });
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

  useEffect(() => {
    if (profile?.role !== "superadmin" && departmentOptions.length > 0) {
      setFormData((prev) => ({
        ...prev,
        department: profile?.department[0],
      }));
    }
  }, [profile]);

  useEffect(() => {
    if (mode === "edit" && classData) {
      setFormData({
        _id: classData._id,
        className: classData.className,
        classCoordinator: classData.teacher,
        passOutYear: classData.passOutYear,
        department: classData.department,
        year: classData.year
      });
      fetchStudents(classData.passOutYear, classData.year, classData.department);
    } else {
      resetForm();
    }
  }, [mode, classData]);

  const fetchStudents = async (passOutYear, year, department) => {
    if (passOutYear && year && department) {
      try {
        const response = await axios.get(`/api/fetchstudentsByid?passOutYear=${passOutYear}&year=${year}&department=${department}`);
        setAllStudents(response.data);
        setSelectedStudents(new Set());
        setSelectAll(false);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);

    const { passOutYear, year, department } = updatedFormData;
    if (passOutYear && year && department) {
      fetchStudents(passOutYear, year, department);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(allStudents.map(student => student._id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSelectionChange = (e) => {
    setSelectedStudents(new Set(e.target.value.split(",")));
  };

  const handleSubmit = async () => {
    try {
      let response;
      const sanitizedFormData = {
        ...formData,
        students: Array.from(selectedStudents)
      };
      if (mode === "add") {
        response = await axios.post("/api/classes", sanitizedFormData);
        toast.success("Class added successfully");
      } else if (mode === "edit") {
        response = await axios.put(`/api/classes?_id=${formData._id}`, sanitizedFormData);
        toast.success("Class updated successfully");
      }
      onSubmit();
      handleCancel();
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Error occurred while ${mode === "add" ? "adding" : "updating"} class`);
    }
  };

  const resetForm = () => {
    setFormData({
      _id: "",
      className: "",
      classCoordinator: "",
      passOutYear: "",
      year: "",
      department: ""
    });
    setAllStudents([]);
    setSelectedStudents(new Set());
    setSelectAll(false);
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel}>
      <ModalContent>
        <ModalHeader>{mode === "add" ? "Add Class" : "Edit Class"}</ModalHeader>
        <ModalBody>
          <Input
            label="Class ID"
            name="_id"
            value={formData._id}
            onChange={handleChange}
            required
            disabled={mode !== "add"}
            variant="bordered"
            size="sm"
          />
          <Select
            label="Class Coordinator"
            placeholder="Select Coordinator"
            name="classCoordinator"
            selectedKeys={[formData.classCoordinator]}
            onChange={handleChange}
            variant="bordered"
            size="sm"
          >
            {teachers.map((teacher) => (
              <SelectItem key={teacher._id} textValue={teacher.name}>
                {teacher.name}
              </SelectItem>
            ))}
          </Select>
          <Input
            label="Academic Year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            variant="bordered"
            size="sm"
          />
          <Input
            label="Pass-out Year"
            name="passOutYear"
            value={formData.passOutYear}
            onChange={handleChange}
            variant="bordered"
            size="sm"
          />
          {profile?.role === "superadmin" ? (
            <Select
              label="Department"
              placeholder="Select department"
              name="department"
              selectedKeys={new Set([formData.department])}
              onSelectionChange={(value) => handleSelectChange("department", value.currentKey)}
              variant="bordered"
              size="sm"
            >
              {departmentOptions.map((department) => (
                <SelectItem key={department.key} textValue={department.label}>
                  {department.label}
                </SelectItem>
              ))}
            </Select>
          ) : (
            <Input
              label="Department"
              name="department"
              value={profile?.department[0]}
              disabled
              variant="bordered"
              size="sm"
            />
          )}
          <div>
            <Checkbox
              isSelected={selectAll}
              onChange={handleSelectAll}
            >
              Select All
            </Checkbox>
            <Select
              selectionMode="multiple"
              label="Students"
              name="students"
              selectedKeys={Array.from(selectedStudents)}
              onChange={handleSelectionChange}
              variant="bordered"
              size="sm"
            >
              {allStudents.map((student) => (
                <SelectItem key={student._id} textValue={student.name}>
                  {student.name}
                </SelectItem>
              ))}
            </Select>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button auto flat color="error" onClick={handleCancel}>
            Cancel
          </Button>
          <Button auto onClick={handleSubmit}>
            {mode === "add" ? "Add" : "Update"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ClassModal;
