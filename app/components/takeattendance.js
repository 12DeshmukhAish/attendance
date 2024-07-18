// "use client"
// import React, { useState, useEffect } from "react";
// import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, CheckboxGroup, Checkbox } from "@nextui-org/react";
// import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
// import axios from 'axios';
// import Image from 'next/image';

// export default function App() {
//   const [selectedDepartment, setSelectedDepartment] = useState("Department");
//   const [selectedClass, setSelectedClass] = useState("Class");
//   const [selectedSubject, setSelectedSubject] = useState("Subject");
//   // const [selectedType, setSelectedType] = useState("Type");
//   const [isTableVisible, setIsTableVisible] = useState(false);
//   const [students, setStudents] = useState([]);
//   const [selectedKeys, setSelectedKeys] = useState(new Set());
//   const [selectedSessions, setSelectedSessions] = useState([]);
//   const [selectedContents, setSelectedContents] = useState([]);
//   const [sessions] = useState([1, 2, 3, 4, 5, 6, 7]);
//   const [profile, setProfile] = useState(null); // State to store user profile
//   const [subjectDetails, setSubjectDetails] = useState(null); // State to store subject details

//   // const typeOptions = [
//   //   { key: "Theory", label: "Theory" },
//   //   { key: "Practical", label: "Practical" },
//   // ];

//   // Fetch profile data from session storage on component mount
//   useEffect(() => {
//     const storedProfile = sessionStorage.getItem('userProfile');
//     if (storedProfile) {
//       setProfile(JSON.parse(storedProfile));
//     }
//   }, []);

//   // Use profile data to initialize departmentOptions, classOptions, and subjectOptions
//   const departmentOptions = profile ? profile.department.map(dep => ({ key: dep, label: dep })) : [];
//   const classOptions = profile ? profile.classes.map(cls => ({ key: cls._id, label: cls.name })) : [];
//   const subjectOptions = profile ? profile.subjects.map(sub => ({ _id: sub, name: sub })) : [];


//   // Fetch subject details when subject changes
//   useEffect(() => {
//     if (selectedSubject !== "Subject") {
//       console.log(selectedSubject);
//       fetchSubjectDetails(selectedSubject);
//       console.log(subjectDetails);
//     }
//   }, [selectedSubject]);

//   const fetchSubjectDetails = async (subjectId) => {
//     try {
//       // Simulated API call to fetch subject details based on subjectId
//       const response = await axios.get(`/api/subject?_id=${subjectId}`);
//       const { subject, students } = response.data;
//       console.log(response.data);
//       setSubjectDetails(subject);
//       setStudents(students || []);
//     } catch (error) {
//       console.error('Error fetching subject details:', error);
//     }
//   };

//   const handleTakeAttendance = () => {
//     setIsTableVisible(true);
//   };

//   const handleSessionChange = (session) => {
//     setSelectedSessions(prev =>
//       prev.includes(session)
//         ? prev.filter(s => s !== session)
//         : [...prev, session]
//     );
//   };

//   const submitAttendance = async () => {
//     if (selectedSubject === "Subject") {
//       alert("Please select a subject");
//       return;
//     }

//     if (selectedSessions.length === 0) {
//       alert("Please select at least one session");
//       return;
//     }

//     let selectedStudents = [];
//     if (selectedKeys instanceof Set) {
//       if (selectedKeys.has("all")) {
//         selectedStudents = students.map(student => student._id); // Use student._id here
//       } else {
//         selectedStudents = Array.from(selectedKeys);
//       }
//     } else {
//       selectedStudents = selectedKeys.includes("all")
//         ? students.map(student => student._id) // Use student._id here
//         : selectedKeys;
//     }

//     const attendanceData = {
//       date: new Date(),
//       subject: selectedSubject,
//       sessions: selectedSessions,
//       records: selectedStudents.map(studentId => ({
//         student: studentId,
//         status: 'present'
//       })),
//       contents: selectedContents
//     };

//     try {
//       // Simulated API call to submit attendance data
//       const response = await axios.post('/api/attendance', attendanceData);
//       console.log('Attendance submitted successfully:', response.data);
//       alert("Attendance submitted successfully");

//     } catch (error) {
//       console.error('Failed to submit attendance:', error);
//       alert("Failed to submit attendance");
//     }
//   };

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

//         <div className="flex flex-wrap gap-4 items-center">
//           {sessions.map(session => (
//             <Checkbox
//               key={session}
//               isSelected={selectedSessions.includes(session)}
//               onValueChange={() => handleSessionChange(session)}
//             >
//               {session}
//             </Checkbox>
//           ))}
//         </div>

//         <Button color="primary" variant="shadow" onClick={handleTakeAttendance}>
//           Take Attendance
//         </Button>
//       </div>


//       {selectedSubject !== "Subject" && subjectDetails && (
//         <div className="mb-4">
//           <h2>Subject Content</h2>
//           <CheckboxGroup
//             value={selectedContents}
//             onChange={setSelectedContents}
//           >
//             {subjectDetails.content && subjectDetails.content
//               .filter(content => content.status !== "covered")
//               .map((content, index) => (
//                 <Checkbox key={index} value={content.name}>
//                   {index + 1} {content.name}
//                 </Checkbox>
//               ))}
//           </CheckboxGroup>
//         </div>
//       )}


//       {isTableVisible && (
//         <div className="flex flex-col gap-3 mt-4">
//           <Table
//             aria-label="Attendance table"
//             selectionMode="multiple"
//             selectedKeys={selectedKeys}
//             onSelectionChange={setSelectedKeys}
//           >
//             <TableHeader>
//               <TableColumn>Roll Number</TableColumn>
//               <TableColumn>Name</TableColumn>
//               {/* <TableColumn>Status</TableColumn> */}
//             </TableHeader>
//             <TableBody>
//               {students.map((student) => (
//                 <TableRow key={student._id}>
//                   <TableCell>{student.rollNumber}</TableCell>
//                   <TableCell>{student.name}</TableCell>
//                   {/* <TableCell>{student.status}</TableCell> */}
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>

//           <Button color="primary" variant="shadow" onClick={submitAttendance}>
//             Submit Attendance
//           </Button>
//         </div>
//       )}
//       {!students &&
//         <div className="flex justify-center mt-4">
//           <Image src="/attendance.svg" alt="Attendance Illustration" width={700} height={300} />
//         </div>
//       }
//     </div>
//   );
// }
// "use client"
// import React, { useState, useEffect } from "react";
// import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Checkbox } from "@nextui-org/react";
// import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
// import axios from 'axios';
// import Image from 'next/image';

// export default function App() {
//   const [selectedDepartment, setSelectedDepartment] = useState("Department");
//   const [selectedClass, setSelectedClass] = useState("Class");
//   const [selectedSubject, setSelectedSubject] = useState("Subject");
//   const [isTableVisible, setIsTableVisible] = useState(false);
//   const [students, setStudents] = useState([]);
//   const [selectedKeys, setSelectedKeys] = useState(new Set());
//   const [selectedSessions, setSelectedSessions] = useState([]);
//   const [selectedContents, setSelectedContents] = useState([]);
//   const [sessions] = useState([1, 2, 3, 4, 5, 6, 7]);
//   const [profile, setProfile] = useState(null); // State to store user profile
//   const [subjectDetails, setSubjectDetails] = useState(null); // State to store subject details

//   // Fetch profile data from session storage on component mount
//   useEffect(() => {
//     const storedProfile = sessionStorage.getItem('userProfile');
//     if (storedProfile) {
//       setProfile(JSON.parse(storedProfile));
//     }
//   }, []);

//   // Use profile data to initialize departmentOptions, classOptions, and subjectOptions
//   // const departmentOptions = profile?.department
//   // const classOptions = profile ? profile.classes.map(cls => ({ key: cls._id, label: cls.name })) : [];
//   const subjectOptions = profile ? profile.subjects.map(sub => ({ _id: sub, name: sub })) : [];

//   // Fetch subject details when subject changes
//   useEffect(() => {
//     if (selectedSubject !== "Subject") {
//       console.log(selectedSubject);
//       fetchSubjectDetails(selectedSubject);
//       console.log(subjectDetails);
//     }
//   }, [selectedSubject]);

//   const fetchSubjectDetails = async (subjectId) => {
//     try {
//       const response = await axios.get(`/api/subject?_id=${subjectId}`);
//       const { subject, students } = response.data;
//       console.log(response.data);
//       setSubjectDetails(subject);
//       setStudents(students || []);
//     } catch (error) {
//       console.error('Error fetching subject details:', error);
//     }
//   };

//   const handleTakeAttendance = () => {
//     setIsTableVisible(true);
//   };

//   const handleSessionChange = (session) => {
//     setSelectedSessions(prev =>
//       prev.includes(session)
//         ? prev.filter(s => s !== session)
//         : [...prev, session]
//     );
//   };

//   const submitAttendance = async () => {
//     if (selectedSubject === "Subject") {
//       alert("Please select a subject");
//       return;
//     }

//     if (selectedSessions.length === 0) {
//       alert("Please select at least one session");
//       return;
//     }

//     let selectedStudents = [];
//     if (selectedKeys instanceof Set) {
//       if (selectedKeys.has("all")) {
//         selectedStudents = students.map(student => student._id); // Use student._id here
//       } else {
//         selectedStudents = Array.from(selectedKeys);
//       }
//     } else {
//       selectedStudents = selectedKeys.includes("all")
//         ? students.map(student => student._id) // Use student._id here
//         : selectedKeys;
//     }

//     const attendanceData = {
//       date: new Date(),
//       subject: selectedSubject,
//       sessions: selectedSessions,
//       records: selectedStudents.map(studentId => ({
//         student: studentId,
//         status: 'present'
//       })),
//       contents: selectedContents
//     };

//     try {
//       const response = await axios.post('/api/attendance', attendanceData);
//       console.log('Attendance submitted successfully:', response.data);
//       alert("Attendance submitted successfully");

//     } catch (error) {
//       console.error('Failed to submit attendance:', error);
//       alert("Failed to submit attendance");
//     }
//   };

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

//         <div className="flex flex-wrap gap-4 items-center">
//           {sessions.map(session => (
//             <Checkbox
//               key={session}
//               isSelected={selectedSessions.includes(session)}
//               onValueChange={() => handleSessionChange(session)}
//             >
//               {session}
//             </Checkbox>
//           ))}
//         </div>

//         <Button color="primary" variant="shadow" onClick={handleTakeAttendance}>
//           Take Attendance
//         </Button>
//       </div>

//       {selectedSubject !== "Subject" && subjectDetails && (
//         <div className="flex gap-4 mb-4">
//           <div className="w-1/2">
//             <h2>Course Content</h2>
//             <Table aria-label="Course Content Table">
//               <TableHeader>
//                 <TableColumn>Title</TableColumn>
//                 <TableColumn>Description</TableColumn>
//                 <TableColumn>Proposed Date</TableColumn>
//                 <TableColumn>Completed Date</TableColumn>
//                 <TableColumn>References</TableColumn>
//                 <TableColumn>Status</TableColumn>
//               </TableHeader>
//               <TableBody>
//                 {subjectDetails.content && subjectDetails.content.map((content, index) => (
//                   <TableRow key={index}>
//                     <TableCell>{content.title}</TableCell>
//                     <TableCell>{content.description}</TableCell>
//                     <TableCell>{content.proposedDate}</TableCell>
//                     <TableCell>{content.completedDate}</TableCell>
//                     <TableCell>{content.references}</TableCell>
//                     <TableCell>{content.status}</TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
//           <div className="w-1/2">
//             <Table
//               aria-label="Attendance table"
//               selectionMode="multiple"
//               selectedKeys={selectedKeys}
//               onSelectionChange={setSelectedKeys}
//             >
//               <TableHeader>
//                 <TableColumn>Roll Number</TableColumn>
//                 <TableColumn>Name</TableColumn>
//               </TableHeader>
//               <TableBody>
//                 {students.map((student) => (
//                   <TableRow key={student._id}>
//                     <TableCell>{student.rollNumber}</TableCell>
//                     <TableCell>{student.name}</TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
//         </div>
//       )}

//       {isTableVisible && (
//         <Button color="primary" variant="shadow" onClick={submitAttendance}>
//           Submit Attendance
//         </Button>
//       )}

//       {!students && (
//         <div className="flex justify-center mt-4">
//           <Image src="/attendance.svg" alt="Attendance Illustration" width={700} height={300} />
//         </div>
//       )}
//     </div>
//   );
// }
"use client"
import React, { useState, useEffect } from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Checkbox } from "@nextui-org/react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import axios from 'axios';
import Image from 'next/image';

export default function App() {
  const [selectedSubject, setSelectedSubject] = useState("Subject");
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedContents, setSelectedContents] = useState([]);
  const [sessions] = useState([1, 2, 3, 4, 5, 6, 7]);
  const [profile, setProfile] = useState(null);
  const [subjectDetails, setSubjectDetails] = useState(null);

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

  const subjectOptions = profile ? profile.subjects.map(sub => ({ _id: sub, name: sub })) : [];

  useEffect(() => {
    if (selectedSubject !== "Subject") {
      fetchSubjectDetails(selectedSubject);
    }
  }, [selectedSubject]);

  const fetchSubjectDetails = async (subjectId) => {
    try {
      const response = await axios.get(`/api/subject?_id=${subjectId}`);
      const { subject, students } = response.data;
      setSubjectDetails(subject);
      setStudents(students || []);
    } catch (error) {
      console.error('Error fetching subject details:', error);
    }
  };

  const handleTakeAttendance = () => {
    setIsTableVisible(true);
  };

  const submitAttendance = async () => {
    if (selectedSubject === "Subject") {
      alert("Please select a subject");
      return;
    }

    if (!selectedSession) {
      alert("Please select a session");
      return;
    }

    let selectedStudents = [];
    if (selectedKeys instanceof Set) {
      if (selectedKeys.has("all")) {
        selectedStudents = students.map(student => student._id); // Use student._id here
      } else {
        selectedStudents = Array.from(selectedKeys);
      }
    } else {
      selectedStudents = selectedKeys.includes("all")
        ? students.map(student => student._id) // Use student._id here
        : selectedKeys;
    }
    const attendanceData = {
      subject: selectedSubject,
      session: selectedSession,
      presentStudents: selectedStudents,
      contents: selectedContents
    };

    try {
      const response = await axios.post('/api/attendance', attendanceData);
      console.log('Attendance submitted successfully:', response.data);
      alert("Attendance submitted successfully");
      fetchSubjectDetails(selectedSubject); // Refresh subject details
    } catch (error) {
      console.error('Failed to submit attendance:', error);
      alert("Failed to submit attendance");
    }
  };

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

        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered" className="capitalize">
              {selectedSession ? `Session ${selectedSession}` : "Select Session"}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Session selection"
            variant="flat"
            disallowEmptySelection
            selectionMode="single"
            selectedKeys={selectedSession ? new Set([selectedSession.toString()]) : new Set()}
            onSelectionChange={(keys) => setSelectedSession(parseInt(Array.from(keys)[0]))}
          >
            {sessions.map((session) => (
              <DropdownItem key={session.toString()}>Session {session}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        <Button color="primary" variant="shadow" onClick={handleTakeAttendance}>
          Take Attendance
        </Button>
      </div>

      {selectedSubject !== "Subject" && subjectDetails && (
        <div className="flex gap-4 mb-4">
          <div className="w-1/2">
            <h2>Course Content</h2>
            <Table aria-label="Course Content Table">
              <TableHeader>
                <TableColumn>Select</TableColumn>
                <TableColumn>Title</TableColumn>
                <TableColumn>Description</TableColumn>
                <TableColumn>Proposed Date</TableColumn>
                <TableColumn>Completed Date</TableColumn>
                <TableColumn>References</TableColumn>
                <TableColumn>Status</TableColumn>
              </TableHeader>
              <TableBody>
                {subjectDetails.content && subjectDetails.content.map((content, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Checkbox
                        isSelected={selectedContents.includes(content.title)}
                        onChange={() => {
                          setSelectedContents(prev => 
                            prev.includes(content.title)
                              ? prev.filter(item => item !== content.title)
                              : [...prev, content.title]
                          );
                        }}
                        isDisabled={content.status === 'covered'}
                      />
                    </TableCell>
                    <TableCell>{content.title}</TableCell>
                    <TableCell>{content.description}</TableCell>
                    <TableCell>{content.proposedDate}</TableCell>
                    <TableCell>{content.completedDate}</TableCell>
                    <TableCell>{content.references}</TableCell>
                    <TableCell>{content.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="w-1/2">
            <Table
              aria-label="Attendance table"
              selectionMode="multiple"
              selectedKeys={selectedKeys}
              onSelectionChange={setSelectedKeys}
            >
              <TableHeader>
                <TableColumn>Roll Number</TableColumn>
                <TableColumn>Name</TableColumn>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell>{student.rollNumber}</TableCell>
                    <TableCell>{student.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {isTableVisible && (
        <Button color="primary" variant="shadow" onClick={submitAttendance}>
          Submit Attendance
        </Button>
      )}

      {!students.length && (
        <div className="flex justify-center mt-4">
          <Image src="/attendance.svg" alt="Attendance Illustration" width={700} height={300} />
        </div>
      )}
    </div>
  );
}