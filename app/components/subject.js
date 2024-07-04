'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Modal, ModalContent, ModalHeader, ModalBody, Button, useDisclosure, Input } from '@nextui-org/react';

export default function SubjectRegister() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();

  const [subjectId, setSubjectId] = useState('');
  const [name, setName] = useState('');
  const [classId, setClassId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [content, setContent] = useState([{ title: '' }]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleCancel = () => {
    router.push('/');
  };

  const handleContentChange = (index, event) => {
    const newContent = [...content];
    newContent[index][event.target.name] = event.target.value;
    setContent(newContent);
  };

  const handleAddContent = () => {
    setContent([...content, { title: '' }]);
  };

  const handleRemoveContent = (index) => {
    const newContent = content.filter((_, i) => i !== index);
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
      const result = await axios.post('/api/register/subject', formData);
      console.log(result);
      if (result.status === 200) {
        setShowSuccessMessage(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
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
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent style={{ width: '100vw', height: '80vh' }}>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Subject Registration</ModalHeader>
              <ModalBody>
                <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white shadow-md rounded-lg p-8 grid grid-cols-2 gap-6">
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
                      <div key={index} className="grid grid-cols-2 gap-4 mb-2">
                        <Input
                          type="text"
                          variant="bordered"
                          label="Title"
                          name="title"
                          value={item.title}
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
                  {showSuccessMessage && (
                    <div className="col-span-2 mt-4 flex items-center space-x-2 text-green-500">
                      <span>Subject Registered successfully!</span>
                    </div>
                  )}
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
