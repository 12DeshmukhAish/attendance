"use client"
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import { Button } from "@nextui-org/button";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/table";
import { Chip } from "@nextui-org/chip";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";



const AbsentStudentsPage = () => {
  const [date, setDate] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState("");

  const fetchClasses = async () => {
    if ((userProfile?.role === "admin" || userProfile?.role === "superadmin") && selectedDepartment) {
      try {
        setLoading(true);
        const response = await axios.get(`/api/utils/classes?department=${selectedDepartment}`);
        setClasses(response.data || []);
      } catch (error) {
        console.error('Error fetching classes:', error);
        setError("Failed to fetch classes. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const storedProfile = sessionStorage.getItem("userProfile");
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      setUserProfile(profile);
      if (profile.role === "admin") {
        setSelectedDepartment(profile.department);
      }
      if (profile.role === "teacher" && profile.classes) {
        setSelectedClass(profile.classes);
        setClasses([{ _id: profile.classes, name: profile.classes }]);
      }
    }
  }, []);

  useEffect(() => {
    if ((userProfile?.role === "admin" || userProfile?.role === "superadmin") && selectedDepartment) {
      fetchClasses();
    }
  }, [userProfile, selectedDepartment]);

  const classOptions = useMemo(() => {
    return Array.isArray(classes) ? classes : [];
  }, [classes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setData(null)
    try {
      const response = await axios.get(`/api/absent-students?date=${date}&classId=${selectedClass}`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError("Failed to fetch absent students data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
  };

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Absent Students Report</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="mx-10 items-center my-2 gap-2 flex">
            <Input
              type="date"
              label="Select Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              variant="bordered"
              className="w-1/2"
            />
            <Select 
              label="Select Class" 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              required
              className="w-1/2"
              variant="bordered"

            >
              {classOptions.map((cls) => (
                <SelectItem key={cls._id} value={cls._id}>
                  {cls.name || cls._id}
                </SelectItem>
              ))}
            </Select>
            <Button type="submit" color="primary" isLoading={loading}>
              Generate Report
            </Button>
          </form>
        </CardBody>
      </Card>

      {error && (
        <Card>
          <CardBody>
            <p className="text-red-500">{error}</p>
          </CardBody>
        </Card>
      )}

      {data && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex justify-between">
              <h3 className="text-xl font-semibold">Report Details</h3>
              <Chip color="primary" variant="flat">{formatDate(data.date)}</Chip>
            </CardHeader>
            <CardBody>
              <p><strong>Class:</strong> {data.class || 'N/A'}</p>
              <p><strong>Total Sessions:</strong> {data.totalSessions || 'N/A'}</p>
            </CardBody>
          </Card>

          {data.absentees && data.absentees.length > 0 ? (
            <Accordion>
              {data.absentees.map((session, index) => (
                <AccordionItem key={index} title={`Session ${session.session} - ${session.subject}`}>
                  {session.absentStudents && session.absentStudents.length > 0 ? (
                    <Table aria-label="Absent students table">
                      <TableHeader>
                        <TableColumn>Roll Number</TableColumn>
                        <TableColumn>Name</TableColumn>
                        <TableColumn>Absent Sessions</TableColumn>
                        <TableColumn>Actions</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {session.absentStudents.map((student) => (
                          <TableRow key={student._id}>
                            <TableCell>{student.rollNumber}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.totalAbsentSessions}</TableCell>
                            <TableCell>
                              <Button size="sm" color="primary" onPress={() => handleStudentClick(student)}>
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p>No absent students for this session.</p>
                  )}
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <Card>
              <CardBody>
                <p>No absentee data available for this date and class.</p>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      <Modal isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Student Details</ModalHeader>
              <ModalBody>
                {selectedStudent && (
                  <>
                    <p><strong>Name:</strong> {selectedStudent.name}</p>
                    <p><strong>Roll Number:</strong> {selectedStudent.rollNumber}</p>
                    <p><strong>Student ID:</strong> {selectedStudent._id}</p>
                    <p><strong>Email:</strong> {selectedStudent.email || 'N/A'}</p>
                    <p><strong>Phone Number:</strong> {selectedStudent.phoneNo || 'N/A'}</p>
                    <p><strong>Total Absent Sessions:</strong> {selectedStudent.totalAbsentSessions}</p>
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AbsentStudentsPage;