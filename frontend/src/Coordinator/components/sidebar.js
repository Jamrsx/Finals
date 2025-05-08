import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiHome, FiBarChart2, FiUsers, FiLogOut, FiArchive, FiUser } from 'react-icons/fi';
import Swal from 'sweetalert2';

const Sidebar = () => {
  const navigate = useNavigate();

  // Load collapse state from localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true'; // Convert string to boolean
  });

  const [hoveredButton, setHoveredButton] = useState(null);

  // Save collapse state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed);
  }, [isCollapsed]);

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of your account",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('coordinator');
        Swal.fire({
          title: 'Logged out!',
          text: 'You have been successfully logged out.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          navigate('/Coordinator/Login');
        });
      }
    });
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const sidebarStyle = {
    width: isCollapsed ? '60px' : '200px',
    height: '100vh',
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '20px 20px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: isCollapsed ? 'center' : 'flex-start',
    transition: 'width 0.3s',
    position: 'fixed',
    left: 0,
    top: 0,
    overflowY: 'auto'
  } 

  const headingStyle = {
    marginBottom: '30px',
    fontSize: '20px',
    borderBottom: isCollapsed ? 'none' : '2px solid white',
    paddingBottom: '10px',
    whiteSpace: 'nowrap',
    opacity: isCollapsed ? 0 : 1,
    transition: 'opacity 0.3s',
  };

  const buttonStyle = (index) => ({
    background: 'none',
    border: 'none',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textAlign: isCollapsed ? 'center' : 'left',
    padding: '10px 0',
    fontSize: '16px',
    cursor: 'pointer',
    width: '100%',
    borderRadius: '4px',
    backgroundColor: hoveredButton === index ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
    transition: 'background 0.3s',
    whiteSpace: 'nowrap',
    justifyContent: isCollapsed ? 'center' : 'flex-start',
    marginBottom: '8px'
  });

  const logoutStyle = {
    marginTop: 'auto',
    color: '#f87171',
  };

  return (
    <div style={sidebarStyle}>
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          marginBottom: '20px',
          cursor: 'pointer',
          fontSize: '24px',
          textAlign: 'center',
        }}
      >
        <FiMenu />
      </button>

      <h3 style={headingStyle}>Coordinator Panel</h3>

      <button
        style={buttonStyle(0)}
        onMouseEnter={() => setHoveredButton(0)}
        onMouseLeave={() => setHoveredButton(null)}
        onClick={() => navigate('/dashboard')}
      >
        <FiHome />
        {!isCollapsed && 'Dashboard'}
      </button>

      <button
        style={buttonStyle(1)}
        onMouseEnter={() => setHoveredButton(1)}
        onMouseLeave={() => setHoveredButton(null)}
        onClick={() => navigate('/track')}
      >
        <FiBarChart2 />
        {!isCollapsed && 'Track'}
      </button>

      <button
        style={buttonStyle(2)}
        onMouseEnter={() => setHoveredButton(2)}
        onMouseLeave={() => setHoveredButton(null)}
        onClick={() => navigate('/students')}
      >
        <FiUsers />
        {!isCollapsed && 'Students'}
      </button>

      <button
        style={buttonStyle(3)}
        onMouseEnter={() => setHoveredButton(3)}
        onMouseLeave={() => setHoveredButton(null)}
        onClick={() => navigate('/instructors')}
      >
        <FiUser />
        {!isCollapsed && 'Instructors'}
      </button>

      <button
        style={buttonStyle(4)}
        onMouseEnter={() => setHoveredButton(4)}
        onMouseLeave={() => setHoveredButton(null)}
        onClick={() => navigate('/student-archive')}
      >
        <FiArchive />
        {!isCollapsed && 'Archive'}
      </button>
    </div>
  );
};

export default Sidebar;
