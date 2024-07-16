"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Spinner, Button, Input } from '@nextui-org/react';
import { Avatar } from "@nextui-org/react";
import Image from 'next/image';
import axios from 'axios';

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({
    _id: '',
    name: '',
    department: '',
    email: '',
    role: '',
  });

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      setUserProfile(profile);
      setUpdatedProfile(profile);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProfile({
      ...updatedProfile,
      [name]: value,
    });
  };

  const handleSave = async () => {
    if (userProfile) {
      const role = userProfile.role === "admin" || userProfile.role === "superadmin" ? "faculty" : userProfile.role;
      const { id } = userProfile;
      try {
        await axios.put(`/api/${role}?_id=${id}`, updatedProfile);
        setUserProfile(updatedProfile);
        sessionStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating user profile:", error);
      }
    }
  };

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Spinner type="points" />
      </div>
    );
  }

  return (
    <div className="flex justify-center h-full items-center mt-auto bg-gradient-to-r from-blue-50 to-blue-100">
      <Card className="w-full h-full shadow-lg rounded-lg bg-white">
        <CardHeader className="border-b   border-gray-200 pb-4 mb-4  ">
          <div className="mb-4 flex content-center m-auto space-x-4 ">
            <Avatar
              src="/avatar.svg"
              size="xl"
              classNames={{
                base: "bg-gradient-to-br from-[#FFB457] to-[#FF705B]",
                icon: "text-black/120",
              }}
            />
          
          <div className="flex items-center space-x-4 ">
            <h4 className="text-2xl font-semibold text-gray-800">
              {userProfile.role === 'admin' ? 'Admin Profile' : userProfile.role === 'faculty' ? 'Faculty Profile' : userProfile.role === 'superadmin' ? "Superadmin Profile" : 'Student Profile'}
            </h4>
            <Button auto size="sm" variant='ghost' color='primary' onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-4 p-4 flex flex-row justify-normal">
          <div className='w-[50%] m-auto'>
        <Image src="/profile.svg" alt="Profile Illustration" width={400} height={400} className="" />
        </div>
          {isEditing ? (
            <div className="space-y-4 p-4 w-[50%] m-auto">
              <Input
                fullWidth
                label="ID"
                name="_id"
                size='sm'
                variant='bordered'
                value={updatedProfile._id}
                onChange={handleInputChange}
                disabled
              />
              <Input
                fullWidth
                label="Name"
                name="name"
                size='sm'
                variant='bordered'
                value={updatedProfile.name}
                onChange={handleInputChange}
              />
              <Input
                fullWidth
                label="Department"
                name="department"
                size='sm'
                variant='bordered'
                value={updatedProfile.department}
                onChange={handleInputChange}
              />
              <Input
                fullWidth
                label="Email"
                name="email"
                size='sm'
                variant='bordered'
                value={updatedProfile.email}
                onChange={handleInputChange}
              />
              <Button auto size='sm' onClick={handleSave} variant='ghost' color="primary">
                Save
              </Button>
            </div>
          ) : (
            userProfile && (
              <div className="space-y-4 p-4 w-[50%] m-auto">
                <h5 className="text-lg font-medium">ID: {userProfile._id}</h5>
                <h5 className="text-lg font-medium">Role: {userProfile.role}</h5>
                <p className="text-lg  text-gray-600">Name: {userProfile.name}</p>
                <p className="text-lg  text-gray-600">Department: {userProfile.department}</p>
                <p className="text-lg text-gray-600">Email: {userProfile.email}</p>
              </div>
            )
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Profile;
