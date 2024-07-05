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

export default function SubjectModal({ isOpen, onClose, mode, subjectData, onSubmit, teachers }) {
  const [subjectId, setSubjectId] = useState('');
  const [name, setName] = useState('');
  const [classId, setClassId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [content, setContent] = useState(['']);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [classes, setClasses] = useState([]);
  const [subjectType, setSubjectType] = useState('');

  const departmentOptions = [
    { key: 'CSE', label: 'CSE' },
    { key: 'ENTC', label: 'ENTC' },
    { key: 'Civil', label: 'Civil' },
    { key: 'Electrical', label: 'Electrical' },
    { key: 'Mechanical', label: 'Mechanical' },
    { key: 'FE', label: 'First Year' },
  ];

  const subjectTypeOptions = [
    { key: 'Theory', label: 'Theory' },
    { key: 'Practical', label: 'Practical' },
  ];

  useEffect(() => {
    if (subjectData) {
      setSubjectId(subjectData._id);
      setName(subjectData.name);
      setClassId(subjectData.class);
      setTeacherId(subjectData.teacher);
      setContent(subjectData.content);
      setSelectedDepartment(subjectData.department);
      setSubjectType(subjectData.type);
    } else {
      resetForm();
    }
  }, [subjectData]);

  useEffect(() => {
    if (selectedDepartment) {
      fetchClasses(selectedDepartment);
    }
  }, [selectedDepartment]);

  const fetchClasses = async (department) => {
    try {
      const response = await axios.get(`/api/classes?department=${department}`);
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
    setContent(['']);
    setSelectedDepartment('');
    setSubjectType('');
  };

  const handleCancel = () => {
    onClose();
  };

  const handleContentChange = (index, event) => {
    const newContent = [...content];
    newContent[index] = event.target.value;
    setContent(newContent);
  };

  const handleAddContent = () => {
    setContent([...content, '']);
  };

  const handleRemoveContent = (index) => {
    const newContent = [...content];
    newContent.splice(index, 1);
    setContent(newContent);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      _id: subjectId,
      name,
      class: classId,
      teacher: teacherId,
      content,
      department: selectedDepartment,
      subType: subjectType,
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
            <Select
              label="Department"
              placeholder="Select department"
              name="department"
              variant="bordered"
              size='sm'
              selectedKeys={[selectedDepartment]}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              required
              className="col-span-1 w-full"
            >
              {departmentOptions.map((department) => (
                <SelectItem key={department.key} textValue={department.label}>
                  {department.label}
                </SelectItem>
              ))}
            </Select>
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
                <SelectItem key={classItem._id} textValue={classItem._id}>
                  {classItem.name}
                </SelectItem>
              ))}
            </Select>
            <Select
              label="Class Coordinator"
              placeholder="Select Class Coordinator"
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
            <Select
              label="Subject Type"
              placeholder="Select Subject Type"
              className="col-span-1 w-full"
              value={subjectType}
              onChange={(e) => setSubjectType(e.target.value)}
              required
              variant="bordered"
              size='sm'
            >
              {subjectTypeOptions.map((type) => (
                <SelectItem key={type.key} textValue={type.label}>
                  {type.label}
                </SelectItem>
              ))}
            </Select>
            <div className="col-span-2">
              <h3 className="text-lg font-bold mb-2">Content</h3>
              {content.map((item, index) => (
                <div key={index} className="flex gap-4 mb-2">
                  <Input
                    type="text"
                    label="Title"
                    value={item}
                    onChange={(e) => handleContentChange(index, e)}
                    required
                    className="w-full"
                    variant="bordered"
                    size='sm'
                  />
                  <Button
                    color="error"
                    variant="bordered"
                    size='sm'
                    auto
                    onClick={() => handleRemoveContent(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                color="default"
                variant="bordered"
                size='sm'
                auto
                onClick={handleAddContent}
              >
                Add Content
              </Button>
            </div>
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
