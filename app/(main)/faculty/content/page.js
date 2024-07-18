// "use client";

// import React, { useState, useEffect } from 'react';
// import { toast } from 'sonner';
// import axios from 'axios';
// import { Button, Input, Checkbox } from '@nextui-org/react';
// import * as XLSX from 'xlsx';

// const TeachingPlanPage = () => {
//   const [subjectId, setSubjectId] = useState('');
//   const [subjectIds, setSubjectIds] = useState([]);
//   const [subject, setSubject] = useState([]);
//   const [content, setContent] = useState([{
//     title: '', description: '', proposedDate: '', completedDate: '', references: '', status: 'not_covered'
//   }]);

//   useEffect(() => {
//     fetchSubjects();
//   }, []);

//   const fetchSubjects = async () => {
//     try {
//       const userProfile = JSON.parse(sessionStorage.getItem('userProfile'));
//       const userSubjectIds = userProfile.subjects;
//       setSubjectIds(userSubjectIds);

//       if (userSubjectIds.length === 1) {
//         setSubjectId(userSubjectIds[0]);
//         fetchSubjectInfo(userSubjectIds[0]);
//       }
//     } catch (error) {
//       console.error('Error fetching subjects:', error);
//     }
//   };

//   const fetchSubjectInfo = async (subjectId) => {
//     try {
//       const response = await axios.get(`/api/subject?_id=${subjectId}`);
//       setSubject(response.data.subject);
//       setContent(response.data.subject.content || [{
//         title: '', description: '', proposedDate: '', completedDate: '', references: '', status: 'not_covered'
//       }]);
//     } catch (error) {
//       console.error('Error fetching subject info:', error);
//     }
//   };

//   const handleSubjectChange = (event) => {
//     const subjectId = event.target.value;
//     setSubjectId(subjectId);
//     fetchSubjectInfo(subjectId);
//   };

//   const handleAddContent = () => {
//     setContent([...content, {
//       title: '', description: '', proposedDate: '', completedDate: '', references: '', status: 'not_covered'
//     }]);
//   };

//   const handleContentChange = (index, event) => {
//     const newContent = [...content];
//     newContent[index][event.target.name] = event.target.value;
//     setContent(newContent);
//   };

//   const handleStatusChange = (index) => {
//     const newContent = [...content];
//     newContent[index].status = newContent[index].status === 'covered' ? 'not_covered' : 'covered';
//     setContent(newContent);
//   };

//   const handleRemoveContent = (index) => {
//     const newContent = [...content];
//     newContent.splice(index, 1);
//     setContent(newContent);
//   };

//   const handleCancel = () => {
//     setSubjectId('');
//     setContent([{
//       title: '', description: '', proposedDate: '', completedDate: '', references: '', status: 'not_covered'
//     }]);
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     if (!subjectId) {
//       toast.error('Please select a subject');
//       return;
//     }

//     const validContent = content.filter(item => item.title.trim() !== '');
//     if (validContent.length === 0) {
//       toast.error('Please add at least one content item');
//       return;
//     }

//     try {
//       const response = await axios.put(`/api/contents?_id=${subjectId}`, {
//         content: validContent,
//       });
//       if (response.status === 200) {
//         toast.success('Content updated successfully');
//         handleCancel();
//       } else {
//         toast.error('Failed to update content');
//       }
//     } catch (error) {
//       console.error('Error updating content:', error);
//       toast.error('Error updating content');
//     }
//   };

//   const handleDownloadExcel = () => {
//     const worksheet = XLSX.utils.json_to_sheet(content);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Teaching Plan');
//     XLSX.writeFile(workbook, 'TeachingPlan.xlsx');
//   };

//   const handleUploadExcel = (event) => {
//     const file = event.target.files[0];
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const data = new Uint8Array(e.target.result);
//       const workbook = XLSX.read(data, { type: 'array' });
//       const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//       const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

//       const parsedContent = jsonData.slice(1).map(row => ({
//         title: row[0] || '',
//         description: row[1] || '',
//         proposedDate: row[2] || '',
//         completedDate: row[3] || '',
//         references: row[4] || '',
//         status: row[5] || 'not_covered',
//       }));

//       setContent(parsedContent);
//     };
//     reader.readAsArrayBuffer(file);
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Manage Teaching Plan</h1>
//       {subjectId && (
//         <div className="mt-4">
//           <h2 className="text-lg font-bold mb-2">Subject Information</h2>
//           <h3>Subject Department - {subject.department}</h3>
//           <h3>Subject Name - {subject.name}</h3>
//           <h3>Subject Code - {subject._id}</h3>
//           <h3>Subject Faculty Name - {subject.teacher}</h3>
//           <h3>Subject class - {subject.class}</h3>
//         </div>
//       )}
//       {subjectIds.length > 1 && (
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">Subject</label>
//           <select
//             value={subjectId}
//             onChange={handleSubjectChange}
//             className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
//           >
//             <option value="">Select Subject</option>
//             {subjectIds.map((subject) => (
//               <option key={subject} value={subject}>
//                 {subject}
//               </option>
//             ))}
//           </select>
//         </div>
//       )}
//       <form onSubmit={handleSubmit} className="w-full bg-white p-2 grid grid-cols-1 gap-4">
//         <div className="col-span-1">
//           <h3 className="text-lg font-bold mb-2">Content</h3>
//           {content.map((item, index) => (
//             <div key={index} className="flex gap-4 mb-2">
//               <Input
//                 type="text"
//                 name="title"
//                 label="Title"
//                 value={item.title}
//                 onChange={(e) => handleContentChange(index, e)}
//                 required
//                 className="w-full"
//                 variant="bordered"
//                 size="sm"
//               />
//               <Input
//                 type="text"
//                 name="description"
//                 label="Description"
//                 value={item.description}
//                 onChange={(e) => handleContentChange(index, e)}
//                 required
//                 className="w-full"
//                 variant="bordered"
//                 size="sm"
//               />
//               <Input
//                 type="text"
//                 name="proposedDate"
//                 label="Proposed Date"
//                 value={item.proposedDate}
//                 onChange={(e) => handleContentChange(index, e)}
//                 required
//                 className="w-full"
//                 variant="bordered"
//                 size="sm"
//               />
//               <Input
//                 type="text"
//                 name="completedDate"
//                 label="Completed Date"
//                 value={item.completedDate}
//                 onChange={(e) => handleContentChange(index, e)}
//                 required
//                 className="w-full"
//                 variant="bordered"
//                 size="sm"
//               />
//               <Input
//                 type="text"
//                 name="references"
//                 label="References"
//                 value={item.references}
//                 onChange={(e) => handleContentChange(index, e)}
//                 required
//                 className="w-full"
//                 variant="bordered"
//                 size="sm"
//               />
//               <Checkbox
//                 isSelected={item.status === 'covered'}
//                 onChange={() => handleStatusChange(index)}
//                 size="sm"
//               >
//                 Covered
//               </Checkbox>
//               <Button
//                 color="error"
//                 variant="bordered"
//                 size="sm"
//                 auto
//                 onClick={() => handleRemoveContent(index)}
//               >
//                 Remove
//               </Button>
//             </div>
//           ))}
//           <Button
//             color="default"
//             variant="bordered"
//             size="sm"
//             auto
//             onClick={handleAddContent}
//           >
//             Add Content
//           </Button>
//         </div>
//         <div className="col-span-1 flex justify-end gap-4">
//           <Button
//             variant="ghost"
//             size="sm"
//             color="default"
//             onClick={handleCancel}
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             color="primary"
//             type="submit"
//           >
//             Update Teaching Plan
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             color="secondary"
//             onClick={handleDownloadExcel}
//           >
//             Download Excel
//           </Button>
//           <input
//             type="file"
//             accept=".xlsx, .xls"
//             onChange={handleUploadExcel}
//             className="hidden"
            
            
//             id="uploadExcel"
//           />
//           <Button
//             variant="ghost"
//             size="sm"
//             color="secondary"
//             onClick={() => document.getElementById('uploadExcel').click()}
//           >
//             Upload Excel
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default TeachingPlanPage;
"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { Button, Input, Checkbox, Table, TableBody, TableCell, TableHeader, TableColumn, TableRow, SelectItem, Select } from '@nextui-org/react';
import * as XLSX from 'xlsx';

const TeachingPlanPage = () => {
  const [subjectId, setSubjectId] = useState('');
  const [subjectIds, setSubjectIds] = useState([]);
  const [subject, setSubject] = useState({});
  const [content, setContent] = useState([{
    title: '', description: '', proposedDate: '', completedDate: '', references: '', status: 'not_covered'
  }]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const userProfile = JSON.parse(sessionStorage.getItem('userProfile'));
      const userSubjectIds = userProfile.subjects;
      setSubjectIds(userSubjectIds);

      if (userSubjectIds.length === 1) {
        setSubjectId(userSubjectIds[0]);
        fetchSubjectInfo(userSubjectIds[0]);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchSubjectInfo = async (subjectId) => {
    try {
      const response = await axios.get(`/api/subject?_id=${subjectId}`);
      setSubject(response.data.subject);
      setContent(response.data.subject.content || [{
        title: '', description: '', proposedDate: '', completedDate: '', references: '', status: 'not_covered'
      }]);
    } catch (error) {
      console.error('Error fetching subject info:', error);
    }
  };

  const handleSubjectChange = (event) => {
    const subjectId = event.target.value;
    setSubjectId(subjectId);
    fetchSubjectInfo(subjectId);
  };

  const handleAddContent = () => {
    setContent([...content, {
      title: '', description: '', proposedDate: '', completedDate: '', references: '', status: 'not_covered'
    }]);
  };

  const handleContentChange = (index, event) => {
    const newContent = [...content];
    newContent[index][event.target.name] = event.target.value;
    setContent(newContent);
  };

  const handleStatusChange = (index) => {
    const newContent = [...content];
    newContent[index].status = newContent[index].status === 'covered' ? 'not_covered' : 'covered';
    setContent(newContent);
  };

  const handleRemoveContent = (index) => {
    const newContent = [...content];
    newContent.splice(index, 1);
    setContent(newContent);
  };

  const handleCancel = () => {
    setSubjectId('');
    setContent([{
      title: '', description: '', proposedDate: '', completedDate: '', references: '', status: 'not_covered'
    }]);
    setIsEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!subjectId) {
      toast.error('Please select a subject');
      return;
    }

    const validContent = content.filter(item => item.title.trim() !== '');
    if (validContent.length === 0) {
      toast.error('Please add at least one content item');
      return;
    }

    try {
      const response = await axios.put(`/api/contents?_id=${subjectId}`, {
        content: validContent,
      });
      if (response.status === 200) {
        toast.success('Content updated successfully');
        handleCancel();
      } else {
        toast.error('Failed to update content');
      }
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Error updating content');
    }
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(content);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Teaching Plan');
    XLSX.writeFile(workbook, 'TeachingPlan.xlsx');
  };

  const handleUploadExcel = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const parsedContent = jsonData.slice(1).map(row => ({
        title: row[0] || '',
        description: row[1] || '',
        proposedDate: row[2] || '',
        completedDate: row[3] || '',
        references: row[4] || '',
        status: row[5] || 'not_covered',
      }));

      setContent(parsedContent);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Teaching Plan</h1>
      {subjectId && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <h2 className="text-lg font-bold mb-2">Subject Information</h2>
          <p>Subject Department: {subject.department}</p>
          <p>Subject Name: {subject.name}</p>
          <p>Subject Code: {subject._id}</p>
          <p>Subject Faculty Name: {subject.teacher}</p>
          <p>Subject Class: {subject.class}</p>
        </div>
      )}
      {subjectIds.length > 1 && (
        <div className="mb-4">
         
          <Select
            label="Subject"
            selectedKeys={[subjectId]}
            onChange={handleSubjectChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {subjectIds.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </Select>
        </div>
      )}
      {!isEditing ? (
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">Course Content</h3>
          {content.length > 0 ? (
            <Table
              aria-label="Course Content"
              css={{
                height: "auto",
                minWidth: "100%",
              }}
            >
              <TableHeader>
                <TableColumn>Title</TableColumn>
                <TableColumn>Description</TableColumn>
                <TableColumn>Proposed Date</TableColumn>
                <TableColumn>Completed Date</TableColumn>
                <TableColumn>References</TableColumn>
                <TableColumn>Status</TableColumn>
              </TableHeader>
              <TableBody>
                {content.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.proposedDate}</TableCell>
                    <TableCell>{item.completedDate}</TableCell>
                    <TableCell>{item.references}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No content available.</p>
          )}
          <Button
            color="primary"
            variant="ghost"
            size="sm"
            auto
            onClick={() => setIsEditing(true)}
            className="mt-2"
          >
            Edit Content
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full bg-white p-2 grid grid-cols-1 gap-4">
          <div className="col-span-1">
            <h3 className="text-lg font-bold mb-2">Content</h3>
            {content.map((item, index) => (
              <div key={index} className="flex gap-4 mb-2">
                <Input
                  type="text"
                  name="title"
                  label="Title"
                  value={item.title}
                  onChange={(e) => handleContentChange(index, e)}
                  required
                  className="w-full"
                  variant="bordered"
                  size="sm"
                />
                <Input
                  type="text"
                  name="description"
                  label="Description"
                  value={item.description}
                  onChange={(e) => handleContentChange(index, e)}
                  required
                  className="w-full"
                  variant="bordered"
                  size="sm"
                />
                <Input
                  type="text"
                  name="proposedDate"
                  label="Proposed Date"
                  value={item.proposedDate}
                  onChange={(e) => handleContentChange(index, e)}
                  required
                  className="w-full"
                  variant="bordered"
                  size="sm"
                />
                <Input
                  type="text"
                  name="completedDate"
                  label="Completed Date"
                  value={item.completedDate}
                  onChange={(e) => handleContentChange(index, e)}
                  required
                  className="w-full"
                  variant="bordered"
                  size="sm"
                />
                <Input
                  type="text"
                  name="references"
                  label="References"
                  value={item.references}
                  onChange={(e) => handleContentChange(index, e)}
                  required
                  className="w-full"
                  variant="bordered"
                  size="sm"
                />
                <div className="flex items-center">
                  <Checkbox
                    name="status"
                    label="Status"
                    isSelected={item.status === 'covered'}
                    onChange={() => handleStatusChange(index)}
                    size="sm"
                  >
                    Covered
                  </Checkbox>
                </div>
                <Button
                  color="error"
                  size="sm"
                  auto
                  onClick={() => handleRemoveContent(index)}
                  className="mt-2"
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              color="primary"
              variant="ghost"
              size="sm"
              auto
              onClick={handleAddContent}
              className="mt-2"
            >
              Add Content
            </Button>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                color="primary"
                variant="ghost"
                size="sm"
                auto
                type="submit"
                className="mt-2"
              >
                Save
              </Button>
              <Button
                color="error"
                variant="ghost"
                size="sm"
                auto
                onClick={handleCancel}
                className="mt-2"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}
      <div className="flex gap-4 mt-4">
      <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleUploadExcel}
              className="hidden"
              id="uploadExcel"
            />
            <Button
              variant="bordered"
              size="sm"
              color="secondary"
               className="mt-2"
              onClick={() => document.getElementById('uploadExcel').click()}
            >
              Upload  Teaching Plan (Excel)
            </Button>
        <Button
          color="primary"
          variant="ghost"
          size="sm"
          auto
          onClick={handleDownloadExcel}
          className="mt-2"
        >
          Download Teaching Plan (Excel)
        </Button>
      </div>
    </div>
  );
};

export default TeachingPlanPage;
