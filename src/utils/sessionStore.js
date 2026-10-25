import * as SecureStore from 'expo-secure-store';

// Remembers which user is logged in (just the user id, not the password)
// in the phone's encrypted secure storage.
const KEY = 'wearcast_session_user';

export const saveSession = async (userId) => {
  try {
    await SecureStore.setItemAsync(KEY, String(userId));
  } catch (e) {
    console.warn('Could not save session', e);
  }
};

export const loadSession = async () => {
  try {
    return await SecureStore.getItemAsync(KEY);
  } catch (e) {
    return null;
  }
};

export const clearSession = async () => {
  try {
    await SecureStore.deleteItemAsync(KEY);
  } catch (e) {
    console.warn('Could not clear session', e);
  }
};
