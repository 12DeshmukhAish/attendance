"use client";
"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { Button, Input, Checkbox } from '@nextui-org/react';

const TeachingPlanPage = () => {
  const [subjectId, setSubjectId] = useState('');
  const [subjectIds, setSubjectIds] = useState([]);
  const [subject, setSubject] = useState([]);
  const [content, setContent] = useState([{ name: '', status: 'not_covered' }]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const userProfile = JSON.parse(sessionStorage.getItem('userProfile'));
      const userSubjectIds = userProfile.subjects;
      setSubjectIds(userSubjectIds);

      if (userSubjectIds.length === 1) {
        // Fetch the single subject's information directly
        setSubjectId(userSubjectIds[0]);
        fetchSubjectInfo(userSubjectIds[0]);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchSubjectInfo = async (subjectId) => {
    try {
      const response = await axios.get(`/api/subject?_id=${subjectId}`);
      setSubject(response.data.subject);
      console.log(response.data);
      setContent(response.data.subject.content || [{ name: '', status: 'not_covered' }]);
    } catch (error) {
      console.error('Error fetching subject info:', error);
    }
  };

  const handleSubjectChange = (event) => {
    const subjectId = event.target.value;
    setSubjectId(subjectId);
    fetchSubjectInfo(subjectId);
  };

  const handleAddContent = () => {
    setContent([...content, { name: '', status: 'not_covered' }]);
  };

  const handleContentChange = (index, event) => {
    const newContent = [...content];
    newContent[index].name = event.target.value;
    setContent(newContent);
  };

  const handleStatusChange = (index) => {
    const newContent = [...content];
    newContent[index].status = newContent[index].status === 'covered' ? 'not_covered' : 'covered';
    setContent(newContent);
  };

  const handleRemoveContent = (index) => {
    const newContent = [...content];
    newContent.splice(index, 1);
    setContent(newContent);
  };

  const handleCancel = () => {
    setSubjectId('');
    setContent([{ name: '', status: 'not_covered' }]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!subjectId) {
      toast.error('Please select a subject');
      return;
    }

    const validContent = content.filter(item => item.name.trim() !== '');
    if (validContent.length === 0) {
      toast.error('Please add at least one content item');
      return;
    }

    try {
      const response = await axios.put(`/api/contents?_id=${subjectId}`, {
        content: validContent,
      });
      if (response.status === 200) {
        toast.success('Content updated successfully');
        handleCancel();
      } else {
        toast.error('Failed to update content');
      }
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Error updating content');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Teaching Plan</h1>
      {subjectId && (
        <div className="mt-4">
          <h2 className="text-lg font-bold mb-2">Subject Information</h2>
          <h3>Subject Department - {subject.department}</h3>
          <h3>Subject Name - {subject.name}</h3>
          <h3>Subject Code - {subject._id}</h3>
          <h3>Subject Faculty Name - {subject.teacher}</h3>
          <h3>Subject class - {subject.class}</h3>

        </div>
      )}
      {subjectIds.length > 1 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Subject</label>
          <select
            value={subjectId}
            onChange={handleSubjectChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select Subject</option>
            {subjectIds.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
      )}
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
              <Checkbox
                isSelected={item.status === 'covered'}
                onChange={() => handleStatusChange(index)}
                size='sm'
              >
                Covered
              </Checkbox>
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
            Update Teaching Plan
          </Button>
        </div>
      </form>

    </div>
  );
};

export default TeachingPlanPage;
