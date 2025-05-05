import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../css/studentadd.css';

const StudentTable = ({
  students,
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
  return (
    <div className="table-container">
      <div className="table-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by Last Name or Student ID"
            value={searchTerm}
            onChange={onSearch}
            className="search-input"
          />
        </div>
        <div className="items-per-page">
          <label>Show:</label>
          <select value={itemsPerPage} onChange={(e) => onItemsPerPageChange(e)}>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value={totalItems}>All</option>
          </select>
        </div>
      </div>

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
            students.map((student) => (
              <tr key={student.student_id}>
                <td>{student.student_id}</td>
                <td>{student.lname}</td>
                <td>{student.fname}</td>
                <td>{student.mname}</td>
                <td>{student.suffix}</td>
                <td>{student.email}</td>
                <td>{student.Phone_number}</td>
                <td>{student.gender}</td>
                <td>{student.Course}</td>
                <td>{student.yearlevel}</td>
                <td>{student.section}</td>
                <td>{student.Track}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="action-btn update"
                      onClick={() => onUpdate(student)}
                      title="Update"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => onDelete(student.student_id)}
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
                {searchTerm ? 'No students found matching your search.' : 'No students found.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination-controls">
        <div className="pagination-buttons">
          <button 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
          >
            Previous
          </button>
          <span>Page {currentPage} of {Math.ceil(totalItems / itemsPerPage)}</span>
          <button 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= Math.ceil(totalItems / itemsPerPage) || isLoading}
          >
            Next
          </button>
        </div>
        <div className="pagination-info">
          Showing {students.length} of {totalItems} students
        </div>
      </div>
    </div>
  );
};

export default StudentTable; 