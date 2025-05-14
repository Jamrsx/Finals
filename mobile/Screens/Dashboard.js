import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import MainLayout from './components/MainLayout';
import { getUserData } from '../utils/userStorage';
import Icon from 'react-native-vector-icons/Ionicons';
import { dashboardStyles } from './design/DashboardDesign';
import { useNavigation } from '@react-navigation/native';
import { refreshApp } from '../utils/refreshApp';

const API_URL = 'http://192.168.193.143:8000/api';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enrollmentStats, setEnrollmentStats] = useState({
    active: 0,
    pending: 0,
    rejected: 0,
    cancelled: 0
  });
  const [currentEnrollment, setCurrentEnrollment] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const data = await getUserData();
      setUserData(data);
      
      if (data?.student_id) {
        await fetchEnrollmentStats(data.student_id);
        await fetchCurrentEnrollment(data.student_id);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchEnrollmentStats = async (studentId) => {
    try {
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
        const enrollments = response.data.data;
        const stats = {
          active: enrollments.filter(e => e.status === 'active').length,
          pending: enrollments.filter(e => e.status === 'pending').length,
          rejected: enrollments.filter(e => e.status === 'declined').length,
          cancelled: enrollments.filter(e => e.status === 'cancelled').length
        };
        setEnrollmentStats(stats);
      }
    } catch (error) {
      console.error('Error fetching enrollment stats:', error);
    }
  };

  const fetchCurrentEnrollment = async (studentId) => {
    try {
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
        const currentEnrollments = response.data.data.filter(
          enrollment => 
            (enrollment.status === 'active' || enrollment.status === 'pending' || enrollment.status === 'accepted') &&
            enrollment.student_id === studentId
        );

        if (currentEnrollments.length > 0) {
          // Get track details
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
              setCurrentEnrollment({
                ...trackDetails,
                status: currentEnrollments[0].status
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching current enrollment:', error);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadUserData();
  }, []);

  if (loading && !refreshing) {
    return (
      <MainLayout title="Dashboard">
        <View style={dashboardStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={dashboardStyles.loadingText}>Loading dashboard...</Text>
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard" userData={userData}>
      <ScrollView 
        style={dashboardStyles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
        <View style={dashboardStyles.welcomeContainer}>
          <Text style={dashboardStyles.welcomeText}>Welcome back!</Text>
     
        </View>

        <View style={dashboardStyles.infoCard}>
          <Text style={dashboardStyles.infoTitle}>Student Information</Text>
          <View style={dashboardStyles.infoRow}>
            <Icon name="card-outline" size={20} color="#007AFF" style={{marginRight: 10}} />
            <Text style={dashboardStyles.infoLabel}>Student ID:</Text>
            <Text style={dashboardStyles.infoValue}>{userData?.student_id}</Text>
          </View>
          <View style={dashboardStyles.infoRow}>
            <Icon name="person-outline" size={20} color="#007AFF" style={{marginRight: 10}} />
            <Text style={dashboardStyles.infoLabel}>Full Name:</Text>
            <Text style={dashboardStyles.infoValue}>{userData?.full_name}</Text>
          </View>
          {currentEnrollment && (
            <>
              <View style={dashboardStyles.infoRow}>
                <Icon name="school-outline" size={20} color="#007AFF" style={{marginRight: 10}} />
                <Text style={dashboardStyles.infoLabel}>Current Track:</Text>
                <Text style={dashboardStyles.infoValue}>{currentEnrollment.track_name}</Text>
              </View>
              <View style={dashboardStyles.infoRow}>
                <Icon name="checkmark-circle-outline" size={20} color="#007AFF" style={{marginRight: 10}} />
                <Text style={dashboardStyles.infoLabel}>Status:</Text>
                <Text style={[
                  dashboardStyles.infoValue,
                  { 
                    color: currentEnrollment.status === 'accepted' ? '#2e7d32' :
                           currentEnrollment.status === 'pending' ? '#ef6c00' :
                           currentEnrollment.status === 'active' ? '#007AFF' : '#666',
                    fontWeight: 'bold',
                  }
                ]}>
                  {currentEnrollment.status.charAt(0).toUpperCase() + currentEnrollment.status.slice(1)}
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={dashboardStyles.statsContainer}>
          <View style={[dashboardStyles.statCard, { backgroundColor: '#e8f5e9' }]}> 
            <Icon name="checkmark-done-circle" size={32} color="#2e7d32" style={{marginBottom: 8}} />
            <Text style={[dashboardStyles.statNumber, { color: '#2e7d32' }]}>{enrollmentStats.active}</Text>
            <Text style={dashboardStyles.statLabel}>Active Enrollments</Text>
          </View>
          <View style={[dashboardStyles.statCard, { backgroundColor: '#fff3e0' }]}> 
            <Icon name="time-outline" size={32} color="#ef6c00" style={{marginBottom: 8}} />
            <Text style={[dashboardStyles.statNumber, { color: '#ef6c00' }]}>{enrollmentStats.pending}</Text>
            <Text style={dashboardStyles.statLabel}>Pending Requests</Text>
          </View>
        </View>
        <View style={dashboardStyles.statsContainer}>
          <View style={[dashboardStyles.statCard, { backgroundColor: '#ffebee' }]}> 
            <Icon name="close-circle-outline" size={32} color="#c62828" style={{marginBottom: 8}} />
            <Text style={[dashboardStyles.statNumber, { color: '#c62828' }]}>{enrollmentStats.rejected}</Text>
            <Text style={dashboardStyles.statLabel}>Rejected</Text>
          </View>
          <View style={[dashboardStyles.statCard, { backgroundColor: '#fffde7' }]}> 
            <Icon name="remove-circle-outline" size={32} color="#bdb800" style={{marginBottom: 8}} />
            <Text style={[dashboardStyles.statNumber, { color: '#bdb800' }]}>{enrollmentStats.cancelled}</Text>
            <Text style={dashboardStyles.statLabel}>Cancelled</Text>
          </View>
        </View>
      </ScrollView>
    </MainLayout>
  );
};

export default Dashboard;
