// Import necessary modules
"use client"
import React, { useState } from 'react';
import axios from 'axios';
import { Checkbox, Button, Spinner } from '@nextui-org/react';

const UpdateAttendanceForm = () => {
    const [subjectId, setSubjectId] = useState('');
    const [lectureDate, setLectureDate] = useState('');
    const [attendances, setAttendances] = useState([]); // Initialize as empty array
    const [loading, setLoading] = useState(false);

    const fetchAttendanceRecords = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/attendance`, {
                params: {
                    subjectId,
                    startDate: lectureDate, // Pass lectureDate as startDate
                    endDate: lectureDate   // Use same date for startDate and endDate for single date query
                }
            });
            setAttendances(response.data); // Assuming response.data is an array of attendance records
            setLoading(false);
        } catch (error) {
            console.error('Error fetching attendance records:', error);
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            const updatedRecords = attendances.map(attendance => ({
                _id: attendance._id,
                records: attendance.records.map(record => ({
                    student: record.student,
                    status: document.getElementById(record._id).checked ? 'present' : 'absent'
                }))
            }));

            await axios.put('/api/attendance', { updatedRecords });
            alert('Attendance updated successfully');
        } catch (error) {
            console.error('Failed to update attendance:', error);
            alert('Failed to update attendance');
        }
    };

    return (
      <div>
          <label>
              Subject ID:
              <input type="text" value={subjectId} onChange={e => setSubjectId(e.target.value)} />
          </label>
          <label>
              Lecture Date:
              <input type="date" value={lectureDate} onChange={e => setLectureDate(e.target.value)} />
          </label>
          <Button onClick={fetchAttendanceRecords} disabled={!subjectId || !lectureDate || loading}>
              {loading ? <Spinner /> : 'Fetch Attendance Records'}
          </Button>
          <br />
          {attendances && attendances.length > 0 && ( // Add null check for attendances
              <div>
                  {attendances.map(attendance => (
                      <div key={attendance._id}>
                          <h3>{attendance.subject}</h3>
                          <ul>
                              {attendance.records.map(record => (
                                  <li key={record._id}>
                                      <label>
                                          {record.student.name}:
                                          <Checkbox
                                              id={record._id}
                                              defaultChecked={record.status === 'present'}
                                          />
                                      </label>
                                  </li>
                              ))}
                          </ul>
                      </div>
                  ))}
                  <Button onClick={handleUpdate}>Update Attendance</Button>
              </div>
          )}
      </div>
  );
};

export default UpdateAttendanceForm;