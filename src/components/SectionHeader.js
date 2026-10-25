import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function SectionHeader({ title, action, onAction, style }) {
  return (
    <View style={[styles.row, style]}>
      <Text style={styles.title}>{title}</Text>
      {action ? (
        <TouchableOpacity onPress={onAction} hitSlop={10}>
          <Text style={styles.action}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.ink },
  action: { fontSize: 14, fontWeight: '700', color: colors.primary },
});
