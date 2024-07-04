import React, { useState, useEffect } from "react";
import { Modal, Button, Input, Select, SelectItem, ModalBody, ModalContent, ModalHeader, ModalFooter } from "@nextui-org/react";
import { toast } from "sonner";
import axios from "axios";

const ClassModal = ({ isOpen, onClose, mode, classData, onSubmit, teachers, students }) => {
  const [formData, setFormData] = useState({
    className: "",
    classCoordinator: "",
    students: []
  });

  useEffect(() => {
    if (mode === "edit" && classData) {
      setFormData({
        className: classData.className,
        classCoordinator: classData.classCoordinator,
        students: classData.students,
        _id: classData._id
      });
    } else {
      setFormData({
        className: "",
        classCoordinator: "",
        students: []
      });
    }
  }, [mode, classData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleStudentsChange = (keys) => {
    setFormData({ ...formData, students: Array.from(keys, key => key.toString()) });
  };

  const handleSubmit = async () => {
    try {
      let response;
      console.log(formData.classCoordinator);
      const sanitizedFormData = JSON.parse(JSON.stringify({
        className: formData.className,
        classCoordinator: formData.classCoordinator,
        students: formData.students,
      }));
      if (mode === "add") {
        response = await axios.post("/api/classes", sanitizedFormData);
        console.log("Class added:", response.data);
        toast.success("Class added successfully");
      } else if (mode === "edit") {
        response = await axios.put(`/api/classes`, { ...sanitizedFormData, _id: formData._id });
        console.log("Class updated:", response.data);
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
              <SelectItem key={teacher._id}  textValue={teacher.name}>
                {teacher.name}
              </SelectItem>
            ))}
          </Select>
          <Select
            label="Students"
            placeholder="Select Students"
            name="students"
            selectionMode="multiple"
            selectedKeys={formData.students}
            onChange={handleStudentsChange}
          >
            {students.map((student) => (
              <SelectItem key={student._id} textValue={`${student.name} - ${student.passOutYear}`}>
                {student.name} - {student.passOutYear}
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
