import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import ClosetScreen from '../screens/ClosetScreen';
import OutfitScreen from '../screens/OutfitScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddItemScreen from '../screens/AddItemScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: ['home', 'home-outline'],
  Closet: ['shirt', 'shirt-outline'],
  Outfit: ['sparkles', 'sparkles-outline'],
  Profile: ['person', 'person-outline'],
};

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.faint,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          paddingTop: 6,
          elevation: 16,
          shadowColor: '#1B2150',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = TAB_ICONS[route.name];
          return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Closet" component={ClosetScreen} />
      <Tab.Screen name="Outfit" component={OutfitScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  // While we check for a saved login, show a splash instead of flashing the Welcome screen.
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 56, marginBottom: 20 }}>🌤️</Text>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  // A remembered (non-guest) login goes straight to the app.
  const startRoute = user && !user.isGuest ? 'Main' : 'Welcome';

  return (
    <Stack.Navigator
      initialRouteName={startRoute}
      screenOptions={{
        headerShadowVisible: false,
        headerTintColor: colors.ink,
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { fontWeight: '800' },
        headerBackTitleVisible: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      {/* Auth flow */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />

      {/* Main app (bottom tabs) */}
      <Stack.Screen
        name="Main"
        component={MainTabs}
        options={{ headerShown: false, gestureEnabled: false }}
      />

      {/* Pushed screens */}
      <Stack.Screen name="AddItem" component={AddItemScreen} options={{ title: 'Add Clothing' }} />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} options={{ title: 'Item Details' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
    </Stack.Navigator>
  );
}
