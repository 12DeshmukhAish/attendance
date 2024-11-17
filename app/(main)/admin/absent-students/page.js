// "use client"
// import React, { useState, useEffect, useMemo } from 'react';
// import axios from 'axios';
// import { Card, CardBody, CardHeader } from "@nextui-org/card";
// import { Input } from "@nextui-org/input";
// import { Select, SelectItem } from "@nextui-org/select";
// import { Button } from "@nextui-org/button";
// import { Accordion, AccordionItem } from "@nextui-org/accordion";
// import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/table";
// import { Chip } from "@nextui-org/chip";
// import { Modal, Checkbox, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, CheckboxGroup } from "@nextui-org/react";
// import { Textarea } from "@nextui-org/input";

// const AbsentStudentsPage = () => {
//   const [date, setDate] = useState('');
//   const [selectedClass, setSelectedClass] = useState('');
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [classes, setClasses] = useState([]);
//   const [selectedDepartment, setSelectedDepartment] = useState("");
//   const [userProfile, setUserProfile] = useState(null);
//   const [error, setError] = useState("");
//   const [showNotificationModal, setShowNotificationModal] = useState(false);
//   const [notificationStep, setNotificationStep] = useState(1);
//   const [selectedStudents, setSelectedStudents] = useState([]);
//   const [selectAll, setSelectAll] = useState(false);
//   const [subject, setSubject] = useState('');
//   const [body, setBody] = useState('');
//   const [notificationTypes, setNotificationTypes] = useState([]);

//   const { isOpen: isStudentModalOpen, onOpen: onStudentModalOpen, onClose: onStudentModalClose } = useDisclosure();

//   const fetchClasses = async () => {
//     if ((userProfile?.role === "admin" || userProfile?.role === "superadmin") && selectedDepartment) {
//       try {
//         setLoading(true);
//         const response = await axios.get(`/api/utils/classes?department=${selectedDepartment}`);
//         setClasses(response.data || []);
//       } catch (error) {
//         console.error('Error fetching classes:', error);
//         setError("Failed to fetch classes. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   useEffect(() => {
//     const storedProfile = sessionStorage.getItem("userProfile");
//     if (storedProfile) {
//       const profile = JSON.parse(storedProfile);
//       setUserProfile(profile);
//       if (profile.role === "admin") {
//         setSelectedDepartment(profile.department);
//       }
//       if (profile.role === "teacher" && profile.classes) {
//         setSelectedClass(profile.classes);
//         setClasses([{ _id: profile.classes, name: profile.classes }]);
//       }
//     }
//   }, []);

//   useEffect(() => {
//     if ((userProfile?.role === "admin" || userProfile?.role === "superadmin") && selectedDepartment) {
//       fetchClasses();
//     }
//   }, [userProfile, selectedDepartment]);

//   const classOptions = useMemo(() => {
//     return Array.isArray(classes) ? classes : [];
//   }, [classes]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setData(null)
//     try {
//       const response = await axios.get(`/api/absent-students?date=${date}&classId=${selectedClass}`);
//       setData(response.data);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       setError("Failed to fetch absent students data. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   const handleStudentClick = (student) => {
//     setSelectedStudent(student);
//     onStudentModalOpen();
//   };

//   const handleSendNotificationsClick = () => {
//     setShowNotificationModal(true);
//     setNotificationStep(1);
//     setSelectedStudents([]);
//     setSelectAll(false);
//     setSubject('');
//     setBody('');
//     setNotificationTypes([]);
//   };

//   const handleSelectAllChange = (checked) => {
//     setSelectAll(checked);
//     if (checked) {
//       setSelectedStudents(data.absentees.flatMap(session =>
//         session.absentStudents.map(student => student._id)
//       ));
//     } else {
//       setSelectedStudents([]);
//     }
//   };

//   const handleStudentSelect = (studentId) => {
//     setSelectedStudents(prev =>
//       prev.includes(studentId)
//         ? prev.filter(id => id !== studentId)
//         : [...prev, studentId]
//     );
//   };

//   const handleSendNotifications = async () => {
//     setLoading(true);
//     try {
//       await axios.post('/api/notifications', {
//         userIds: selectedStudents,
//         notification: {
//           subject,
//           body,
//           type: 'custom',
//           redirectUrl: '/notifications',
//         },
//         notificationTypes,
//       });
//       alert('Notifications sent successfully!');
//       setShowNotificationModal(false);
//     } catch (error) {
//       console.error('Error sending notifications:', error);
//       alert('Failed to send notifications. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderNotificationModalContent = () => {
//     switch (notificationStep) {
//       case 1:
//         return (
//           <>
//             <ModalHeader>Select Students</ModalHeader>
//             <ModalBody>
//               <Checkbox
//                 isSelected={selectAll}
//                 onValueChange={handleSelectAllChange}
//               >
//                 Select All
//               </Checkbox>
//               <Table aria-label="Absent students table">
//                 <TableHeader>
//                   <TableColumn>Select</TableColumn>
//                   <TableColumn>Roll Number</TableColumn>
//                   <TableColumn>Name</TableColumn>
//                   <TableColumn>Absent Sessions</TableColumn>
//                 </TableHeader>
//                 <TableBody>
//                   {data && data.absentees.flatMap(session =>
//                     session.absentStudents.map((student) => (
//                       <TableRow key={student._id}>
//                         <TableCell>
//                           <Checkbox
//                             isSelected={selectedStudents.includes(student._id)}
//                             onValueChange={() => handleStudentSelect(student._id)}
//                           />
//                         </TableCell>
//                         <TableCell>{student.rollNumber}</TableCell>
//                         <TableCell>{student.name}</TableCell>
//                         <TableCell>{student.totalAbsentSessions}</TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </ModalBody>
//             <ModalFooter>
//               <Button color="primary" onPress={() => setNotificationStep(2)} isDisabled={selectedStudents.length === 0}>
//                 Next
//               </Button>
//             </ModalFooter>
//           </>
//         );
//       case 2:
//         return (
//           <>
//             <ModalHeader>Compose Notification</ModalHeader>
//             <ModalBody>
//               <Input
//                 label="Subject"
//                 placeholder="Enter notification subject"
//                 value={subject}
//                 onValueChange={setSubject}
//                 required
//               />
//               <Textarea
//                 label="Body"
//                 placeholder="Enter notification body"
//                 value={body}
//                 onValueChange={setBody}
//                 required
//               />
//               <CheckboxGroup
//                 label="Notification Types"
//                 value={notificationTypes}
//                 onValueChange={setNotificationTypes}
//               >
//                 <Checkbox value="email">Email</Checkbox>
//                 <Checkbox value="push">Push Notification</Checkbox>
//                 <Checkbox value="sse">In-App Notification</Checkbox>
//               </CheckboxGroup>
//             </ModalBody>
//             <ModalFooter>
//               <Button color="primary" variant="light" onPress={() => setNotificationStep(1)}>
//                 Back
//               </Button>
//               <Button color="primary" onPress={handleSendNotifications} isLoading={loading}>
//                 Send Notifications
//               </Button>
//             </ModalFooter>
//           </>
//         );
//     }
//   };

//   return (
//     <div className="p-4 space-y-6">
//       <Card>
//         <CardHeader>
//           <h2 className="text-2xl font-bold">Absent Students Report</h2>
//         </CardHeader>
//         <CardBody>
//           <form onSubmit={handleSubmit} className="mx-10 items-center my-2 gap-2 flex">
//             <Input
//               type="date"
//               label="Select Date"
//               value={date}
//               onValueChange={setDate}
//               required
//               variant="bordered"
//               className="w-1/2"
//             />
//             <Select
//               label="Select Class"
//               selectedKeys={[selectedClass]}
//               onSelectionChange={(keys) => setSelectedClass(Array.from(keys)[0])}
//               required
//               className="w-1/2"
//               variant="bordered"
//             >
//               {classOptions.map((cls) => (
//                 <SelectItem key={cls._id} value={cls._id}>
//                   {cls.name || cls._id}
//                 </SelectItem>
//               ))}
//             </Select>
//             <Button type="submit" color="primary" isLoading={loading}>
//               Generate Report
//             </Button>
//           </form>
//         </CardBody>
//       </Card>

//       {error && (
//         <Card>
//           <CardBody>
//             <p className="text-red-500">{error}</p>
//           </CardBody>
//         </Card>
//       )}

//       {data && (
//         <div className="space-y-6">
//           <Card>
//             <CardHeader className="flex justify-between">
//               <h3 className="text-xl font-semibold">Report Details</h3>
//               <Button color="primary" onPress={handleSendNotificationsClick}>
//                 Send Notifications
//               </Button>
//               <Chip color="primary" variant="flat">{formatDate(data.date)}</Chip>
//             </CardHeader>
//             <CardBody>
//               <p><strong>Class:</strong> {data.class || 'N/A'}</p>
//               <p><strong>Total Sessions:</strong> {data.totalSessions || 'N/A'}</p>
//             </CardBody>
//           </Card>

//           {data.absentees && data.absentees.length > 0 ? (
//             <Accordion>
//               {data.absentees.map((session, index) => (
//                 <AccordionItem key={index} title={`Session ${session.session} - ${session.subject}`}>
//                   {session.absentStudents && session.absentStudents.length > 0 ? (
//                     <Table aria-label="Absent students table">
//                       <TableHeader>
//                         <TableColumn>Roll Number</TableColumn>
//                         <TableColumn>Name</TableColumn>
//                         <TableColumn>Absent Sessions</TableColumn>
//                         <TableColumn>Actions</TableColumn>
//                       </TableHeader>
//                       <TableBody>
//                         {session.absentStudents.map((student) => (
//                           <TableRow key={student._id}>
//                             <TableCell>{student.rollNumber}</TableCell>
//                             <TableCell>{student.name}</TableCell>
//                             <TableCell>{student.totalAbsentSessions}</TableCell>
//                             <TableCell>
//                               <Button size="sm" color="primary" onPress={() => handleStudentClick(student)}>
//                                 View Details
//                               </Button>
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   ) : (
//                     <p>No absent students for this session.</p>
//                   )}
//                 </AccordionItem>
//               ))}
//             </Accordion>
//           ) : (
//             <Card>
//               <CardBody>
//                 <p>No absentee data available for this date and class.</p>
//               </CardBody>
//             </Card>
//           )}
//         </div>
//       )}

//       <Modal
//         isOpen={showNotificationModal}
//         onClose={() => setShowNotificationModal(false)}
//         size="3xl"
//       >
//         <ModalContent>
//           {renderNotificationModalContent()}
//         </ModalContent>
//       </Modal>
      
//       <Modal isOpen={isStudentModalOpen} onClose={onStudentModalClose}>
//         <ModalContent>
//           <ModalHeader className="flex flex-col gap-1">Student Details</ModalHeader>
//           <ModalBody>
//             {selectedStudent && (
//               <>
//                 <p><strong>Name:</strong> {selectedStudent.name}</p>
//                 <p><strong>Roll Number:</strong> {selectedStudent.rollNumber}</p>
//                 <p><strong>Student ID:</strong> {selectedStudent._id}</p>
//                 <p><strong>Email:</strong> {selectedStudent.email || 'N/A'}</p>
//                 <p><strong>Phone Number:</strong> {selectedStudent.phoneNo || 'N/A'}</p>
//                 <p><strong>Total Absent Sessions:</strong> {selectedStudent.totalAbsentSessions}</p>
//               </>
//             )}
//           </ModalBody>
//           <ModalFooter>
//             <Button color="danger" variant="light" onPress={onStudentModalClose}>
//               Close
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </div>
//   );
// };

// export default AbsentStudentsPage;
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
import { Modal, Checkbox, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { Textarea } from "@nextui-org/input";
import { Spinner } from "@nextui-org/spinner";
import { Tooltip } from "@nextui-org/tooltip";
import { toast } from 'sonner';

const AbsentStudentsPage = () => {
  const [date, setDate] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationStep, setNotificationStep] = useState(1);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [notificationTypes, setNotificationTypes] = useState([]);

  const { isOpen: isStudentModalOpen, onOpen: onStudentModalOpen, onClose: onStudentModalClose } = useDisclosure();
 

  const fetchClasses = async () => {
    if ((userProfile?.role === "admin" || userProfile?.role === "superadmin") && selectedDepartment) {
      try {
        setLoading(true);
        const response = await axios.get(`/api/utils/classes?department=${selectedDepartment}`);
        setClasses(response.data || []);
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error("Failed to fetch classes. Please try again.");
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
    setData(null);
    try {
      const response = await axios.get(`/api/absent-students?date=${date}&classId=${selectedClass}`);
      setData(response.data);
      toast.success("Absent students data fetched successfully.");
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(
        "Failed to fetch absent students data. Please try again.");
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
    onStudentModalOpen();
  };

  const handleSendNotificationsClick = () => {
    setShowNotificationModal(true);
    setNotificationStep(1);
    setSelectedStudents([]);
    setSelectAll(false);
    setSubject('');
    setBody('');
    setNotificationTypes([]);
  };

  const handleSelectAllChange = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedStudents(data.absentees.flatMap(session =>
        session.absentStudents.map(student => student._id)
      ));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSendNotifications = async () => {
    setLoading(true);
    try {
      await axios.post('/api/notifications', {
        userIds: selectedStudents,
        notification: {
          subject,
          body,
          type: 'custom',
          redirectUrl: '/notifications',
        },
        notificationTypes,
      });
      toast.success("Notifications sent successfully!",
      )
      setShowNotificationModal(false);
    } catch (error) {
      console.error('Error sending notifications:', error);
      toast.error("Failed to send notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderNotificationModalContent = () => {
    switch (notificationStep) {
      case 1:
        return (
          <>
            <ModalHeader>Select Students</ModalHeader>
            <ModalBody>
              <Checkbox
                isSelected={selectAll}
                onValueChange={handleSelectAllChange}
              >
                Select All
              </Checkbox>
              <Table aria-label="Absent students table">
                <TableHeader>
                  <TableColumn>Select</TableColumn>
                  <TableColumn>Roll Number</TableColumn>
                  <TableColumn>Name</TableColumn>
                  <TableColumn>Absent Sessions</TableColumn>
                </TableHeader>
                <TableBody>
                  {data && data.absentees.flatMap(session =>
                    session.absentStudents.map((student) => (
                      <TableRow key={student._id}>
                        <TableCell>
                          <Checkbox
                            isSelected={selectedStudents.includes(student._id)}
                            onValueChange={() => handleStudentSelect(student._id)}
                          />
                        </TableCell>
                        <TableCell>{student.rollNumber}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.totalAbsentSessions}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={() => setNotificationStep(2)} isDisabled={selectedStudents.length === 0}>
                Next
              </Button>
            </ModalFooter>
          </>
        );
      case 2:
        return (
          <>
            <ModalHeader>Compose Notification</ModalHeader>
            <ModalBody>
              <Input
                label="Subject"
                placeholder="Enter notification subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
              <Textarea
                label="Body"
                placeholder="Enter notification body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
              <div className="flex flex-col gap-2">
                <p className="text-small font-bold">Notification Types</p>
                <div className="flex flex-wrap gap-4">
                  {['email', 'push', 'sse'].map((type) => (
                    <Checkbox
                      key={type}
                      value={type}
                      isSelected={notificationTypes.includes(type)}
                      onValueChange={(isSelected) => {
                        if (isSelected) {
                          setNotificationTypes([...notificationTypes, type]);
                        } else {
                          setNotificationTypes(notificationTypes.filter(t => t !== type));
                        }
                      }}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Checkbox>
                  ))}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={() => setNotificationStep(1)}>
                Back
              </Button>
              <Button color="primary" onPress={handleSendNotifications} isLoading={loading}>
                Send Notifications
              </Button>
            </ModalFooter>
          </>
        );
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Absent Students Report</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-end gap-4">
            <Input
              type="date"
              label="Select Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="flex-1"
            />
            <Select
              label="Select Class"
              selectedKeys={[selectedClass]}
              onSelectionChange={(keys) => setSelectedClass(Array.from(keys)[0])}
              required
              className="flex-1"
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

      {loading && (
        <div className="flex justify-center items-center h-32">
          <Spinner size="lg" />
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Report Details</h3>
              <div className="flex gap-2">
                <Tooltip content="Send notifications to absent students">
                  <Button color="primary" onPress={handleSendNotificationsClick}>
                    Send Notifications
                  </Button>
                </Tooltip>
                <Chip color="primary" variant="flat">{formatDate(data.date)}</Chip>
              </div>
            </CardHeader>
            <CardBody>
              <p><strong>Class:</strong> {data.class || 'N/A'}</p>
              <p><strong>Total Sessions:</strong> {data.totalSessions || 'N/A'}</p>
            </CardBody>
          </Card>

          {data.absentees && data.absentees.length > 0 ? (
            <Accordion>
              {data.absentees.map((session, index) => (
                <AccordionItem key={index} aria-label={`Session ${session.session} - ${session.subject}`} title={`Session ${session.session} - ${session.subject}`}>
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
                <p className="text-center">No absentee data available for this date and class.</p>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      <Modal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        size="3xl"
      >
        <ModalContent>
          {renderNotificationModalContent()}
        </ModalContent>
      </Modal>
      
      <Modal isOpen={isStudentModalOpen} onClose={onStudentModalClose}>
        <ModalContent>
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
            <Button color="danger" variant="light" onPress={onStudentModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AbsentStudentsPage;