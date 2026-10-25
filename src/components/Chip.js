import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

export default function Chip({ label, active, onPress, emoji, style }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.chip, active && styles.active, style]}
    >
      <Text style={[styles.text, active && styles.activeText]}>
        {emoji ? `${emoji}  ` : ''}
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    marginRight: 8,
    marginBottom: 8,
  },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 14, fontWeight: '600', color: colors.muted },
  activeText: { color: '#fff' },
});
