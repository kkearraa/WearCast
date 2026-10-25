import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

// Red message box for form errors. Renders nothing when there's no message.
export default function FormError({ message, style }) {
  if (!message) return null;
  return (
    <View style={[styles.box, style]}>
      <Ionicons name="alert-circle" size={18} color={colors.danger} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 16,
  },
  text: { flex: 1, marginLeft: 10, color: colors.danger, fontSize: 13, fontWeight: '600', lineHeight: 18 },
});
