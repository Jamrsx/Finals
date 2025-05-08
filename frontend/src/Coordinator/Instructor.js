import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../Coordinator/components/sidebar';
import Header from './components/Header';
import Swal from 'sweetalert2';
import AuthCheck from '../utils/AuthCheck';
import '@fortawesome/fontawesome-free/css/all.min.css';

// InstructorTable Component
const InstructorTable = ({
  instructors,
  isLoading,
  currentPage,
  totalItems,
  itemsPerPage,
  searchTerm,
  onPageChange,
  onItemsPerPageChange,
  onSearch,
  onDelete,
  onUpdate
}) => {
  // Calculate pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInstructors = instructors.slice(startIndex, endIndex);

  return (
    <div className="table-container">
      <div className="table-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by Last Name or Instructor ID"
            value={searchTerm}
            onChange={onSearch}
            className="search-input"
          />
        </div>

      </div>

      <table className="student-table">
        <thead>
          <tr>
            <th>Instructor ID</th>
            <th>Last Name</th>
            <th>First Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                Loading...
              </td>
            </tr>
          ) : currentInstructors.length > 0 ? (
            currentInstructors.map((instructor) => (
              <tr key={instructor.instructor_id}>
                <td>{instructor.instructor_id}</td>
                <td>{instructor.lname}</td>
                <td>{instructor.fname}</td>
                <td>{instructor.email}</td>
                <td>{instructor.phone}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn update"
                      onClick={() => onUpdate(instructor)}
                      title="Update"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => onDelete(instructor.instructor_id)}
                      title="Delete"
                      style={{ backgroundColor: 'red' }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                {searchTerm ? 'No instructors found matching your search.' : 'No instructors found.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

// UpdateInstructorModal Component
const UpdateInstructorModal = ({ showModal, setShowModal, selectedInstructor, fetchInstructors, apiUrl }) => {
  const [updateForm, setUpdateForm] = useState({
    instructor_id: '',
    lname: '',
    fname: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (selectedInstructor) {
      setUpdateForm({
        instructor_id: selectedInstructor.instructor_id,
        lname: selectedInstructor.lname,
        fname: selectedInstructor.fname,
        email: selectedInstructor.email,
        phone: selectedInstructor.phone
      });
    }
  }, [selectedInstructor]);

  const handleChange = (e) => {
    setUpdateForm({ ...updateForm, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { instructor_id, ...updateData } = updateForm;
      const response = await axios.put(`${apiUrl}/UpdateInstructor/${selectedInstructor.instructor_id}`, updateData);
      if (response.data) {
        Swal.fire({
          title: 'Success!',
          text: 'Instructor has been updated successfully.',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          fetchInstructors();
          setShowModal(false);
          setUpdateForm({
            instructor_id: '',
            lname: '',
            fname: '',
            email: '',
            phone: ''
          });
        });
      }
    } catch (err) {
      console.error('Error updating instructor:', err.response?.data || err);
      let errorMessage = 'Failed to update instructor';
      
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
        <h3>Update Instructor</h3>
        <form onSubmit={handleUpdate} className="student-form">
          <input 
            name="instructor_id" 
            value={updateForm.instructor_id} 
            onChange={handleChange} 
            placeholder="Instructor ID" 
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
            name="email" 
            value={updateForm.email} 
            onChange={handleChange} 
            placeholder="Email" 
            required 
          />
          <input 
            name="phone" 
            value={updateForm.phone} 
            onChange={handleChange} 
            placeholder="Phone Number" 
            required 
          />
          <button type="submit" className="btn btn-primary">Update Instructor</button>
        </form>
      </div>
    </div>
  );
};

// AddInstructorModal Component
const AddInstructorModal = ({ showModal, setShowModal, fetchInstructors, apiUrl }) => {
  const [formData, setFormData] = useState({
    instructor_id: '',
    lname: '',
    fname: '',
    email: '',
    phone: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/instructors`, formData);
      if (response.data) {
        Swal.fire({
          title: 'Success!',
          text: 'Instructor has been added successfully.',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          fetchInstructors();
          setShowModal(false);
          setFormData({
            instructor_id: '',
            lname: '',
            fname: '',
            email: '',
            phone: ''
          });
        });
      }
    } catch (err) {
      console.error('Error adding instructor:', err.response?.data || err);
      let errorMessage = 'Failed to add instructor';
      
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
        <h3>Add New Instructor</h3>
        <form onSubmit={handleSubmit} className="student-form">
          <input 
            name="instructor_id" 
            value={formData.instructor_id} 
            onChange={handleChange} 
            placeholder="Instructor ID" 
            required 
          />
          <input 
            name="lname" 
            value={formData.lname} 
            onChange={handleChange} 
            placeholder="Last Name" 
            required 
          />
          <input 
            name="fname" 
            value={formData.fname} 
            onChange={handleChange} 
            placeholder="First Name" 
            required 
          />
          <input 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            placeholder="Email" 
            required 
          />
          <input 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange} 
            placeholder="Phone Number" 
            required 
          />
          <button type="submit" className="btn btn-primary">Add Instructor</button>
        </form>
      </div>
    </div>
  );
};

// Main Instructor Component
const Instructor = () => {
  const [instructors, setInstructors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const apiUrl = 'http://localhost:8000/api';

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchInstructors();
  }, [currentPage, itemsPerPage, debouncedSearchTerm]);

  const fetchInstructors = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching instructors from:', `${apiUrl}/ShowInstructor`);
      const response = await axios.get(`${apiUrl}/ShowInstructor`);
      console.log('API Response:', response.data);
      
      if (response.data) {
        let filteredInstructors = Array.isArray(response.data) ? response.data : [response.data];
        
        // Apply search filter
        if (debouncedSearchTerm) {
          const searchLower = debouncedSearchTerm.toLowerCase();
          filteredInstructors = filteredInstructors.filter(instructor => 
            instructor.lname.toLowerCase().includes(searchLower) ||
            instructor.instructor_id.toLowerCase().includes(searchLower)
          );
        }
        
        setInstructors(filteredInstructors);
        setTotalItems(filteredInstructors.length);
        setError(null);
      } else {
        console.warn('No data received from API');
        setInstructors([]);
        setTotalItems(0);
        setError('No instructor data available');
      }
    } catch (err) {
      console.error('Error fetching instructors:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      let errorMessage = 'Failed to fetch instructors. ';
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage += `Server responded with status ${err.response.status}: ${err.response.data?.error || err.response.data?.message || 'Unknown error'}`;
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage += 'No response received from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      setInstructors([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Delete Instructor?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${apiUrl}/DeleteInstructor/${id}`);
          Swal.fire(
            'Deleted!',
            'Instructor has been deleted.',
            'success'
          ).then(() => {
            fetchInstructors();
          });
        } catch (err) {
          console.error('Error deleting instructor:', err);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to delete instructor',
            icon: 'error',
            confirmButtonText: 'OK'
          });
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

  const openUpdateModal = (instructor) => {
    setSelectedInstructor(instructor);
    setShowUpdateModal(true);
  };

  return (
    <AuthCheck>
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <Header title="Instructor Management" />

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            style={{ marginBottom: '1.5rem' }}
          >
            Add New Instructor
          </button>

          <InstructorTable
            instructors={instructors}
            isLoading={isLoading}
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            searchTerm={searchTerm}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            onSearch={handleSearch}
            onDelete={handleDelete}
            onUpdate={openUpdateModal}
          />

          <AddInstructorModal
            showModal={showModal}
            setShowModal={setShowModal}
            fetchInstructors={fetchInstructors}
            apiUrl={apiUrl}
          />

          <UpdateInstructorModal
            showModal={showUpdateModal}
            setShowModal={setShowUpdateModal}
            selectedInstructor={selectedInstructor}
            fetchInstructors={fetchInstructors}
            apiUrl={apiUrl}
          />
        </div>
      </div>
    </AuthCheck>
  );
};

export default Instructor;
