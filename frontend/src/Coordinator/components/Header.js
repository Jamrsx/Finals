import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../css/Header.css';

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
    localStorage.removeItem('coordinator');
    navigate('/Coordinator/Login');
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