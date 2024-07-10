import React, { useState, useEffect } from "react";
import { Modal, Button, Input, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem } from "@nextui-org/react";
import { toast } from "sonner";
import axios from "axios";

const StudentModal = ({ isOpen, onClose, mode, student, onSubmit }) => {
  const [formData, setFormData] = useState({
    _id: "",
    rollNumber: "",
    name: "",
    passOutYear: "",
    department: "",
    email: "",
    phoneNo: "",
    password: "",
    year: ""
  });

  const departmentOptions = [
    { key: "Department", label: "Department" },
    { key: "FE", label: "First Year" },
    { key: "CSE", label: "CSE" },
    { key: "ENTC", label: "ENTC" },
    { key: "Civil", label: "Civil" },
    { key: "Electrical", label: "Electrical" },
    { key: "Mechanical", label: "Mechanical" },
  ];

  useEffect(() => {
    if (mode === "edit" && student) {
      setFormData({
        _id: student._id,
        rollNumber: student.rollNumber,
        name: student.name,
        passOutYear: student.passOutYear,
        department: student.department,
        email: student.email,
        phoneNo: student.phoneNo,
        password: student.password,
        year: student.year
      });
    } else {
      setFormData({
        _id: "",
        rollNumber: "",
        name: "",
        passOutYear: "",
        department: "",
        phoneNo: "",
        email: "",
        password: "",
        year: ""
      });
    }
  }, [mode, student]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      let response;
      if (mode === "add") {
        response = await axios.post("/api/student", formData);
        console.log("Student added:", response.data);
        toast.success("Student added successfully");
        onSubmit();
      } else if (mode === "edit") {
        response = await axios.put(`/api/student?_id=${formData._id}`, formData);
        console.log("Student updated:", response.data);
        toast.success("Student updated successfully");
      }

      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error occurred while saving student data");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>{mode === "add" ? "Add Student" : "Edit Student"}</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ID"
              name="_id"
              value={formData._id}
              onChange={handleChange}
              required
              disabled={mode !== "add"}
              variant="bordered"
              size="sm"
            />
            <Input
              label="Roll Number"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              required
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
              label="Pass Out Year"
              name="passOutYear"
              value={formData.passOutYear}
              onChange={handleChange}
              required
              variant="bordered"
              size="sm"
            />
            <Input
              label="Phone No."
              name="phoneNo"
              value={formData.phoneNo}
              onChange={handleChange}
              required
              variant="bordered"
              size="sm"
            />
            <Input
              label="Email ID"
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
          </div>
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

export default StudentModal;
