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
import { previousEnrollmentsStyles } from './design/PreviousEnrollmentsDesign';
import { useNavigation } from '@react-navigation/native';
import { refreshApp } from '../utils/refreshApp';
import API_URL from '../config/api';

const PreviousEnrollmentsScreen = () => {
  const navigation = useNavigation();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reenrolling, setReenrolling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserDataAndEnrollments();
  }, []);

  const loadUserDataAndEnrollments = async () => {
    try {
      const data = await getUserData();
      setUserData(data);
      if (data?.student_id) {
        await fetchEnrollments(data.student_id);
      } else {
        setError('User data not found. Please log in again.');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data');
    }
  };

  const fetchEnrollments = async (studentId) => {
    try {
      setLoading(true);
      
      const response = await axios.get(`${API_URL}/enrollments`, {
        params: {
          student_id: studentId
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (response.data.status === 'success') {
        // Filter only declined enrollments for the current student
        const declinedEnrollments = response.data.data.filter(
          enrollment => 
            enrollment.status === 'declined' &&
            enrollment.student_id === studentId // Ensure it matches the current student
        );
        setEnrollments(declinedEnrollments);
      } else {
        setError('Failed to fetch enrollments');
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setError('Failed to load enrollments. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (userData?.student_id) {
      fetchEnrollments(userData.student_id);
    } else {
      loadUserDataAndEnrollments();
    }
  }, [userData]);

  const handleReenroll = async (track) => {
    try {
      setReenrolling(true);
      const userData = await getUserData();
      
      if (!userData || !userData.student_id) {
        Alert.alert('Error', 'Please log in to re-enroll');
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
          `Successfully re-enrolled in ${track.track_name}`,
          [{ 
            text: 'OK',
            onPress: () => {
              // Refresh the enrollments list
              fetchEnrollments();
            }
          }]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to re-enroll');
      }
    } catch (error) {
      console.error('Error re-enrolling:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to re-enroll. Please try again.'
      );
    } finally {
      setReenrolling(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <MainLayout title="Previous Enrollments">
        <View style={previousEnrollmentsStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={previousEnrollmentsStyles.loadingText}>Loading enrollments...</Text>
        </View>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Previous Enrollments">
        <View style={previousEnrollmentsStyles.errorContainer}>
          <Text style={previousEnrollmentsStyles.errorText}>{error}</Text>
          <TouchableOpacity style={previousEnrollmentsStyles.retryButton} onPress={fetchEnrollments}>
            <Text style={previousEnrollmentsStyles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Previous Enrollments">
      <ScrollView 
        style={previousEnrollmentsStyles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
        {enrollments.length === 0 ? (
          <View style={previousEnrollmentsStyles.emptyContainer}>
            <Text style={previousEnrollmentsStyles.emptyText}>No previous enrollments</Text>
          </View>
        ) : (
          enrollments.map((enrollment) => (
            <View key={enrollment.enrollment_id} style={previousEnrollmentsStyles.enrollmentCard}>
              <View style={previousEnrollmentsStyles.cardHeader}>
                <Text style={previousEnrollmentsStyles.courseName}>{enrollment.track_name}</Text>
                <View style={[previousEnrollmentsStyles.statusBadge, { backgroundColor: '#dc3545' }]}>
                  <Text style={previousEnrollmentsStyles.statusText}>Declined</Text>
                </View>
              </View>

              <View style={previousEnrollmentsStyles.infoRow}>
                <Text style={previousEnrollmentsStyles.infoLabel}>Track ID:</Text>
                <Text style={previousEnrollmentsStyles.infoValue}>{enrollment.track_id}</Text>
              </View>

              <View style={previousEnrollmentsStyles.infoRow}>
                <Text style={previousEnrollmentsStyles.infoLabel}>Declined On:</Text>
                <Text style={previousEnrollmentsStyles.infoValue}>
                  {new Date(enrollment.updated_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </MainLayout>
  );
};

export default PreviousEnrollmentsScreen; 