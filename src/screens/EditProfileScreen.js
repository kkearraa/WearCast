import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Field from '../components/Field';
import FormError from '../components/FormError';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { isValidEmail } from '../utils/validation';
import { colors } from '../theme';

export default function EditProfileScreen({ navigation }) {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setError('');
    if (!name.trim()) return setError('Please enter your name.');
    if (!isValidEmail(email)) return setError('Please enter a valid email address.');

    setLoading(true);
    try {
      await updateProfile({ name, email });
      Alert.alert('Saved', 'Your profile was updated.');
      navigation.goBack();
    } catch (e) {
      setError(
        e.message === 'EMAIL_TAKEN'
          ? 'Another account already uses this email.'
          : 'Could not save your changes. Please try again.'
      );
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.initials || '?'}</Text>
          </View>

          <FormError message={error} />
          <Field label="Full name" icon="person-outline" autoCapitalize="words" value={name} onChangeText={setName} />
          <Field label="Email" icon="mail-outline" keyboardType="email-address" value={email} onChangeText={setEmail} />

          <PrimaryButton title="Save changes" icon="checkmark" onPress={handleSave} loading={loading} style={{ marginTop: 8 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 20,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '900' },
});
