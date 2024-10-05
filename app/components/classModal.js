"use client"

import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Button,
  Checkbox,
  Input,
  Select,
  SelectItem,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Spinner
} from "@nextui-org/react";
import { toast } from "sonner";
import axios from "axios";
import { departmentOptions } from "../utils/department";

const ClassModal = ({ isOpen, onClose, mode, classData, onSubmit, teachers }) => {
  const [formData, setFormData] = useState({
    _id: "",
    className: "",
    classCoordinator: "",
    year: "",
    department: ""
  });
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [profile, setProfile] = useState(null);
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      try {
        const parsedProfile = JSON.parse(storedProfile);
        setProfile(parsedProfile);
        if (parsedProfile.role !== "superadmin" && departmentOptions.length > 0) {
          setFormData(prev => ({ ...prev, department: parsedProfile.department }));
        }
      } catch (error) {
        console.error("Error parsing user profile:", error);
        toast.error("Error loading user profile. Please try refreshing the page.");
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && classData) {
        setFormData({
          _id: classData._id || "",
          className: classData.className || "",
          classCoordinator: classData.teacher?._id || "",
          department: classData.department || "",
          year: classData.year || ""
        });
        setBatches(classData.batches || []);
        if (classData.students) {
          setSelectedStudents(new Set(classData.students.map(student => student._id)));
        }
      } else {
        resetForm();
      }
    }
  }, [isOpen, mode, classData]);

  const fetchStudents = useCallback(async (year, department) => {
    if (!year || !department) return;

    setIsLoading(true);
    try {
      const response = await axios.get(`/api/fetchstudentsByid`, {
        params: { year, department },
        timeout: 5000 // 5 seconds timeout
      });
      if (Array.isArray(response.data)) {
        setAllStudents(response.data);
        setSelectAll(response.data.length === selectedStudents.size);
      } else {
        throw new Error("Invalid student data received");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedStudents]);

  useEffect(() => {
    const { year, department } = formData;
    if (year && department) {
      fetchStudents(year, department);
    }
  }, [formData.year, formData.department, fetchStudents]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectAll) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(allStudents.map(student => student._id)));
    }
    setSelectAll(!selectAll);
  }, [selectAll, allStudents]);

  const handleSelectChange = useCallback((key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSelectionChange = useCallback((keys) => {
    setSelectedStudents(new Set(keys));
  }, []);

  const handleBatchChange = useCallback((index, key, value) => {
    setBatches(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  }, []);

  const addBatch = useCallback(() => {
    setBatches(prev => [...prev, { _id: "", type: "", students: [] }]);
  }, []);

  const removeBatch = useCallback((index) => {
    setBatches(prev => prev.filter((_, i) => i !== index));
  }, []);

  const validateForm = useCallback(() => {
    if (!formData._id || !formData.className || !formData.classCoordinator || !formData.year || !formData.department) {
      toast.error("Please fill in all required fields.");
      return false;
    }
    if (selectedStudents.size === 0) {
      toast.error("Please select at least one student.");
      return false;
    }
    if (batches.some(batch => !batch._id || !batch.type)) {
      toast.error("Please fill in all batch details.");
      return false;
    }
    return true;
  }, [formData, selectedStudents, batches]);

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const sanitizedFormData = {
        ...formData,
        students: Array.from(selectedStudents),
        batches: batches.map(batch => ({
          ...batch,
          students: Array.from(new Set(batch.students.filter(studentId => selectedStudents.has(studentId))))
        }))
      };
      const url = mode === "add" ? "/api/classes" : `/api/classes?_id=${formData._id}`;
      const method = mode === "add" ? "post" : "put";
      
      const response = await axios[method](url, sanitizedFormData, { timeout: 10000 });
      
      if (response.status === 201 || response.status === 200) {
        toast.success(`Class ${mode === "add" ? "added" : "updated"} successfully`);
        onSubmit();
        onClose(); // Close the modal after successful submission
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Error occurred while ${mode === "add" ? "adding" : "updating"} class. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      _id: "",
      className: "",
      classCoordinator: "",
      year: "",
      department: profile?.role !== "superadmin" ? profile?.department : ""
    });
    setAllStudents([]);
    setSelectedStudents(new Set());
    setSelectAll(false);
    setBatches([]);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => {
        resetForm();
        onClose();
      }} 
      size="3xl"
    >
      <ModalContent className="max-h-[90vh] overflow-y-auto">
        <ModalHeader>{mode === "add" ? "Add Class" : "Edit Class"}</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            <Input
              label="Class Name"
              name="className"
              value={formData.className}
              onChange={handleChange}
              required
              variant="bordered"
              size="sm"
            />
            <Select
              label="Class Coordinator"
              placeholder="Select Coordinator"
              name="classCoordinator"
              selectedKeys={[formData.classCoordinator]}
              onSelectionChange={(value) => handleSelectChange("classCoordinator", value.currentKey)}
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
              label="Admission Year"
              name="year"
              value={formData.year}
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
                value={profile?.department}
                disabled
                variant="bordered"
                size="sm"
              />
            )}
          </div>
          <div className="mt-4">
            <Checkbox
              isSelected={selectAll}
              onChange={handleSelectAll}
            >
              Select All Students
            </Checkbox>
            <Select
              selectionMode="multiple"
              label="Students"
              name="students"
              selectedKeys={Array.from(selectedStudents)}
              onSelectionChange={handleSelectionChange}
              variant="bordered"
              size="sm"
              className="mt-2"
            >
              {allStudents.map((student) => (
                <SelectItem key={student._id} textValue={student.name}>
                  {student.rollNumber} {student.name}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="mt-4">
            <h4>Batches</h4>
            {batches.map((batch, index) => (
              <div key={index} className="border p-4 mb-4 rounded-md">
                <Input
                  label="Batch ID"
                  name={`batch-${index}-id`}
                  value={batch._id}
                  onChange={(e) => handleBatchChange(index, '_id', e.target.value)}
                  required
                  variant="bordered"
                  size="sm"
                />
                <Select
                  label="Batch Type"
                  placeholder="Select Batch Type"
                  selectedKeys={[batch.type]}
                  onSelectionChange={(value) => handleBatchChange(index, 'type', value.currentKey)}
                  variant="bordered"
                  size="sm"
                  className="mb-2"
                >
                  <SelectItem key="practical" textValue="Practical">
                    Practical
                  </SelectItem>
                  <SelectItem key="TG" textValue="TG">
                    TG
                  </SelectItem>
                </Select>
                <Select
                  selectionMode="multiple"
                  label="Batch Students"
                  name={`batch-${index}-students`}
                  selectedKeys={new Set(batch.students)}
                  onSelectionChange={(keys) => handleBatchChange(index, 'students', Array.from(keys))}
                  variant="bordered"
                  size="sm"
                  className="my-2"
                >
                  {allStudents
                    .filter((student) => selectedStudents.has(student._id))
                    .map((student) => (
                    <SelectItem key={student._id} textValue={student.name}>
                      {student.rollNumber} {student.name}
                    </SelectItem>
                  ))}
                </Select>
                <Button
                  color="danger"
                  onClick={() => removeBatch(index)}
                  className="mt-2"
                  size="sm" 
                >
                  Remove Batch
                </Button>
              </div>
            ))}
            <Button onClick={addBatch} size="sm">Add Batch</Button>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button size="md" onClick={() => {
            resetForm();
            onClose();
          }}>
            Cancel
          </Button>
          <Button color="primary" size="md" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : (mode === "add" ? "Add Class" : "Save Changes")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ClassModal;