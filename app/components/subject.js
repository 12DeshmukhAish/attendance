"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Modal, ModalContent, ModalHeader, ModalBody, Button, useDisclosure, Input } from '@nextui-org/react';

export default function SubjectRegister() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const [subjectId, setSubjectId] = useState('');
  const [name, setName] = useState('');
  const [classId, setClassId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [content, setContent] = useState(['']);

  const handleCancel = () => {
    onClose();
  };

  const handleContentChange = (index, event) => {
    const newContent = [...content]; // Create a copy of the content array
    newContent[index] = event.target.value; // Update the specific index
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
      const result = await axios.post('/api/subject', formData);
      console.log(result);
      if (result.status === 200) {
        setShowSuccessMessage(true);
        onClose(); 
      }
    } catch (error) {
      console.error('Error registering subject:', error);
    }
  };

  return (
    <>
      <Button onPress={onOpen} color="primary">Add Subject</Button>
      <Modal
        isOpen={isOpen}
        onClose={onClose} // Ensure onClose is used to close the modal
        placement="top-center"
        className='max-w-[40vw] max-h-[80vh] overflow-y-auto'
      >
        <ModalContent>
          <ModalHeader>Subject Registration</ModalHeader>
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
              <Input
                type="text"
                variant="bordered"
                label="Teacher Name"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                required
                className="col-span-1 w-full"
              />
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
                <Button
                  color="default"
                  auto
                  onClick={handleAddContent}
                >
                  Add Content
                </Button>
              </div>
              <Button color="default" className="col-span-1" onClick={handleCancel}>Cancel</Button>
              <Button color="primary" className="col-span-1" type="submit">Register</Button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
