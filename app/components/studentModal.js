// import React, { useState, useEffect } from "react";
// import { Modal, Button, Input, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem } from "@nextui-org/react";
// import { toast } from "sonner";
// import axios from "axios";
// import { departmentOptions } from "../utils/department";

// const StudentModal = ({ isOpen, onClose, mode, student, onSubmit }) => {
//   const [profile, setProfile] = useState(null);
//   const [formData, setFormData] = useState({
//     _id: "",
//     rollNumber: "",
//     name: "",
//     passOutYear: "",
//     department: "",
//     email: "",
//     phoneNo: "",
//     password: "",
//     year: ""
//   });

//   useEffect(() => {
//     const storedProfile = sessionStorage.getItem('userProfile');
//     if (storedProfile) {
//       setProfile(JSON.parse(storedProfile));
//     }
//   }, []);

//   useEffect(() => {
//     if (profile?.role !== "superadmin") {
//       setFormData((prev) => ({
//         ...prev,
//         department: profile?.department,
//       }));
//     }
//   }, [profile]);

//   useEffect(() => {
//     if (mode === "edit" && student) {
//       setFormData({
//         _id: student._id,
//         rollNumber: student.rollNumber,
//         name: student.name,
//         passOutYear: student.passOutYear,
//         department: student.department,
//         email: student.email,
//         phoneNo: student.phoneNo,
//         password: student.password,
//         year: student.year
//       });
//     } else {
//       setFormData({
//         _id: "",
//         rollNumber: "",
//         name: "",
//         passOutYear: "",
//         department: "",
//         phoneNo: "",
//         email: "",
//         password: "",
//         year: ""
//       });
//     }
//   }, [mode, student]);

//   useEffect(() => {
//     if (!isOpen) {
//       handleClear();
//     }
//   }, [isOpen]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     const updatedFormData = { ...formData, [name]: value };

//     if (name === 'year') {
//       const passOutYear = (parseInt(value) + 4).toString();
//       updatedFormData.passOutYear = passOutYear;
//     }

//     setFormData(updatedFormData);
//   };

//   const handleSelectChange = (key, value) => {
//     setFormData({ ...formData, [key]: value });
//   };

//   const handleClear = () => {
//     setFormData({
//       _id: "",
//       rollNumber: "",
//       name: "",
//       passOutYear: "",
//       department: "",
//       phoneNo: "",
//       email: "",
//       password: "",
//       year: ""
//     });
//   };

//   const handleSubmit = async () => {
//     try {
//       let response;
//       if (mode === "add") {
//         response = await axios.post("/api/student", formData);
//         console.log("Student added:", response.data);
//         toast.success("Student added successfully");
//         onSubmit();
//       } else if (mode === "edit") {
//         console.log(formData);
//         response = await axios.put(`/api/student?_id=${formData._id}`, formData);
//         console.log("Student updated:", response.data);
//         toast.success("Student updated successfully");
//       }
//       onClose();
//       handleClear();
//     } catch (error) {
//       console.error("Error:", error);
//       toast.error("Error occurred while saving student data");
//     }
//   };

//   return (
//     <Modal isOpen={isOpen} onClose={onClose}>
//       <ModalContent>
//         <ModalHeader>{mode === "add" ? "Add Student" : "Edit Student"}</ModalHeader>
//         <ModalBody>
//           <div className="grid grid-cols-2 gap-4">
//             <Input
//               label="ID"
//               name="_id"
//               value={formData._id}
//               onChange={handleChange}
//               required
//               disabled={mode !== "add"}
//               variant="bordered"
//               size="sm"
//             />
//             <Input
//               label="Roll Number"
//               name="rollNumber"
//               value={formData.rollNumber}
//               onChange={handleChange}
//               required
//               variant="bordered"
//               size="sm"
//             />
//             <Input
//               label="Name"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               required
//               variant="bordered"
//               size="sm"
//             />
//             <Input
//               label="Admission Year"
//               name="year"
//               value={formData.year}
//               onChange={handleChange}
//               required
//               variant="bordered"
//               size="sm"
//             />
//             <Input
//               label="Pass Out Year"
//               name="passOutYear"
//               value={formData.passOutYear}
//               onChange={handleChange}
//               required
//               variant="bordered"
//               size="sm"
//             />
//             <Input
//               label="Phone No."
//               name="phoneNo"
//               value={formData.phoneNo}
//               onChange={handleChange}
//               required
//               variant="bordered"
//               size="sm"
//             />
//             <Input
//               label="Email ID"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//               variant="bordered"
//               size="sm"
//             />
//             <Input
//               label="Password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//               variant="bordered"
//               size="sm"
//             />
//             {profile?.role === "superadmin" ? (
//               <Select
//                 label="Department"
//                 placeholder="Select department"
//                 name="department"
//                 selectedKeys={new Set([formData.department])}
//                 onSelectionChange={(value) => handleSelectChange("department", value.currentKey)}
//                 variant="bordered"
//                 size="sm"
//               >
//                 {departmentOptions.map((department) => (
//                   <SelectItem key={department.key} textValue={department.label}>
//                     {department.label}
//                   </SelectItem>
//                 ))}
//               </Select>
//             ) : (
//               <Input
//                 label="Department"
//                 name="department"
//                 value={profile?.department}
//                 disabled
//                 variant="bordered"
//                 size="sm"
//               />
//             )}
//           </div>
//         </ModalBody>
//         <ModalFooter>
//           <Button auto flat color="error" onClick={() => { onClose(); handleClear(); }}>
//             Cancel
//           </Button>
//           <Button auto onClick={handleSubmit}>
//             {mode === "add" ? "Add" : "Update"}
//           </Button>
//         </ModalFooter>
//       </ModalContent>
//     </Modal>
//   );
// };

// export default StudentModal;
import React, { useState, useEffect } from "react";
import { Modal, Button, Input, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem } from "@nextui-org/react";
import { toast } from "sonner";
import axios from "axios";
import { departmentOptions } from "../utils/department";

const StudentModal = ({ isOpen, onClose, mode, student, onSubmit }) => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    _id: "",
    rollNumber: "",
    name: "",
    passOutYear: "",
    department: "",
    email: "",
    phoneNo: "",
    password: "",
    year: ""
  });

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

  useEffect(() => {
    if (profile?.role !== "superadmin") {
      setFormData((prev) => ({
        ...prev,
        department: profile?.department,
      }));
    }
  }, [profile]);

  useEffect(() => {
    if (mode === "edit" && student) {
      setFormData({
        _id: student._id,
        rollNumber: student.rollNumber,
        name: student.name,
        passOutYear: student.passOutYear,
        department: student.department,
        email: student.email,
        phoneNo: student.phoneNo,
        password: student.password,
        year: student.year
      });
    } else {
      handleClear();
    }
  }, [mode, student]);

  useEffect(() => {
    if (!isOpen) {
      handleClear();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "year" && { passOutYear: (parseInt(value) + 4).toString() })
    }));
  };

  const handleSelectChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClear = () => {
    setFormData({
      _id: "",
      rollNumber: "",
      name: "",
      passOutYear: "",
      department: profile?.role === "superadmin" ? "" : profile?.department,
      phoneNo: "",
      email: "",
      password: "",
      year: ""
    });
  };

  const handleSubmit = async () => {
    try {
      console.log(formData);
      let response;
      if (mode === "add") {
        response = await axios.post("/api/student", formData);
        toast.success("Student added successfully");
      } else if (mode === "edit") {
        response = await axios.put(`/api/student?_id=${formData._id}`, formData);
        toast.success("Student updated successfully");
      }
      onSubmit();
      onClose();
      handleClear();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error occurred while saving student data");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>{mode === "add" ? "Add Student" : "Edit Student"}</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ID"
              name="_id"
              value={formData._id}
              onChange={handleChange}
              required
              disabled={mode !== "add"}
              variant="bordered"
              size="sm"
            />
            <Input
              label="Roll Number"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              required
              variant="bordered"
              size="sm"
            />
            <Input
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              variant="bordered"
              size="sm"
            />
            <Input
              label="Admission Year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              variant="bordered"
              size="sm"
            />
            <Input
              label="Pass Out Year"
              name="passOutYear"
              value={formData.passOutYear}
              onChange={handleChange}
              required
              variant="bordered"
              size="sm"
              disabled
            />
            <Input
              label="Phone No."
              name="phoneNo"
              value={formData.phoneNo}
              onChange={handleChange}
              required
              variant="bordered"
              size="sm"
            />
            <Input
              label="Email ID"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              variant="bordered"
               size="sm"
            />
            <Input
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              variant="bordered"
              size="sm"
            />
            {profile?.role === "superadmin" ? (
              <Select
                label="Department"
                placeholder="Select department"
                name="department"
                selectedKeys={new Set([formData.department])}
                onSelectionChange={(value) => handleSelectChange("department", value.currentKey)}
                variant="bordered"
                size="sm"
              >
                {departmentOptions.map((department) => (
                  <SelectItem key={department.key} textValue={department.label}>
                    {department.label}
                  </SelectItem>
                ))}
              </Select>
            ) : (
              <Input
                label="Department"
                name="department"
                value={formData.department}
                disabled
                variant="bordered"
                size="sm"
              />
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button auto flat color="error" onClick={() => { onClose(); handleClear(); }}>
            Cancel
          </Button>
          <Button auto onClick={handleSubmit}>
            {mode === "add" ? "Add" : "Update"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default StudentModal;
