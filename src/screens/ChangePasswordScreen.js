import React, { useState } from 'react';
import { ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Field from '../components/Field';
import FormError from '../components/FormError';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { passwordProblem } from '../utils/validation';
import { colors } from '../theme';

export default function ChangePasswordScreen({ navigation }) {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setError('');
    if (!current) return setError('Please enter your current password.');
    const problem = passwordProblem(next);
    if (problem) return setError(problem);
    if (next !== confirm) return setError('New passwords do not match.');
    if (next === current) return setError('Your new password must be different from the current one.');

    setLoading(true);
    try {
      await changePassword(current, next);
      Alert.alert('Password changed', 'Use your new password next time you log in.');
      navigation.goBack();
    } catch (e) {
      setError(
        e.message === 'WRONG_PASSWORD'
          ? 'Your current password is incorrect.'
          : 'Could not change your password. Please try again.'
      );
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.hint}>Choose a password with at least 8 characters, including a letter and a number.</Text>

          <FormError message={error} />
          <Field label="Current password" icon="lock-closed-outline" secure value={current} onChangeText={setCurrent} />
          <Field label="New password" icon="key-outline" secure value={next} onChangeText={setNext} />
          <Field
            label="Confirm new password"
            icon="shield-checkmark-outline"
            secure
            value={confirm}
            onChangeText={setConfirm}
            onSubmitEditing={handleSave}
          />

          <PrimaryButton title="Update password" icon="checkmark" onPress={handleSave} loading={loading} style={{ marginTop: 8 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  hint: { fontSize: 14, color: colors.muted, lineHeight: 21, marginBottom: 20 },
});
