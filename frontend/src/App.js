import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './Coordinator/Login';  // Login component
import Dashboard from './Coordinator/Dashboard';  // Dashboard component
import Track from './Coordinator/Track'; 
import Student from './Coordinator/Student'; 
import Instructor from './Coordinator/Instructor';
import StudentArchive from './Coordinator/StudentArchive';
import Enrollments from './Coordinator/Enrollements';
import { ThemeProvider } from './context/ThemeContext';
import './Coordinator/css/theme.css';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/Coordinator/Login" />} />
          <Route path="/Coordinator/Login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/track" element={<Track/>} />
          <Route path="/students" element={<Student/>} />
          <Route path="/instructors" element={<Instructor/>} />
          <Route path="/enrollments" element={<Enrollments/>} />
          <Route path="/student-archive" element={<StudentArchive/>} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
