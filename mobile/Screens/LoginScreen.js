import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { storeUserData, getUserData } from '../utils/userStorage';
import { loginStyles } from './design/LoginDesign';
import { refreshApp } from '../utils/refreshApp';

const { width } = Dimensions.get('window');
const API_URL = 'http://192.168.193.143:8000/api';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    checkExistingLogin();
  }, []);

  const checkExistingLogin = async () => {
    try {
      const userData = await getUserData();
      if (userData && userData.student_id) {
        // User is already logged in, navigate to Dashboard
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!studentId || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoggingIn(true);
    try {
      console.log('Attempting login to:', `${API_URL}/login`);
      const response = await axios.post(`${API_URL}/login`, {
        student_id: studentId,
        password: password,
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      console.log('Login response:', response.data);

      if (response.data.status === 'success') {
        // Store all user data in AsyncStorage
        const userData = {
          student_id: response.data.data.student_id,
          full_name: response.data.data.full_name,
          password: password, // Store password for future use
          ...response.data.data // Store any additional data from the response
        };
        
        // Store user data
        await storeUserData(userData);
        
        // Navigate to Dashboard
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
      } else {
        Alert.alert('Error', response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response) {
        Alert.alert(
          'Error',
          error.response.data.message || 'Login failed. Please check your credentials.'
        );
      } else if (error.request) {
        Alert.alert(
          'Connection Error',
          'Unable to connect to the server. Please check your internet connection.'
        );
      } else {
        Alert.alert(
          'Error',
          `An unexpected error occurred: ${error.message}`
        );
      }
    } finally {
      setLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={loginStyles.container}>
        <View style={loginStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={loginStyles.loadingText}>Checking login status...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={loginStyles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={loginStyles.keyboardAvoidingView}
      >
        <View style={loginStyles.logoContainer}>
          <View style={loginStyles.logoCircle}>
            <Text style={loginStyles.logoText}>OCC</Text>
          </View>
          <Text style={loginStyles.welcomeText}>Welcome Back!</Text>
          <Text style={loginStyles.subtitleText}>Sign in to continue</Text>
        </View>

        <View style={loginStyles.formContainer}>
          <View style={loginStyles.inputContainer}>
            <Text style={loginStyles.inputLabel}>Student ID</Text>
            <TextInput
              style={loginStyles.input}
              placeholder="Enter your student ID"
              value={studentId}
              onChangeText={setStudentId}
              keyboardType="numeric"
              maxLength={12}
              editable={!loggingIn}
              placeholderTextColor="#999"
            />
          </View>

          <View style={loginStyles.inputContainer}>
            <Text style={loginStyles.inputLabel}>Password</Text>
            <TextInput
              style={loginStyles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loggingIn}
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity 
            style={[loginStyles.button, loggingIn && loginStyles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loggingIn}
          >
            {loggingIn ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={loginStyles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen; 