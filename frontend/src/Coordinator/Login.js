import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import Swal from 'sweetalert2';
import '../css/Login.css';

function Login() {
  const [coordinatorId, setCoordinatorId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const coordinatorData = localStorage.getItem('coordinator');
    if (coordinatorData) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/coordinator/login', {
        coordinator_id: coordinatorId,
        password: password,
      });

      localStorage.setItem('coordinator', JSON.stringify(response.data.coordinator));
      
      Swal.fire({
        title: 'Success!',
        text: 'Login successful',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        navigate('/dashboard');
      });

    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.error || 'Login failed',
        icon: 'error',
        confirmButtonColor: '#3085d6',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <img 
            src="/img/occlogo.png" 
            alt="Opol Community College Logo"
            className="login-logo"
          />
          <h2>Coordinator Login</h2>
          <p>Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <FiUser className="input-icon" />
            <input
              type="text"
              placeholder="Coordinator ID"
              value={coordinatorId}
              onChange={(e) => setCoordinatorId(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <FiLock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button" 
              className="password-toggle"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
