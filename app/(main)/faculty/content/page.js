"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Input, Button, Dropdown } from '@nextui-org/react';
import { toast } from 'sonner';

const ContentPage = ({ subjectId }) => {
  const [subject, setSubject] = useState(null);
  const [newContentName, setNewContentName] = useState('');
  const [newContentStatus, setNewContentStatus] = useState('not_covered');
  const [profile, setProfile] = useState(null); // State to store user profile
  const [subjectDetails, setSubjectDetails] = useState(null); // State to store subject details

  useEffect(() => {
    fetchSubject();
  }, []);
  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);
  const fetchSubject = async () => {
    try {
      const response = await axios.get(`/api/subject/${subjectId}`);
      setSubject(response.data);
    } catch (error) {
      console.error('Failed to fetch subject', error);
      toast.error('Failed to fetch subject');
    }
  };

  const handleAddContent = async () => {
    if (!newContentName) {
      toast.error('Content name is required');
      return;
    }

    const newContent = { name: newContentName, status: newContentStatus };

    try {
      const response = await axios.post(`/api/subject/${subjectId}`, newContent);
      setSubject(response.data);
      setNewContentName('');
      setNewContentStatus('not_covered');
      toast.success('Content added successfully');
    } catch (error) {
      console.error('Failed to add content', error);
      toast.error('Failed to add content');
    }
  };

  const handleUpdateContentStatus = async (contentIndex, newStatus) => {
    try {
      const updatedContent = [...subject.content];
      updatedContent[contentIndex].status = newStatus;

      const response = await axios.put(`/api/subject/${subjectId}`, { content: updatedContent });
      setSubject(response.data);
      toast.success('Content status updated successfully');
    } catch (error) {
      console.error('Failed to update content status', error);
      toast.error('Failed to update content status');
    }
  };

  if (!subject) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Subject Content</h1>
      
      <div className="mb-4">
        <Input
          type="text"
          variant="bordered"
          label="Content Name"
          value={newContentName}
          onChange={(e) => setNewContentName(e.target.value)}
          className="mb-2"
        />
        <Dropdown>
          <Dropdown.Button flat>{newContentStatus}</Dropdown.Button>
          <Dropdown.Menu
            aria-label="Single selection actions"
            selectionMode="single"
            onSelectionChange={(key) => setNewContentStatus(key)}
          >
            <Dropdown.Item key="covered">covered</Dropdown.Item>
            <Dropdown.Item key="not_covered">not_covered</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Button color="primary" onClick={handleAddContent} className="mt-2">
          Add Content
        </Button>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Existing Content</h2>
        {subject.content.map((content, index) => (
          <div key={index} className="mb-4 p-4 border rounded-lg">
            <p className="text-lg font-semibold">{content.name}</p>
            <Dropdown>
              <Dropdown.Button flat>{content.status}</Dropdown.Button>
              <Dropdown.Menu
                aria-label="Single selection actions"
                selectionMode="single"
                onSelectionChange={(key) => handleUpdateContentStatus(index, key)}
              >
                <Dropdown.Item key="covered">covered</Dropdown.Item>
                <Dropdown.Item key="not_covered">not_covered</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentPage;
