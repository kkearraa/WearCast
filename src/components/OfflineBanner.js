import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';


export default function OfflineBanner({ message }) {
  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline-outline" size={20} color="#B54708" />
      <Text style={styles.text}>
        {message || "You're offline. Showing your saved closet — weather and AI suggestions are paused."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E5',
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 16,
  },
  text: { flex: 1, marginLeft: 10, fontSize: 13, lineHeight: 18, color: '#B54708', fontWeight: '600' },
});
