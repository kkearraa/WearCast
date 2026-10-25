import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Field from '../components/Field';
import FormError from '../components/FormError';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export default function LoginScreen({ navigation }) {
  const { logIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await logIn({ email, password });
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e) {
      setError(
        e.message === 'INVALID_CREDENTIALS'
          ? 'Incorrect email or password.'
          : 'Something went wrong. Please try again.'
      );
      setLoading(false);
    }
  };

  const handleForgot = () =>
    Alert.alert(
      'Forgot your password?',
      'Accounts are stored only on this device, so there is no email reset. If you are still logged in, use Profile > Change password. Otherwise create a new account.'
    );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={colors.ink} />
          </TouchableOpacity>

          <Text style={styles.title}>Welcome back 👋</Text>
          <Text style={styles.subtitle}>Log in to open your closet and today's outfit.</Text>

          <View style={{ marginTop: 32 }}>
            <FormError message={error} />
            <Field
              label="Email"
              icon="mail-outline"
              placeholder="you@example.com"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <Field
              label="Password"
              icon="lock-closed-outline"
              placeholder="Your password"
              secure
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity style={styles.forgot} onPress={handleForgot}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <PrimaryButton title="Log in" onPress={handleLogin} loading={loading} style={{ marginTop: 8 }} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New to WearCast? </Text>
            <TouchableOpacity onPress={() => navigation.replace('SignUp')}>
              <Text style={styles.footerLink}>Create account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, flexGrow: 1 },
  back: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  title: { fontSize: 32, fontWeight: '900', color: colors.ink, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: colors.muted, marginTop: 8, lineHeight: 22 },
  forgot: { alignSelf: 'flex-end', marginBottom: 12 },
  forgotText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', paddingTop: 32 },
  footerText: { color: colors.muted, fontSize: 15 },
  footerLink: { color: colors.primary, fontSize: 15, fontWeight: '700' },
});
