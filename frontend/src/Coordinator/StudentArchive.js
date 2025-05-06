import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../Coordinator/components/sidebar';
import '../css/StudentArchive.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Swal from 'sweetalert2';
import AuthCheck from '../utils/AuthCheck';

const StudentArchive = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRestoringAll, setIsRestoringAll] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchArchivedStudents();
  }, [currentPage, itemsPerPage, debouncedSearchTerm]);

  const fetchArchivedStudents = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/showStudents`, {
        params: {
          page: currentPage,
          per_page: itemsPerPage,
          search: debouncedSearchTerm,
          show_archived: 'true',
          status: '0' // Only show archived students
        }
      });
      
      if (res.data && res.data.students) {
        const formattedStudents = res.data.students
          .filter(student => student.status === '0') // Double-check archived status
          .map(student => ({
            student_id: student.student_id || '',
            lname: student.lname || '',
            fname: student.fname || '',
            mname: student.mname || '',
            suffix: student.suffix || '',
            email: student.email || '',
            Phone_number: student.Phone_number || '',
            gender: student.gender || '',
            Course: student.section?.Course || '',
            yearlevel: student.section?.yearlevel || '',
            section: student.section?.section || '',
            Track: student.section?.Track || '',
            status: student.status || '',
            account_status: student.account?.status || ''
          }));
        setStudents(formattedStudents);
        setTotalItems(res.data.pagination.total);
        setError(null);
      } else {
        setStudents([]);
        setTotalItems(0);
        setError('No archived students found');
      }
    } catch (err) {
      console.error('Error fetching archived students:', err);
      setError('Failed to fetch archived students. Please try again later.');
      setStudents([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (id) => {
    Swal.fire({
      title: 'Restore Student?',
      text: "This will restore the student to active status.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, restore it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.get(`${apiUrl}/restore-student/${id}`);
          if (response.data.message) {
            Swal.fire(
              'Restored!',
              'Student has been restored successfully.',
              'success'
            ).then(() => {
              fetchArchivedStudents(); // Refresh the list
            });
          } else {
            throw new Error('Failed to restore student');
          }
        } catch (err) {
          console.error('Error restoring student:', err);
          Swal.fire({
            title: 'Error!',
            text: err.response?.data?.error || 'Failed to restore student',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      }
    });
  };

  const handleRestoreAll = async () => {
    if (students.length === 0) {
      Swal.fire({
        title: 'No Students',
        text: 'There are no archived students to restore',
        icon: 'info',
        confirmButtonText: 'OK'
      });
      return;
    }

    Swal.fire({
      title: 'Restore All Students',
      text: "This will restore ALL archived students. Are you absolutely sure?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, restore all!',
      cancelButtonText: 'Cancel',
      input: 'text',
      inputPlaceholder: 'Type "RESTORE" to confirm',
      inputValidator: (value) => {
        if (value !== 'RESTORE') {
          return 'You must type "RESTORE" to confirm';
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsRestoringAll(true);
          Swal.fire({
            title: 'Restoring...',
            text: 'Please wait while all students are being restored',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          const response = await axios.get(`${apiUrl}/restore-all-students`);
          
          if (response.data.success) {
            // Clear the current list and reset pagination
            setStudents([]);
            setTotalItems(0);
            setCurrentPage(1);
            setSearchTerm('');
            setDebouncedSearchTerm('');
            
            Swal.fire({
              title: 'Success!',
              text: `Successfully restored ${response.data.count} students`,
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            }).then(() => {
              // Refresh the list after success
              fetchArchivedStudents();
            });
          } else {
            throw new Error(response.data.message || 'Failed to restore students');
          }
        } catch (err) {
          console.error('Error restoring all students:', err);
          Swal.fire({
            title: 'Error!',
            text: err.response?.data?.message || 'Failed to restore all students. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        } finally {
          setIsRestoringAll(false);
        }
      }
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = Number(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <AuthCheck>
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <h2>Archived Students</h2>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="table-controls">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
            </div>
            <div className="items-per-page">
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
                <option value={totalItems}>All</option>
              </select>
            </div>
          </div>

          <button 
            className="btn restore-all-btn" 
            onClick={handleRestoreAll}
            disabled={isRestoringAll || students.length === 0}
          >
            {isRestoringAll ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Restoring...
              </>
            ) : (
              <>
                <i className="fas fa-undo"></i> Restore All Students
              </>
            )}
          </button>

          {isLoading ? (
            <div className="loading-message">
              <i className="fas fa-spinner fa-spin"></i> Loading...
            </div>
          ) : students.length === 0 ? (
            <div className="no-results">
              No archived students found
            </div>
          ) : (
            <div className="student-table">
              <table>
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Course</th>
                    <th>Year Level</th>
                    <th>Section</th>
                    <th>Track</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.student_id}>
                      <td>{student.student_id}</td>
                      <td>{`${student.lname}, ${student.fname} ${student.mname || ''} ${student.suffix || ''}`}</td>
                      <td>{student.email}</td>
                      <td>{student.Course}</td>
                      <td>{student.yearlevel}</td>
                      <td>{student.section}</td>
                      <td>{student.Track}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn restore"
                            onClick={() => handleRestore(student.student_id)}
                            title="Restore Student"
                          >
                            <i className="fas fa-undo"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="8">
                      <div className="pagination" style={{ justifyContent: 'flex-start' }}>
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="pagination-btn"
                          style={{ marginRight: '10px' }}
                        >
                          Previous
                        </button>
                        <span className="page-info" style={{ margin: '0 15px' }}>
                          Page {currentPage} of {Math.ceil(totalItems / itemsPerPage)}
                        </span>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
                          className="pagination-btn"
                        >
                          Next
                        </button>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </AuthCheck>
  );
};

export default StudentArchive;
