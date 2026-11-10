import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getSavedOutfits, deleteSavedOutfit, getItemById } from '../utils/storage';
import { radius, getCategoryMeta } from '../theme';
import { useStyles } from '../context/ThemeContext';

export default function SavedOutfitsScreen({ navigation }) {
  const { colors, styles, isDark } = useStyles(makeStyles);
  const [outfits, setOutfits] = useState(null); // null = still loading

  const load = useCallback(async () => setOutfits(await getSavedOutfits()), []);
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // The detail screen wants the full item, so fetch it from the closet first
  const openItem = async (id) => {
    const full = await getItemById(id);
    if (full) navigation.navigate('ItemDetail', { item: full });
  };

  const confirmDelete = (outfit) =>
    Alert.alert('Remove this outfit?', 'Your clothes stay in the closet.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await deleteSavedOutfit(outfit.id);
          load();
        },
      },
    ]);

  const renderOutfit = ({ item: outfit }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{outfit.occasion} outfit</Text>
          <Text style={styles.cardSub}>
            {new Date(outfit.createdAt).toLocaleDateString()}
            {outfit.weather ? ` · ${outfit.weather}` : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={() => confirmDelete(outfit)} hitSlop={10}>
          <Ionicons name="trash-outline" size={20} color={colors.faint} />
        </TouchableOpacity>
      </View>

      <View style={styles.pieces}>
        {outfit.pieces.map(({ item }) => {
          const meta = getCategoryMeta(item.category, isDark);
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              style={styles.piece}
              onPress={() => openItem(item.id)}
            >
              <View style={[styles.pieceBox, { backgroundColor: meta.tint }]}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.pieceImage} />
                ) : (
                  <Text style={{ fontSize: 26 }}>{meta.emoji}</Text>
                )}
              </View>
              <Text style={styles.pieceName} numberOfLines={1}>
                {item.name}
              </Text>
              {item.status === 'In Laundry' && <Text style={styles.laundry}>In laundry</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      {!!outfit.tip && <Text style={styles.tip}>💡 {outfit.tip}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={outfits || []}
        keyExtractor={(o) => o.id}
        renderItem={renderOutfit}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        ListEmptyComponent={
          outfits ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 44 }}>🤍</Text>
              <Text style={styles.emptyTitle}>No saved outfits yet</Text>
              <Text style={styles.emptyText}>
                Generate an outfit and tap "Save outfit" to keep it here.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const makeStyles = ({ colors, shadow }) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, marginBottom: 16, ...shadow.card },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 17, fontWeight: '800', color: colors.ink },
  cardSub: { fontSize: 13, color: colors.muted, marginTop: 3 },
  pieces: { flexDirection: 'row', marginTop: 14 },
  piece: { flex: 1, alignItems: 'center', marginRight: 8 },
  pieceBox: { width: '100%', aspectRatio: 1, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  pieceImage: { width: '100%', height: '100%' },
  pieceName: { fontSize: 12, fontWeight: '700', color: colors.ink, marginTop: 6 },
  laundry: { fontSize: 11, color: colors.muted },
  tip: { fontSize: 13, lineHeight: 19, color: colors.muted, marginTop: 14 },
  empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.ink, marginTop: 12 },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 21, marginTop: 6 },
});
