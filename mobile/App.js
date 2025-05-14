import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './Screens/LoginScreen';
import Dashboard from './Screens/Dashboard';
import TracksScreen from './Screens/TracksScreen';
import EnrollmentsScreen from './Screens/EnrollmentsScreen';
import PreviousEnrollmentsScreen from './Screens/PreviousEnrollmentsScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Tracks" component={TracksScreen} />
        <Stack.Screen name="Enrollments" component={EnrollmentsScreen} />
        <Stack.Screen name="PreviousEnrollments" component={PreviousEnrollmentsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App; 