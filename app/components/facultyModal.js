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
  const [profile, setProfile] = useState(null);

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

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

  const handleSelectChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const departmentOptions = [
    { key: "CSE", label: "CSE" },
    { key: "ENTC", label: "ENTC" },
    { key: "Civil", label: "Civil" },
    { key: "Electrical", label: "Electrical" },
    { key: "Mechanical", label: "Mechanical" },
    { key: "FE", label: "First Year" },
  ];

  useEffect(() => {
    if (profile?.role !== "superadmin" && departmentOptions.length > 0) {
      setFormData((prev) => ({
        ...prev,
        department: profile?.department[0],
      }));
    }
  }, [profile]);

  const handleSubmit = async () => {
    try {
      let response;
      if (mode === "add") {
        response = await axios.post("/api/faculty", formData);
        toast.success('Faculty added successfully');
        onSubmit();
      } else if (mode === "edit") {
        response = await axios.put(`/api/faculty`, formData);
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
            selectedKeys={new Set([formData.isAdmin ? "true" : "false"])}
            onSelectionChange={(value) => handleSelectChange("isAdmin", value.currentKey === "true")}
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
