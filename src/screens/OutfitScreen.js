import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Chip from '../components/Chip';
import PrimaryButton from '../components/PrimaryButton';
import OfflineBanner from '../components/OfflineBanner';
import { mockWeather, mockOutfit } from '../data/mockData';
import { formalities, colors, radius, shadow, getCategoryMeta } from '../theme';

const isOffline = false; 

export default function OutfitScreen() {
  const [occasion, setOccasion] = useState('Casual');
  const w = mockWeather;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Outfit Assistant</Text>
        <Text style={styles.subtitle}>AI picks from your clean clothes, based on today's weather.</Text>

        {isOffline && (
          <OfflineBanner message="AI suggestions need an internet connection. You can still browse your closet." />
        )}

        {/* Weather summary */}
        <View style={styles.weather}>
          <View style={styles.weatherIcon}>
            <Ionicons name={w.icon} size={28} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.weatherTitle}>
              {w.temp}° · {w.condition}
            </Text>
            <Text style={styles.weatherSub}>
              Rain {w.precipitation} · Wind {w.wind}
            </Text>
          </View>
          <Ionicons name="refresh" size={20} color={colors.faint} />
        </View>

        {/* Occasion */}
        <Text style={styles.label}>What's the occasion?</Text>
        <View style={styles.chips}>
          {formalities.map((f) => (
            <Chip key={f} label={f} active={occasion === f} onPress={() => setOccasion(f)} />
          ))}
        </View>

        <PrimaryButton title="Generate outfit" icon="sparkles" style={{ marginTop: 6 }} />

        {/* Result */}
        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>Your outfit for today</Text>
          <View style={styles.aiTag}>
            <Ionicons name="sparkles" size={12} color={colors.primary} />
            <Text style={styles.aiTagText}>AI</Text>
          </View>
        </View>

        <View style={styles.card}>
          {mockOutfit.pieces.map((p, i) => {
            const meta = getCategoryMeta(p.category);
            return (
              <View key={p.id} style={[styles.pieceRow, i > 0 && styles.pieceDivider]}>
                <View style={[styles.pieceBox, { backgroundColor: meta.tint }]}>
                  <Text style={{ fontSize: 28 }}>{meta.emoji}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.pieceName}>{p.name}</Text>
                  <Text style={styles.pieceNote}>
                    {p.category} · {p.note}
                  </Text>
                </View>
                <Ionicons name="swap-horizontal" size={20} color={colors.faint} />
              </View>
            );
          })}
        </View>

        <View style={styles.note}>
          <Text style={styles.noteTitle}>💡 Stylist note</Text>
          <Text style={styles.noteText}>{mockOutfit.tip}</Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton title="Regenerate" icon="refresh" variant="secondary" style={{ flex: 1, marginRight: 10 }} />
          <PrimaryButton title="Save outfit" icon="heart-outline" style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 30, fontWeight: '900', color: colors.ink, letterSpacing: -0.5, marginTop: 4 },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 4, marginBottom: 20, lineHeight: 20 },

  weather: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 24,
    ...shadow.card,
  },
  weatherIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherTitle: { fontSize: 17, fontWeight: '800', color: colors.ink },
  weatherSub: { fontSize: 13, color: colors.muted, marginTop: 3 },

  label: { fontSize: 15, fontWeight: '800', color: colors.ink, marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },

  resultHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 30, marginBottom: 12 },
  resultTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginLeft: 10,
  },
  aiTagText: { color: colors.primary, fontWeight: '800', fontSize: 11, marginLeft: 4 },

  card: { backgroundColor: colors.card, borderRadius: radius.lg, paddingHorizontal: 16, ...shadow.card },
  pieceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  pieceDivider: { borderTopWidth: 1, borderTopColor: colors.line },
  pieceBox: { width: 58, height: 58, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  pieceName: { fontSize: 16, fontWeight: '700', color: colors.ink },
  pieceNote: { fontSize: 13, color: colors.muted, marginTop: 3 },

  note: { backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: 18, marginTop: 16 },
  noteTitle: { fontSize: 14, fontWeight: '800', color: colors.primaryDark, marginBottom: 6 },
  noteText: { fontSize: 14, lineHeight: 21, color: colors.ink },

  actions: { flexDirection: 'row', marginTop: 20 },
});
