import * as SecureStore from 'expo-secure-store';

// API keys live in the phone's encrypted secure storage, never in the code
// (so they can't leak when you push the project to GitHub).
const WEATHER_KEY = 'wearcast_weather_api_key';
const aiKeyName = (provider) => `wearcast_ai_key_${String(provider).toLowerCase()}`;

const read = async (name) => {
  try {
    return (await SecureStore.getItemAsync(name)) || '';
  } catch (e) {
    return '';
  }
};

const write = async (name, value) => {
  const clean = (value || '').trim();
  if (!clean) return;
  await SecureStore.setItemAsync(name, clean);
};

export const getWeatherApiKey = () => read(WEATHER_KEY);
export const setWeatherApiKey = (key) => write(WEATHER_KEY, key);

export const getAiApiKey = (provider) => read(aiKeyName(provider));
export const setAiApiKey = (provider, key) => write(aiKeyName(provider), key);
