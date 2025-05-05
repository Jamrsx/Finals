import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Coordinator/components/sidebar';
import '../css/Dashboard.css';
import '../css/track.css';
import axios from 'axios';
import AuthCheck from '../utils/AuthCheck';

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
      setTracks(res.data.tracks || res.data); // adjust depending on your actual API response
    } catch (err) {
      console.error('Error fetching tracks:', err);
    }
  };

  const openAddModal = () => {
    setTrackId(''); // Clear track ID for a new track
    setTrackName('');
    setDescription('');
    setIsEdit(false);
    setShowModal(true);
  };

  const openEditModal = (track) => {
    setTrackId(track.track_id); // Use the track_id from the selected track
    setTrackName(track.track_name);
    setDescription(track.description);
    setCurrentTrack(track);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this track?')) {
      try {
        await axios.delete(`http://localhost:8000/api/DeleteTrack/${id}`);
        fetchTracks(); // Refresh track list after deletion
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trackData = {
      track_id: trackId, // Include the track_id in the request
      track_name: trackName,
      description: description,
    };

    try {
      if (isEdit && currentTrack) {
        // If editing an existing track, make a PUT request
        await axios.put(`http://localhost:8000/api/UpdateTrack/${currentTrack.track_id}`, trackData);
      } else {
        // If adding a new track, make a POST request
        await axios.post('http://localhost:8000/api/tracks', trackData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      setShowModal(false);
      fetchTracks(); // Refresh track list after update or creation
    } catch (err) {
      console.error('Failed to save track:', err.response ? err.response.data : err.message);
    }
  };

  return (
    <AuthCheck>
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <h1>Track Management</h1>
          <button onClick={openAddModal} style={{ marginBottom: '10px' }}>
            ➕ Add New Track
          </button>

          <table border="1" width="100%" cellPadding="10">
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
                <tr key={track.track_id}> {/* Use track_id for key */}
                  <td>{track.track_id}</td>
                  <td>{track.track_name}</td>
                  <td>{track.description}</td>
                  <td>
                    <button onClick={() => openEditModal(track)}>✏️ Edit</button>
                    <button onClick={() => handleDelete(track.track_id)} style={{ marginLeft: '10px' }}>🗑️ Delete</button>
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
                    onChange={(e) => setTrackId(e.target.value)}
                    required
                    style={{ width: '100%', marginBottom: '10px' }}
                    disabled={isEdit} // Disable Track ID field in edit mode
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
                  <button type="submit" style={{ marginRight: '10px' }}>
                    {isEdit ? 'Update' : 'Save'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
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
