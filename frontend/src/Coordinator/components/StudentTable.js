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
  onUpdate,
  showRestoreButton = false
}) => {
  const handleAction = (student) => {
    onDelete(student.student_id);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

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

      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
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
              {students.map((student) => (
                <tr key={student.student_id} className={student.status === '0' ? 'archived' : ''}>
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
                      {!showRestoreButton && (
                        <button
                          className="action-btn update"
                          onClick={() => onUpdate(student)}
                          title="Update"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      )}
                      <button
                        className={`action-btn ${showRestoreButton ? 'restore' : 'delete'}`}
                        onClick={() => handleAction(student)}
                        title={showRestoreButton ? 'Restore' : 'Archive'}
                      >
                        <i className={`fas fa-${showRestoreButton ? 'undo' : 'archive'}`}></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination" style={{ justifyContent: 'flex-start' }}>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="pagination-btn"
              style={{ marginRight: '10px' }}
            >
              Previous
            </button>
            <span className="page-info" style={{ margin: '0 15px' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentTable; 