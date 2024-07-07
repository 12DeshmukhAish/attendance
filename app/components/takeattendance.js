// "use client";
// import React, { useState, useEffect } from "react";
// import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, CheckboxGroup, Checkbox } from "@nextui-org/react";
// import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
// import axios from 'axios';

// export default function App() {
//   const [selectedDepartment, setSelectedDepartment] = useState("Department");
//   const [selectedClass, setSelectedClass] = useState("Class");
//   const [selectedSubject, setSelectedSubject] = useState("Subject");
//   const [selectedType, setSelectedType] = useState("Type");
//   const [isTableVisible, setIsTableVisible] = useState(false);
//   const [classOptions, setClassOptions] = useState([]);
//   const [subjectOptions, setSubjectOptions] = useState([]);
//   const [students, setStudents] = useState([]);
//   const [selectedKeys, setSelectedKeys] = useState(new Set());
//   const [selectedSessions, setSelectedSessions] = useState([]);
//   const [subjectContent, setSubjectContent] = useState([]);
//   const [sessions] = useState([1, 2, 3, 4, 5, 6, 7]); 
//   const departmentOptions = [
//     { key: "Department", label: "Department" },
//     { key: "CSE", label: "CSE" },
//     { key: "ENTC", label: "ENTC" },
//     { key: "Civil", label: "Civil" },
//     { key: "Electrical", label: "Electrical" },
//     { key: "Mechanical", label: "Mechanical" },
//   ];

//   const typeOptions = [
//     { key: "Theory", label: "Theory" },
//     { key: "Practical", label: "Practical" },
//   ];

//   const columns = [
//     {
//       key: "rollNumber",
//       label: "ROLL NO.",
//     },
//     {
//       key: "name",
//       label: "NAME",
//     },
//   ];

//   useEffect(() => {
//     if (selectedDepartment !== "Department") {
//       fetchClasses(selectedDepartment);
//     }
//   }, [selectedDepartment]);

//   useEffect(() => {
//     if (selectedClass !== "Class") {
//       fetchSubjects(selectedClass);
//       fetchStudents(selectedClass);
//     }
//   }, [selectedClass]);

//   useEffect(() => {
//     if (selectedSubject !== "Subject") {
//       console.log(selectedSubject);
//     }
//   }, [selectedSubject]);

//   const fetchClasses = async (department) => {
//     try {
//       const response = await axios.get(`/api/classes?department=${department}`);
//       setClassOptions(response.data.map(cls => ({ key: cls._id, label: cls.name })));
//     } catch (error) {
//       console.error('Failed to fetch classes', error);
//     }
//   };

//   const fetchSubjects = async () => {
//     try {
//       const params = {
//         department: selectedDepartment !== "Department" ? selectedDepartment : undefined,
//         subType: selectedType !== "Type" ? selectedType : undefined,
//         class: selectedClass !== "Class" ? selectedClass : undefined
//       };
//       const response = await axios.get('/api/subject', { params });
//       setSubjectOptions(response.data || []);
//     } catch (error) {
//       console.error('Error fetching subjects:', error);
//     }
//   };

//   const fetchStudents = async (classId) => {
//     try {
//       const response = await axios.get(`/api/fetchstudents?classId=${classId}`);
//       setStudents(response.data.map(student => ({
//         key: student._id,
//         rollNumber: student.rollNumber,
//         name: student.name,
//         status: 'Absent'
//       })));
//     } catch (error) {
//       console.error('Failed to fetch students', error);
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
//         selectedStudents = students.map(student => student.key);
//       } else {
//         selectedStudents = Array.from(selectedKeys);
//       }
//     } else {
//       selectedStudents = selectedKeys.includes("all")
//         ? students.map(student => student.key)
//         : selectedKeys;
//     }

//     const attendanceData = {
//       date: new Date(),
//       subject: selectedSubject,
//       sessions: selectedSessions,
//       records: selectedStudents.map(studentId => ({
//         student: studentId,
//         status: 'present'
//       }))
//     };

//     try {
//       const response = await axios.post('/api/attendance', attendanceData);
//       console.log('Attendance submitted successfully:', response.data);
//       alert("Attendance submitted successfully");
      
//       // Update the subject content to covered

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
//               {selectedType}
//             </Button>
//           </DropdownTrigger>
//           <DropdownMenu
//             aria-label="Type selection"
//             variant="flat"
//             disallowEmptySelection
//             selectionMode="single"
//             selectedKeys={new Set([selectedType])}
//             onSelectionChange={(keys) => setSelectedType(Array.from(keys)[0])}
//           >
//             {typeOptions.map((option) => (
//               <DropdownItem key={option.key}>{option.label}</DropdownItem>
//             ))}
//           </DropdownMenu>
//         </Dropdown>

//         <Dropdown>
//           <DropdownTrigger>
//             <Button variant="bordered" className="capitalize">
//               {selectedDepartment}
//             </Button>
//           </DropdownTrigger>
//           <DropdownMenu
//             aria-label="Department selection"
//             variant="flat"
//             disallowEmptySelection
//             selectionMode="single"
//             selectedKeys={new Set([selectedDepartment])}
//             onSelectionChange={(keys) => setSelectedDepartment(Array.from(keys)[0])}
//           >
//             {departmentOptions.map((option) => (
//               <DropdownItem key={option.key}>{option.label}</DropdownItem>
//             ))}
//           </DropdownMenu>
//         </Dropdown>

//         <Dropdown>
//           <DropdownTrigger>
//             <Button variant="bordered" className="capitalize">
//               {selectedClass}
//             </Button>
//           </DropdownTrigger>
//           <DropdownMenu
//             aria-label="Class selection"
//             variant="flat"
//             disallowEmptySelection
//             selectionMode="single"
//             selectedKeys={new Set([selectedClass])}
//             onSelectionChange={(keys) => setSelectedClass(Array.from(keys)[0])}
//           >
//             {classOptions.map((option) => (
//               <DropdownItem key={option.key}>{option.label}</DropdownItem>
//             ))}
//           </DropdownMenu>
//         </Dropdown>

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

//       {subjectContent.length > 0 && (
//         <div className="mb-4">
//           <h2>Subject Content</h2>
//           <ul>
//             {subjectContent.map(content => (
//               <li key={content._id}>{content.description}</li>
//             ))}
//           </ul>
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
//             <TableHeader columns={columns}>
//               {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
//             </TableHeader>
//             <TableBody items={students}>
//               {(item) => (
//                 <TableRow key={item.key}>
//                   {(columnKey) => 
//                     <TableCell>
//                       {columnKey === 'status' 
//                         ? (selectedKeys.has(item.key) ? 'Present' : 'Absent') 
//                         : item[columnKey]}
//                     </TableCell>
//                   }
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//           <Button color="primary" variant="shadow" onClick={submitAttendance}>
//             Submit Attendance
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";
import React, { useState, useEffect } from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, CheckboxGroup, Checkbox } from "@nextui-org/react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import axios from 'axios';

export default function App() {
  const [selectedDepartment, setSelectedDepartment] = useState("Department");
  const [selectedClass, setSelectedClass] = useState("Class");
  const [selectedSubject, setSelectedSubject] = useState("Subject");
  const [selectedType, setSelectedType] = useState("Type");
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [classOptions, setClassOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [selectedContents, setSelectedContents] = useState([]);
  const [sessions] = useState([1, 2, 3, 4, 5, 6, 7]); 
  const departmentOptions = [
    { key: "Department", label: "Department" },
    { key: "CSE", label: "CSE" },
    { key: "ENTC", label: "ENTC" },
    { key: "Civil", label: "Civil" },
    { key: "Electrical", label: "Electrical" },
    { key: "Mechanical", label: "Mechanical" },
  ];

  const typeOptions = [
    { key: "Theory", label: "Theory" },
    { key: "Practical", label: "Practical" },
  ];

  const columns = [
    {
      key: "rollNumber",
      label: "ROLL NO.",
    },
    {
      key: "name",
      label: "NAME",
    },
  ];

  useEffect(() => {
    if (selectedDepartment !== "Department") {
      fetchClasses(selectedDepartment);
    }
  }, [selectedDepartment]);

  useEffect(() => {
    if (selectedClass !== "Class") {
      fetchSubjects(selectedClass);
      fetchStudents(selectedClass);
    }
  }, [selectedClass]);

  const fetchClasses = async (department) => {
    try {
      const response = await axios.get(`/api/classes?department=${department}`);
      setClassOptions(response.data.map(cls => ({ key: cls._id, label: cls.name })));
    } catch (error) {
      console.error('Failed to fetch classes', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const params = {
        department: selectedDepartment !== "Department" ? selectedDepartment : undefined,
        subType: selectedType !== "Type" ? selectedType : undefined,
        class: selectedClass !== "Class" ? selectedClass : undefined
      };
      const response = await axios.get('/api/subject', { params });
      setSubjectOptions(response.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const response = await axios.get(`/api/fetchstudents?classId=${classId}`);
      setStudents(response.data.map(student => ({
        key: student._id,
        rollNumber: student.rollNumber,
        name: student.name,
        status: 'Absent'
      })));
    } catch (error) {
      console.error('Failed to fetch students', error);
    }
  };

  const handleTakeAttendance = () => {
    setIsTableVisible(true);
  };

  const handleSessionChange = (session) => {
    setSelectedSessions(prev => 
      prev.includes(session)
        ? prev.filter(s => s !== session)
        : [...prev, session]
    );
  };

  const submitAttendance = async () => {
    if (selectedSubject === "Subject") {
      alert("Please select a subject");
      return;
    }

    if (selectedSessions.length === 0) {
      alert("Please select at least one session");
      return;
    }

    if (selectedContents.length === 0) {
      alert("Please select at least one content");
      return;
    }

    let selectedStudents = [];
    if (selectedKeys instanceof Set) {
      if (selectedKeys.has("all")) {
        selectedStudents = students.map(student => student.key);
      } else {
        selectedStudents = Array.from(selectedKeys);
      }
    } else {
      selectedStudents = selectedKeys.includes("all")
        ? students.map(student => student.key)
        : selectedKeys;
    }

    const attendanceData = {
      date: new Date(),
      subject: selectedSubject,
      sessions: selectedSessions,
      records: selectedStudents.map(studentId => ({
        student: studentId,
        status: 'present'
      })),
      contents: selectedContents
    };

    try {
      const response = await axios.post('/api/attendance', attendanceData);
      console.log('Attendance submitted successfully:', response.data);
      alert("Attendance submitted successfully");

    } catch (error) {
      console.error('Failed to submit attendance:', error);
      alert("Failed to submit attendance");
    }
  };

  const getSelectedSubjectContent = () => {
    const selectedSub = subjectOptions.find(sub => sub._id === selectedSubject);
    return selectedSub ? selectedSub.content : [];
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex space-x-4 mb-4 items-center">
        
        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered" className="capitalize">
              {selectedType}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Type selection"
            variant="flat"
            disallowEmptySelection
            selectionMode="single"
            selectedKeys={new Set([selectedType])}
            onSelectionChange={(keys) => setSelectedType(Array.from(keys)[0])}
          >
            {typeOptions.map((option) => (
              <DropdownItem key={option.key}>{option.label}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered" className="capitalize">
              {selectedDepartment}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Department selection"
            variant="flat"
            disallowEmptySelection
            selectionMode="single"
            selectedKeys={new Set([selectedDepartment])}
            onSelectionChange={(keys) => setSelectedDepartment(Array.from(keys)[0])}
          >
            {departmentOptions.map((option) => (
              <DropdownItem key={option.key}>{option.label}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered" className="capitalize">
              {selectedClass}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Class selection"
            variant="flat"
            disallowEmptySelection
            selectionMode="single"
            selectedKeys={new Set([selectedClass])}
            onSelectionChange={(keys) => setSelectedClass(Array.from(keys)[0])}
          >
            {classOptions.map((option) => (
              <DropdownItem key={option.key}>{option.label}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

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

        <div className="flex flex-wrap gap-4 items-center">
          {sessions.map(session => (
            <Checkbox
              key={session}
              isSelected={selectedSessions.includes(session)}
              onValueChange={() => handleSessionChange(session)}
            >
              {session}
            </Checkbox>
          ))}
        </div>

        <Button color="primary" variant="shadow" onClick={handleTakeAttendance}>
          Take Attendance
        </Button>
      </div>

      
      {selectedSubject !== "Subject" && getSelectedSubjectContent().length > 0 && (
  <div className="mb-4">
    <h2>Subject Content</h2>
    <CheckboxGroup
      value={selectedContents}
      onChange={setSelectedContents}
    >
      {getSelectedSubjectContent()
        .filter(content => content.status !== "covered")
        .map((content, index) => (
          <Checkbox key={index} value={content.name}>
            {content.name}
          </Checkbox>
        ))}
    </CheckboxGroup>
  </div>
)}

      {isTableVisible && (
        <div className="flex flex-col gap-3 mt-4">
          <Table 
            aria-label="Attendance table"
            selectionMode="multiple"
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
          >
            <TableHeader columns={columns}>
              {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
            </TableHeader>
            <TableBody items={students}>
              {(item) => (
                <TableRow key={item.key}>
                  {(columnKey) => 
                    <TableCell>
                      {columnKey === 'status' 
                        ? (selectedKeys.has(item.key) ? 'Present' : 'Absent') 
                        : item[columnKey]}
                    </TableCell>
                  }
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Button color="primary" variant="shadow" onClick={submitAttendance}>
            Submit Attendance
          </Button>
        </div>
      )}
    </div>
  );
}
