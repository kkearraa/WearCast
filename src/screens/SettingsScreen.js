import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Switch, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Field from '../components/Field';
import Chip from '../components/Chip';
import PrimaryButton from '../components/PrimaryButton';
import { useWeather } from '../context/WeatherContext';
import { getSettings, setSetting } from '../db/settings';
import { clearWeatherCache } from '../db/weatherCache';
import { getWeatherApiKey, setWeatherApiKey, getAiApiKey, setAiApiKey } from '../utils/secrets';
import { clearClothes } from '../utils/storage';
import { colors, radius, shadow } from '../theme';

export default function SettingsScreen() {
  const { units, changeUnits, refresh } = useWeather();

  const [useGps, setUseGps] = useState(true);
  const [cacheWeather, setCacheWeather] = useState(true);
  const [provider, setProvider] = useState('Gemini');

  // Keys are never shown again after saving: we only remember whether one exists.
  const [weatherKey, setWeatherKey] = useState('');
  const [aiKey, setAiKey] = useState('');
  const [hasWeatherKey, setHasWeatherKey] = useState(false);
  const [hasAiKey, setHasAiKey] = useState(false);
  const [savingKeys, setSavingKeys] = useState(false);

  // If something weather-related changed, reload the weather when leaving this screen
  const dirty = useRef(false);
  useEffect(() => {
    return () => {
      if (dirty.current) refresh(true);
    };
  }, [refresh]);

  // load saved settings once
  useEffect(() => {
    (async () => {
      const s = await getSettings();
      setUseGps(s.useGps);
      setCacheWeather(s.cacheWeather);
      setProvider(s.aiProvider);
      setHasWeatherKey(!!(await getWeatherApiKey()));
      setHasAiKey(!!(await getAiApiKey(s.aiProvider)));
    })();
  }, []);

  const onGps = async (value) => {
    setUseGps(value);
    dirty.current = true;
    await setSetting('useGps', value);
  };

  const onCache = async (value) => {
    setCacheWeather(value);
    await setSetting('cacheWeather', value);
    if (!value) await clearWeatherCache(); // also forget what was saved
  };

  const onProvider = async (name) => {
    setProvider(name);
    setAiKey('');
    await setSetting('aiProvider', name);
    setHasAiKey(!!(await getAiApiKey(name)));
  };

  const handleSaveKeys = async () => {
    if (!weatherKey.trim() && !aiKey.trim()) {
      Alert.alert('Nothing to save', 'Paste a key first.');
      return;
    }
    setSavingKeys(true);
    try {
      if (weatherKey.trim()) {
        await setWeatherApiKey(weatherKey);
        setHasWeatherKey(true);
        setWeatherKey('');
        dirty.current = true;
      }
      if (aiKey.trim()) {
        await setAiApiKey(provider, aiKey);
        setHasAiKey(true);
        setAiKey('');
      }
      Alert.alert('Saved', 'Your key was stored securely on this device.');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not save the key. Please try again.');
    } finally {
      setSavingKeys(false);
    }
  };

  // Moved here from the old Home screen: your existing "Clear Wardrobe" feature
  const handleClearAll = () => {
    Alert.alert('Clear wardrobe?', 'This removes every item saved in your closet on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearClothes();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.group}>Weather</Text>
        <View style={styles.card}>
          <Text style={styles.rowTitle}>Units</Text>
          <View style={styles.segment}>
            {[
              { key: 'metric', label: '°C · km/h' },
              { key: 'imperial', label: '°F · mph' },
            ].map((u) => (
              <TouchableOpacity
                key={u.key}
                style={[styles.segmentItem, units === u.key && styles.segmentActive]}
                onPress={() => changeUnits(u.key)}
              >
                <Text style={[styles.segmentText, units === u.key && { color: '#fff' }]}>{u.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Divider />
          <ToggleRow
            icon="location-outline"
            title="Use my GPS location"
            sub="Needed to fetch local weather"
            value={useGps}
            onChange={onGps}
          />
          <Divider />
          <Field
            label="OpenWeatherMap API key"
            icon="key-outline"
            placeholder={hasWeatherKey ? 'Saved ✓  (paste a new key to replace)' : 'Paste your key'}
            secure
            value={weatherKey}
            onChangeText={setWeatherKey}
            style={{ marginBottom: 6 }}
          />
          <Text style={styles.help}>
            Get a free key at openweathermap.org. A brand-new key can take up to 2 hours to activate.
          </Text>
        </View>

        <Text style={styles.group}>AI stylist</Text>
        <View style={styles.card}>
          <Text style={styles.rowTitle}>Provider</Text>
          <View style={styles.chips}>
            {['Gemini', 'OpenAI'].map((p) => (
              <Chip key={p} label={p} active={provider === p} onPress={() => onProvider(p)} />
            ))}
          </View>
          <Field
            label={`${provider} API key`}
            icon="key-outline"
            placeholder={hasAiKey ? 'Saved ✓  (paste a new key to replace)' : 'Paste your key'}
            secure
            value={aiKey}
            onChangeText={setAiKey}
            style={{ marginBottom: 0 }}
          />
        </View>

        <PrimaryButton
          title="Save API keys"
          icon="lock-closed-outline"
          onPress={handleSaveKeys}
          loading={savingKeys}
          style={{ marginBottom: 18 }}
        />

        <Text style={styles.group}>Offline & data</Text>
        <View style={styles.card}>
          <ToggleRow
            icon="cloud-download-outline"
            title="Cache last weather"
            sub="Show the latest forecast when offline"
            value={cacheWeather}
            onChange={onCache}
          />
          <Divider />
          <TouchableOpacity style={styles.dangerRow} onPress={handleClearAll} activeOpacity={0.7}>
            <View style={styles.dangerIcon}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.danger, marginBottom: 2 }]}>Clear wardrobe</Text>
              <Text style={styles.sub}>Delete all items in your closet</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 16 }} />;
}

function ToggleRow({ icon, title, sub, value, onChange }) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { marginBottom: 2 }]}>{title}</Text>
        <Text style={styles.sub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.primary, false: colors.line }}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  group: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 18, marginBottom: 18, ...shadow.card },
  rowTitle: { fontSize: 15, fontWeight: '700', color: colors.ink, marginBottom: 12 },
  sub: { fontSize: 12, color: colors.muted },
  help: { fontSize: 12, color: colors.muted, lineHeight: 18, marginLeft: 2 },
  chips: { flexDirection: 'row' },

  segment: { flexDirection: 'row', backgroundColor: colors.bg, borderRadius: 14, padding: 4 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 11 },
  segmentActive: { backgroundColor: colors.primary },
  segmentText: { fontWeight: '800', color: colors.muted, fontSize: 14 },

  toggleRow: { flexDirection: 'row', alignItems: 'center' },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  dangerRow: { flexDirection: 'row', alignItems: 'center' },
  dangerIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
});
