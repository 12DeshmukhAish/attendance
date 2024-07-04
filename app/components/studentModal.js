import React, { useState, useEffect } from "react";
import { Modal, Button, Input,ModalBody,ModalContent,ModalFooter,ModalHeader, Select, SelectItem } from "@nextui-org/react";
import { toast } from "sonner";
import axios from "axios";



const StudentModal = ({ isOpen, onClose, mode, student, onSubmit }) => {
  const [formData, setFormData] = useState({
    _id: "",
    rollNumber: "",
    name: "",
    passOutYear: "",
    department:""
  });

  const departmentOptions = [
    { key: "Department", label: "Department" },
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
        department:student.department
      
      });
    } else {
      setFormData({
        _id:"",
        rollNumber: "",
        name: "",
        passOutYear: "",
        department:""
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
        <Input
            label="ID"
            name="_id"
            value={formData._id}
            onChange={handleChange}
            required
          />
          <Input
            label="Roll Number"
            name="rollNumber"
            value={formData.rollNumber}
            onChange={handleChange}
            required
          />
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          
          <Input
            label="Pass Out Year"
            name="passOutYear"
            value={formData.passOutYear}
            onChange={handleChange}
            required
          /> 
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

export default StudentModal;
