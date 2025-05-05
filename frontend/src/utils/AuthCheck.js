import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCheck = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const coordinatorData = localStorage.getItem('coordinator');
    
    if (!coordinatorData) {
      navigate('/Coordinator/Login');
    }
  }, [navigate]);

  return children;
};

export default AuthCheck; 