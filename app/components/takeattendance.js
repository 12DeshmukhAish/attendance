// "use client";
// import React, { useState, useEffect, useMemo } from "react";
// import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Checkbox, CheckboxGroup, Input } from "@nextui-org/react";
// import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
// import axios from 'axios';
// import Image from 'next/image';

// export default function App() {
//   const [selectedSubject, setSelectedSubject] = useState("Subject");
//   const [isTableVisible, setIsTableVisible] = useState(false);
//   const [students, setStudents] = useState([]);
//   const [selectedKeys, setSelectedKeys] = useState(new Set());
//   const [selectedSession, setSelectedSession] = useState([]);
//   const [selectedContentIds, setSelectedContentIds] = useState([]);
//   const [selectedBatch, setSelectedBatch] = useState(null);
//   const [profile, setProfile] = useState(null);
//   const [subjectDetails, setSubjectDetails] = useState(null);
//   const [batches, setBatches] = useState([]);
//   const [availableSessions, setAvailableSessions] = useState([]);
//   const [pointsDiscussed, setPointsDiscussed] = useState([]);

//   const [tgSessions, setTgSessions] = useState([]);
//   useEffect(() => {
//     const storedProfile = sessionStorage.getItem('userProfile');
//     if (storedProfile) {
//       setProfile(JSON.parse(storedProfile));
//     }
//   }, []);

//   const subjectOptions = useMemo(() =>
//     profile ? profile.subjects.map(sub => ({ _id: sub, name: sub })) : []
//     , [profile]);


//     const resetForm = () => {
//       setSelectedBatch(null);
//       setIsTableVisible(false);
//       setSelectedKeys(new Set());
//       setSelectedContentIds([]);
//       setSubjectDetails(null);
//       setSelectedSession([]);
//       setSelectedSubject("Subject");
//       setPointsDiscussed([]);
//     };
  
// const fetchAvailableSessions = async (subjectId, batchId) => {
//   try {
//     const today = new Date().toISOString().split('T')[0];
//     const response = await axios.get(`/api/utils/available-sessions?subjectId=${subjectId}&batchId=${batchId || ''}&date=${today}`);
//     setAvailableSessions(response.data.availableSessions);
//   } catch (error) {
//     console.error('Error fetching available sessions:', error);
//   }
// };

// useEffect(() => {
//   if (selectedSubject !== "Subject") {
//     fetchSubjectDetails(selectedSubject);
//     fetchAvailableSessions(selectedSubject, selectedBatch);
//   }
// }, [selectedSubject, selectedBatch]);
//   const fetchSubjectDetails = async (subjectId) => {
//     try {
//       const response = await axios.get(`/api/utils/batches?_id=${subjectId}&batchId=${selectedBatch || ''}`);
//       const { subject, batches, students } = response.data;
//       console.log("Received subject details:", subject);
//       console.log("Received batches:", batches);
//       console.log("Received students:", students);
//       setSubjectDetails(subject);
//       setBatches(batches || []);
//       setStudents(students || []);
//       if (subject.subType === 'tg') {
//         setTgSessions(subject.tgSessions || []);
//       }
//     } catch (error) {
//       console.error('Error fetching subject details:', error);
//     }
//   };

//   const handleTakeAttendance = () => {
//     setIsTableVisible(true);
//   };

//   const submitAttendance = async () => {
//     if (selectedSubject === "Subject") {
//       alert("Please select a subject");
//       return;
//     }

//     if (selectedSession.length === 0) {
//       alert("Please select at least one session");
//       return;
//     }

//     let presentStudentIds = [];
//     if (selectedKeys instanceof Set) {
//       if (selectedKeys.has("all")) {
//         presentStudentIds = students.map(student => student._id);
//       } else {
//         presentStudentIds = Array.from(selectedKeys);
//       }
//     } else {
//       presentStudentIds = selectedKeys.includes("all")
//         ? students.map(student => student._id)
//         : selectedKeys;
//     }
//     const attendanceRecords = students.map(student => ({
//       student: student._id,
//       status: presentStudentIds.includes(student._id) ? 'present' : 'absent'
//     }));

//     const attendanceData = {
//       subject: selectedSubject,
//       session: selectedSession,
//       attendanceRecords,
//       batchId: selectedBatch,
//       ...(subjectDetails.subType === 'tg' 
//           ? { pointsDiscussed } 
//           : { contents: selectedContentIds })
//   };

//     try {
//       const response = await axios.post('/api/attendance', attendanceData);
//       console.log('Attendance submitted successfully:', response.data);
//       alert("Attendance submitted successfully");
//       fetchSubjectDetails(selectedSubject);
//     } catch (error) {
//       console.error('Failed to submit attendance:', error);
//       alert("Failed to submit attendance");
//     } finally {
//       setSelectedBatch(null);
//       setIsTableVisible(false);
//       setSelectedKeys(new Set());
//       setSelectedContentIds([]);
//       setSubjectDetails(null)
//       setSelectedSession([]);
//       setSelectedSubject("Subject")
//       setPointsDiscussed('')
//     }
//   };
//   const TGSessionContent = useMemo(() => {
//     if (!subjectDetails || subjectDetails.subType !== 'tg') return null;

//     return (
//       <div>
//         <h2>TG Session Details</h2>
//         <div className="flex flex-col gap-2">
//           {pointsDiscussed.map((point, index) => (
//             <div key={index} className="flex gap-2">
//               <Input
//                 value={point}
//                 variant='bordered'
//                 onChange={(e) => {
//                   const newPoints = [...pointsDiscussed];
//                   newPoints[index] = e.target.value;
//                   setPointsDiscussed(newPoints);
//                 }}
//                 className="flex-grow"
//                 placeholder={`Point ${index + 1}`}
//               />
//               <Button variant='bordered' color='primary' onClick={() => {
//                 const newPoints = pointsDiscussed.filter((_, i) => i !== index);
//                 setPointsDiscussed(newPoints);

//               }}>Remove</Button>
//             </div>
//           ))}
//           <Button variant="shadow" className="max-w-1/2 mx-auto" color="primary" onClick={() => setPointsDiscussed([...pointsDiscussed, ''])}>
//             Add Point
//           </Button>
//         </div>
//       </div>
//     );
//   }, [subjectDetails, pointsDiscussed]);
//   const convertToDate = (customDate) => {
//     const { year, month, day } = customDate;
//     return new Date(year, month - 1, day + 1);
//   };

//   const TGSessionsHistory = ({ sessions }) => {
//     return (
//       <div className="mt-4">
//         <h2 className="text-xl font-bold mb-2">TG Sessions History</h2>
//         {sessions.map((session, index) => (
//           <div key={index} className="mb-4 p-4 border rounded">
//             <h3 className="font-semibold">Date: {new Date(session.date).toLocaleDateString()}</h3>
//             <ul className="list-disc pl-5">
//               {session.pointsDiscussed.map((point, pointIndex) => (
//                 <li key={pointIndex}>{point}</li>
//               ))}
//             </ul>
//           </div>
//         ))}
//       </div>
//     );
//   };

//   const CourseContentTable = useMemo(() => {
//     if (!subjectDetails ) return null;
//     if (!subjectDetails.content) return null;
//     return (
//       <Table aria-label="Course Content Table" className="max-h-[75vh]">
//         <TableHeader>
//           <TableColumn>Select</TableColumn>
//           <TableColumn>Title</TableColumn>
//           <TableColumn>Description</TableColumn>
//           <TableColumn>Proposed Date</TableColumn>
//           <TableColumn>Completed Date</TableColumn>
//           <TableColumn>References</TableColumn>
//           <TableColumn>CO</TableColumn>
//           <TableColumn>PO:</TableColumn>
//           <TableColumn>Status</TableColumn>
//         </TableHeader>
//         <TableBody>
//           {subjectDetails.content.map((content) => (
//             <TableRow key={content._id}>
//               <TableCell>
//                 <Checkbox
//                   isSelected={selectedContentIds.includes(content._id)}
//                   onChange={() => {
//                     setSelectedContentIds(prev =>
//                       prev.includes(content._id)
//                         ? prev.filter(id => id !== content._id)
//                         : [...prev, content._id]
//                     );
//                   }}
//                   isDisabled={content.status === 'covered'}
//                 />
//               </TableCell>
//               <TableCell>{content.title}</TableCell>
//               <TableCell>{content.description}</TableCell>
//               <TableCell>{content.proposedDate}</TableCell>
//               <TableCell>{content.completedDate}</TableCell>
//               <TableCell>{content.references} </TableCell>
//               <TableCell>{content.courseOutcomes} </TableCell>
//               <TableCell>{content.programOutcomes} </TableCell>
//               <TableCell>{content.status}</TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     );
//   }, [subjectDetails, selectedContentIds,pointsDiscussed]);
//   const StudentListTable = useMemo(() => {
//     const sortedStudents = students.slice().sort((a, b) => {
//       // Extract the numeric part of the roll number
//       const aNumericPart = parseInt(a.rollNumber.replace(/\D/g, ''), 10);
//       const bNumericPart = parseInt(b.rollNumber.replace(/\D/g, ''), 10);
  
//       // Compare the numeric parts of the roll numbers
//       return aNumericPart - bNumericPart;
//     });
  
//     return (
//       <Table
//         aria-label="Attendance Table"
//         selectionMode="multiple"
//         selectedKeys={selectedKeys}
//         onSelectionChange={setSelectedKeys}
//         className="max-h-[75vh]"
//       >
//         <TableHeader>
//           <TableColumn>Roll Number</TableColumn>
//           <TableColumn>Name</TableColumn>
//         </TableHeader>
//         <TableBody>
//           {sortedStudents.map((student) => (
//             <TableRow key={student._id}>
//               <TableCell>{student.rollNumber}</TableCell>
//               <TableCell>{student.name}</TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     );
//   }, [students, selectedKeys]);

//   return (
//     <div className="flex flex-col gap-4 p-4">
//       <div className="flex space-x-4 mb-4 items-center">
//         <Dropdown>
//           <DropdownTrigger>
//             <Button variant="bordered" className="capitalize">
//               {selectedSubject}
//             </Button>
//           </DropdownTrigger>
//           <DropdownMenu
//             aria-label="Subject selection"
//             variant="flat"
//             disallowEmptySelection
//             selectionMode="single"
//             selectedKeys={new Set([selectedSubject])}
//             onSelectionChange={(keys) => setSelectedSubject(Array.from(keys)[0])}
//           >
//             {subjectOptions.map((option) => (
//               <DropdownItem key={option._id}>{option.name}</DropdownItem>
//             ))}
//           </DropdownMenu>
//         </Dropdown>
//         {subjectDetails?.subType !== "theory" &&
//           < Dropdown >
//             <DropdownTrigger>
//               <Button variant="bordered" className="capitalize">
//                 {selectedBatch ? `Batch ${selectedBatch}` : "Select Batch"}
//               </Button>
//             </DropdownTrigger>
//             <DropdownMenu
//               aria-label="Batch selection"
//               variant="flat"
//               disallowEmptySelection
//               selectionMode="single"
//               selectedKeys={selectedBatch ? new Set([selectedBatch]) : new Set()}
//               onSelectionChange={(keys) => setSelectedBatch(Array.from(keys)[0])}
//             >
//               {batches && batches.map((batch) => (
//                 <DropdownItem key={batch}>{batch}</DropdownItem>
//               ))}
//             </DropdownMenu>
//           </Dropdown>
//         }
//         <CheckboxGroup
//           orientation="horizontal"
//           label="Select Sessions"
//           value={selectedSession}
//           onChange={setSelectedSession}
//         >
//           {availableSessions.map(session => (
//             <Checkbox key={session} value={session.toString()}>
//               {session}
//             </Checkbox>
//           ))}
//         </CheckboxGroup>

//         <Button color="primary" variant="shadow" onClick={handleTakeAttendance}>
//           Take Attendance
//         </Button>
//       </div>

//       {
//         selectedSubject !== "Subject" && subjectDetails && isTableVisible && (
//           <div className="flex gap-4 mb-4">
//            <div className="w-1/2">
//             <h2> {subjectDetails.subType === 'tg' ? "Points Discussion" : "Course Content"}</h2>
//             {subjectDetails.subType === 'tg' ? TGSessionContent : CourseContentTable}
//             {subjectDetails.subType === 'tg' && <TGSessionsHistory sessions={tgSessions} />}
//           </div>
//             <div className="w-1/2">
//               <h2>Students List</h2>
//               {StudentListTable}
//             </div>
//           </div>
//         )
//       }

//       {
//         isTableVisible && selectedSubject && subjectDetails && (
//           <Button color="primary" className="max-w-[50%] mx-auto" variant="shadow" onClick={submitAttendance}>
//             Submit Attendance
//           </Button>
//         )
//       }

//       {
//         !students.length && !isTableVisible && (
//           <div className="flex justify-center mt-4">
//             <Image src="/attendance.svg" alt="Attendance Illustration" width={700} height={300} />
//           </div>
//         )
//       }
//     </div >
//   );
// }

"use client"
import React, { useState, useEffect, useMemo,useCallback } from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Checkbox, CheckboxGroup, Input } from "@nextui-org/react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import axios from 'axios';
import Image from 'next/image';


const PointInput = ({ value, onChange, onRemove, canRemove, index }) => (
  <div className="flex gap-2">
    <Input
      key={`point-input-${index}`}
      value={value}
      onChange={onChange}
      variant="bordered"
      className="flex-grow"
      placeholder={`Point ${index + 1}`}
    />
    {canRemove && (
      <Button 
        variant="bordered" 
        color="danger"
        onClick={onRemove}
      >
        Remove
      </Button>
    )}
  </div>
);
export default function App() {
  const [selectedSubject, setSelectedSubject] = useState("Subject");
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [selectedSession, setSelectedSession] = useState([]);
  const [selectedContentIds, setSelectedContentIds] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subjectDetails, setSubjectDetails] = useState(null);
  const [batches, setBatches] = useState([]);
  const [availableSessions, setAvailableSessions] = useState([]);
  const [pointsDiscussed, setPointsDiscussed] = useState(['']); // Initialize with empty string array
  const [tgSessions, setTgSessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [pointInputs, setPointInputs] = useState([{ id: Date.now(), value: '' }]);

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

  const subjectOptions = useMemo(() =>
    profile ? profile.subjects.map(sub => ({ _id: sub, name: sub })) : []
  , [profile]);

  const resetForm = () => {
    setSelectedBatch(null);
    setIsTableVisible(false);
    setSelectedKeys(new Set());
    setSelectedContentIds([]);
    setSubjectDetails(null);
    setSelectedSession([]);
    setSelectedSubject("Subject");
    setPointsDiscussed(['']);
  };

  const fetchAvailableSessions = async (subjectId, batchId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`/api/utils/available-sessions?subjectId=${subjectId}&batchId=${batchId || ''}&date=${today}`);
      setAvailableSessions(response.data.availableSessions);
    } catch (error) {
      console.error('Error fetching available sessions:', error);
    }
  };

  useEffect(() => {
    if (selectedSubject !== "Subject") {
      fetchSubjectDetails(selectedSubject);
      fetchAvailableSessions(selectedSubject, selectedBatch);
    }
  }, [selectedSubject, selectedBatch]);

  const fetchSubjectDetails = async (subjectId) => {
    try {
      const response = await axios.get(`/api/utils/batches?_id=${subjectId}&batchId=${selectedBatch || ''}`);
      const { subject, batches, students } = response.data;
      setSubjectDetails(subject);
      setBatches(batches || []);
      setStudents(students || []);
      if (subject.subType === 'tg') {
        setTgSessions(subject.tgSessions || []);
        setPointsDiscussed(['']); // Reset points discussed for TG
      }
    } catch (error) {
      console.error('Error fetching subject details:', error);
    }
  };

  const handleTakeAttendance = () => {
    setIsTableVisible(true);
  };

  const validateTGSession = () => {
    if (!selectedDate) {
      alert("Please select a date for the TG session");
      return false;
    }

    const existingSession = tgSessions.find(session => 
      new Date(session.date).toISOString().split('T')[0] === selectedDate
    );

    if (existingSession) {
      alert("A TG session already exists for this date");
      return false;
    }

    const validPoints = pointInputs.filter(point => point.value.trim());
    if (validPoints.length === 0) {
      alert("Please add at least one point discussed");
      return false;
    }

    return true;
  };

  const submitAttendance = async () => {
    if (selectedSubject === "Subject") {
      alert("Please select a subject");
      return;
    }

    if (selectedSession.length === 0) {
      alert("Please select at least one session");
      return;
    }

    if (subjectDetails?.subType === 'tg' && !validateTGSession()) {
      return;
    }

    let presentStudentIds = [];
    if (selectedKeys instanceof Set) {
      presentStudentIds = Array.from(selectedKeys);
      if (selectedKeys.has("all")) {
        presentStudentIds = students.map(student => student._id);
      }
    }

    const attendanceData = {
      subject: selectedSubject,
      session: selectedSession,
      attendanceRecords: students.map(student => ({
        student: student._id,
        status: presentStudentIds.includes(student._id) ? 'present' : 'absent'
      })),
      batchId: selectedBatch,
      ...(subjectDetails.subType === 'tg' 
        ? { 
            tgSession: {
              date: selectedDate,
              pointsDiscussed: pointInputs
                .filter(point => point.value.trim())
                .map(point => point.value.trim())
            }
          } 
        : { contents: selectedContentIds })
    };

    try {
      const response = await axios.post('/api/attendance', attendanceData);
      alert("Attendance submitted successfully");
      if (subjectDetails.subType === 'tg') {
        const updatedSubject = await fetchSubjectDetails(selectedSubject);
        setTgSessions(updatedSubject?.tgSessions || []);
      }
      resetForm();
    } catch (error) {
      console.error('Failed to submit attendance:', error);
      alert("Failed to submit attendance");
    }
  };
  const TGSessionContent = () => {
    if (!subjectDetails || subjectDetails.subType !== 'tg') return null;

    const handleAddPoint = () => {
      setPointInputs(current => [...current, { id: Date.now(), value: '' }]);
    };

    const handleRemovePoint = (id) => {
      setPointInputs(current => current.filter(point => point.id !== id));
    };

    const handlePointChange = (id, newValue) => {
      setPointInputs(current =>
        current.map(point =>
          point.id === id ? { ...point, value: newValue } : point
        )
      );
    };

    return (
      <div className="space-y-4">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Session Date</label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            variant="bordered"
            className="max-w-xs"
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Points Discussed</h3>
          <div className="space-y-2">
            {pointInputs.map((point, index) => (
              <PointInput
                key={point.id}
                value={point.value}
                onChange={(e) => handlePointChange(point.id, e.target.value)}
                onRemove={() => handleRemovePoint(point.id)}
                canRemove={pointInputs.length > 1}
                index={index}
              />
            ))}
          </div>
          <Button 
            variant="shadow" 
            color="primary" 
            onClick={handleAddPoint}
            className="mt-2"
          >
            Add Point
          </Button>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Previous TG Sessions</h3>
          <div className="space-y-4">
            {tgSessions.length > 0 ? (
              tgSessions
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((session, sessionIndex) => (
                  <div key={session.date} className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-2">
                      Date: {new Date(session.date).toLocaleDateString()}
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {session.pointsDiscussed.map((point, pointIndex) => (
                        <li key={`${session.date}-point-${pointIndex}`} className="text-sm">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
            ) : (
              <p className="text-gray-500">No previous sessions recorded</p>
            )}
          </div>
        </div>
      </div>
    );
  };


  const CourseContentTable = useMemo(() => {
    if (!subjectDetails || !subjectDetails.content) return null;

    return (
      <Table aria-label="Course Content Table" className="max-h-[75vh]">
        <TableHeader>
          <TableColumn>Select</TableColumn>
          <TableColumn>Title</TableColumn>
          <TableColumn>Description</TableColumn>
          <TableColumn>Proposed Date</TableColumn>
          <TableColumn>Completed Date</TableColumn>
          <TableColumn>References</TableColumn>
          <TableColumn>CO</TableColumn>
          <TableColumn>PO</TableColumn>
          <TableColumn>Status</TableColumn>
        </TableHeader>
        <TableBody>
          {subjectDetails.content.map((content) => {
            const isCovered = subjectDetails.subType === 'practical' 
              ? content.batchStatus?.find(b => b.batchId === selectedBatch)?.status === 'covered'
              : content.status === 'covered';

            return (
              <TableRow key={content._id}>
                <TableCell>
                  <Checkbox
                    isSelected={selectedContentIds.includes(content._id)}
                    onChange={() => {
                      setSelectedContentIds(prev =>
                        prev.includes(content._id)
                          ? prev.filter(id => id !== content._id)
                          : [...prev, content._id]
                      );
                    }}
                    isDisabled={isCovered}
                  />
                </TableCell>
                <TableCell>{content.title}</TableCell>
                <TableCell>{content.description}</TableCell>
                <TableCell>{content.proposedDate}</TableCell>
                <TableCell>
                  {subjectDetails.subType === 'practical' 
                    ? content.batchStatus?.find(b => b.batchId === selectedBatch)?.completedDate 
                    : content.completedDate}
                </TableCell>
                <TableCell>{content.references}</TableCell>
                <TableCell>{content.courseOutcomes}</TableCell>
                <TableCell>{content.programOutcomes}</TableCell>
                <TableCell>
                  {subjectDetails.subType === 'practical'
                    ? content.batchStatus?.find(b => b.batchId === selectedBatch)?.status || 'not_covered'
                    : content.status}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  }, [subjectDetails, selectedContentIds, selectedBatch]);

  const StudentListTable = useMemo(() => {
    const sortedStudents = [...students].sort((a, b) => {
      const aNum = parseInt(a.rollNumber.replace(/\D/g, ''), 10);
      const bNum = parseInt(b.rollNumber.replace(/\D/g, ''), 10);
      return aNum - bNum;
    });

    return (
      <Table
        aria-label="Attendance Table"
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        className="max-h-[75vh]"
      >
        <TableHeader>
          <TableColumn>Roll Number</TableColumn>
          <TableColumn>Name</TableColumn>
        </TableHeader>
        <TableBody>
          {sortedStudents.map((student) => (
            <TableRow key={student._id}>
              <TableCell>{student.rollNumber}</TableCell>
              <TableCell>{student.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }, [students, selectedKeys]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex space-x-4 mb-4 items-center">
        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered" className="capitalize">
              {selectedSubject}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Subject selection"
            variant="flat"
            disallowEmptySelection
            selectionMode="single"
            selectedKeys={new Set([selectedSubject])}
            onSelectionChange={(keys) => setSelectedSubject(Array.from(keys)[0])}
          >
            {subjectOptions.map((option) => (
              <DropdownItem key={option._id}>{option.name}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        {subjectDetails?.subType !== "theory" && (
          <Dropdown>
            <DropdownTrigger>
              <Button variant="bordered" className="capitalize">
                {selectedBatch ? `Batch ${selectedBatch}` : "Select Batch"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Batch selection"
              variant="flat"
              disallowEmptySelection
              selectionMode="single"
              selectedKeys={selectedBatch ? new Set([selectedBatch]) : new Set()}
              onSelectionChange={(keys) => setSelectedBatch(Array.from(keys)[0])}
            >
              {batches.map((batch) => (
                <DropdownItem key={batch}>{batch}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        )}

        <CheckboxGroup
          orientation="horizontal"
          label="Select Sessions"
          value={selectedSession}
          onChange={setSelectedSession}
        >
          {availableSessions.map(session => (
            <Checkbox key={session} value={session.toString()}>
              {session}
            </Checkbox>
          ))}
        </CheckboxGroup>

        <Button color="primary" variant="shadow" onClick={handleTakeAttendance}>
          Take Attendance
        </Button>
      </div>

      {selectedSubject !== "Subject" && subjectDetails && isTableVisible && (
        <div className="flex gap-4 mb-4">
          <div className="w-1/2">
            <h2>{subjectDetails.subType === 'tg' ? "Points Discussion" : "Course Content"}</h2>
            {subjectDetails.subType === 'tg' ? <TGSessionContent /> : CourseContentTable}
          </div>
          <div className="w-1/2">
            <h2>Students List</h2>
            {StudentListTable}
          </div>
        </div>
      )}

      {isTableVisible && selectedSubject && subjectDetails && (
        <Button 
          color="primary" 
          className="max-w-[50%] mx-auto" 
          variant="shadow" 
          onClick={submitAttendance}
        >
          Submit Attendance
        </Button>
      )}

      {!students.length && !isTableVisible && (
        <div className="flex justify-center mt-4">
          <Image src="/attendance.svg" alt="Attendance Illustration" width={700} height={300} />
        </div>
      )}
    </div>
  );
}