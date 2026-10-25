import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow } from '../theme';

// variant: 'primary' | 'secondary' | 'ghost' | 'danger'
// loading: shows a spinner and blocks extra taps while something is happening
export default function PrimaryButton({
  title,
  onPress,
  icon,
  variant = 'primary',
  style,
  loading = false,
  disabled = false,
}) {
  const textColor =
    variant === 'primary' ? '#fff' : variant === 'danger' ? colors.danger : colors.primary;
  const inactive = loading || disabled;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={inactive}
      style={[styles.base, styles[variant], inactive && styles.inactive, style]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator size="small" color={textColor} style={styles.icon} />
        ) : icon ? (
          <Ionicons name={icon} size={18} color={textColor} style={styles.icon} />
        ) : null}
        <Text style={[styles.text, { color: textColor }]}>{loading ? 'Please wait...' : title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 8 },
  text: { fontSize: 16, fontWeight: '700' },
  inactive: { opacity: 0.6 },
  primary: { backgroundColor: colors.primary, ...shadow.button },
  secondary: { backgroundColor: colors.primarySoft },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.dangerSoft },
});
