import React, { useState, useEffect } from "react";
import { Modal, Button, Input, Select, SelectItem, ModalBody, ModalContent, ModalHeader, ModalFooter } from "@nextui-org/react";
import { toast } from "sonner";
import axios from "axios";

const ClassModal = ({ isOpen, onClose, mode, classData, onSubmit, teachers }) => {
  const [formData, setFormData] = useState({
    _id:"",
    className: "",
    classCoordinator: "",
    passOutYear: "",
    department:""
  });
  const [passOutYears, setPassOutYears] = useState([]);

  useEffect(() => {
    const fetchPassOutYears = async () => {
      try {
        const response = await axios.get("/api/passOutYears");
        setPassOutYears(response.data);
      } catch (error) {
        console.error("Error fetching pass-out years:", error);
      }
    };

    fetchPassOutYears();
  }, []);

  useEffect(() => {
    if (mode === "edit" && classData) {
      setFormData({
        _id:classData._id,
        className: classData.name,
        classCoordinator: classData.teacher,
        passOutYear: classData.passOutYear,
        department:classData.department
      });
    } else {
      setFormData({
        _id:"",
        className: "",
        classCoordinator: "",
        passOutYear: "",
        department:""
      });
    }
  }, [mode, classData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const departmentOptions = [
    { key: "Department", label: "Department" },
    { key: "FE", label: "First Year" },
    { key: "CSE", label: "CSE" },
    { key: "ENTC", label: "ENTC" },
    { key: "Civil", label: "Civil" },
    { key: "Electrical", label: "Electrical" },
    { key: "Mechanical", label: "Mechanical" },
    { key: "FE", label: "First Year" },
  ];
  const handleSubmit = async () => {
    try {
      let response;
      const sanitizedFormData = JSON.parse(JSON.stringify(formData));
      if (mode === "add") {
        response = await axios.post("/api/classes", sanitizedFormData);
        toast.success("Class added successfully");
      } else if (mode === "edit") {
        response = await axios.put(`/api/classes?_id=${formData._id}`, { ...sanitizedFormData, _id: formData._id });
        toast.success("Class updated successfully");
      }
      onSubmit();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Error occurred while ${mode === "add" ? "adding" : "updating"} class`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>{mode === "add" ? "Add Class" : "Edit Class"}</ModalHeader>
        <ModalBody>
        <Input
            label="Class ID"
            name="_id"
            value={formData._id}
            onChange={handleChange}
            required
          />
          <Input
            label="Class Name"
            name="className"
            value={formData.className}
            onChange={handleChange}
            required
          />
          <Select
            label="Class Coordinator"
            placeholder="Select Coordinator"
            name="classCoordinator"
            selectedKeys={[formData.classCoordinator]}
            onChange={handleChange}
          >
            {teachers.map((teacher) => (
              <SelectItem key={teacher._id} textValue={teacher.name}>
                {teacher.name}
              </SelectItem>
            ))}
          </Select>
          <Select
            label="Pass-out Year"
            placeholder="Select Pass-out Year"
            name="passOutYear"
            selectedKeys={[formData.passOutYear]}
            onChange={handleChange}
          >
            {passOutYears.map((year) => (
              <SelectItem key={year} textValue={year}>
                {year}
              </SelectItem>
            ))}
          </Select>
          <Select
            label="Department"
            placeholder="Select department"
            name="department"
            selectedKeys={[formData.department]}
            onChange={handleChange}
          >
            {departmentOptions.map((department) => (
              <SelectItem key={department.key} textValue={department.label}>
                {department.label}
              </SelectItem>
            ))}
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button auto flat color="error" onClick={onClose}>
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
