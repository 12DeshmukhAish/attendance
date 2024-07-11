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
  const [profile, setProfile] = useState(null);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

  useEffect(() => {
    if (profile?.role !== "superadmin" && departmentOptions.length > 0) {
      setSelectedDepartment(profile?.department[0]);
    }
  }, [profile]);

<<<<<<< HEAD
  const departmentOptions = [
    { key: 'CSE', label: 'CSE' },
    { key: 'ENTC', label: 'ENTC' },
    { key: 'Civil', label: 'Civil' },
    { key: 'Electrical', label: 'Electrical' },
    { key: 'Mechanical', label: 'Mechanical' },
    { key: 'FE', label: 'First Year' },
  ];

=======
>>>>>>> ed5779b35281b7e19e63641b90194b323c7a2724
  useEffect(() => {
    if (subjectData) {
      setSubjectId(subjectData._id);
      setName(subjectData.name);
      setClassId(subjectData.class);
      setTeacherId(subjectData.teacher);
      setSelectedDepartment(subjectData.department);
    } else {
      resetForm();
    }
  }, [subjectData]);

  useEffect(() => {
    if (selectedDepartment) {
      fetchClasses();
    }
  }, [selectedDepartment]);

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`/api/classes?department=${selectedDepartment}`);
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const resetForm = () => {
    setSubjectId('');
    setName('');
    setClassId('');
    setTeacherId('');
    setSelectedDepartment('');
  };

  const handleSelectChange = (value) => {
    setSelectedDepartment(value);
  };

  const handleCancel = () => {
    resetForm();
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
    };

    try {
      if (mode === 'add') {
        await axios.post('/api/subject', formData);
      } else {
        await axios.put(`/api/subject?_id=${subjectId}`, formData);
      }
      resetForm();
      onSubmit();
      onClose();
    } catch (error) {
      console.error('Error submitting subject:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
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
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              required
              variant="bordered"
              size='sm'
            >
              {classes.map((classItem) => (
                <SelectItem key={classItem._id} value={classItem._id}>
                  {classItem._id}
                </SelectItem>
              ))}
            </Select>
            <Select
              label="Subject Teacher"
              placeholder="Select Subject Teacher"
              className="col-span-1 w-full"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
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
<<<<<<< HEAD
       
=======
>>>>>>> ed5779b35281b7e19e63641b90194b323c7a2724
            <div className="col-span-2 flex justify-end gap-4">
              <Button
                variant="ghost"
                size='sm'
                color="default"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                variant="ghost"
                size='sm'
                color="primary"
                type="submit"
              >
                {mode === 'add' ? 'Add Subject' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
