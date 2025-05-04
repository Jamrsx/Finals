import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../Coordinator/components/sidebar';
import '../css/studentadd.css';

const Student = () => {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
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
  const [file, setFile] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [error, setError] = useState(null);

  const apiUrl = 'http://localhost:8000/api';

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${apiUrl}/showStudents`);
      console.log('Raw API Response:', res.data); // Debug the raw response

      if (res.data && res.data.students) {
        // Transform the data to match our table structure
        const formattedStudents = res.data.students.map(student => {
          // Debug the student object
          console.log('Raw Student Data:', student);

          // Get section data with fallback
          const sectionData = student.section || {};

          return {
            student_id: student.student_id,
            lname: student.lname,
            fname: student.fname,
            mname: student.mname,
            suffix: student.suffix,
            email: student.email,
            Phone_number: student.Phone_number,
            gender: student.gender,
            // Section data with fallback values
            Course: sectionData.Course || '',
            yearlevel: sectionData.yearlevel || '',
            section: sectionData.section || '',
            Track: sectionData.Track || '',
            status: student.status,
            account_status: student.account?.status || ''
          };
        });

        console.log('Formatted Students:', formattedStudents); // Debug formatted data
        setStudents(formattedStudents);
        setError(null);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.error || 'Failed to fetch students. Please try again later.');
      setStudents([]);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${apiUrl}/import-csv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setImportStatus(res.data);
      fetchStudents();
      setFile(null);
    } catch (err) {
      console.error('Error importing CSV:', err);
      setImportStatus({ error: err.response?.data?.error || 'Import failed' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post(`${apiUrl}/students`, form);
      if (response.data.message) {
        fetchStudents();
        setShowModal(false);
        setForm({
          student_id: '', lname: '', fname: '', mname: '', suffix: '',
          email: '', Phone_number: '', gender: '', Course: '', yearlevel: '', section: '', Track: ''
        });
      }
    } catch (err) {
      console.error('Error adding student:', err.response?.data || err);
      setError(err.response?.data?.error || 'Failed to add student');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`${apiUrl}/student/${id}`);
        fetchStudents();
      } catch (err) {
        console.error('Error deleting student:', err);
        setError('Failed to delete student');
      }
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <h2>Student Management</h2>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* CSV Import Section */}
        <div className="csv-import-section">
          <h3>Import Students from CSV</h3>
          <form onSubmit={handleImport} className="csv-form">
            <input type="file" accept=".csv" onChange={handleFileChange} />
            <button type="submit">Import CSV</button>
          </form>
          {importStatus && (
            <div className={`import-status ${importStatus.error ? 'error' : 'success'}`}>
              {importStatus.error ? (
                <p>Error: {importStatus.error}</p>
              ) : (
                <p>Successfully imported {importStatus.imported_count} students</p>
              )}
              {importStatus.errors && importStatus.errors.length > 0 && (
                <div className="import-errors">
                  <h4>Errors:</h4>
                  <ul>
                    {importStatus.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Student Button */}
        <button className="add-student-btn" onClick={() => setShowModal(true)}>
          Add New Student
        </button>

        {/* Add Student Modal */}
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => setShowModal(false)}>&times;</span>
              <h3>Add New Student</h3>
              <form onSubmit={handleSubmit}>
                <input name="student_id" value={form.student_id} onChange={handleChange} placeholder="Student ID" required />
                <input name="lname" value={form.lname} onChange={handleChange} placeholder="Last Name" required />
                <input name="fname" value={form.fname} onChange={handleChange} placeholder="First Name" required />
                <input name="mname" value={form.mname} onChange={handleChange} placeholder="Middle Name" />
                <input name="suffix" value={form.suffix} onChange={handleChange} placeholder="Suffix" />
                <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
                <input name="Phone_number" value={form.Phone_number} onChange={handleChange} placeholder="Phone Number" required />
                <select name="gender" value={form.gender} onChange={handleChange} required>
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <input name="Course" value={form.Course} onChange={handleChange} placeholder="Course" required />
                <input name="yearlevel" value={form.yearlevel} onChange={handleChange} placeholder="Year Level" required />
                <input name="section" value={form.section} onChange={handleChange} placeholder="Section" required />
                {/* <input name="Track" value={form.Track} onChange={handleChange} placeholder="Track" /> */}
                <button type="submit">Add Student</button>
              </form>
            </div>
          </div>
        )}

        {/* Students Table */}
        <table className="student-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Last Name</th>
              <th>First Name</th>
              <th>Middle Name</th>
              <th>Suffix</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>Course</th>
              <th>Year Level</th>
              <th>Section</th>
              <th>Track</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map((s) => (
                <tr key={s.student_id}>
                  <td>{s.student_id}</td>
                  <td>{s.lname}</td>
                  <td>{s.fname}</td>
                  <td>{s.mname}</td>
                  <td>{s.suffix}</td>
                  <td>{s.email}</td>
                  <td>{s.Phone_number}</td>
                  <td>{s.gender}</td>
                  <td>{s.Course}</td>
                  <td>{s.yearlevel}</td>
                  <td>{s.section}</td>
                  <td>{s.Track}</td>
                  <td>
                    <button onClick={() => alert('Update modal coming soon')}>Update</button>
                    <button onClick={() => handleDelete(s.student_id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="13">No students found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Student;
