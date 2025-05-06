import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../Coordinator/components/sidebar';
import StudentTable from './components/StudentTable';
import UpdateStudentModal from './components/UpdateStudentModal';
import '../css/Dashboard.css';
import '../css/studentadd.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import AuthCheck from '../utils/AuthCheck';

const Dashboard = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [isTableVisible, setIsTableVisible] = useState(() => {
    // Initialize state from localStorage or default to true
    const savedState = localStorage.getItem('tableVisibility');
    return savedState ? JSON.parse(savedState) : true;
  });
  const [courseStats, setCourseStats] = useState({
    BSIT: 0,
    BSBA: 0,
    EDUC: 0
  });
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const apiUrl = 'http://localhost:8000/api'; // Hardcoded API URL like in Student component

  useEffect(() => {
    fetchStudents();
    fetchAllStudentsForAnalytics();
  }, [currentPage, itemsPerPage, searchTerm]);

  const fetchAllStudentsForAnalytics = async () => {
    try {
      const response = await axios.get(`${apiUrl}/showStudents`, {
        params: {
          per_page: 1000 // Get a large number to ensure we get all students
        }
      });
      
      if (response.data && response.data.students) {
        calculateCourseStats(response.data.students);
      }
    } catch (error) {
      console.error('Error fetching students for analytics:', error);
    }
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/showStudents`, {
        params: {
          page: currentPage,
          per_page: itemsPerPage,
          search: searchTerm
        }
      });
      
      if (response.data && response.data.students) {
        const formattedStudents = response.data.students.map(student => {
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
        setTotalItems(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCourseStats = (studentData) => {
    const stats = {
      BSIT: 0,
      BSBA: 0,
      EDUC: 0
    };

    studentData.forEach(student => {
      const course = student.section?.Course?.toUpperCase();
      if (course in stats) {
        stats[course]++;
      }
    });

    setCourseStats(stats);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (studentId) => {
    try {
      await axios.delete(`${apiUrl}/student/${studentId}`);
      fetchStudents();
      fetchAllStudentsForAnalytics(); // Update analytics after deletion
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const handleUpdate = (student) => {
    setSelectedStudent(student);
    setShowUpdateModal(true);
  };

  const toggleTableVisibility = () => {
    const newState = !isTableVisible;
    setIsTableVisible(newState);
    // Save the new state to localStorage
    localStorage.setItem('tableVisibility', JSON.stringify(newState));
  };

  return (
    <AuthCheck>
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <h1>Welcome Coordinator!</h1>
          
          <div className="analytics-container">
            <div className="analytics-card">
              <h3>BSIT Students</h3>
              <p className="analytics-number">{courseStats.BSIT}</p>
            </div>
            <div className="analytics-card">
              <h3>BSBA Students</h3>
              <p className="analytics-number">{courseStats.BSBA}</p>
            </div>
            <div className="analytics-card">
              <h3>EDUC Students</h3>
              <p className="analytics-number">{courseStats.EDUC}</p>
            </div>
          </div>

          <div className="table-controls">
            <button 
              className="toggle-table-btn"
              onClick={toggleTableVisibility}
            >
              {isTableVisible ? 'Hide Table' : 'Show Table'}
            </button>
          </div>

          {isTableVisible && (
            <StudentTable
              students={students}
              isLoading={isLoading}
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              searchTerm={searchTerm}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              onSearch={handleSearch}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          )}

          <UpdateStudentModal 
            showModal={showUpdateModal}
            setShowModal={setShowUpdateModal}
            selectedStudent={selectedStudent}
            fetchStudents={fetchStudents}
            apiUrl={apiUrl}
          />
        </div>
      </div>
    </AuthCheck>
  );
};

export default Dashboard;
