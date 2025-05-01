import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './Coordinator/Login';  // Login component
import Dashboard from './Coordinator/Dashboard';  // Dashboard component
import Track from './Coordinator/Track'; 
import Student from './Coordinator/Student'; 
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/Coordinator/Login" />} />
        <Route path="/Coordinator/Login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/track" element={<Track/>} />
        <Route path="/students" element={<Student/>} />
      </Routes>
    </div>
  );
}

export default App;
