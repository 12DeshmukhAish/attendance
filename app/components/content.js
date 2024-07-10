"use client"
import React, { useState,useEffect } from 'react';
import axios from 'axios';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Input,
} from '@nextui-org/react';

export default function ContentModal({ isOpen, onClose, mode, subjectData, onSubmit }) {
  const [subjectId, setSubjectId] = useState('');
  const [content, setContent] = useState([{ name: '', status: 'not_covered' }]);

  useEffect(() => {
    if (subjectData) {
      setSubjectId(subjectData._id);
      setContent(subjectData.content);
    } else {
      resetForm();
    }
  }, [subjectData]);

  const resetForm = () => {
    setSubjectId('');
    setContent([{ name: '', status: 'not_covered' }]);
  };

  const handleCancel = () => {
    onClose();
  };

  const handleContentChange = (index, event) => {
    const newContent = [...content];
    newContent[index] = { ...newContent[index], name: event.target.value };
    setContent(newContent);
  };

  const handleAddContent = () => {
    setContent([...content, { name: '', status: 'not_covered' }]);
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
      content,
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
      isOpen={true}
      onClose={onClose}
      placement="top-center"
      className="max-w-[40vw] max-h-[80vh] overflow-y-auto"
    >
      <ModalContent>
        <ModalHeader>{mode === 'add' ? 'Add New Subject' : 'Edit Subject'}</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit} className="w-full bg-white p-2 grid grid-cols-1 gap-4">
            <div className="col-span-1">
              <h3 className="text-lg font-bold mb-2">Content</h3>
              {content.map((item, index) => (
                <div key={index} className="flex gap-4 mb-2">
                  <Input
                    type="text"
                    label="Title"
                    value={item.name}
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
            <div className="col-span-1 flex justify-end gap-4">
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
