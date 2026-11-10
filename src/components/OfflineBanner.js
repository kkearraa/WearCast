import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius } from '../theme';
import { useStyles } from '../context/ThemeContext';

// Shown when there's no connection / weather couldn't be loaded (graceful degradation).
export default function OfflineBanner({ message }) {
  const { styles, isDark } = useStyles(makeStyles);
  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline-outline" size={20} color={isDark ? '#FFB86B' : '#B54708'} />
      <Text style={styles.text}>
        {message || "You're offline. Showing your saved closet — weather and AI suggestions are paused."}
      </Text>
    </View>
  );
}

const makeStyles = ({ colors, shadow }) => StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warnSoft,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 16,
  },
  text: { flex: 1, marginLeft: 10, fontSize: 13, lineHeight: 18, color: colors.warnText, fontWeight: '600' },
});
