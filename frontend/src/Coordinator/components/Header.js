import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../css/Header.css';
import Swal from 'sweetalert2';

const Header = ({ title }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  return (
    <header className="dashboard-header">
      <h1>{title}</h1>
      <div className="profile-section" ref={dropdownRef}>
        <button 
          className="profile-button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <i className="fas fa-user-circle"></i>
          <span>Coordinator</span>
          <i className={`fas fa-chevron-${isDropdownOpen ? 'up' : 'down'}`}></i>
        </button>
        
        {isDropdownOpen && (
          <div className="dropdown-menu">
            <button onClick={handleLogout} className="dropdown-item">
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 