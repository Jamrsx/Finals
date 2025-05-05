import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../Coordinator/components/sidebar';
import { processCSV } from '../utils/csvProcessor';
import '../css/studentadd.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Student = () => {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [error, setError] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [file, setFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
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

  const apiUrl = 'http://localhost:8000/api';

  useEffect(() => {
    fetchStudents();
  }, [currentPage, itemsPerPage]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/showStudents`, {
        params: {
          page: currentPage,
          per_page: itemsPerPage
        }
      });
      
      if (res.data && res.data.students) {
        const formattedStudents = res.data.students.map(student => {
          const section = student.section || {};
          const account = student.account || {};
          
          return {
            student_id: student.student_id || '',
            lname: student.lname || '',
            fname: student.fname || '',
            mname: student.mname || '',
            suffix: student.suffix || '',
            email: student.email || '',
            Phone_number: student.Phone_number || '',
            gender: student.gender || '',
            Course: section.Course || '',
            yearlevel: section.yearlevel || '',
            section: section.section || '',
            Track: section.Track || '',
            status: student.status || '',
            account_status: account.status || ''
          };
        });
        setStudents(formattedStudents);
        setTotalItems(res.data.pagination.total);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to fetch students. Please try again later.');
    } finally {
      setIsLoading(false);
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
      setError('Please select a file');
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setElapsedTime(0);
    setError(null);
    setImportStatus(null);

    // Start the timer
    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    try {
      // Process CSV on client side first
      const { students: processedStudents, errors } = await processCSV(file);
      
      if (errors.length > 0) {
        setError('Validation errors found in CSV');
        setImportStatus({ error: 'Validation failed', errors });
        setIsImporting(false);
        clearInterval(timerInterval);
        return;
      }

      // Calculate total steps (upload + processing)
      const totalSteps = processedStudents.length;
      let completedSteps = 0;

      // Send processed data to server
      const formData = new FormData();
      formData.append('file', file);
      formData.append('processed_data', JSON.stringify(processedStudents));

      // Create a progress interval for processing phase
      const progressInterval = setInterval(() => {
        if (completedSteps < totalSteps) {
          completedSteps += Math.ceil(totalSteps / 50); // Increment by 2% of total
          const progress = Math.min(completedSteps / totalSteps, 0.99); // Cap at 99%
          setImportProgress(Math.round(progress * 100));
        }
      }, 100);

      const res = await axios.post(`${apiUrl}/import-csv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          // Update progress during upload phase (0-50%)
          if (progressEvent.loaded < progressEvent.total) {
            const uploadProgress = Math.round((progressEvent.loaded * 50) / progressEvent.total);
            setImportProgress(uploadProgress);
          } else {
            // When upload is complete, start processing phase (50-100%)
            clearInterval(progressInterval);
            setImportProgress(50);
          }
        }
      });

      // Clear the progress interval
      clearInterval(progressInterval);
      clearInterval(timerInterval);

      if (res.data.error) {
        setError(res.data.error);
        if (res.data.errors) {
          setImportStatus({ error: res.data.error, errors: res.data.errors });
        }
      } else {
        setImportStatus({
          message: res.data.message,
          imported_count: res.data.imported_count,
          errors: res.data.errors || []
        });
        fetchStudents();
      }
    } catch (err) {
      console.error('Error importing CSV:', err);
      setError(err.response?.data?.error || 'Import failed');
      setImportStatus({ 
        error: err.response?.data?.error || 'Import failed',
        errors: err.response?.data?.errors || []
      });
    } finally {
      setIsImporting(false);
      setImportProgress(100);
      setFile(null);
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

  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    student.lname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = Number(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
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

        {/* Search and Items Per Page */}
        <div className="table-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by Last Name or Student ID"
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          <div className="items-per-page">
            <label>Show:</label>
            <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value={totalItems}>All</option>
            </select>
          </div>
        </div>

        {/* CSV Import Section */}
        <div className="import-section">
          <h3>Import Students from CSV</h3>
          <form onSubmit={handleImport} className="csv-form">
            <input type="file" accept=".csv" onChange={handleFileChange} />
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isImporting}
            >
              {isImporting ? 'Importing...' : 'Import CSV'}
            </button>
          </form>
          
          {isImporting && (
            <div className="import-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${importProgress}%` }}
                ></div>
              </div>
              <div className="progress-info">
                <span>{importProgress}%</span>
                <span className="elapsed-time">
                  {elapsedTime >= 60 
                    ? `${Math.floor(elapsedTime / 60)}m ${elapsedTime % 60}s` 
                    : `${elapsedTime}s`}
                </span>
              </div>
            </div>
          )}

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
        <button 
          className="btn btn-primary" 
          onClick={() => setShowModal(true)}
          style={{ marginBottom: '1.5rem' }}
        >
          Add New Student
        </button>

        {/* Students Table */}
        <div className="table-container">
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
              {isLoading ? (
                <tr>
                  <td colSpan="13" style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading...
                  </td>
                </tr>
              ) : students.length > 0 ? (
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
                      <div className="action-buttons">
                        <button 
                          className="action-btn update"
                          onClick={() => alert('Update modal coming soon')}
                          title="Update"
                        >
                          <i className="fas fa-cog"></i>
                        </button>
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDelete(s.student_id)}
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="13" style={{ textAlign: 'center', padding: '2rem' }}>
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="pagination-controls">
          <div className="pagination-buttons">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              Previous
            </button>
            <span>Page {currentPage} of {Math.ceil(totalItems / itemsPerPage)}</span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= Math.ceil(totalItems / itemsPerPage) || isLoading}
            >
              Next
            </button>
          </div>
          <div className="pagination-info">
            Showing {students.length} of {totalItems} students
          </div>
        </div>

        {/* Add Student Modal */}
        {showModal && (
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
                <input 
                  name="Track" 
                  value={form.Track} 
                  onChange={handleChange} 
                  placeholder="Track" 
                  required 
                />
                <button type="submit" className="btn btn-primary">Add Student</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Student;
