// // "use client";
// // import React, { useState, useEffect } from 'react';
// // import { toast } from 'sonner';
// // import axios from 'axios';
// // import { Button, Input, Checkbox, Table, TableBody, TableCell, TableHeader, TableColumn, TableRow, SelectItem, Select, Textarea } from '@nextui-org/react';
// // import * as XLSX from 'xlsx';

// // const TeachingPlanPage = () => {
// //   const [subjectId, setSubjectId] = useState('');
// //   const [subjectIds, setSubjectIds] = useState([]);
// //   const [subject, setSubject] = useState({});
// //   const [content, setContent] = useState([]);
// //   const [tgSessions, setTgSessions] = useState([]);
// //   const [isEditing, setIsEditing] = useState(false);

// //   useEffect(() => {
// //     fetchSubjects();
// //   }, []);

// //   const fetchSubjects = async () => {
// //     try {
// //       const userProfile = JSON.parse(sessionStorage.getItem('userProfile'));
// //       const userSubjectIds = userProfile.subjects;
// //       setSubjectIds(userSubjectIds);

// //       if (userSubjectIds.length === 1) {
// //         setSubjectId(userSubjectIds[0]);
// //         fetchSubjectInfo(userSubjectIds[0]);
// //       }
// //     } catch (error) {
// //       console.error('Error fetching subjects:', error);
// //     }
// //   };

// //   const fetchSubjectInfo = async (subjectId) => {
// //     try {
// //       const response = await axios.get(`/api/subject?_id=${subjectId}`);
// //       setSubject(response.data.subject);
// //       if (response.data.subject.subType === 'tg') {
// //         setTgSessions(response.data.subject.tgSessions || []);
// //         console.table(tgSessions)
// //         console.log(tgSessions);

// //       } else {
// //         setContent(response.data.subject.content || [{
// //           title: '', description: '', proposedDate: '', completedDate: '', references: '', courseOutcomes: '', programOutcomes: '', status: 'not_covered'
// //         }]);
// //       }
// //     } catch (error) {
// //       console.error('Error fetching subject info:', error);
// //     }
// //   };

// //   const handleSubjectChange = (event) => {
// //     const subjectId = event.target.value;
// //     setSubjectId(subjectId);
// //     fetchSubjectInfo(subjectId);
// //   };

// //   const handleAddContent = () => {
// //     if (subject.subType === 'tg') {
// //       setTgSessions([...tgSessions, { date: '', pointsDiscussed: '' }]);
// //     } else {
// //       setContent([...content, {
// //         title: '', description: '', proposedDate: '', completedDate: '', references: '', courseOutcomes: '', programOutcomes: '', status: 'not_covered'
// //       }]);
// //     }
// //   };

// //   const handleContentChange = (index, event) => {
// //     if (subject.subType === 'tg') {
// //       const newTgSessions = [...tgSessions];
// //       if (event.target.name === 'date') {
// //         newTgSessions[index][event.target.name] = event.target.value;
// //       } else if (event.target.name === 'pointsDiscussed') {
// //         newTgSessions[index][event.target.name] = event.target.value;
// //       } else {
// //         newTgSessions[index][event.target.name] = event.target.value;
// //       }
// //       setTgSessions(newTgSessions);
// //     } else {
// //       const newContent = [...content];
// //       newContent[index][event.target.name] = event.target.value;
// //       setContent(newContent);
// //     }
// //   };
// //   const handleStatusChange = (index) => {
// //     const newContent = [...content];
// //     newContent[index].status = newContent[index].status === 'covered' ? 'not_covered' : 'covered';
// //     setContent(newContent);
// //   };

// //   const handleRemoveContent = (index) => {
// //     if (subject.subType === 'tg') {
// //       const newTgSessions = [...tgSessions];
// //       newTgSessions.splice(index, 1);
// //       setTgSessions(newTgSessions);
// //     } else {
// //       const newContent = [...content];
// //       newContent.splice(index, 1);
// //       setContent(newContent);
// //     }
// //   };

// //   const handleCancel = () => {
// //     setSubjectId('');
// //     setContent([]);
// //     setTgSessions([]);
// //     setIsEditing(false);
// //   };
// //   const handleSubmit = async (event) => {
// //     event.preventDefault();
// //     if (!subjectId) {
// //       toast.error('Please select a subject');
// //       return;
// //     }

// //     try {
// //       let response;

// //       if (subject.subType === 'tg') {
// //         const validTgSessions = tgSessions.map((session) => {
// //           // Check if date is not empty
// //           const isDateValid = session.date && session.date.trim() !== '';

// //           // Split pointsDiscussed by commas and filter out empty points
// //           const pointsArray = Array.isArray(session.pointsDiscussed)
// //             ? session.pointsDiscussed
// //             : session.pointsDiscussed.split(',').map((point) => point.trim()).filter((point) => point !== '');

// //           const arePointsValid = pointsArray.length > 0;

// //           if (isDateValid && arePointsValid) {
// //             return { ...session, pointsDiscussed: pointsArray };
// //           }

// //           return null; // Return null for invalid sessions
// //         }).filter(session => session !== null); // Filter out null values (invalid sessions)

// //         response = await axios.put(`/api/contents?_id=${subjectId}`, {
// //           tgSessions: validTgSessions,
// //         });
// //       } else {
// //         const validContent = content.filter(item => item.title.trim() !== '');
// //         response = await axios.put(`/api/contents?_id=${subjectId}`, {
// //           content: validContent,
// //         });
// //       }

// //       if (response.status === 200) {
// //         toast.success('Content updated successfully');
// //         handleCancel();
// //       } else {
// //         toast.error('Failed to update content');
// //       }
// //     } catch (error) {
// //       console.error('Error updating content:', error);
// //       toast.error('Error updating content');
// //     }
// //   };
// //   const handleDownloadExcel = () => {
// //     const dataToExport = subject.subType === 'tg' ? tgSessions : content;
// //     const worksheet = XLSX.utils.json_to_sheet(dataToExport);
// //     const workbook = XLSX.utils.book_new();
// //     XLSX.utils.book_append_sheet(workbook, worksheet, 'Teaching Plan');
// //     XLSX.writeFile(workbook, 'TeachingPlan.xlsx');
// //   };

// //   const handleUploadExcel = (event) => {
// //     const file = event.target.files[0];
// //     const reader = new FileReader();
// //     reader.onload = (e) => {
// //       const data = new Uint8Array(e.target.result);
// //       const workbook = XLSX.read(data, { type: 'array' });
// //       const worksheet = workbook.Sheets[workbook.SheetNames[0]];
// //       const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// //       if (subject.subType === 'tg') {
// //         const parsedTgSessions = jsonData.slice(1).map(row => ({
// //           date: row[0] || '',
// //           pointsDiscussed: row[1] || '',
// //         }));
// //         setTgSessions(parsedTgSessions);
// //       } else {
// //         const parsedContent = jsonData.slice(1).map(row => ({
// //           title: row[0] || '',
// //           description: row[1] || '',
// //           proposedDate: row[2] || '',
// //           completedDate: row[3] || '',
// //           references: row[4] || '',
// //           courseOutcomes: row[5] || '',
// //           programOutcomes: row[6] || '',
// //           status: row[7] || 'not_covered',
// //         }));
// //         setContent(parsedContent);
// //       }
// //     };
// //     reader.readAsArrayBuffer(file);
// //   };

// //   return (
// //     <div className="container mx-auto p-4">
// //       <h1 className="text-2xl font-bold mb-4">Manage Teaching Plan</h1>
// //       {subjectId && (
// //         <div className="mt-4 p-4 bg-gray-100 rounded-md">
// //           <h2 className="text-lg font-bold mb-2">Subject Information</h2>
// //           <p>Subject Department: {subject.department}</p>
// //           <p>Subject Name: {subject.name}</p>
// //           <p>Subject Code: {subject._id}</p>
// //           {/* <p>Subject Faculty Name: {subject.teacher.split('.').join(" ")}</p> */}
// //           <p>Subject Class: {subject.class}</p>
// //           <p>Subject Type: {subject.subType}</p>
// //         </div>
// //       )}
// //       {subjectIds.length > 1 && (
// //         <div className="mb-4">
// //           <Select
// //             label="Subject"
// //             selectedKeys={[subjectId]}
// //             onChange={handleSubjectChange}
// //             variant='bordered'
// //             size='sm'
// //             className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
// //           >
// //             {subjectIds.map((subject) => (
// //               <SelectItem key={subject} value={subject}>
// //                 {subject}
// //               </SelectItem>
// //             ))}
// //           </Select>
// //         </div>
// //       )}
// //       {!isEditing ? (
// //         <div className="mt-4">
// //           <h3 className="text-lg font-bold mb-2">{subject.subType === 'tg' ? 'TG Sessions' : 'Course Content'}</h3>
// //           {subject.subType === 'tg' ? (
// //             tgSessions.length > 0 ? (
// //               <Table
// //                 aria-label="TG Sessions"
// //                 css={{
// //                   height: "auto",
// //                   minWidth: "100%",
// //                 }}
// //               >
// //                 <TableHeader>
// //                   <TableColumn>Date</TableColumn>
// //                   <TableColumn>Points Discussed</TableColumn>
// //                 </TableHeader>
// //                 <TableBody>
// //                   {tgSessions.map((session, index) => (
// //                     <TableRow key={index}>
// //                       <TableCell>{session.date.split('T')[0]}</TableCell>
// //                       <TableCell>
// //                         <ul>
// //                           {session.pointsDiscussed.map((point, pointIndex) => (
// //                             <li key={pointIndex}>{point}</li>
// //                           ))}
// //                         </ul>
// //                       </TableCell>
// //                     </TableRow>
// //                   ))}
// //                 </TableBody>
// //               </Table>
// //             ) : (
// //               <p>No TG sessions available.</p>
// //             )
// //           ) : (
// //             content.length > 0 ? (
// //               <Table
// //                 aria-label="Course Content"
// //                 css={{
// //                   height: "auto",
// //                   minWidth: "100%",
// //                 }}
// //               >
// //                 <TableHeader>
// //                   <TableColumn>Title</TableColumn>
// //                   <TableColumn>Description</TableColumn>
// //                   <TableColumn>Proposed Date</TableColumn>
// //                   <TableColumn>Completed Date</TableColumn>
// //                   <TableColumn>References</TableColumn>
// //                   <TableColumn>Course Outcomes</TableColumn>
// //                   <TableColumn>Program Outcomes</TableColumn>
// //                   <TableColumn>Status</TableColumn>
// //                 </TableHeader>
// //                 <TableBody>
// //                   {content.map((item, index) => (
// //                     <TableRow key={index}>
// //                       <TableCell>{item.title}</TableCell>
// //                       <TableCell>{item.description}</TableCell>
// //                       <TableCell>{item.proposedDate}</TableCell>
// //                       <TableCell>{item.completedDate}</TableCell>
// //                       <TableCell>{item.references}</TableCell>
// //                       <TableCell>{item.courseOutcomes}</TableCell>
// //                       <TableCell>{item.programOutcomes}</TableCell>
// //                       <TableCell>{item.status}</TableCell>
// //                     </TableRow>
// //                   ))}
// //                 </TableBody>
// //               </Table>
// //             ) : (
// //               <p>No content available.</p>
// //             )
// //           )}
// //           <Button
// //             color="primary"
// //             variant="ghost"
// //             size="sm"
// //             auto
// //             onClick={() => setIsEditing(true)}
// //             className="mt-2"
// //           >
// //             Edit {subject.subType === 'tg' ? 'TG Sessions' : 'Content'}
// //           </Button>
// //         </div>
// //       ) : (
// //         <form onSubmit={handleSubmit} className="w-full bg-white p-2 grid grid-cols-1 gap-4">
// //           <div className="col-span-1">
// //             <h3 className="text-lg font-bold mb-2">{subject.subType === 'tg' ? 'TG Sessions' : 'Content'}</h3>
// //             {subject.subType === 'tg' ? (
// //               tgSessions.map((session, index) => (
// //                 <div key={index} className="flex gap-4 mb-2">
// //                   <Input
// //                     type="date"
// //                     name="date"
// //                     label="Date"
// //                     value={session.date.split('T')[0]}
// //                     onChange={(e) => handleContentChange(index, e)}
// //                     required
// //                     className="w-full"
// //                     variant="bordered"
// //                     size="sm"
// //                   />
// //                   <Textarea
// //                     name="pointsDiscussed"
// //                     label="Points Discussed"
// //                     value={session.pointsDiscussed}
// //                     onChange={(e) => handleContentChange(index, e)}
// //                     required
// //                     className="w-full"
// //                     variant="bordered"
// //                     size="sm"

// //                   />
// //                   <Button
// //                     color="error"
// //                     size="sm"
// //                     auto
// //                     onClick={() => handleRemoveContent(index)}
// //                     className="mt-2"
// //                   >
// //                     Remove
// //                   </Button>
// //                 </div>
// //               ))
// //             ) : (
// //               content.map((item, index) => (
// //                 <div key={index} className="flex gap-4 mb-2">
// //                   <Input
// //                     type="text"
// //                     name="title"
// //                     label="Title"
// //                     value={item.title}
// //                     onChange={(e) => handleContentChange(index, e)}
// //                     required
// //                     className="w-full"
// //                     variant="bordered"
// //                     size="sm"
// //                   />
// //                   <Input
// //                     type="text"
// //                     name="description"
// //                     label="Description"
// //                     value={item.description}
// //                     onChange={(e) => handleContentChange(index, e)}
// //                     required
// //                     className="w-full"
// //                     variant="bordered"
// //                     size="sm"
// //                   />
// //                   <Input
// //                     type="text"
// //                     name="proposedDate"
// //                     label="Proposed Date"
// //                     value={item.proposedDate}
// //                     onChange={(e) => handleContentChange(index, e)}
// //                     className="w-full"
// //                     variant="bordered"
// //                     size="sm"
// //                   />
// //                   <Input
// //                     type="text"
// //                     name="completedDate"
// //                     label="Completed Date"
// //                     value={item.completedDate}
// //                     onChange={(e) => handleContentChange(index, e)}
// //                     className="w-full"
// //                     variant="bordered"
// //                     size="sm"
// //                   />
// //                   <Input
// //                     type="text"
// //                     name="references"
// //                     label="References"
// //                     value={item.references}
// //                     onChange={(e) => handleContentChange(index, e)}
// //                     className="w-full"
// //                     variant="bordered"
// //                     size="sm"
// //                   />
// //                   <Input
// //                     type="text"
// //                     name="courseOutcomes"
// //                     label="CourseOutcomes"
// //                     value={item.courseOutcomes}
// //                     onChange={(e) => handleContentChange(index, e)}
// //                     className="w-full"
// //                     variant="bordered"
// //                     size="sm"
// //                   />
// //                   <Input
// //                     type="text"
// //                     name="programOutcomes"
// //                     label="ProgramOutcomes"
// //                     value={item.programOutcomes}
// //                     onChange={(e) => handleContentChange(index, e)}
// //                     className="w-full"
// //                     variant="bordered"
// //                     size="sm"
// //                   />
// //                   <div className="flex items-center">
// //                     <Checkbox
// //                       name="status"
// //                       label="Status"
// //                       isSelected={item.status === 'covered'}
// //                       onChange={() => handleStatusChange(index)}
// //                       size="sm"
// //                     >
// //                       Covered
// //                     </Checkbox>
// //                   </div>
// //                   <Button
// //                     color="error" size="sm"
// //                     auto
// //                     onClick={() => handleRemoveContent(index)}
// //                     className="mt-2"
// //                   >
// //                     Remove
// //                   </Button>
// //                 </div>
// //               ))
// //             )}
// //             <Button
// //               color="primary"
// //               variant="ghost"
// //               size="sm"
// //               auto
// //               onClick={handleAddContent}
// //               className="mt-2"
// //             >
// //               Add {subject.subType === 'tg' ? 'TG Session' : 'Content'}
// //             </Button>
// //             <div className="flex justify-end gap-2 mt-4">
// //               <Button
// //                 color="primary"
// //                 variant="ghost"
// //                 size="sm"
// //                 auto
// //                 type="submit"
// //                 className="mt-2"
// //               >
// //                 Save
// //               </Button>
// //               <Button
// //                 color="error"
// //                 variant="ghost"
// //                 size="sm"
// //                 auto
// //                 onClick={handleCancel}
// //                 className="mt-2"
// //               >
// //                 Cancel
// //               </Button>
// //             </div>
// //           </div>
// //         </form>
// //       )}
// //       <div className="flex gap-4 mt-4">
// //         <input
// //           type="file"
// //           accept=".xlsx, .xls"
// //           onChange={handleUploadExcel}
// //           className="hidden"
// //           id="uploadExcel"
// //         />
// //         <Button
// //           variant="bordered"
// //           size="sm"
// //           color="secondary"
// //           className="mt-2"
// //           onClick={() => document.getElementById('uploadExcel').click()}
// //         >
// //           Upload {subject.subType === 'tg' ? 'TG Sessions' : 'Teaching Plan'} (Excel)
// //         </Button>
// //         <Button
// //           color="primary"
// //           variant="ghost"
// //           size="sm"
// //           auto
// //           onClick={handleDownloadExcel}
// //           className="mt-2"
// //         >
// //           Download {subject.subType === 'tg' ? 'TG Sessions' : 'Teaching Plan'} (Excel)
// //         </Button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default TeachingPlanPage;

// 'use client'
// import React, { useState, useEffect } from 'react'
// import { toast } from 'sonner'
// import axios from 'axios'
// import { Button, Input, Checkbox, Table, TableBody, TableCell, TableHeader, TableColumn, TableRow, Select, SelectItem, Textarea } from '@nextui-org/react'
// import * as XLSX from 'xlsx'

// export default function TeachingPlanPage() {
//   const [subjectId, setSubjectId] = useState('')
//   const [subjectIds, setSubjectIds] = useState([])
//   const [subject, setSubject] = useState({})
//   const [content, setContent] = useState([])
//   const [tgSessions, setTgSessions] = useState([])
//   const [isEditing, setIsEditing] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)

//   useEffect(() => {
//     fetchSubjects()
//   }, [])

//   const fetchSubjects = async () => {
//     try {
//       const userProfile = JSON.parse(sessionStorage.getItem('userProfile'))
//       const userSubjectIds = userProfile.subjects
//       setSubjectIds(userSubjectIds)

//       if (userSubjectIds.length === 1) {
//         setSubjectId(userSubjectIds[0])
//         fetchSubjectInfo(userSubjectIds[0])
//       }
//     } catch (error) {
//       console.error('Error fetching subjects:', error)
//       toast.error('Failed to fetch subjects')
//     }
//   }

//   const fetchSubjectInfo = async (id) => {
//     setIsLoading(true)
//     try {
//       const response = await axios.get(`/api/subject?_id=${id}`)
//       setSubject(response.data.subject)
//       if (response.data.subject.subType === 'tg') {
//         setTgSessions(response.data.subject.tgSessions || [])
//       } else {
//         setContent(response.data.subject.content || [{
//           title: '', description: '', proposedDate: '', completedDate: '', references: '', courseOutcomes: '', programOutcomes: '', status: 'not_covered'
//         }])
//       }
//     } catch (error) {
//       console.error('Error fetching subject info:', error)
//       toast.error('Failed to fetch subject information')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleSubjectChange = (event) => {
//     const id = event.target.value
//     setSubjectId(id)
//     fetchSubjectInfo(id)
//   }

//   const handleAddContent = () => {
//     if (subject.subType === 'tg') {
//       setTgSessions([...tgSessions, { date: '', pointsDiscussed: '' }])
//     } else {
//       setContent([...content, {
//         title: '', description: '', proposedDate: '', completedDate: '', references: '', courseOutcomes: '', programOutcomes: '', status: 'not_covered'
//       }])
//     }
//   }
//   const handleContentChange = (index, event) => {
//     if (subject.subType === 'tg') {
//       const newTgSessions = [...tgSessions];
//       if (event.target.name === 'date') {
//         newTgSessions[index][event.target.name] = parseDate(event.target.value);
//       } else {
//         newTgSessions[index][event.target.name] = event.target.value;
//       }
//       setTgSessions(newTgSessions);
//     } else {
//       const newContent = [...content];
//       if (event.target.name === 'proposedDate' || event.target.name === 'completedDate') {
//         newContent[index][event.target.name] = parseDate(event.target.value);
//       } else {
//         newContent[index][event.target.name] = event.target.value;
//       }
//       setContent(newContent);
//     }
//   };

//   const handleStatusChange = (index) => {
//     const newContent = [...content]
//     newContent[index].status = newContent[index].status === 'covered' ? 'not_covered' : 'covered'
//     setContent(newContent)
//   }

//   const handleRemoveContent = (index) => {
//     if (subject.subType === 'tg') {
//       const newTgSessions = [...tgSessions]
//       newTgSessions.splice(index, 1)
//       setTgSessions(newTgSessions)
//     } else {
//       const newContent = [...content]
//       newContent.splice(index, 1)
//       setContent(newContent)
//     }
//   }

//   const handleCancel = () => {
//     setIsEditing(false)
//     fetchSubjectInfo(subjectId)
//   }

//   const handleSubmit = async (event) => {
//     event.preventDefault()
//     if (!subjectId) {
//       toast.error('Please select a subject')
//       return
//     }

//     setIsLoading(true)
//     try {
//       let response
//       if (subject.subType === 'tg') {
//         const validTgSessions = tgSessions
//           .filter(session => session.date && session.pointsDiscussed)
//           .map(session => ({
//             ...session,
//             pointsDiscussed: Array.isArray(session.pointsDiscussed)
//               ? session.pointsDiscussed
//               : session.pointsDiscussed.split(',').map(point => point.trim()).filter(point => point !== '')
//           }))

//         response = await axios.put(`/api/contents?_id=${subjectId}`, {
//           tgSessions: validTgSessions,
//         })
//       } else {
//         const validContent = content.filter(item => item.title.trim() !== '')
//         response = await axios.put(`/api/contents?_id=${subjectId}`, {
//           content: validContent,
//         })
//       }

//       if (response.status === 200) {
//         toast.success('Content updated successfully')
//         setIsEditing(false)
//         fetchSubjectInfo(subjectId)
//       } else {
//         toast.error('Failed to update content')
//       }
//     } catch (error) {
//       console.error('Error updating content:', error)
//       toast.error('Error updating content')
//     } finally {
//       setIsLoading(false)
//     }
//   }
//   const formatDate = (dateString) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = date.getFullYear();
//     return `${day}-${month}-${year}`;
//   };

//   const parseDate = (dateString) => {
//     if (!dateString) return '';
//     const [day, month, year] = dateString.split('-');
//     return `${year}-${month}-${day}`;
//   };

//   const handleUploadExcel = async (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     setIsLoading(true);
//     try {
//       const data = await file.arrayBuffer();
//       const workbook = XLSX.read(data, { type: 'array', cellDates: true });
//       const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//       const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
//         header: 1,
//         raw: false,
//         dateNF: 'dd-mm-yyyy'
//       });

//       if (subject.subType === 'tg') {
//         const parsedTgSessions = jsonData.slice(1).map(row => ({
//           date: formatDate(row[0]) || '',
//           pointsDiscussed: row[1] || '',
//         }));
//         setTgSessions(parsedTgSessions);
//       } else {
//         const parsedContent = jsonData.slice(1).map(row => ({
//           title: row[0] || '',
//           description: row[1] || '',
//           proposedDate: formatDate(row[2]) || '',
//           completedDate: formatDate(row[3]) || '',
//           references: row[4] || '',
//           courseOutcomes: row[5] || '',
//           programOutcomes: row[6] || '',
//           status: row[7] || 'not_covered',
//         }));
//         setContent(parsedContent);
//       }
//       setIsEditing(true);
//       toast.success('Excel file uploaded successfully');
//     } catch (error) {
//       console.error('Error uploading Excel file:', error);
//       toast.error('Failed to upload Excel file');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDownloadExcel = () => {
//     const dataToExport = subject.subType === 'tg' 
//       ? tgSessions.map(session => ({
//           ...session,
//           date: formatDate(session.date)
//         }))
//       : content.map(item => ({
//           ...item,
//           proposedDate: formatDate(item.proposedDate),
//           completedDate: formatDate(item.completedDate)
//         }));

//     const worksheet = XLSX.utils.json_to_sheet(dataToExport);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Teaching Plan');
//     XLSX.writeFile(workbook, 'TeachingPlan.xlsx');
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Manage Teaching Plan</h1>

//       {subjectIds.length > 1 && (
//         <div className="mb-4">
//           <Select
//             label="Select Subject"
//             placeholder="Choose a subject"
//             selectedKeys={subjectId ? [subjectId] : []}
//             onChange={handleSubjectChange}
//           >
//             {subjectIds.map((subject) => (
//               <SelectItem key={subject} value={subject}>
//                 {subject}
//               </SelectItem>
//             ))}
//           </Select>
//         </div>
//       )}

//       {subjectId && (
//         <div className="mt-4 p-4 bg-gray-100 rounded-md">
//           <h2 className="text-lg font-bold mb-2">Subject Information</h2>
//           <p>Department: {subject.department}</p>
//           <p>Name: {subject.name}</p>
//           <p>Code: {subject._id}</p>
//           <p>Class: {subject.class}</p>
//           <p>Type: {subject.subType}</p>
//         </div>
//       )}

//       {subjectId && !isEditing ? (
//         <div className="mt-4">
//           <h3 className="text-lg font-bold mb-2">{subject.subType === 'tg' ? 'TG Sessions' : 'Course Content'}</h3>
//           {subject.subType === 'tg' ? (
//             tgSessions.length > 0 ? (
//               <Table aria-label="TG Sessions">
//                 <TableHeader>
//                   <TableColumn>Date</TableColumn>
//                   <TableColumn>Points Discussed</TableColumn>
//                 </TableHeader>
//                 <TableBody>
//                   {tgSessions.map((session, index) => (
//                     <TableRow key={index}>
//                       <TableCell>{session.date.split('T')[0]}</TableCell>
//                       <TableCell>
//                         <ul className="list-disc pl-4">
//                           {Array.isArray(session.pointsDiscussed)
//                             ? session.pointsDiscussed.map((point, pointIndex) => (
//                               <li key={pointIndex}>{point}</li>
//                             ))
//                             : session.pointsDiscussed.split(',').map((point, pointIndex) => (
//                               <li key={pointIndex}>{point.trim()}</li>
//                             ))
//                           }
//                         </ul>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             ) : (
//               <p>No TG sessions available.</p>
//             )
//           ) : (
//             content.length > 0 ? (
//               <Table aria-label="Course Content">
//                 <TableHeader>
//                   <TableColumn>Title</TableColumn>
//                   <TableColumn>Description</TableColumn>
//                   <TableColumn>Proposed Date</TableColumn>
//                   <TableColumn>Completed Date</TableColumn>
//                   <TableColumn>References</TableColumn>
//                   <TableColumn>Course Outcomes</TableColumn>
//                   <TableColumn>Program Outcomes</TableColumn>
//                   <TableColumn>Status</TableColumn>
//                 </TableHeader>
//                 <TableBody>
//                   {content.map((item, index) => (
//                     <TableRow key={index}>
//                       <TableCell>{item.title}</TableCell>
//                       <TableCell>{item.description}</TableCell>
//                       <TableCell>{item.proposedDate}</TableCell>
//                       <TableCell>{item.completedDate}</TableCell>
//                       <TableCell>{item.references}</TableCell>
//                       <TableCell>{item.courseOutcomes}</TableCell>
//                       <TableCell>{item.programOutcomes}</TableCell>
//                       <TableCell>{item.status}</TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             ) : (
//               <p>No content available.</p>
//             )
//           )}
//           <Button
//             color="primary"
//             onClick={() => setIsEditing(true)}
//             className="mt-4"
//           >
//             Edit {subject.subType === 'tg' ? 'TG Sessions' : 'Content'}
//           </Button>
//         </div>
//       ) : subjectId && isEditing ? (
//         <form onSubmit={handleSubmit} className="mt-4 space-y-4">
//           <h3 className="text-lg font-bold mb-2">{subject.subType === 'tg' ? 'TG Sessions' : 'Content'}</h3>
//           {subject.subType === 'tg' ? (
//             tgSessions.map((session, index) => (
//               <div key={index} className="flex flex-col gap-2 p-4 border rounded-md">
//                 <Input
//                   type="date"
//                   name="date"
//                   label="Date"
//                   value={formatDate(session.date.split('T')[0])}
//                   onChange={(e) => handleContentChange(index, e)}
//                   required
//                 />
//                 <Textarea
//                   name="pointsDiscussed"
//                   label="Points Discussed (comma-separated)"
//                   value={Array.isArray(session.pointsDiscussed) ? session.pointsDiscussed.join(', ') : session.pointsDiscussed}
//                   onChange={(e) => handleContentChange(index, e)}
//                   required
//                 />
//                 <Button
//                   color="danger"
//                   onClick={() => handleRemoveContent(index)}
//                 >
//                   Remove Session
//                 </Button>
//               </div>
//             ))
//           ) : (
//             content.map((item, index) => (
//               <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
//                 <Input
//                   type="text"
//                   name="title"
//                   label="Title"
//                   value={item.title}
//                   onChange={(e) => handleContentChange(index, e)}
//                   required
//                 />
//                 <Input
//                   type="text"
//                   name="description"
//                   label="Description"
//                   value={item.description}
//                   onChange={(e) => handleContentChange(index, e)}
//                   required
//                 />
//                 <Input
//                   type="date"
//                   name="proposedDate"
//                   label="Proposed Date"
//                   value={formatDate(item.proposedDate)}
//                   onChange={(e) => handleContentChange(index, e)}
//                 />
//                 <Input
//                   type="date"
//                   name="completedDate"
//                   label="Completed Date"
//                   value={formatDate(item.completedDate)}
//                   onChange={(e) => handleContentChange(index, e)}
//                 />
//                 <Input
//                   type="text"
//                   name="references"
//                   label="References"
//                   value={item.references}
//                   onChange={(e) => handleContentChange(index, e)}
//                 />
//                 <Input
//                   type="text"
//                   name="courseOutcomes"
//                   label="Course Outcomes"
//                   value={item.courseOutcomes}
//                   onChange={(e) => handleContentChange(index, e)}
//                 />
//                 <Input
//                   type="text"
//                   name="programOutcomes"
//                   label="Program Outcomes"

//                   value={item.programOutcomes}
//                   onChange={(e) => handleContentChange(index, e)}
//                 />
//                 <Checkbox
//                   isSelected={item.status === 'covered'}
//                   onChange={() => handleStatusChange(index)}
//                 >
//                   Covered
//                 </Checkbox>
//                 <Button
//                   color="danger"
//                   onClick={() => handleRemoveContent(index)}
//                 >
//                   Remove Content
//                 </Button>
//               </div>
//             ))
//           )}
//           <Button
//             color="primary"
//             onClick={handleAddContent}
//           >
//             Add {subject.subType === 'tg' ? 'TG Session' : 'Content'}
//           </Button>
//           <div className="flex justify-end gap-2 mt-4">
//             <Button
//               color="primary"
//               type="submit"
//               isLoading={isLoading}
//             >
//               Save
//             </Button>
//             <Button
//               color="secondary"
//               onClick={handleCancel}
//               isDisabled={isLoading}
//             >
//               Cancel
//             </Button>
//           </div>
//         </form>
//       ) : null
//       }
  
//       {subjectId && (
//         <div className="flex gap-4 mt-4">
//           <input
//             type="file"
//             accept=".xlsx, .xls"
//             onChange={handleUploadExcel}
//             className="hidden"
//             id="uploadExcel"
//           />
//           <Button
//             color="secondary"
//             onClick={() => document.getElementById('uploadExcel').click()}
//             isDisabled={isLoading}
//           >
//             Upload {subject.subType === 'tg' ? 'TG Sessions' : 'Teaching Plan'} (Excel)
//           </Button>
//           <Button
//             color="primary"
//             onClick={handleDownloadExcel}
//             isDisabled={isLoading}
//           >
//             Download {subject.subType === 'tg' ? 'TG Sessions' : 'Teaching Plan'} (Excel)
//           </Button>
//         </div>
//       )}
//     </div>
//   )
// }

import TeachingPlanPage from '@/app/components/TeachingPlanPage'
import React from 'react'

const page = () => {
  return (
    <div>
      <TeachingPlanPage/>
    </div>
  )
}

export default page
