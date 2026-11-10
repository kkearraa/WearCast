import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { WeatherProvider } from './src/context/WeatherContext';

// Needs to sit inside ThemeProvider so the navigation container follows the theme.
function Root() {
  const { isDark, colors } = useTheme();
  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: { ...base.colors, background: colors.bg, card: colors.card, text: colors.ink, border: colors.line, primary: colors.primary },
  };
  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WeatherProvider>
          <Root />
        </WeatherProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
