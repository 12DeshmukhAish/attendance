import React, { useState, useEffect } from "react";
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
  ModalFooter
} from "@nextui-org/react";
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
  const [batches, setBatches] = useState([]);

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
        department: profile?.department,
      }));
    }
  }, [profile]);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && classData) {
        console.log(classData);
        
        setFormData({
          _id: classData._id,
          className: classData.className,
          classCoordinator: classData.teacher,
          passOutYear: classData.passOutYear,
          department: classData.department,
          year: classData.year
        });
        setBatches(classData.batches || []);
        if (classData.students) {
          setSelectedStudents(new Set(classData?.students));
          console.log(selectedStudents);
          
        }
      } else {
        resetForm();
      }
    }
  }, [isOpen, mode, classData]);

  const fetchStudents = async (passOutYear, year, department) => {
    if (passOutYear && year && department) {
      try {
        const response = await axios.get(`/api/fetchstudentsByid?passOutYear=${passOutYear}&year=${year}&department=${department}`);
        setAllStudents(response.data);
        setSelectAll(response.data.length === selectedStudents.size);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);

    if (name === 'year') {
      const passOutYear = (parseInt(value) + 4).toString();
      updatedFormData.passOutYear = passOutYear;
      setFormData(updatedFormData);
    }
  };

  useEffect(() => {
    const { passOutYear, year, department } = formData;
    if (passOutYear && year && department) {
      fetchStudents(passOutYear, year, department);
    }
  }, [formData.passOutYear, formData.year, formData.department]);

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

  const handleSelectionChange = (keys) => {
    setSelectedStudents(new Set(keys));
  };

  const handleBatchChange = (index, key, value) => {
    const updatedBatches = [...batches];
    updatedBatches[index][key] = value;
    setBatches(updatedBatches);
  };

  const addBatch = () => {
    setBatches([...batches, { _id: "", type: "", students: [] }]);
  };

  const removeBatch = (index) => {
    const updatedBatches = batches.filter((_, i) => i !== index);
    setBatches(updatedBatches);
  };

  const handleSubmit = async () => {
    try {
      let response;
      const sanitizedFormData = {
        ...formData,
        students: Array.from(selectedStudents),
        batches
      };
      if (mode === "add") {
        response = await axios.post("/api/classes", sanitizedFormData);
        toast.success("Class added successfully");
      } else if (mode === "edit") {
        response = await axios.put(`/api/classes?_id=${formData._id}`, sanitizedFormData);
        toast.success("Class updated successfully");
      }
      onSubmit();
      onClose();
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
      department: profile?.role !== "superadmin" ? profile?.department : ""
    });
    setAllStudents([]);
    setSelectedStudents(new Set());
    setSelectAll(false);
    setBatches([]);
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
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
            <Button onClick={addBatch} size="sm" >Add Batch</Button>
          </div>
          </ModalBody>
        <ModalFooter>
          <Button size="md" onClick={onClose}>Cancel</Button>
          <Button color="primary" size="md" onClick={handleSubmit}>{mode === "add" ? "Add Class" : "Save Changes"}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ClassModal;
