import React, { useState, useLayoutEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Field from '../components/Field';
import Chip from '../components/Chip';
import PrimaryButton from '../components/PrimaryButton';
import { addClothingItem, updateItem } from '../utils/storage';
import { saveImageFile, deleteImageFile } from '../utils/imageStore';
import { categories, formalities, seasons, radius } from '../theme';
import { useStyles } from '../context/ThemeContext';

export default function AddItemScreen({ navigation, route }) {
  const { colors, styles } = useStyles(makeStyles);
  // When opened from "Edit" an existing item is passed in; otherwise this is the Add form.
  const editing = route?.params?.item || null;
  const isEdit = !!editing;

  const [name, setName] = useState(editing?.name || '');
  const [category, setCategory] = useState(editing?.category || 'Tops');
  const [formality, setFormality] = useState(editing?.formality || 'Casual');
  const [selectedSeasons, setSelectedSeasons] = useState(editing?.seasons || []);
  const [inLaundry, setInLaundry] = useState(editing?.status === 'In Laundry');
  const [saving, setSaving] = useState(false);

  // Photo: what is shown now, and whether the user changed it
  const [photoUri, setPhotoUri] = useState(editing?.image || null);
  const [photoChanged, setPhotoChanged] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEdit ? 'Edit Clothing' : 'Add Clothing' });
  }, [navigation, isEdit]);

  const toggleSeason = (s) =>
    setSelectedSeasons((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const useResult = (result) => {
    if (!result.canceled && result.assets?.length) {
      setPhotoUri(result.assets[0].uri);
      setPhotoChanged(true);
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Camera permission needed',
          'Allow camera access in your phone settings to take photos of your clothes.'
        );
        return;
      }
      useResult(
        await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        })
      );
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not open the camera.');
    }
  };

  const pickFromGallery = async () => {
    try {
      useResult(
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        })
      );
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not open your gallery.');
    }
  };

  const removePhoto = () => {
    setPhotoUri(null);
    setPhotoChanged(true);
  };

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

    setSaving(true);
    let newPath = null; // permanent copy of a newly chosen photo
    try {
      if (photoChanged && photoUri) newPath = await saveImageFile(photoUri);

      if (isEdit) {
        const patch = { ...data };
        if (photoChanged) patch.image = newPath; // new photo, or null when removed
        await updateItem(editing.id, patch);
        // the old photo is no longer used
        if (photoChanged && editing.imagePath) await deleteImageFile(editing.imagePath);
      } else {
        await addClothingItem({ ...data, image: newPath });
      }
      navigation.goBack();
    } catch (e) {
      console.error(e);
      if (newPath) await deleteImageFile(newPath); // don't leave an unused copy behind
      Alert.alert('Error', 'Could not save the item. Please try again.');
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Photo area */}
        <View style={[styles.photo, photoUri && styles.photoFilled]}>
          {photoUri ? (
            <View style={styles.previewWrap}>
              <Image source={{ uri: photoUri }} style={styles.preview} />
              <TouchableOpacity style={styles.removeBtn} onPress={removePhoto} hitSlop={8}>
                <Ionicons name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.photoIcon}>
                <Ionicons name="camera-outline" size={34} color={colors.primary} />
              </View>
              <Text style={styles.photoTitle}>Add a photo</Text>
              <Text style={styles.photoSub}>Snap your clothing item or pick one from your gallery</Text>
            </>
          )}

          <View style={styles.photoButtons}>
            <PrimaryButton
              title={photoUri ? 'Retake' : 'Camera'}
              icon="camera"
              onPress={takePhoto}
              style={{ flex: 1, marginRight: 10, paddingVertical: 13 }}
            />
            <PrimaryButton
              title={photoUri ? 'Replace' : 'Gallery'}
              icon="images"
              variant="secondary"
              onPress={pickFromGallery}
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
          loading={saving}
          style={{ marginTop: 28 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = ({ colors, shadow }) => StyleSheet.create({
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
  photoFilled: { borderStyle: 'solid', borderColor: colors.card, padding: 14, ...shadow.card },
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

  previewWrap: { width: '100%', aspectRatio: 1, marginBottom: 14 },
  preview: { width: '100%', height: '100%', borderRadius: radius.lg, backgroundColor: colors.bg },
  removeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: 'rgba(20,23,43,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },

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
