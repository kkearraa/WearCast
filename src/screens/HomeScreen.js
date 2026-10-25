import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import SectionHeader from '../components/SectionHeader';
import OfflineBanner from '../components/OfflineBanner';
import PrimaryButton from '../components/PrimaryButton';
import { getStats } from '../utils/storage';
import { mockWeather, mockOutfit } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { colors, radius, shadow, getCategoryMeta } from '../theme';

const isOffline = false; // flip to true to preview the offline state

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, clean: 0, laundry: 0 });

  // Closet snapshot is calculated by the database (SQL COUNT)
  useFocusEffect(
    useCallback(() => {
      (async () => setStats(await getStats()))();
    }, [])
  );

  const w = mockWeather;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const isGuest = !user || user.isGuest;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.name}>{isGuest ? 'there' : user.firstName} 👋</Text>
          </View>
          <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.avatarText}>{isGuest ? '👤' : user.initials}</Text>
          </TouchableOpacity>
        </View>

        {isOffline && <OfflineBanner />}

        {/* Weather hero */}
        <View style={styles.hero}>
          <View style={[styles.circle, { width: 220, height: 220, top: -70, right: -60 }]} />
          <View style={[styles.circle, { width: 120, height: 120, bottom: -40, left: -30 }]} />

          <View style={styles.heroTop}>
            <View style={styles.locRow}>
              <Ionicons name="location" size={15} color="rgba(255,255,255,0.8)" />
              <Text style={styles.loc}>{w.location}</Text>
            </View>
            <Text style={styles.hiLo}>
              H {w.high}°  L {w.low}°
            </Text>
          </View>

          <View style={styles.heroMid}>
            <View>
              <Text style={styles.temp}>{w.temp}°</Text>
              <Text style={styles.cond}>{w.condition}</Text>
              <Text style={styles.feels}>Feels like {w.feelsLike}°</Text>
            </View>
            <Ionicons name={w.icon} size={92} color={colors.sun} />
          </View>

          <View style={styles.metrics}>
            <Metric icon="water-outline" label="Rain" value={w.precipitation} />
            <Metric icon="speedometer-outline" label="Wind" value={w.wind} />
            <Metric icon="thermometer-outline" label="Humidity" value={w.humidity} />
          </View>
        </View>

        {/* Hourly */}
        <SectionHeader title="Next hours" style={{ marginTop: 28 }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }}>
          <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
            {w.hourly.map((h, i) => (
              <View key={h.time} style={[styles.hour, i === 0 && styles.hourActive]}>
                <Text style={[styles.hourTime, i === 0 && { color: '#fff' }]}>{h.time}</Text>
                <Ionicons
                  name={h.icon}
                  size={24}
                  color={i === 0 ? colors.sun : colors.primary}
                  style={{ marginVertical: 8 }}
                />
                <Text style={[styles.hourTemp, i === 0 && { color: '#fff' }]}>{h.temp}°</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Today's outfit */}
        <SectionHeader
          title="Today's outfit"
          action="See all"
          onAction={() => navigation.navigate('Outfit')}
          style={{ marginTop: 24 }}
        />
        <View style={styles.outfitCard}>
          <View style={styles.piecesRow}>
            {mockOutfit.pieces.map((p) => {
              const meta = getCategoryMeta(p.category);
              return (
                <View key={p.id} style={styles.piece}>
                  <View style={[styles.pieceBox, { backgroundColor: meta.tint }]}>
                    <Text style={{ fontSize: 30 }}>{meta.emoji}</Text>
                  </View>
                  <Text style={styles.pieceName} numberOfLines={2}>
                    {p.name}
                  </Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.tip}>{mockOutfit.tip}</Text>
          <PrimaryButton
            title="Get a new suggestion"
            icon="sparkles"
            onPress={() => navigation.navigate('Outfit')}
            style={{ marginTop: 16 }}
          />
        </View>

        {/* Closet snapshot */}
        <SectionHeader
          title="Your closet"
          action="Open"
          onAction={() => navigation.navigate('Closet')}
          style={{ marginTop: 28 }}
        />
        <View style={styles.statsRow}>
          <Stat value={stats.total} label="Items" tint={colors.primarySoft} color={colors.primary} />
          <Stat value={stats.clean} label="Clean" tint={colors.successSoft} color={colors.success} />
          <Stat value={stats.laundry} label="Laundry" tint={colors.dangerSoft} color={colors.danger} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ icon, label, value }) {
  return (
    <View style={styles.metric}>
      <Ionicons name={icon} size={18} color="rgba(255,255,255,0.85)" />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function Stat({ value, label, tint, color }) {
  return (
    <View style={[styles.stat, { backgroundColor: tint }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 15, color: colors.muted, fontWeight: '500' },
  name: { fontSize: 28, fontWeight: '900', color: colors.ink, letterSpacing: -0.5 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  hero: {
    backgroundColor: colors.navy,
    borderRadius: radius.xl,
    padding: 22,
    overflow: 'hidden',
    ...shadow.card,
  },
  circle: { position: 'absolute', borderRadius: 999, backgroundColor: colors.navySoft },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locRow: { flexDirection: 'row', alignItems: 'center' },
  loc: { color: 'rgba(255,255,255,0.8)', marginLeft: 4, fontWeight: '600', fontSize: 14 },
  hiLo: { color: 'rgba(255,255,255,0.8)', fontWeight: '700', fontSize: 13 },
  heroMid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  temp: { fontSize: 76, fontWeight: '200', color: '#fff', lineHeight: 84 },
  cond: { fontSize: 20, fontWeight: '700', color: '#fff' },
  feels: { fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  metrics: {
    flexDirection: 'row',
    marginTop: 22,
    backgroundColor: colors.navySoft,
    borderRadius: radius.md,
    paddingVertical: 14,
  },
  metric: { flex: 1, alignItems: 'center' },
  metricValue: { color: '#fff', fontWeight: '800', fontSize: 15, marginTop: 6 },
  metricLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },

  hour: {
    width: 68,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    marginRight: 10,
    ...shadow.card,
  },
  hourActive: { backgroundColor: colors.primary },
  hourTime: { fontSize: 12, fontWeight: '600', color: colors.muted },
  hourTemp: { fontSize: 15, fontWeight: '800', color: colors.ink },

  outfitCard: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 18, ...shadow.card },
  piecesRow: { flexDirection: 'row', justifyContent: 'space-between' },
  piece: { width: '23%', alignItems: 'center' },
  pieceBox: { width: '100%', aspectRatio: 1, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  pieceName: { fontSize: 11, fontWeight: '600', color: colors.ink, textAlign: 'center', marginTop: 6 },
  tip: { fontSize: 14, lineHeight: 21, color: colors.muted, marginTop: 16 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { width: '31%', borderRadius: radius.lg, paddingVertical: 18, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '900' },
  statLabel: { fontSize: 13, fontWeight: '700', marginTop: 2 },
});
