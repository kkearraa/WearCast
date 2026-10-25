import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ClothingCard from '../components/ClothingCard';
import Chip from '../components/Chip';
import { getClothes } from '../utils/storage';
import { categories, colors, radius, shadow } from '../theme';

const FILTERS = ['All', ...categories.map((c) => c.key), 'Laundry'];

export default function ClosetScreen({ navigation }) {
  const [clothes, setClothes] = useState([]);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');

  
  useFocusEffect(
    useCallback(() => {
      (async () => setClothes(await getClothes()))();
    }, [])
  );

  const visible = clothes.filter((c) => {
    const matchesFilter =
      filter === 'All' ? true : filter === 'Laundry' ? c.status === 'In Laundry' : c.category === filter;
    const matchesQuery = c.name.toLowerCase().includes(query.trim().toLowerCase());
    return matchesFilter && matchesQuery;
  });

  
  const data = visible.length % 2 === 1 ? [...visible, { id: '__spacer', spacer: true }] : visible;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Closet</Text>
          <Text style={styles.subtitle}>
            {clothes.length} {clothes.length === 1 ? 'item' : 'items'} saved on this device
          </Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={colors.faint} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your clothes"
          placeholderTextColor={colors.faint}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <View style={{ height: 52 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {FILTERS.map((f) => (
            <Chip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={data}
        numColumns={2}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) =>
          item.spacer ? (
            <View style={{ flex: 1, margin: 6 }} />
          ) : (
            <ClothingCard item={item} onPress={() => navigation.navigate('ItemDetail', { item })} />
          )
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🧺</Text>
            <Text style={styles.emptyTitle}>
              {clothes.length === 0 ? 'Your closet is empty' : 'Nothing found'}
            </Text>
            <Text style={styles.emptyText}>
              {clothes.length === 0
                ? 'Add your first piece with a photo and WearCast will start building outfits.'
                : 'Try another filter or search term.'}
            </Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={() => navigation.navigate('AddItem')}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14 },
  title: { fontSize: 30, fontWeight: '900', color: colors.ink, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 4 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 14,
    ...shadow.card,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: colors.ink },
  filters: { paddingHorizontal: 20, alignItems: 'center' },
  list: { paddingHorizontal: 14, paddingBottom: 110, paddingTop: 4, flexGrow: 1 },
  empty: { alignItems: 'center', paddingHorizontal: 40, paddingTop: 60 },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: colors.ink, marginTop: 12 },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 6, lineHeight: 21 },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 22,
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.button,
  },
});
