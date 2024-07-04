"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Input,
} from '@nextui-org/react';

export default function SubjectModal({ isOpen, onClose, mode, subjectData, onSubmit, teachers }) {
  const [subjectId, setSubjectId] = useState('');
  const [name, setName] = useState('');
  const [classId, setClassId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [content, setContent] = useState(['']);

  useEffect(() => {
    if (subjectData) {
      setSubjectId(subjectData._id);
      setName(subjectData.name);
      setClassId(subjectData.class);
      setTeacherId(subjectData.teacher);
      setContent(subjectData.content);
    } else {
      setSubjectId('');
      setName('');
      setClassId('');
      setTeacherId('');
      setContent(['']);
    }
  }, [subjectData]);

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
    };

    try {
      if (mode === "add") {
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
        <ModalHeader>{mode === "add" ? "Add New Subject" : "Edit Subject"}</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit} className="w-full bg-white p-2 grid grid-cols-2 gap-4">
            <Input
              type="text"
              variant="bordered"
              label="Subject ID"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
              className="col-span-1 w-full"
            />
            <Input
              type="text"
              variant="bordered"
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="col-span-1 w-full"
            />
            <Input
              type="text"
              variant="bordered"
              label="Class"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              required
              className="col-span-1 w-full"
            />
            <div className="col-span-1 w-full">
              <label className="block mb-2 font-medium">Teacher</label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select a teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <h3 className="text-lg font-bold mb-2">Content</h3>
              {content.map((item, index) => (
                <div key={index} className="flex gap-4 mb-2">
                  <Input
                    type="text"
                    variant="bordered"
                    label="Title"
                    value={item}
                    onChange={(e) => handleContentChange(index, e)}
                    required
                    className="w-full"
                  />
                  <Button
                    color="error"
                    auto
                    onClick={() => handleRemoveContent(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button color="default" auto onClick={handleAddContent}>
                Add Content
              </Button>
            </div>
            <Button color="default" className="col-span-1" onClick={handleCancel}>
              Cancel
            </Button>
            <Button color="primary" className="col-span-1" type="submit">
              {mode === "add" ? "Add Subject" : "Save Changes"}
            </Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
