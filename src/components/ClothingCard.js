import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, shadow, getCategoryMeta } from '../theme';

// Grid tile for a clothing item. Works with your existing item shape
// ({ id, name, category, status }) and any extra fields (image, formality...).
export default function ClothingCard({ item, onPress }) {
  const meta = getCategoryMeta(item.category);
  const isClean = item.status === 'Clean' || !item.status;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      <View style={[styles.imageBox, { backgroundColor: meta.tint }]}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} />
        ) : (
          <Text style={styles.emoji}>{meta.emoji}</Text>
        )}

        <View style={[styles.badge, isClean ? styles.cleanBadge : styles.dirtyBadge]}>
          <View style={[styles.dot, { backgroundColor: isClean ? colors.success : colors.danger }]} />
          <Text style={[styles.badgeText, { color: isClean ? colors.success : colors.danger }]}>
            {isClean ? 'Clean' : 'Laundry'}
          </Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.category} numberOfLines={1}>
          {item.category}
          {item.formality ? `  ·  ${item.formality}` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'visible',
    ...shadow.card,
  },
  imageBox: {
    height: 130,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  emoji: { fontSize: 52 },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  cleanBadge: { backgroundColor: 'rgba(255,255,255,0.92)' },
  dirtyBadge: { backgroundColor: 'rgba(255,255,255,0.92)' },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 5 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  info: { padding: 12 },
  name: { fontSize: 15, fontWeight: '700', color: colors.ink },
  category: { fontSize: 12, color: colors.muted, marginTop: 3 },
});
