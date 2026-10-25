import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../components/PrimaryButton';
import { mockItem } from '../data/mockData';
import { updateItemStatus, deleteItemById, getItemById } from '../utils/storage';
import { colors, radius, shadow, getCategoryMeta } from '../theme';

export default function ItemDetailScreen({ route, navigation }) {
  const initial = route.params?.item || mockItem;
  const [item, setItem] = useState(initial);
  const [inLaundry, setInLaundry] = useState(initial.status === 'In Laundry');
  const meta = getCategoryMeta(item.category);
  const isSample = item.id === 'sample'; // the placeholder item isn't in the database

  // Reload from the database whenever we come back (e.g. after saving in the Edit form)
  useFocusEffect(
    useCallback(() => {
      if (initial.id === 'sample') return;
      (async () => {
        const fresh = await getItemById(initial.id);
        if (fresh) {
          setItem(fresh);
          setInLaundry(fresh.status === 'In Laundry');
        }
      })();
    }, [initial.id])
  );

  const handleEdit = () =>
    navigation.navigate('AddItem', {
      item: { ...item, status: inLaundry ? 'In Laundry' : 'Clean' },
    });

  const toggleLaundry = async () => {
    const next = !inLaundry;
    setInLaundry(next);
    if (isSample) return;
    try {
      await updateItemStatus(item.id, next ? 'In Laundry' : 'Clean');
    } catch (e) {
      console.error(e);
      setInLaundry(!next); // undo on failure
      Alert.alert('Error', 'Could not update the item.');
    }
  };

  const handleDelete = () =>
    Alert.alert('Delete item?', `"${item.name}" will be removed from your closet.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            if (!isSample) await deleteItemById(item.id);
            navigation.goBack();
          } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Could not delete the item.');
          }
        },
      },
    ]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={[styles.image, { backgroundColor: meta.tint }]}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} />
          ) : (
            <Text style={styles.emoji}>{meta.emoji}</Text>
          )}
        </View>

        <Text style={styles.name}>{item.name}</Text>

        <View style={styles.tags}>
          <Tag label={item.category} bg={colors.primarySoft} color={colors.primary} />
          {item.formality ? <Tag label={item.formality} bg="#FFF1E3" color="#C2570C" /> : null}
          {(item.seasons || []).map((s) => (
            <Tag key={s} label={s} bg="#E7F4FF" color="#1C6FB5" />
          ))}
        </View>

        {/* Laundry toggle card */}
        <View style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{inLaundry ? 'In the laundry' : 'Clean & ready'}</Text>
            <Text style={styles.cardSub}>
              {inLaundry
                ? "Won't be suggested in outfits until it's clean."
                : 'Available for outfit suggestions.'}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={toggleLaundry}
            style={[styles.toggle, { backgroundColor: inLaundry ? colors.danger : colors.success }]}
          >
            <Ionicons name={inLaundry ? 'water' : 'checkmark'} size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Details */}
        <View style={styles.card2}>
          <Row label="Category" value={item.category} />
          <Row label="Formality" value={item.formality || '—'} />
          <Row
            label="Seasons"
            value={item.seasons && item.seasons.length ? item.seasons.join(', ') : '—'}
          />
          <Row label="Added" value={item.addedOn || 'Recently'} last />
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            title="Edit"
            icon="create-outline"
            variant="secondary"
            onPress={handleEdit}
            disabled={isSample}
            style={{ flex: 1, marginRight: 10 }}
          />
          <PrimaryButton
            title="Delete"
            icon="trash-outline"
            variant="danger"
            onPress={handleDelete}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Tag({ label, bg, color }) {
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <Text style={[styles.tagText, { color }]}>{label}</Text>
    </View>
  );
}

function Row({ label, value, last }) {
  return (
    <View style={[styles.row, !last && styles.rowDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  image: {
    height: 280,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  emoji: { fontSize: 110 },
  name: { fontSize: 26, fontWeight: '900', color: colors.ink, marginTop: 20, letterSpacing: -0.5 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  tag: { borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8 },
  tagText: { fontSize: 13, fontWeight: '700' },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    marginTop: 16,
    ...shadow.card,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
  cardSub: { fontSize: 13, color: colors.muted, marginTop: 3, lineHeight: 18, paddingRight: 10 },
  toggle: { width: 50, height: 50, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  card2: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingHorizontal: 18,
    marginTop: 16,
    ...shadow.card,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.line },
  rowLabel: { fontSize: 15, color: colors.muted },
  rowValue: { fontSize: 15, fontWeight: '700', color: colors.ink },

  actions: { flexDirection: 'row', marginTop: 24 },
});
