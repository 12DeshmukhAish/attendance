"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { Card, CardBody, CardHeader, Spinner, Button, Input } from '@nextui-org/react';
import { Avatar, AvatarIcon } from "@nextui-org/react";

const Profile = () => {
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState(null); // Changed to null for initial state
  const [isEditing, setIsEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({
    _id: '',
    name: '',
    department: '',
    email: '',
    role: '', // Added role to updatedProfile state
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user && !userProfile) {
        const role = session.user.role === "admin" ? "faculty" : session.user.role;
        const { id } = session.user;
        const storedProfile = sessionStorage.getItem('userProfile');

        if (storedProfile) {
          setUserProfile(JSON.parse(storedProfile));
          setUpdatedProfile(JSON.parse(storedProfile));
        } else {
          try {
            const res = await axios.get(`/api/${role}?_id=${id}`);
            const profileData = Array.isArray(res.data) ? res.data[0] : res.data; // Ensure userProfile is an object
            profileData.role = session?.user?.role; // Add role to profile data
            setUserProfile(profileData);
            setUpdatedProfile(profileData);
            sessionStorage.setItem('userProfile', JSON.stringify(profileData));
          } catch (error) {
            console.error("Error fetching user profile:", error);
          }
        }
      }
    };
    fetchUserProfile();
  }, [session, userProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProfile({
      ...updatedProfile,
      [name]: value,
    });
  };

  const handleSave = async () => {
    if (session?.user) {
      const role = session.user.role === "admin" ? "faculty" : session.user.role;
      const { id } = session.user;
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

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Spinner type="points" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-50 to-blue-100">
      <Card className="w-full max-w-md p-6 shadow-lg rounded-lg bg-white">
        <CardHeader className="border-b border-gray-200 pb-4 mb-4 flex flex-col items-center">
          <div className="mb-4">
            <Avatar
              icon={<AvatarIcon />}
              size="xxl" // Increase avatar size
              classNames={{
                base: "bg-gradient-to-br from-[#FFB457] to-[#FF705B]",
                icon: "text-black/120",
              }}
            />
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <h4 className="text-2xl font-semibold text-gray-800">
              {session.user.role === 'admin' ? 'Admin Profile' : session.user.role === 'faculty' ? 'Faculty Profile' : 'Student Profile'}
            </h4>
            <Button auto size="sm" variant='ghost' color='primary' onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {isEditing ? (
            <>
              <Input
                fullWidth
                label="ID"
                name="_id"
                value={updatedProfile._id}
                onChange={handleInputChange}
                disabled 
              />
              <Input
                fullWidth
                label="Name"
                name="name"
                value={updatedProfile.name}
                onChange={handleInputChange}
              />
              <Input
                fullWidth
                label="Department"
                name="department"
                value={updatedProfile.department}
                onChange={handleInputChange}
              />
              <Input
                fullWidth
                label="Email"
                name="email"
                value={updatedProfile.email}
                onChange={handleInputChange}
              />
              <Button auto size='sm' onClick={handleSave} variant='ghost' color="primary">
                Save
              </Button>
            </>
          ) : (
            userProfile && (
              <>
                <h6 className="text-lg font-medium">ID: {session?.user?.id}</h6>
                <h6 className="text-lg font-medium">Role: {userProfile.role}</h6>
                <p className="text-gray-600">Name: {userProfile.name}</p>
                <p className="text-gray-600">Department: {userProfile.department}</p>
                <p className="text-gray-600">Email: {userProfile.email}</p>
              </>
            )
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Profile;
