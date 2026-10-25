import React, { useState, useLayoutEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Field from '../components/Field';
import Chip from '../components/Chip';
import PrimaryButton from '../components/PrimaryButton';
import { addClothingItem, updateItem } from '../utils/storage';
import { categories, formalities, seasons, colors, radius, shadow } from '../theme';

export default function AddItemScreen({ navigation, route }) {
  // When opened from "Edit" an existing item is passed in; otherwise this is the Add form.
  const editing = route?.params?.item || null;
  const isEdit = !!editing;

  const [name, setName] = useState(editing?.name || '');
  const [category, setCategory] = useState(editing?.category || 'Tops');
  const [formality, setFormality] = useState(editing?.formality || 'Casual');
  const [selectedSeasons, setSelectedSeasons] = useState(editing?.seasons || []);
  const [inLaundry, setInLaundry] = useState(editing?.status === 'In Laundry');

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEdit ? 'Edit Clothing' : 'Add Clothing' });
  }, [navigation, isEdit]);

  const toggleSeason = (s) =>
    setSelectedSeasons((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  // Adds a new item, or updates the existing one when editing
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an item name.');
      return;
    }

    const data = {
      name: name.trim(),
      category: category || 'General',
      formality,
      seasons: selectedSeasons,
      status: inLaundry ? 'In Laundry' : 'Clean',
    };

    try {
      if (isEdit) {
        await updateItem(editing.id, data);
      } else {
        await addClothingItem({ ...data, image: null }); // photo capture comes later
      }
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not save the item. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Photo area */}
        <View style={styles.photo}>
          <View style={styles.photoIcon}>
            <Ionicons name="camera-outline" size={34} color={colors.primary} />
          </View>
          <Text style={styles.photoTitle}>{isEdit ? 'Change photo' : 'Add a photo'}</Text>
          <Text style={styles.photoSub}>Snap your clothing item or pick one from your gallery</Text>

          <View style={styles.photoButtons}>
            <PrimaryButton
              title="Camera"
              icon="camera"
              style={{ flex: 1, marginRight: 10, paddingVertical: 13 }}
            />
            <PrimaryButton
              title="Gallery"
              icon="images"
              variant="secondary"
              style={{ flex: 1, paddingVertical: 13 }}
            />
          </View>
        </View>

        <Field
          label="Item name"
          icon="pricetag-outline"
          placeholder="e.g. Blue Denim Jacket"
          autoCapitalize="sentences"
          value={name}
          onChangeText={setName}
          style={{ marginTop: 24 }}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryGrid}>
          {categories.map((c) => {
            const active = category === c.key;
            return (
              <TouchableOpacity
                key={c.key}
                activeOpacity={0.85}
                onPress={() => setCategory(c.key)}
                style={[styles.categoryTile, active && styles.categoryTileActive]}
              >
                <Text style={{ fontSize: 28 }}>{c.emoji}</Text>
                <Text style={[styles.categoryText, active && { color: colors.primary }]}>{c.key}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Formality</Text>
        <View style={styles.chips}>
          {formalities.map((f) => (
            <Chip key={f} label={f} active={formality === f} onPress={() => setFormality(f)} />
          ))}
        </View>

        <Text style={styles.label}>Season</Text>
        <View style={styles.chips}>
          {seasons.map((s) => (
            <Chip key={s} label={s} active={selectedSeasons.includes(s)} onPress={() => toggleSeason(s)} />
          ))}
        </View>

        <Text style={styles.label}>Laundry status</Text>
        <View style={styles.segment}>
          <TouchableOpacity
            style={[styles.segmentItem, !inLaundry && styles.segmentCleanActive]}
            onPress={() => setInLaundry(false)}
          >
            <Ionicons name="checkmark-circle" size={18} color={!inLaundry ? colors.success : colors.faint} />
            <Text style={[styles.segmentText, !inLaundry && { color: colors.success }]}>Clean</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentItem, inLaundry && styles.segmentDirtyActive]}
            onPress={() => setInLaundry(true)}
          >
            <Ionicons name="water" size={18} color={inLaundry ? colors.danger : colors.faint} />
            <Text style={[styles.segmentText, inLaundry && { color: colors.danger }]}>In Laundry</Text>
          </TouchableOpacity>
        </View>

        <PrimaryButton
          title={isEdit ? 'Save changes' : 'Save to Wardrobe'}
          icon="checkmark"
          onPress={handleSave}
          style={{ marginTop: 28 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },

  photo: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: 22,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primarySoft,
    borderStyle: 'dashed',
  },
  photoIcon: {
    width: 70,
    height: 70,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  photoTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },
  photoSub: { fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 4, marginBottom: 18 },
  photoButtons: { flexDirection: 'row', width: '100%' },

  label: { fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: 10, marginLeft: 2, marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },

  categoryGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  categoryTile: {
    width: '23%',
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  categoryTileActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  categoryText: { fontSize: 11, fontWeight: '700', color: colors.muted, marginTop: 6 },

  segment: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 5,
    ...shadow.card,
  },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
  },
  segmentCleanActive: { backgroundColor: colors.successSoft },
  segmentDirtyActive: { backgroundColor: colors.dangerSoft },
  segmentText: { marginLeft: 8, fontWeight: '700', color: colors.faint, fontSize: 15 },
});
