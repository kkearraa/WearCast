import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

export default function Field({ label, icon, secure, error, style, ...inputProps }) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View style={[styles.wrap, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.box, focused && styles.boxFocused, error && styles.boxError]}>
        {icon ? (
          <Ionicons
            name={icon}
            size={20}
            color={focused ? colors.primary : colors.faint}
            style={styles.icon}
          />
        ) : null}
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.faint}
          secureTextEntry={secure && !visible}
          autoCapitalize="none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...inputProps}
        />
        {secure ? (
          <TouchableOpacity onPress={() => setVisible((v) => !v)} hitSlop={10}>
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.faint}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: 8, marginLeft: 2 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    paddingHorizontal: 14,
    height: 54,
  },
  boxFocused: { borderColor: colors.primary, backgroundColor: '#FAFBFF' },
  boxError: { borderColor: colors.danger },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: colors.ink, height: '100%' },
});
