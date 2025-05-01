import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';  // Import the CSS file

function Login() {
  const [coordinatorId, setCoordinatorId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8000/api/coordinator/login', {
        coordinator_id: coordinatorId,
        password: password,
      });

      setMessage(response.data.message);
      console.log('Coordinator data:', response.data.coordinator);

      localStorage.setItem('coordinator', JSON.stringify(response.data.coordinator));
      navigate('/dashboard');

    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      setMessage(error.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      {/* Add your photo here */}
      <img 
        src="/img/occlogo.png" 
        alt="Opol Community College Logo"
        className="login-logo"
      />

      <h2>Coordinator Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Coordinator ID"
          value={coordinatorId}
          onChange={(e) => setCoordinatorId(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>

      {message && (
        <p>{message}</p>
      )}
    </div>
  );
}

export default Login;
