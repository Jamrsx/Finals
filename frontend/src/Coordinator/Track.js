import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Coordinator/components/sidebar';
import Header from './components/Header';
import './css/Dashboard.css';
import './css/track.css';
import axios from 'axios';
import AuthCheck from '../utils/AuthCheck';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Swal from 'sweetalert2';

const Track = () => {
  const navigate = useNavigate();

  const [tracks, setTracks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);

  const [trackId, setTrackId] = useState('');
  const [trackName, setTrackName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const coordinatorData = localStorage.getItem('coordinator');
    if (!coordinatorData) {
      navigate('/Coordinator/Login');
    } else {
      fetchTracks();
    }
  }, [navigate]);

  const fetchTracks = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/ShowTracks');
      setTracks(res.data.tracks || res.data); 
    } catch (err) {
      console.error('Error fetching tracks:', err);
    }
  };

  const openAddModal = () => {
    setTrackId(''); 
    setTrackName('');
    setDescription('');
    setIsEdit(false);
    setShowModal(true);
  };

  const openEditModal = (track) => {
    setTrackId(track.track_id);
    setTrackName(track.track_name);
    setDescription(track.description);
    setCurrentTrack(track);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Delete Track?',
      text: "Are you sure you want to delete this track?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:8000/api/DeleteTrack/${id}`);
          Swal.fire(
            'Deleted!',
            'Track has been deleted.',
            'success'
          ).then(() => {
            fetchTracks();
          });
        } catch (err) {
          console.error('Delete failed:', err);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to delete track',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      }
    });
  };

  const handleTrackIdChange = (e) => {
    const value = e.target.value;
    // Check if the input contains any non-digit characters
    if (value && !/^\d+$/.test(value)) {
      Swal.fire({
        title: 'Invalid Input!',
        text: 'Track ID must contain only numbers',
        icon: 'warning',
        confirmButtonColor: '#2563eb'
      });
      return;
    }
    setTrackId(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!trackId || !trackName.trim() || !description.trim()) {
      Swal.fire({
        title: 'Error!',
        text: 'Please fill in all fields',
        icon: 'error',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    // Additional validation for track ID
    if (!/^\d+$/.test(trackId)) {
      Swal.fire({
        title: 'Error!',
        text: 'Track ID must contain only numbers',
        icon: 'error',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const trackData = {
      track_id: trackId,
      track_name: trackName,
      description: description,
    };

    try {
      if (isEdit && currentTrack) {
        // If editing an existing track, make a PUT request
        await axios.put(`http://localhost:8000/api/UpdateTrack/${currentTrack.track_id}`, trackData);
        Swal.fire({
          title: 'Success!',
          text: 'Track has been updated successfully',
          icon: 'success',
          confirmButtonColor: '#2563eb'
        });
      } else {
        // If adding a new track, make a POST request
        await axios.post('http://localhost:8000/api/tracks', trackData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        Swal.fire({
          title: 'Success!',
          text: 'Track has been added successfully',
          icon: 'success',
          confirmButtonColor: '#2563eb'
        });
      }

      setShowModal(false);
      fetchTracks(); // Refresh track list after update or creation
    } catch (err) {
      console.error('Failed to save track:', err.response ? err.response.data : err.message);
      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Failed to save track. Please try again.',
        icon: 'error',
        confirmButtonColor: '#2563eb'
      });
    }
  };

  return (
    <AuthCheck>
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <Header title="Track Management" />
          <button onClick={openAddModal} style={{ marginBottom: '10px' }}>
            ➕ Add New Track
          </button>

          <table width="100%" cellPadding="10">
            <thead>
              <tr>
                <th>Track ID</th>
                <th>Track Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tracks.map((track) => (
                <tr key={track.track_id}>
                  <td>{track.track_id}</td>
                  <td>{track.track_name}</td>
                  <td>{track.description}</td>
                  <td>
                    <button 
                      onClick={() => openEditModal(track)}
                      className="btn btn-link edit-btn"
                      style={{ border: 'none', background: 'none', padding: '0 5px' }}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      onClick={() => handleDelete(track.track_id)}
                      className="btn btn-link delete-btn"
                      style={{ border: 'none', background: 'none', padding: '0 5px' }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {showModal && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
              justifyContent: 'center', alignItems: 'center'
            }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '10px', width: '400px' }}>
                <h2>{isEdit ? 'Edit Track' : 'Add Track'}</h2>
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    placeholder="Track ID"
                    value={trackId}
                    onChange={handleTrackIdChange}
                    required
                    style={{ width: '100%', marginBottom: '10px' }}
                    disabled={isEdit}
                    pattern="[0-9]*"
                    inputMode="numeric"
                  />
                  <input
                    type="text"
                    placeholder="Track Name"
                    value={trackName}
                    onChange={(e) => setTrackName(e.target.value)}
                    required
                    style={{ width: '100%', marginBottom: '10px' }}
                  />
                  <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    style={{ width: '100%', marginBottom: '10px' }}
                  />
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      style={{ 
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      {isEdit ? 'Update' : 'Save'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowModal(false)}
                      className="btn btn-danger"
                      style={{ 
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthCheck>
  );
};

export default Track;
