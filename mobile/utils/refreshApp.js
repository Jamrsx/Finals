import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { getUserData } from './userStorage';

/**
 * Refreshes the whole app: clears async storage, resets navigation, and reloads user/session data.
 * @param {object} navigation - The navigation object from react-navigation.
 */
export const refreshApp = async (navigation) => {
  try {
    // Optionally clear all storage, or just user/session data
    // await AsyncStorage.clear(); // Uncomment to clear everything
    await AsyncStorage.removeItem('userData');

    // Check if user is still logged in
    const userData = await getUserData();
    if (userData && userData.student_id) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        })
      );
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    }
  } catch (error) {
    console.error('Error refreshing app:', error);
  }
}; 