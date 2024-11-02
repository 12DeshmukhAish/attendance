// // import React, { useState, useEffect } from 'react';
// // import axios from 'axios';
// // import {
// //   Modal,
// //   ModalContent,
// //   ModalHeader,
// //   ModalBody,
// //   Button,
// //   Input,
// //   Select,
// //   SelectItem,
// // } from '@nextui-org/react';
// // import { departmentOptions } from '../utils/department';

// // export default function SubjectModal({ isOpen, onClose, mode, subjectData, onSubmit, classes, teachers }) {
// //   const [subjectId, setSubjectId] = useState('');
// //   const [name, setName] = useState('');
// //   const [classId, setClassId] = useState('');
// //   const [teacherId, setTeacherId] = useState('');
// //   const [selectedDepartment, setSelectedDepartment] = useState("");
// //   const [subjectType, setSubjectType] = useState('');
// //   const [batchIds, setBatchIds] = useState([]);
// //   const [profile, setProfile] = useState(null);
// //   const [batches, setBatches] = useState([]);

// //   useEffect(() => {
// //     const storedProfile = sessionStorage.getItem('userProfile');
// //     if (storedProfile) {
// //       setProfile(JSON.parse(storedProfile));
// //     }
// //   }, []);

// //   useEffect(() => {
// //     if (profile && profile.department) { 
// //       setSelectedDepartment(profile.department)
// //       console.log(selectedDepartment);
// //     }
// //   }, [profile?.department]); 
// //   useEffect(() => {
// //     if (subjectData) {
// //       setSubjectId(subjectData._id);
// //       setName(subjectData.name);
// //       setClassId(subjectData.class);
// //       setTeacherId(subjectData.teacher);
// //       setSelectedDepartment(subjectData.department);
// //       setSubjectType(subjectData.subType);
// //       setBatchIds(subjectData.batchIds || []);
// //     } else {
// //       resetForm();
// //     }
// //   }, [subjectData]);

// //   useEffect(() => {
// //     if (classId && subjectType === 'practical'||'tg') {
// //       const selectedClass = classes.find(cls => cls._id === classId);
// //       setBatches(selectedClass ? selectedClass.batches : []);
// //     } else {
// //       setBatches([]);
// //     }
// //   }, [classId, subjectType, classes]);

// //   const handleSelectionChange = (selectedKeys) => {
// //     setBatchIds(Array.from(selectedKeys)); // Convert Set to Array
// //   };

// //   const resetForm = () => {
// //     setSubjectId('');
// //     setName('');
// //     setClassId('');
// //     setTeacherId('');
// //     if (profile?.role === "superadmin") {
// //       setSelectedDepartment('');
// //     }
// //     setSubjectType('');
// //     setBatchIds([]);
// //   };

// //   const handleSelectChange = (value) => {
// //     setSelectedDepartment(value);
// //   };

// //   const handleCancel = () => {
// //     onClose();
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     const formData = {
// //       _id: subjectId,
// //       name,
// //       class: classId,
// //       teacher: teacherId,
// //       department: profile.department,
// //       type: subjectType,
// //       batch: batchIds?  batchIds : undefined,
// //     };

// //     try {
// //       if (mode === 'add') {
// //         await axios.post('/api/subject', formData);
// //       } else {
// //         await axios.put(`/api/subject?_id=${subjectId}`, formData);
// //       }
// //       onSubmit();
// //       onClose();
// //     } catch (error) {
// //       console.error('Error submitting subject:', error);
// //     }
// //   };

// //   useEffect(() => {
// //     if (!isOpen) {
// //       resetForm();
// //     }
// //   }, [isOpen]);

// //   return (
// //     <Modal
// //       isOpen={isOpen}
// //       onClose={onClose}
// //       placement="top-center"
// //       className="max-w-[40vw] max-h-[80vh] overflow-y-auto"
// //     >
// //       <ModalContent>
// //         <ModalHeader>{mode === 'add' ? 'Add New Subject' : 'Edit Subject'}</ModalHeader>
// //         <ModalBody>
// //           <form onSubmit={handleSubmit} className="w-full bg-white p-2 grid grid-cols-2 gap-4">
// //             <Input
// //               type="text"
// //               variant="bordered"
// //               size='sm'
// //               label="Subject ID"
// //               value={subjectId}
// //               onChange={(e) => setSubjectId(e.target.value)}
// //               required
// //               disabled={mode !== 'add'}
// //               placeholder="Course ID-Year"
// //               className="col-span-1 w-full"
// //             />
// //             <Input
// //               type="text"
// //               variant="bordered"
// //               size='sm'
// //               label="Name"
// //               value={name}
// //               onChange={(e) => setName(e.target.value)}
// //               required
// //               className="col-span-1 w-full"
// //             />
// //             {profile?.role === "superadmin" && (
// //               <Select
// //                 label="Department"
// //                 placeholder="Select department"
// //                 name="department"
// //                 selectedKeys={[selectedDepartment]}
// //                 onSelectionChange={(value) => handleSelectChange(value.currentKey)}
// //                 variant="bordered"
// //                 size="sm"
// //               >
// //                 {departmentOptions.map((department) => (
// //                   <SelectItem key={department.key} textValue={department.label}>
// //                     {department.label}
// //                   </SelectItem>
// //                 ))}
// //               </Select>
// //             )}
// //             <Select
// //               label="Class"
// //               placeholder="Select Class"
// //               className="col-span-1 w-full"
// //               selectedKeys={[classId]}
// //               onChange={(e) => setClassId(e.target.value)}
// //               required
// //               variant="bordered"
// //               size='sm'
// //             >
// //              {Array.isArray(classes) && classes.length > 0 ? (
// //               classes.map((classItem) => (
// //                 <SelectItem key={classItem._id} value={classItem._id}>
// //                   {classItem._id}
// //                 </SelectItem>
// //               ))
// //             ) : (
// //               <SelectItem value="no-classes">No classes available</SelectItem>
// //             )}
// //             </Select>
            
// //             <Select
// //               label="Subject Teacher"
// //               placeholder="Select Subject Teacher"
// //               className="col-span-1 w-full"
// //               selectedKeys={[teacherId]}
// //               onSelectionChange={(keys) => setTeacherId(keys.currentKey)}
// //               required
// //               variant="bordered"
// //               size='sm'
// //             >
// //               {teachers && teachers.map((teacher) => (
// //                 <SelectItem key={teacher._id} value={teacher._id}>
// //                   {teacher.name}
// //                 </SelectItem>
// //               ))}
// //             </Select>
// //             <Select
// //               label="Subject Type"
// //               placeholder="Select Subject Type"
// //               className="col-span-1 w-full"
// //               selectedKeys={[subjectType]}
// //               onSelectionChange={(keys) => setSubjectType(keys.currentKey)}
// //               required
// //               variant="bordered"
// //               size='sm'
// //             >
// //               <SelectItem key="theory" textValue='theory'>Theory</SelectItem>
// //               <SelectItem key="practical" value="practical">Practical</SelectItem>
// //               <SelectItem key="tg" value="tg">Teacher Guardian</SelectItem>
// //             </Select>
// //             {(subjectType === 'practical'||subjectType === 'tg') && (
// //                   <Select
// //                   label="Batches"
// //                   placeholder="Select Batches"
// //                   className="col-span-1 w-full"
// //                   selectedKeys={batchIds}
// //                   onSelectionChange={handleSelectionChange}
// //                   required
// //                   variant="bordered"
// //                   size='sm'
// //                   selectionMode="multiple"
// //                 >
// //                   {batches && batches.map((batch) => (
// //                     <SelectItem key={batch._id} value={batch._id}>
// //                       {batch._id}
// //                     </SelectItem>
// //                   ))}
// //                 </Select>
// //             )}
// //             <div className="col-span-2 flex justify-end gap-4">
// //               <Button
// //                 variant="ghost"
// //                 size="sm"
// //                 onClick={handleCancel}
// //                 className="w-fit px-3 font-normal bg-gray-200 text-gray-600"
// //               >
// //                 Cancel
// //               </Button>
// //               <Button
// //                 type="submit"
// //                 variant="flat"
// //                 size="sm"
// //                 color="primary"
// //                 className="w-fit px-3 font-normal"
// //               >
// //                 {mode === 'add' ? 'Add Subject' : 'Update Subject'}
// //               </Button>
// //             </div>
// //           </form>
// //         </ModalBody>
// //       </ModalContent>
// //     </Modal>
// //   );
// // }
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import {
//   Modal,
//   ModalContent,
//   ModalHeader,
//   ModalBody,
//   Button,
//   Input,
//   Select,
//   SelectItem,
// } from '@nextui-org/react';
// import { departmentOptions } from '../utils/department';

// export default function SubjectModal({ isOpen, onClose, mode, subjectData, onSubmit, classes, teachers }) {
//   const [subjectId, setSubjectId] = useState('');
//   const [name, setName] = useState('');
//   const [classId, setClassId] = useState('');
//   const [teacherId, setTeacherId] = useState('');
//   const [selectedDepartment, setSelectedDepartment] = useState("");
//   const [subjectType, setSubjectType] = useState('');
//   const [batchIds, setBatchIds] = useState([]);
//   const [profile, setProfile] = useState(null);
//   const [batches, setBatches] = useState([]);
//   const [semester, setSemester] = useState('');
//   const [academicYear, setAcademicYear] = useState('');

//   useEffect(() => {
//     const storedProfile = sessionStorage.getItem('userProfile');
//     if (storedProfile) {
//       setProfile(JSON.parse(storedProfile));
//     }
//   }, []);

//   useEffect(() => {
//     if (profile && profile.department) { 
//       setSelectedDepartment(profile.department);
//     }
//   }, [profile?.department]); 

//   useEffect(() => {
//     if (subjectData) {
//       setSubjectId(subjectData._id);
//       setName(subjectData.name);
//       setClassId(subjectData.class);
//       setTeacherId(subjectData.teacher);
//       setSelectedDepartment(subjectData.department);
//       setSubjectType(subjectData.subType);
//       setBatchIds(subjectData.batch || []);
//       setSemester(subjectData.sem);
//       setAcademicYear(subjectData.academicYear);
//     } else {
//       resetForm();
//     }
//   }, [subjectData]);

//   useEffect(() => {
//     if (classId && (subjectType === 'practical' || subjectType === 'tg')) {
//       const selectedClass = classes.find(cls => cls._id === classId);
//       setBatches(selectedClass ? selectedClass.batches : []);
//     } else {
//       setBatches([]);
//     }
//   }, [classId, subjectType, classes]);

//   const handleSelectionChange = (selectedKeys) => {
//     setBatchIds(Array.from(selectedKeys));
//   };

//   const resetForm = () => {
//     setSubjectId('');
//     setName('');
//     setClassId('');
//     setTeacherId('');
//     if (profile?.role === "superadmin") {
//       setSelectedDepartment('');
//     }
//     setSubjectType('');
//     setBatchIds([]);
//     setSemester('');
//     setAcademicYear('');
//   };

//   const handleSelectChange = (value) => {
//     setSelectedDepartment(value);
//   };

//   const handleCancel = () => {
//     onClose();
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const formData = {
//       _id: subjectId,
//       name,
//       class: classId,
//       teacher: teacherId,
//       department: profile.department,
//       subType: subjectType,
//       batch: batchIds.length > 0 ? batchIds : undefined,
//       sem: semester,
//       academicYear,
//     };

//     try {
//       if (mode === 'add') {
//         await axios.post('/api/v1/subject', formData);
//       } else {
//         await axios.put(`/api/v1/subject?_id=${subjectId}`, formData);
//       }
//       onSubmit();
//       onClose();
//     } catch (error) {
//       console.error('Error submitting subject:', error);
//     }
//   };

//   useEffect(() => {
//     if (!isOpen) {
//       resetForm();
//     }
//   }, [isOpen]);

//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={onClose}
//       placement="top-center"
//       className="max-w-[40vw] max-h-[80vh] overflow-y-auto"
//     >
//       <ModalContent>
//         <ModalHeader>{mode === 'add' ? 'Add New Subject' : 'Edit Subject'}</ModalHeader>
//         <ModalBody>
//           <form onSubmit={handleSubmit} className="w-full bg-white p-2 grid grid-cols-2 gap-4">
//             <Input
//               type="text"
//               variant="bordered"
//               size='sm'
//               label="Subject ID"
//               value={subjectId}
//               onChange={(e) => setSubjectId(e.target.value)}
//               required
//               disabled={mode !== 'add'}
//               placeholder="Course ID-Year"
//               className="col-span-1 w-full"
//             />
//             <Input
//               type="text"
//               variant="bordered"
//               size='sm'
//               label="Name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//               className="col-span-1 w-full"
//             />
//             {profile?.role === "superadmin" && (
//               <Select
//                 label="Department"
//                 placeholder="Select department"
//                 name="department"
//                 selectedKeys={[selectedDepartment]}
//                 onSelectionChange={(value) => handleSelectChange(value.currentKey)}
//                 variant="bordered"
//                 size="sm"
//               >
//                 {departmentOptions.map((department) => (
//                   <SelectItem key={department.key} textValue={department.label}>
//                     {department.label}
//                   </SelectItem>
//                 ))}
//               </Select>
//             )}
//             <Select
//               label="Class"
//               placeholder="Select Class"
//               className="col-span-1 w-full"
//               selectedKeys={[classId]}
//               onChange={(e) => setClassId(e.target.value)}
//               required
//               variant="bordered"
//               size='sm'
//             >
//              {Array.isArray(classes) && classes.length > 0 ? (
//               classes.map((classItem) => (
//                 <SelectItem key={classItem._id} value={classItem._id}>
//                   {classItem._id}
//                 </SelectItem>
//               ))
//             ) : (
//               <SelectItem value="no-classes">No classes available</SelectItem>
//             )}
//             </Select>
            
//             <Select
//               label="Subject Teacher"
//               placeholder="Select Subject Teacher"
//               className="col-span-1 w-full"
//               selectedKeys={[teacherId]}
//               onSelectionChange={(keys) => setTeacherId(keys.currentKey)}
//               required
//               variant="bordered"
//               size='sm'
//             >
//               {teachers && teachers.map((teacher) => (
//                 <SelectItem key={teacher._id} value={teacher._id}>
//                   {teacher.name}
//                 </SelectItem>
//               ))}
//             </Select>
//             <Select
//               label="Subject Type"
//               placeholder="Select Subject Type"
//               className="col-span-1 w-full"
//               selectedKeys={[subjectType]}
//               onSelectionChange={(keys) => setSubjectType(keys.currentKey)}
//               required
//               variant="bordered"
//               size='sm'
//             >
//               <SelectItem key="theory" value="theory">Theory</SelectItem>
//               <SelectItem key="practical" value="practical">Practical</SelectItem>
//               <SelectItem key="tg" value="tg">Teacher Guardian</SelectItem>
//             </Select>
//             {(subjectType === 'practical' || subjectType === 'tg') && (
//               <Select
//                 label="Batches"
//                 placeholder="Select Batches"
//                 className="col-span-1 w-full"
//                 selectedKeys={batchIds}
//                 onSelectionChange={handleSelectionChange}
//                 required
//                 variant="bordered"
//                 size='sm'
//                 selectionMode="multiple"
//               >
//                 {batches && batches.map((batch) => (
//                   <SelectItem key={batch._id} value={batch._id}>
//                     {batch._id}
//                   </SelectItem>
//                 ))}
//               </Select>
//             )}
//             <Select
//               label="Semester"
//               placeholder="Select Semester"
//               className="col-span-1 w-full"
//               selectedKeys={[semester]}
//               onSelectionChange={(keys) => setSemester(keys.currentKey)}
//               required
//               variant="bordered"
//               size='sm'
//             >
//               <SelectItem key="sem1" value="sem1">Semester 1</SelectItem>
//               <SelectItem key="sem2" value="sem2">Semester 2</SelectItem>
//             </Select>
//             <Input
//               type="text"
//               variant="bordered"
//               size='sm'
//               label="Academic Year"
//               value={academicYear}
//               onChange={(e) => setAcademicYear(e.target.value)}
//               required
//               placeholder="YYYY-YYYY"
//               className="col-span-1 w-full"
//             />
//             <div className="col-span-2 flex justify-end gap-4">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={handleCancel}
//                 className="w-fit px-3 font-normal bg-gray-200 text-gray-600"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 variant="flat"
//                 size="sm"
//                 color="primary"
//                 className="w-fit px-3 font-normal"
//               >
//                 {mode === 'add' ? 'Add Subject' : 'Update Subject'}
//               </Button>
//             </div>
//           </form>
//         </ModalBody>
//       </ModalContent>
//     </Modal>
//   );
// }
'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Input,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  Spinner,
} from '@nextui-org/react';
import { departmentOptions } from '../utils/department';
import { toast } from 'sonner';

export default function SubjectModal({ isOpen, onClose, mode, subjectData, onSubmit, classes }) {
  const [subjectId, setSubjectId] = useState('');
  const [name, setName] = useState('');
  const [classId, setClassId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [subjectType, setSubjectType] = useState('');
  const [batchIds, setBatchIds] = useState([]);
  const [profile, setProfile] = useState(null);
  const [batches, setBatches] = useState([]);
  const [semester, setSemester] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [facultySearch, setFacultySearch] = useState('');
  const [facultyOptions, setFacultyOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
      setSelectedDepartment(JSON.parse(storedProfile).department);
    }
  }, []);

  useEffect(() => {
    if (subjectData) {
      setSubjectId(subjectData._id);
      setName(subjectData.name);
      setClassId(subjectData.class);
      setTeacherId(subjectData.teacher);
      setSelectedDepartment(subjectData.department);
      setSubjectType(subjectData.subType);
      setBatchIds(subjectData.batch || []);
      setSemester(subjectData.sem);
      setAcademicYear(subjectData.academicYear);
    } else {
      resetForm();
    }
  }, [subjectData]);

  useEffect(() => {
    if (classId && (subjectType === 'practical' || subjectType === 'tg')) {
      const selectedClass = classes.find(cls => cls._id === classId);
      setBatches(selectedClass ? selectedClass.batches : []);
    } else {
      setBatches([]);
    }
  }, [classId, subjectType, classes]);

  const resetForm = () => {
    setSubjectId('');
    setName('');
    setClassId('');
    setTeacherId('');
    setSubjectType('');
    setBatchIds([]);
    setSemester('');
    setAcademicYear('');
    setFacultySearch('');
  };

  const handleFacultySearch = async (value) => {
    setFacultySearch(value);
    if (value.length > 2) {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/v1/faculty/search?query=${value}`);
        setFacultyOptions(response.data);
      } catch (error) {
        console.error('Error searching faculty:', error);
        toast.error('Failed to search faculty. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setFacultyOptions([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = {
      _id: subjectId,
      name,
      class: classId,
      teacher: teacherId,
      department: selectedDepartment,
      subType: subjectType,
      batch: batchIds.length > 0 ? batchIds : undefined,
      sem: semester,
      academicYear,
    };

    try {
      if (mode === 'add') {
        await axios.post('/api/v1/subject', formData);
        toast.success('Subject added successfully');
      } else {
        await axios.put(`/api/v1/subject?_id=${subjectId}`, formData);
        toast.success('Subject updated successfully');
      }
      onSubmit();
      onClose();
    } catch (error) {
      console.error('Error submitting subject:', error);
      toast.error('Failed to submit subject. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalContent>
        <ModalHeader>{mode === 'add' ? 'Add New Subject' : 'Edit Subject'}</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <Input
              label="Subject ID"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
              disabled={mode !== 'add'}
              placeholder="Course ID-Year"
            />
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            {profile?.role === "superadmin" && (
              <Select
                label="Department"
                selectedKeys={[selectedDepartment]}
                onSelectionChange={(value) => setSelectedDepartment(value.currentKey)}
              >
                {departmentOptions.map((dept) => (
                  <SelectItem key={dept.key} value={dept.key}>
                    {dept.label}
                  </SelectItem>
                ))}
              </Select>
            )}
            <Select
              label="Class"
              selectedKeys={[classId]}
              onSelectionChange={(value) => setClassId(value.currentKey)}
              required
            >
              {classes.map((classItem) => (
                <SelectItem key={classItem._id} value={classItem._id}>
                  {classItem._id}
                </SelectItem>
              ))}
            </Select>
            <Autocomplete
              label="Subject Teacher"
              placeholder="Search for a teacher"
              value={facultySearch}
              onInputChange={handleFacultySearch}
              onSelectionChange={(value) => setTeacherId(value)}
              isLoading={isLoading}
            >
              {facultyOptions.map((faculty) => (
                <AutocompleteItem key={faculty._id} value={faculty._id}>
                  {faculty.name}
                </AutocompleteItem>
              ))}
            </Autocomplete>
            <Select
              label="Subject Type"
              selectedKeys={[subjectType]}
              onSelectionChange={(value) => setSubjectType(value.currentKey)}
              required
            >
              <SelectItem key="theory" value="theory">Theory</SelectItem>
              <SelectItem key="practical" value="practical">Practical</SelectItem>
              <SelectItem key="tg" value="tg">Teacher Guardian</SelectItem>
            </Select>
            {(subjectType === 'practical' || subjectType === 'tg') && (
              <Select
                label="Batches"
                selectedKeys={batchIds}
                onSelectionChange={(value) => setBatchIds(Array.from(value))}
                selectionMode="multiple"
              >
                {batches.map((batch) => (
                  <SelectItem key={batch._id} value={batch._id}>
                    {batch._id}
                  </SelectItem>
                ))}
              </Select>
            )}
            <Select
              label="Semester"
              selectedKeys={[semester]}
              onSelectionChange={(value) => setSemester(value.currentKey)}
              required
            >
              <SelectItem key="sem1" value="sem1">Semester 1</SelectItem>
              <SelectItem key="sem2" value="sem2">Semester 2</SelectItem>
            </Select>
            <Input
              label="Academic Year"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              required
              placeholder="YYYY-YYYY"
            />
            <div className="col-span-2 flex justify-end gap-4">
              <Button onClick={onClose} variant="light">
                Cancel
              </Button>
              <Button type="submit" color="primary" isLoading={isSubmitting}>
                {isSubmitting ? <Spinner size="sm" /> : (mode === 'add' ? 'Add Subject' : 'Update Subject')}
              </Button>
            </div>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}