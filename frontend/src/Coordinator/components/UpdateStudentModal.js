import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const UpdateStudentModal = ({ showModal, setShowModal, selectedStudent, fetchStudents, apiUrl }) => {
  const [updateForm, setUpdateForm] = useState({
    student_id: '',
    lname: '',
    fname: '',
    mname: '',
    suffix: '',
    email: '',
    Phone_number: '',
    gender: '',
    Course: '',
    yearlevel: '',
    section: '',
    Track: ''
  });

  useEffect(() => {
    if (selectedStudent) {
      setUpdateForm({
        student_id: selectedStudent.student_id,
        lname: selectedStudent.lname,
        fname: selectedStudent.fname,
        mname: selectedStudent.mname || '',
        suffix: selectedStudent.suffix || '',
        email: selectedStudent.email,
        Phone_number: selectedStudent.Phone_number,
        gender: selectedStudent.gender,
        Course: selectedStudent.Course,
        yearlevel: selectedStudent.yearlevel,
        section: selectedStudent.section,
        Track: selectedStudent.Track || ''
      });
    }
  }, [selectedStudent]);

  const handleChange = (e) => {
    setUpdateForm({ ...updateForm, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${apiUrl}/student/${selectedStudent.student_id}`, updateForm);
      if (response.data.message) {
        Swal.fire({
          title: 'Success!',
          text: 'Student has been updated successfully.',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          fetchStudents();
          setShowModal(false);
          setUpdateForm({
            student_id: '', lname: '', fname: '', mname: '', suffix: '',
            email: '', Phone_number: '', gender: '', Course: '', yearlevel: '', section: '', Track: ''
          });
        });
      }
    } catch (err) {
      console.error('Error updating student:', err.response?.data || err);
      let errorMessage = 'Failed to update student';
      
      if (err.response?.data?.errors) {
        errorMessage = Object.values(err.response.data.errors).flat().join(', ');
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  if (!showModal) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={() => setShowModal(false)}>&times;</span>
        <h3>Update Student</h3>
        <form onSubmit={handleUpdate} className="student-form">
          <input 
            name="student_id" 
            value={updateForm.student_id} 
            onChange={handleChange} 
            placeholder="Student ID" 
            required 
            disabled
          />
          <input 
            name="lname" 
            value={updateForm.lname} 
            onChange={handleChange} 
            placeholder="Last Name" 
            required 
          />
          <input 
            name="fname" 
            value={updateForm.fname} 
            onChange={handleChange} 
            placeholder="First Name" 
            required 
          />
          <input 
            name="mname" 
            value={updateForm.mname} 
            onChange={handleChange} 
            placeholder="Middle Name" 
          />
          <input 
            name="suffix" 
            value={updateForm.suffix} 
            onChange={handleChange} 
            placeholder="Suffix" 
          />
          <input 
            name="email" 
            value={updateForm.email} 
            onChange={handleChange} 
            placeholder="Email" 
            required 
          />
          <input 
            name="Phone_number" 
            value={updateForm.Phone_number} 
            onChange={handleChange} 
            placeholder="Phone Number" 
            required 
          />
          <select 
            name="gender" 
            value={updateForm.gender} 
            onChange={handleChange} 
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <input 
            name="Course" 
            value={updateForm.Course} 
            onChange={handleChange} 
            placeholder="Course" 
            required 
          />
          <input 
            name="yearlevel" 
            value={updateForm.yearlevel} 
            onChange={handleChange} 
            placeholder="Year Level" 
            required 
          />
          <input 
            name="section" 
            value={updateForm.section} 
            onChange={handleChange} 
            placeholder="Section" 
            required 
          />
          {/* <input 
            name="Track" 
            value={updateForm.Track} 
            onChange={handleChange} 
            placeholder="Track" 
          /> */}
          <button type="submit" className="btn btn-primary">Update Student</button>
        </form>
      </div>
    </div>
  );
};

export default UpdateStudentModal; 