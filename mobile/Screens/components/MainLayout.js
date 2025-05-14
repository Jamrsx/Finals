import React, { useState, useEffect } from 'react';
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
} from 'react-native';
import Sidebar from './Sidebar';
import { getUserData } from '../../utils/userStorage';

const MainLayout = ({ children, title }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f8fa' }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#007AFF',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
      }}>
        <TouchableOpacity onPress={toggleSidebar} style={{ marginRight: 10, padding: 4 }}>
          <Text style={{ fontSize: 22, color: '#fff', fontWeight: '700' }}>☰</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 16, color: '#fff', fontWeight: '700', letterSpacing: 0.2 }}>{title}</Text>
      </View>

      <View style={{ flex: 1 }}>{children}</View>

      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userData={userData}
      />
    </SafeAreaView>
  );
};

export default MainLayout; 