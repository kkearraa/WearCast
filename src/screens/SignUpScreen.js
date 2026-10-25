import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Field from '../components/Field';
import FormError from '../components/FormError';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, passwordProblem } from '../utils/validation';
import { colors } from '../theme';

export default function SignUpScreen({ navigation }) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setError('');
    if (!name.trim()) return setError('Please enter your name.');
    if (!isValidEmail(email)) return setError('Please enter a valid email address.');
    const pwProblem = passwordProblem(password);
    if (pwProblem) return setError(pwProblem);
    if (password !== confirm) return setError('Passwords do not match.');

    setLoading(true);
    try {
      await signUp({ name, email, password });
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e) {
      setError(
        e.message === 'EMAIL_TAKEN'
          ? 'An account with this email already exists. Try logging in.'
          : 'Something went wrong. Please try again.'
      );
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={colors.ink} />
          </TouchableOpacity>

          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Your profile and closet are stored on this device — no server needed.
          </Text>

          <View style={{ marginTop: 28 }}>
            <FormError message={error} />
            <Field
              label="Full name"
              icon="person-outline"
              placeholder="Alex Morgan"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
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
              placeholder="8+ characters, letters and a number"
              secure
              value={password}
              onChangeText={setPassword}
            />
            <Field
              label="Confirm password"
              icon="shield-checkmark-outline"
              placeholder="Repeat your password"
              secure
              value={confirm}
              onChangeText={setConfirm}
              onSubmitEditing={handleSignUp}
            />

            <PrimaryButton title="Create account" onPress={handleSignUp} loading={loading} style={{ marginTop: 8 }} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.replace('Login')}>
              <Text style={styles.footerLink}>Log in</Text>
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
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', paddingTop: 28 },
  footerText: { color: colors.muted, fontSize: 15 },
  footerLink: { color: colors.primary, fontSize: 15, fontWeight: '700' },
});
