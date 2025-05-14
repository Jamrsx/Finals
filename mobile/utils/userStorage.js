import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_DATA_KEY = '@user_data';

export const storeUserData = async (userData) => {
  try {
    const data = {
      student_id: userData.student_id,
      full_name: userData.full_name,
    };
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error storing user data:', error);
    return false;
  }
};

export const getUserData = async () => {
  try {
    const data = await AsyncStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const removeUserData = async () => {
  try {
    await AsyncStorage.removeItem(USER_DATA_KEY);
    return true;
  } catch (error) {
    console.error('Error removing user data:', error);
    return false;
  }
}; 