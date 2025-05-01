import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Coordinator/components/sidebar';
import '../css/Dashboard.css'; // Import the CSS file

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const coordinatorData = localStorage.getItem('coordinator');
    
    if (!coordinatorData) {
      navigate('/Coordinator/Login');
    } else {
      const coordinator = JSON.parse(coordinatorData);
      console.log('Logged in as:', coordinator.name);
    }
  }, [navigate]);
  
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <h1>Welcome Coordinator!</h1>
      </div>
    </div>
  );
};

export default Dashboard;
