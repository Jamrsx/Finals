import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/sidebar';
import Header from './components/Header';
import './css/Dashboard.css';
import './css/enrollments.css';
import AuthCheck from '../utils/AuthCheck';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Swal from 'sweetalert2';

const Enrollments = () => {
    const navigate = useNavigate();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAccepted, setShowAccepted] = useState(() => {
        const saved = localStorage.getItem('showAcceptedEnrollments');
        return saved ? JSON.parse(saved) : false;
    });
    const [showRejected, setShowRejected] = useState(() => {
        const saved = localStorage.getItem('showRejectedEnrollments');
        return saved ? JSON.parse(saved) : false;
    });

    // Pagination states for each table
    const [pendingPage, setPendingPage] = useState(1);
    const [acceptedPage, setAcceptedPage] = useState(1);
    const [rejectedPage, setRejectedPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(() => {
        const saved = localStorage.getItem('entriesPerPage');
        return saved ? JSON.parse(saved) : 10;
    });

    useEffect(() => {
        const coordinatorData = localStorage.getItem('coordinator');
        if (!coordinatorData) {
            navigate('/Coordinator/Login');
        } else {
            fetchEnrollments();
        }
    }, [navigate]);

    // Polling: auto-refresh enrollments every 10 seconds
    useEffect(() => {
        if (loading || error) return;
        const interval = setInterval(() => {
            fetchEnrollments();
        }, 20000); // 2seconds
        return () => clearInterval(interval);
    }, [loading, error]);

    useEffect(() => {
        localStorage.setItem('showAcceptedEnrollments', JSON.stringify(showAccepted));
    }, [showAccepted]);

    useEffect(() => {
        localStorage.setItem('showRejectedEnrollments', JSON.stringify(showRejected));
    }, [showRejected]);

    useEffect(() => {
        localStorage.setItem('entriesPerPage', JSON.stringify(entriesPerPage));
    }, [entriesPerPage]);

    const fetchEnrollments = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/enrollments');
            if (response.data.status === 'success') {
                setEnrollments(response.data.data);
            } else {
                setError(response.data.message || 'Failed to fetch enrollments');
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching enrollments:', err);
            setError(err.response?.data?.message || 'Failed to fetch enrollments. Please try again later.');
            setLoading(false);
        }
    };

    const handleAction = async (enrollmentId, action) => {
        try {
            const response = await axios.put(`http://localhost:8000/api/enrollments/${enrollmentId}/${action}`);
            
            if (response.data.status === 'success') {
                Swal.fire({
                    title: 'Success!',
                    text: response.data.message,
                    icon: 'success',
                    confirmButtonColor: '#2563eb'
                });
                fetchEnrollments();
            } else {
                throw new Error(response.data.message);
            }
        } catch (err) {
            Swal.fire({
                title: 'Error!',
                text: err.response?.data?.message || `Failed to ${action} enrollment`,
                icon: 'error',
                confirmButtonColor: '#2563eb'
            });
        }
    };

    const getStatusClass = (status) => {
        const statusMap = {
            'pending': 'status-pending',
            'accepted': 'status-accepted',
            'declined': 'status-declined',
            'cancelled': 'status-cancelled',
        };
        return statusMap[status.toLowerCase()] || '';
    };

    const renderPagination = (currentPage, setPage, totalItems) => {
        const totalPages = Math.ceil(totalItems / entriesPerPage);
        if (totalPages <= 1) return null;

        return (
            <div className="pagination">
                <button 
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="pagination-button"
                >
                    <i className="fas fa-chevron-left"></i>
                </button>
                <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                </span>
                <button 
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                >
                    <i className="fas fa-chevron-right"></i>
                </button>
            </div>
        );
    };

    const renderEntriesPerPageDropdown = () => (
        <div className="entries-per-page">
            <label htmlFor="entriesPerPage">Show entries:</label>
            <select
                id="entriesPerPage"
                value={entriesPerPage}
                onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setPendingPage(1);
                    setAcceptedPage(1);
                    setRejectedPage(1);
                }}
                className="entries-select"
            >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
            </select>
        </div>
    );

    const renderEnrollmentTable = (enrollments, title, showActions = false, currentPage, setPage) => {
        if (enrollments.length === 0) {
            return (
                <div className="no-enrollments">
                    <div className="no-enrollments-icon">
                        <i className="fas fa-clipboard-list"></i>
                    </div>
                    <div className="no-enrollments-text">No {title} Enrollments</div>
                </div>
            );
        }

        const startIndex = (currentPage - 1) * entriesPerPage;
        const endIndex = startIndex + entriesPerPage;
        const currentEnrollments = enrollments.slice(startIndex, endIndex);

        return (
            <div className="enrollment-section">
                <div className="table-header">
                    <h2 className="section-title">{title} Enrollments</h2>
                    {renderEntriesPerPageDropdown()}
                </div>
                <table className="enrollments-table">
                    <thead>
                        <tr>
                            <th>Student ID</th>
                            <th>Student Name</th>
                            <th>Course</th>
                            <th>Section</th>
                            <th>Track</th>
                            <th>Status</th>
                            <th>Request Date</th>
                            {showActions && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {currentEnrollments.map((enrollment) => (
                            <tr key={enrollment.id}>
                                <td>{enrollment.student?.student_id || 'N/A'}</td>
                                <td>
                                    {enrollment.student
                                        ? `${enrollment.student.lname}, ${enrollment.student.fname} ${enrollment.student.mname || ''}`
                                        : 'N/A'}
                                </td>
                                <td>{enrollment.student?.section?.Course || 'N/A'}</td>
                                <td>{enrollment.student?.section?.section || 'N/A'}</td>
                                <td>{enrollment.track_name}</td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(enrollment.status)}`}>
                                        {enrollment.status}
                                    </span>
                                </td>
                                <td>{new Date(enrollment.created_at).toLocaleDateString()}</td>
                                {showActions && (
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="btn-accept"
                                                onClick={() => handleAction(enrollment.id, 'accept')}
                                            >
                                                <i className="fas fa-check"></i> Accept
                                            </button>
                                            <button 
                                                className="btn-decline"
                                                onClick={() => handleAction(enrollment.id, 'decline')}
                                            >
                                                <i className="fas fa-times"></i> Decline
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {renderPagination(currentPage, setPage, enrollments.length)}
            </div>
        );
    };

    if (loading) return (
        <AuthCheck>
            <div className="dashboard-container">
                <Sidebar />
                <div className="dashboard-content">
                    <Header title="Enrollment Requests" />
                    <div className="loading">Loading enrollments...</div>
                </div>
            </div>
        </AuthCheck>
    );

    if (error) return (
        <AuthCheck>
            <div className="dashboard-container">
                <Sidebar />
                <div className="dashboard-content">
                    <Header title="Enrollment Requests" />
                    <div className="error">{error}</div>
                </div>
            </div>
        </AuthCheck>
    );

    const pendingEnrollments = enrollments.filter(e => e.status === 'pending');
    const acceptedEnrollments = enrollments.filter(e => e.status === 'accepted');
    const declinedEnrollments = enrollments.filter(e => e.status === 'declined' || e.status === 'cancelled');

    return (
        <AuthCheck>
            <div className="dashboard-container">
                <Sidebar />
                <div className="dashboard-content">
                    <Header title="Enrollment Requests" />
                    <div className="enrollments-container">
                        {renderEnrollmentTable(pendingEnrollments, 'Pending', true, pendingPage, setPendingPage)}
                        
                        <div className="history-toggle-buttons">
                            <button 
                                className={`toggle-button ${showAccepted ? 'active' : ''}`}
                                onClick={() => setShowAccepted(!showAccepted)}
                            >
                                <i className={`fas ${showAccepted ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                                {showAccepted ? 'Hide Accepted' : 'Show Accepted'}
                            </button>
                            <button 
                                className={`toggle-button ${showRejected ? 'active' : ''}`}
                                onClick={() => setShowRejected(!showRejected)}
                            >
                                <i className={`fas ${showRejected ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                                {showRejected ? 'Hide Rejected' : 'Show Rejected'}
                            </button>
                        </div>

                        <div className="history-tables">
                            {showAccepted && (
                                <div className="history-table">
                                    {renderEnrollmentTable(acceptedEnrollments, 'Accepted', false, acceptedPage, setAcceptedPage)}
                                </div>
                            )}
                            {showRejected && (
                                <div className="history-table">
                                    {renderEnrollmentTable(declinedEnrollments, 'Rejected', false, rejectedPage, setRejectedPage)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthCheck>
    );
};

export default Enrollments;
