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
import { enrollmentsStyles } from './design/EnrollmentsDesign';
import { useNavigation } from '@react-navigation/native';
import { refreshApp } from '../utils/refreshApp';
import API_URL from '../config/api';

const EnrollmentsScreen = () => {
  const navigation = useNavigation();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const userData = await getUserData();
      
      if (!userData || !userData.student_id) {
        setError('Please log in to view enrollments');
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
        // Filter only active and pending enrollments for the current student
        const currentEnrollments = response.data.data.filter(
          enrollment => 
            (enrollment.status === 'active' || enrollment.status === 'pending') &&
            enrollment.student_id === userData.student_id
        );
        console.log('Fetched enrollments:', currentEnrollments); // Debug log
        setEnrollments(currentEnrollments);
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
    refreshApp(navigation);
  }, [navigation]);

  const handleCancelEnrollment = async (enrollmentId) => {
    try {
      const userData = await getUserData();
      
      if (!userData || !userData.student_id) {
        Alert.alert('Error', 'Please log in to cancel enrollment');
        return;
      }

      // Show confirmation dialog
      Alert.alert(
        'Cancel Enrollment',
        'Are you sure you want to cancel this enrollment request?',
        [
          {
            text: 'No',
            style: 'cancel'
          },
          {
            text: 'Yes',
            onPress: async () => {
              try {
                // Ensure enrollmentId is a number
                const id = parseInt(enrollmentId, 10);
                
                if (isNaN(id)) {
                  Alert.alert('Error', 'Invalid enrollment ID');
                  return;
                }

                const response = await axios.post(
                  `${API_URL}/cancel-enrollment`,
                  {
                    id: id,
                    student_id: userData.student_id.toString()
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
                    'Enrollment cancelled successfully',
                    [{ 
                      text: 'OK',
                      onPress: () => {
                        // Refresh the enrollments list
                        fetchEnrollments();
                      }
                    }]
                  );
                } else {
                  Alert.alert('Error', response.data.message || 'Failed to cancel enrollment');
                }
              } catch (error) {
                console.error('Error cancelling enrollment:', error);
                let errorMessage = 'Failed to cancel enrollment. Please try again.';
                
                if (error.response) {
                  // The request was made and the server responded with a status code
                  // that falls out of the range of 2xx
                  if (error.response.status === 422) {
                    errorMessage = 'Invalid enrollment data. Please try again.';
                  } else if (error.response.status === 404) {
                    errorMessage = 'Enrollment not found.';
                  } else if (error.response.status === 400) {
                    errorMessage = 'This enrollment cannot be cancelled.';
                  } else {
                    errorMessage = error.response.data.message || errorMessage;
                  }
                } else if (error.request) {
                  // The request was made but no response was received
                  errorMessage = 'No response from server. Please check your internet connection.';
                }
                
                Alert.alert('Error', errorMessage);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in handleCancelEnrollment:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '#4CAF50';
      case 'pending':
        return '#FFC107';
      default:
        return '#757575';
    }
  };

  if (loading && !refreshing) {
    return (
      <MainLayout title="Current Enrollments">
        <View style={enrollmentsStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={enrollmentsStyles.loadingText}>Loading enrollments...</Text>
        </View>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Current Enrollments">
        <View style={enrollmentsStyles.errorContainer}>
          <Text style={enrollmentsStyles.errorText}>{error}</Text>
          <TouchableOpacity style={enrollmentsStyles.retryButton} onPress={fetchEnrollments}>
            <Text style={enrollmentsStyles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Current Enrollments">
      <ScrollView 
        style={enrollmentsStyles.content}
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
          <View style={enrollmentsStyles.emptyContainer}>
            <Text style={enrollmentsStyles.emptyText}>No current enrollments</Text>
          </View>
        ) : (
          enrollments.map((enrollment) => (
            <View key={enrollment.id} style={enrollmentsStyles.enrollmentCard}>
              <View style={enrollmentsStyles.cardHeader}>
                <Text style={enrollmentsStyles.courseName}>{enrollment.track_name}</Text>
                <View style={[enrollmentsStyles.statusBadge, { backgroundColor: getStatusColor(enrollment.status) }]}>
                  <Text style={enrollmentsStyles.statusText}>{enrollment.status}</Text>
                </View>
              </View>

              <View style={enrollmentsStyles.infoRow}>
                <Text style={enrollmentsStyles.infoLabel}>Track ID:</Text>
                <Text style={enrollmentsStyles.infoValue}>{enrollment.track_id}</Text>
              </View>

              <View style={enrollmentsStyles.infoRow}>
                <Text style={enrollmentsStyles.infoLabel}>Enrolled:</Text>
                <Text style={enrollmentsStyles.infoValue}>
                  {new Date(enrollment.created_at).toLocaleDateString()}
                </Text>
              </View>

              {enrollment.status === 'pending' && (
                <TouchableOpacity 
                  style={enrollmentsStyles.cancelButton}
                  onPress={() => handleCancelEnrollment(enrollment.id)}
                >
                  <Text style={enrollmentsStyles.cancelButtonText}>Cancel Enrollment</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </MainLayout>
  );
};

export default EnrollmentsScreen; 