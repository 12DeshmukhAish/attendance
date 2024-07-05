import React, { useState, useEffect } from "react";
import { Modal, Button, Input,ModalBody,ModalContent,ModalHeader,ModalFooter } from "@nextui-org/react";
import { toast } from "sonner";
import axios from "axios";
const FacultyModal = ({ isOpen, onClose, mode, faculty, onSubmit }) => {
  const [formData, setFormData] = useState({
    facultyId: "",
    name: "",
    department: "",
    email: "",
    password:""
  });

  useEffect(() => {
    if (mode === "edit" && faculty) {
      setFormData({
        facultyId: faculty.facultyId,
        name: faculty.name,
        department: faculty.department,
        email: faculty.email,
        _id:faculty._id,
        password:faculty.password
      });
    } else {
      setFormData({
        facultyId: "",
        name: "",
        department: "",
        email: "",
        password:""
      });
    }
  }, [mode, faculty]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async() => {
    
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
      toast.error('Error occurred while saving student data');
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
        />
        <Input
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <Input
          label="Department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          required
        />
        <Input
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
         <Input
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
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
