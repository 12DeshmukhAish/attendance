import React, { useState, useEffect } from "react";
import { Modal, Button, Input, ModalBody, ModalContent, ModalHeader, ModalFooter } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/react";
import { toast } from "sonner";
import axios from "axios";

const FacultyModal = ({ isOpen, onClose, mode, faculty, onSubmit }) => {
  const [formData, setFormData] = useState({
    facultyId: "",
    name: "",
    department: "",
    email: "",
    password: "",
    isAdmin: false,
  });

  useEffect(() => {
    if (mode === "edit" && faculty) {
      setFormData({
        facultyId: faculty.facultyId,
        name: faculty.name,
        department: faculty.department,
        email: faculty.email,
        password: faculty.password,
        isAdmin: faculty.isAdmin,
        _id: faculty._id,
      });
    } else {
      setFormData({
        facultyId: "",
        name: "",
        department: "",
        email: "",
        password: "",
        isAdmin: false,
      });
    }
  }, [mode, faculty]);

 

  const handleSelectChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
    console.log(formData);
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const departmentOptions = [
    { key: "Department", label: "Department" },

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
      if (mode === "add") {
        response = await axios.post("/api/faculty", formData);
        console.log("Faculty added:", response.data);
        toast.success('Faculty added successfully');
        onSubmit();
      } else if (mode === "edit") {
        response = await axios.put(`/api/faculty`, formData);
        console.log("Faculty updated:", response.data);
        toast.success('Faculty updated successfully');
      }
      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error('Error occurred while saving faculty data');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>{mode === "add" ? "Add Faculty" : "Edit Faculty"}</ModalHeader>
        <ModalBody>
          <Input
            label="Faculty ID"
            name="facultyId"
            value={formData.facultyId}
            onChange={handleChange}
            required
            disabled={mode !== "add"}
            variant="bordered"
            size="sm"
          />
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            variant="bordered"
            size="sm"
          />
            <Select
            label="Department"
            placeholder="Select department"
            name="department"
            selectedKeys={[formData.department]}
            onChange={handleChange}
            variant="bordered"
            size="sm"
          >
            {departmentOptions.map((department) => (
              <SelectItem key={department.key} textValue={department.label}>
                {department.label}
              </SelectItem>
            ))}
            </Select>
          <Input
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            variant="bordered"
            size="sm"
          />
          <Input
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            variant="bordered"
            size="sm"
          />
          <Select
            label="Admin"
            placeholder="Select Admin Status"
            name="isAdmin"
            selectedKeys={[formData.isAdmin ? "true" : "false"]}
            onChange={handleChange}
            variant="bordered"
            size="sm"
          >
            <SelectItem key="true" textValue="Yes">
              Yes
            </SelectItem>
            <SelectItem key="false" textValue="No">
              No
            </SelectItem>
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

export default FacultyModal;
