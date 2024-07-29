import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Input,
  Select,
  SelectItem,
} from '@nextui-org/react';
import { departmentOptions } from '../utils/department';

export default function SubjectModal({ isOpen, onClose, mode, subjectData, onSubmit, teachers }) {
  const [subjectId, setSubjectId] = useState('');
  const [name, setName] = useState('');
  const [classId, setClassId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [subjectType, setSubjectType] = useState('');
  const [batchIds, setBatchIds] = useState([]);
  const [profile, setProfile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

  useEffect(() => {
    if (profile?.role !== "superadmin") {
      setSelectedDepartment(profile?.department);
    }
  }, [profile]);

  useEffect(() => {
    if (subjectData) {
      setSubjectId(subjectData._id);
      setName(subjectData.name);
      setClassId(subjectData.class);
      setTeacherId(subjectData.teacher);
      setSelectedDepartment(subjectData.department);
      setSubjectType(subjectData.subType);
      setBatchIds(subjectData.batchIds || []);
    } else {
      resetForm();
    }
  }, [subjectData]);

  useEffect(() => {
    if (selectedDepartment) {
      fetchClasses();
    }
  }, [selectedDepartment]);

  useEffect(() => {
    if (classId && subjectType === 'practical'||'tg') {
      const selectedClass = classes.find(cls => cls._id === classId);
      setBatches(selectedClass ? selectedClass.batches : []);
    } else {
      setBatches([]);
    }
  }, [classId, subjectType, classes]);

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`/api/classes?department=${selectedDepartment}`);
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleSelectionChange = (keys) => {
    setBatchIds(new Set(keys));
  };

  const resetForm = () => {
    setSubjectId('');
    setName('');
    setClassId('');
    setTeacherId('');
    setSelectedDepartment('');
    setSubjectType('');
    setBatchIds([]);
  };

  const handleSelectChange = (value) => {
    setSelectedDepartment(value);
  };

  const handleCancel = () => {
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      _id: subjectId,
      name,
      class: classId,
      teacher: teacherId,
      department: selectedDepartment,
      type: subjectType,
      batchIds: subjectType === 'practical'||'tg' ? Array.from(batchIds) : undefined,
    };

    try {
      if (mode === 'add') {
        await axios.post('/api/subject', formData);
      } else {
        await axios.put(`/api/subject?_id=${subjectId}`, formData);
      }
      onSubmit();
      onClose();
    } catch (error) {
      console.error('Error submitting subject:', error);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="top-center"
      className="max-w-[40vw] max-h-[80vh] overflow-y-auto"
    >
      <ModalContent>
        <ModalHeader>{mode === 'add' ? 'Add New Subject' : 'Edit Subject'}</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit} className="w-full bg-white p-2 grid grid-cols-2 gap-4">
            <Input
              type="text"
              variant="bordered"
              size='sm'
              label="Subject ID"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
              disabled={mode !== 'add'}
              placeholder="Course ID-Year"
              className="col-span-1 w-full"
            />
            <Input
              type="text"
              variant="bordered"
              size='sm'
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="col-span-1 w-full"
            />
            {profile?.role === "superadmin" && (
              <Select
                label="Department"
                placeholder="Select department"
                name="department"
                selectedKeys={[selectedDepartment]}
                onSelectionChange={(value) => handleSelectChange(value.currentKey)}
                variant="bordered"
                size="sm"
              >
                {departmentOptions.map((department) => (
                  <SelectItem key={department.key} textValue={department.label}>
                    {department.label}
                  </SelectItem>
                ))}
              </Select>
            )}
            <Select
              label="Class"
              placeholder="Select Class"
              className="col-span-1 w-full"
              selectedKeys={[classId]}
              onChange={(keys) => setClassId(keys.currentKey)}
              required
              variant="bordered"
              size='sm'
            >
             {Array.isArray(classes) && classes.length > 0 ? (
              classes.map((classItem) => (
                <SelectItem key={classItem._id} value={classItem._id}>
                  {classItem._id}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-classes">No classes available</SelectItem>
            )}
            </Select>
            
            <Select
              label="Subject Teacher"
              placeholder="Select Subject Teacher"
              className="col-span-1 w-full"
              selectedKeys={[teacherId]}
              onSelectionChange={(keys) => setTeacherId(keys.currentKey)}
              required
              variant="bordered"
              size='sm'
            >
              {teachers.map((teacher) => (
                <SelectItem key={teacher._id} value={teacher._id}>
                  {teacher.name}
                </SelectItem>
              ))}
            </Select>
            <Select
              label="Subject Type"
              placeholder="Select Subject Type"
              className="col-span-1 w-full"
              selectedKeys={[subjectType]}
              onSelectionChange={(keys) => setSubjectType(keys.currentKey)}
              required
              variant="bordered"
              size='sm'
            >
              <SelectItem key="theory" textValue='theory'>Theory</SelectItem>
              <SelectItem key="practical" value="practical">Practical</SelectItem>
              <SelectItem key="tg" value="tg">Teacher Guardian</SelectItem>
            </Select>
            {subjectType === 'practical'||'tg' && (
              <Select
                label="Batches"
                placeholder="Select Batches"
                className="col-span-1 w-full"
                selectedKeys={Array.from(batchIds)}
                onSelectionChange={handleSelectionChange} required
                variant="bordered"
                size='sm'
                selectionMode="multiple"
              >
                {batches.map((batch) => (
                  <SelectItem key={batch._id} value={batch._id}>
                    {batch._id}
                  </SelectItem>
                ))}
              </Select>
            )}
            <div className="col-span-2 flex justify-end gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="w-fit px-3 font-normal bg-gray-200 text-gray-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="flat"
                size="sm"
                color="primary"
                className="w-fit px-3 font-normal"
              >
                {mode === 'add' ? 'Add Subject' : 'Update Subject'}
              </Button>
            </div>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
