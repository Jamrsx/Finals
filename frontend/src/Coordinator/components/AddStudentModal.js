import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AddStudentModal = ({ showModal, setShowModal, fetchStudents, apiUrl }) => {
  const [form, setForm] = useState({
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/students`, form);
      if (response.data.message) {
        Swal.fire({
          title: 'Success!',
          text: 'Student has been added successfully.',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          fetchStudents();
          setShowModal(false);
          setForm({
            student_id: '', lname: '', fname: '', mname: '', suffix: '',
            email: '', Phone_number: '', gender: '', Course: '', yearlevel: '', section: '', Track: ''
          });
        });
      }
    } catch (err) {
      console.error('Error adding student:', err.response?.data || err);
      let errorMessage = 'Failed to add student';
      
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
        <h3>Add New Student</h3>
        <form onSubmit={handleSubmit} className="student-form">
          <input 
            name="student_id" 
            value={form.student_id} 
            onChange={handleChange} 
            placeholder="Student ID" 
            required 
          />
          <input 
            name="lname" 
            value={form.lname} 
            onChange={handleChange} 
            placeholder="Last Name" 
            required 
          />
          <input 
            name="fname" 
            value={form.fname} 
            onChange={handleChange} 
            placeholder="First Name" 
            required 
          />
          <input 
            name="mname" 
            value={form.mname} 
            onChange={handleChange} 
            placeholder="Middle Name" 
          />
          <input 
            name="suffix" 
            value={form.suffix} 
            onChange={handleChange} 
            placeholder="Suffix" 
          />
          <input 
            name="email" 
            value={form.email} 
            onChange={handleChange} 
            placeholder="Email" 
            required 
          />
          <input 
            name="Phone_number" 
            value={form.Phone_number} 
            onChange={handleChange} 
            placeholder="Phone Number" 
            required 
          />
          <select 
            name="gender" 
            value={form.gender} 
            onChange={handleChange} 
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <input 
            name="Course" 
            value={form.Course} 
            onChange={handleChange} 
            placeholder="Course" 
            required 
          />
          <input 
            name="yearlevel" 
            value={form.yearlevel} 
            onChange={handleChange} 
            placeholder="Year Level" 
            required 
          />
          <input 
            name="section" 
            value={form.section} 
            onChange={handleChange} 
            placeholder="Section" 
            required 
          />
          {/* <input 
            name="Track" 
            value={form.Track} 
            onChange={handleChange} 
            placeholder="Track" 
          /> */}
          <button type="submit" className="btn btn-primary">Add Student</button>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal; 