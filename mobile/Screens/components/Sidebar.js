import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { removeUserData, getUserData } from '../../utils/userStorage';
import { sidebarStyles } from '../design/SidebarDesign';

const { width } = Dimensions.get('window');

const Sidebar = ({ isOpen, onClose }) => {
  const navigation = useNavigation();
  const translateX = React.useRef(new Animated.Value(-width)).current;
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await getUserData();
      if (data) {
        setUserData(data);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await removeUserData();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleNavigation = (screenName) => {
    onClose();
    navigation.navigate(screenName);
  };

  return (
    <>
      {isOpen && (
        <TouchableOpacity
          style={sidebarStyles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
      )}
      <Animated.View
        style={[
          sidebarStyles.container,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <SafeAreaView style={sidebarStyles.safeArea}>
          <View style={sidebarStyles.header}>
            <Text style={sidebarStyles.headerTitle}>Menu</Text>
          </View>

          <View style={sidebarStyles.userInfo}>
            <Text style={sidebarStyles.userInfoLabel}>Student ID:</Text>
            <Text style={sidebarStyles.userInfoValue}>{userData?.student_id || 'N/A'}</Text>
            <Text style={sidebarStyles.userInfoLabel}>Full Name:</Text>
            <Text style={sidebarStyles.userInfoValue}>{userData?.full_name || 'N/A'}</Text>
          </View>

          <View style={sidebarStyles.divider} />

          <ScrollView style={sidebarStyles.menuContainer}>
            <TouchableOpacity 
              style={sidebarStyles.menuItem}
              onPress={() => handleNavigation('Dashboard')}
            >
              <Text style={sidebarStyles.menuText}>Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={sidebarStyles.menuItem}
              onPress={() => handleNavigation('Tracks')}
            >
              <Text style={sidebarStyles.menuText}>Tracks</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={sidebarStyles.menuItem}
              onPress={() => handleNavigation('Enrollments')}
            >
              <Text style={sidebarStyles.menuText}>Enrollments</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={sidebarStyles.menuItem}
              onPress={() => handleNavigation('PreviousEnrollments')}
            >
              <Text style={sidebarStyles.menuText}>Previous Enrollments</Text>
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity style={sidebarStyles.logoutButton} onPress={handleLogout}>
            <Text style={sidebarStyles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Animated.View>
    </>
  );
};

export default Sidebar; 