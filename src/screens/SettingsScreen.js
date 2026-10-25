import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Field from '../components/Field';
import Chip from '../components/Chip';
import { clearClothes } from '../utils/storage';
import { colors, radius, shadow } from '../theme';

export default function SettingsScreen() {
  const [units, setUnits] = useState('C');
  const [provider, setProvider] = useState('Gemini');
  const [cacheWeather, setCacheWeather] = useState(true);
  const [autoLocation, setAutoLocation] = useState(true);
  const [weatherKey, setWeatherKey] = useState('');
  const [aiKey, setAiKey] = useState('');

  
  const handleClearAll = () => {
    Alert.alert('Clear wardrobe?', 'This removes every item saved on this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => { await clearClothes(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.group}>Weather</Text>
        <View style={styles.card}>
          <Text style={styles.rowTitle}>Temperature units</Text>
          <View style={styles.segment}>
            {['C', 'F'].map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.segmentItem, units === u && styles.segmentActive]}
                onPress={() => setUnits(u)}
              >
                <Text style={[styles.segmentText, units === u && { color: '#fff' }]}>°{u}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Divider />
          <ToggleRow
            icon="location-outline"
            title="Use my GPS location"
            sub="Needed to fetch local weather"
            value={autoLocation}
            onChange={setAutoLocation}
          />
          <Divider />
          <Field
            label="OpenWeatherMap API key"
            icon="key-outline"
            placeholder="Paste your key"
            secure
            value={weatherKey}
            onChangeText={setWeatherKey}
            style={{ marginBottom: 0 }}
          />
        </View>

        <Text style={styles.group}>AI stylist</Text>
        <View style={styles.card}>
          <Text style={styles.rowTitle}>Provider</Text>
          <View style={styles.chips}>
            {['Gemini', 'OpenAI'].map((p) => (
              <Chip key={p} label={p} active={provider === p} onPress={() => setProvider(p)} />
            ))}
          </View>
          <Field
            label={`${provider} API key`}
            icon="key-outline"
            placeholder="Paste your key"
            secure
            value={aiKey}
            onChangeText={setAiKey}
            style={{ marginBottom: 0 }}
          />
        </View>

        <Text style={styles.group}>Offline & data</Text>
        <View style={styles.card}>
          <ToggleRow
            icon="cloud-download-outline"
            title="Cache last weather"
            sub="Show the latest forecast when offline"
            value={cacheWeather}
            onChange={setCacheWeather}
          />
          <Divider />
          <TouchableOpacity style={styles.dangerRow} onPress={handleClearAll} activeOpacity={0.7}>
            <View style={styles.dangerIcon}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.danger, marginBottom: 2 }]}>Clear wardrobe</Text>
              <Text style={styles.sub}>Delete all items stored on this device</Text>
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
  chips: { flexDirection: 'row' },

  segment: { flexDirection: 'row', backgroundColor: colors.bg, borderRadius: 14, padding: 4 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 11 },
  segmentActive: { backgroundColor: colors.primary },
  segmentText: { fontWeight: '800', color: colors.muted, fontSize: 15 },

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
