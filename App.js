import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { WeatherProvider } from './src/context/WeatherContext';

export default function App() {
  return (
    <AuthProvider>
      <WeatherProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <AppNavigator />
        </NavigationContainer>
      </WeatherProvider>
    </AuthProvider>
  );
}
