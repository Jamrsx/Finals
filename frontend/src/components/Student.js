import React, { useState } from 'react';
import axios from 'axios';

const Student = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '', lname: '', fname: '', mname: '', suffix: '',
    email: '', Phone_number: '', gender: '', Course: '', yearlevel: '', section: '', Track: ''
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear any previous errors
    
    // Basic frontend validation
    if (!formData.student_id || !formData.lname || !formData.fname || !formData.email || 
        !formData.Phone_number || !formData.gender || !formData.Course || 
        !formData.yearlevel || !formData.section) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      // Log the data being sent
      console.log('Submitting form data:', formData);
      
      const response = await axios.post(`${apiUrl}/students`, formData);
      console.log('Response:', response.data);
      
      if (response.data.message) {
        fetchStudents();
        setIsModalOpen(false);
        setFormData({
          student_id: '', lname: '', fname: '', mname: '', suffix: '',
          email: '', Phone_number: '', gender: '', Course: '', yearlevel: '', section: '', Track: ''
        });
      }
    } catch (err) {
      console.error('Full error response:', err.response);
      
      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        console.error('Validation errors:', validationErrors);
        
        // Format the error messages for display
        const formattedErrors = Object.entries(validationErrors).map(([field, messages]) => {
          const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          return `${fieldName}: ${messages.join(', ')}`;
        });
        
        setError(formattedErrors.join('\n'));
      } else {
        console.error('Error adding student:', err.response?.data || err);
        setError(err.response?.data?.error || 'Failed to add student');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    {isModalOpen && (
      <div className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">Add New Student</h2>
            <button className="close" onClick={closeModal}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          {error && (
            <div className="error-message">
              {error.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          )}
          <form className="student-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="student_id">Student ID *</label>
              <input
                type="text"
                id="student_id"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                placeholder="Enter student ID"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lname">Last Name *</label>
              <input
                type="text"
                id="lname"
                name="lname"
                value={formData.lname}
                onChange={handleChange}
                placeholder="Enter last name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="fname">First Name *</label>
              <input
                type="text"
                id="fname"
                name="fname"
                value={formData.fname}
                onChange={handleChange}
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="mname">Middle Name</label>
              <input
                type="text"
                id="mname"
                name="mname"
                value={formData.mname}
                onChange={handleChange}
                placeholder="Enter middle name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="suffix">Suffix</label>
              <input
                type="text"
                id="suffix"
                name="suffix"
                value={formData.suffix}
                onChange={handleChange}
                placeholder="Enter suffix (e.g., Jr., Sr.)"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="Phone_number">Phone Number *</label>
              <input
                type="tel"
                id="Phone_number"
                name="Phone_number"
                value={formData.Phone_number}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="Course">Course *</label>
              <select
                id="Course"
                name="Course"
                value={formData.Course}
                onChange={handleChange}
                required
              >
                <option value="">Select course</option>
                <option value="BSIT">BSIT</option>
                <option value="BSCS">BSCS</option>
                <option value="BSIS">BSIS</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="yearlevel">Year Level *</label>
              <select
                id="yearlevel"
                name="yearlevel"
                value={formData.yearlevel}
                onChange={handleChange}
                required
              >
                <option value="">Select year level</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="section">Section *</label>
              <input
                type="text"
                id="section"
                name="section"
                value={formData.section}
                onChange={handleChange}
                placeholder="Enter section"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="Track">Track</label>
              <select
                id="Track"
                name="Track"
                value={formData.Track}
                onChange={handleChange}
              >
                <option value="">Select track</option>
                <option value="Regular">Regular</option>
                <option value="Honors">Honors</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="button" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit">
                Add Student
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  );
};

export default Student; 