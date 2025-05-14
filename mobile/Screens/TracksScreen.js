import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import MainLayout from './components/MainLayout';
import { getUserData } from '../utils/userStorage';
import Icon from 'react-native-vector-icons/Ionicons';
import { tracksStyles } from './design/TracksDesign';

const API_URL = 'http://192.168.193.143:8000/api';

const TracksScreen = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [hasExistingEnrollment, setHasExistingEnrollment] = useState(false);
  const [existingTrack, setExistingTrack] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkExistingEnrollment();
  }, []);

  const checkExistingEnrollment = async () => {
    try {
      const userData = await getUserData();
      
      if (!userData || !userData.student_id) {
        setError('Please log in to view tracks');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/enrollments`, {
        params: {
          student_id: userData.student_id
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (response.data.status === 'success') {
        const currentEnrollments = response.data.data.filter(
          enrollment => 
            (enrollment.status === 'active' || enrollment.status === 'pending' || enrollment.status === 'accepted') &&
            enrollment.student_id === userData.student_id
        );

        if (currentEnrollments.length > 0) {
          setHasExistingEnrollment(true);
          // Get the track details from the available tracks endpoint
          const tracksResponse = await axios.get(`${API_URL}/available-tracks`, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          });
          
          if (tracksResponse.data.status === 'success') {
            const trackDetails = tracksResponse.data.data.find(
              track => track.track_id === currentEnrollments[0].track_id
            );
            
            if (trackDetails) {
              setExistingTrack({
                ...trackDetails,
                status: currentEnrollments[0].status
              });
            }
          }
          setLoading(false);
        } else {
          // Only fetch tracks if there's no existing enrollment
          fetchTracks();
        }
      } else {
        setError('Failed to check enrollment status');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking enrollment status:', error);
      setError('Failed to check enrollment status. Please try again later.');
      setLoading(false);
    }
  };

  const fetchTracks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/available-tracks`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (response.data.status === 'success') {
        setTracks(response.data.data || []);
      } else {
        setError('Failed to fetch tracks');
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
      setError('Failed to load tracks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (track) => {
    try {
      setEnrolling(true);
      const userData = await getUserData();
      
      if (!userData || !userData.student_id) {
        Alert.alert('Error', 'Please log in to enroll in a track');
        return;
      }

      const response = await axios.post(
        `${API_URL}/enroll-track`,
        {
          student_id: userData.student_id,
          track_id: track.track_id
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.status === 'success') {
        Alert.alert(
          'Success',
          `Successfully enrolled in ${track.track_name}`,
          [{ 
            text: 'OK',
            onPress: () => {
              // After successful enrollment, update the screen state
              setHasExistingEnrollment(true);
              setTracks([]);
            }
          }]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to enroll in track');
      }
    } catch (error) {
      console.error('Error enrolling in track:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to enroll in track. Please try again.'
      );
    } finally {
      setEnrolling(false);
    }
  };

  const handleTrackPress = (track) => {
    Alert.alert(
      'Track Details',
      `${track.description}\n\nCreated: ${new Date(track.created_at).toLocaleDateString()}`,
      [{ text: 'OK' }]
    );
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    checkExistingEnrollment().finally(() => setRefreshing(false));
  }, []);

  if (loading) {
    return (
      <MainLayout title="Available Tracks">
        <View style={tracksStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={tracksStyles.loadingText}>Loading tracks...</Text>
        </View>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Available Tracks">
        <View style={tracksStyles.errorContainer}>
          <Text style={tracksStyles.errorText}>{error}</Text>
          <TouchableOpacity style={tracksStyles.retryButton} onPress={checkExistingEnrollment}>
            <Text style={tracksStyles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </MainLayout>
    );
  }

  if (hasExistingEnrollment) {
    return (
      <MainLayout title="Available Tracks">
        <ScrollView
          style={tracksStyles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
        >
          <View style={tracksStyles.emptyContainer}>
            <Text style={tracksStyles.emptyText}>
              <Icon name="alert-circle-outline" size={22} color="#ef6c00" style={{marginRight: 6}} />
              You already have a {existingTrack?.status || 'pending/active'} enrollment in:
            </Text>
            {existingTrack && (
              <View style={tracksStyles.existingTrackCard}>
                <View style={tracksStyles.trackHeaderRow}>
                  <Icon name="school-outline" size={28} color="#007AFF" style={{marginRight: 10}} />
                  <Text style={tracksStyles.trackName}>{existingTrack.track_name}</Text>
                </View>
                <Text style={tracksStyles.trackDescription}>{existingTrack.description}</Text>
                <View style={tracksStyles.statusBadgeRow}>
                  <Icon name="checkmark-circle-outline" size={18} color="#007AFF" style={{marginRight: 6}} />
                  <Text style={tracksStyles.trackStatus}>
                    Status: {existingTrack.status.charAt(0).toUpperCase() + existingTrack.status.slice(1)}
                  </Text>
                </View>
              </View>
            )}
            <Text style={[tracksStyles.emptyText, { marginTop: 15 }]}>Please check your enrollments screen for more details.</Text>
          </View>
        </ScrollView>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Available Tracks">
      <ScrollView
        style={tracksStyles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
        {tracks.length === 0 ? (
          <View style={tracksStyles.emptyContainer}>
            <Icon name="information-circle-outline" size={32} color="#007AFF" style={{marginBottom: 10}} />
            <Text style={tracksStyles.emptyText}>No tracks available</Text>
          </View>
        ) : (
          tracks.map((track) => (
            <View key={track.track_id} style={tracksStyles.trackCard}>
              <View style={tracksStyles.trackHeaderRow}>
                <Icon name="school-outline" size={28} color="#007AFF" style={{marginRight: 10}} />
                <Text style={tracksStyles.trackName}>{track.track_name}</Text>
              </View>
              <Text style={tracksStyles.trackDescription}>{track.description}</Text>
              <Text style={tracksStyles.trackDate}>
                <Icon name="calendar-outline" size={16} color="#999" style={{marginRight: 4}} />
                Created: {new Date(track.created_at).toLocaleDateString()}
              </Text>
              <TouchableOpacity
                style={tracksStyles.enrollButton}
                onPress={() => handleEnroll(track)}
                disabled={enrolling}
                activeOpacity={0.85}
              >
                {enrolling ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <View style={tracksStyles.enrollButtonContent}>
                    <Icon name="add-circle-outline" size={18} color="#fff" style={{marginRight: 8}} />
                    <Text style={tracksStyles.enrollButtonText}>Enroll in this Track</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </MainLayout>
  );
};

export default TracksScreen; 