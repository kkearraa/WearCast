import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import SectionHeader from '../components/SectionHeader';
import OfflineBanner from '../components/OfflineBanner';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../context/WeatherContext';
import { getStats } from '../utils/storage';
import { tempValue, windText, iconColor, hourLabel } from '../utils/units';
import { getWeatherProblem, cacheBannerText } from '../utils/weatherMessages';
import { colors, radius, shadow } from '../theme';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { weather, source, error, loading, units, refresh } = useWeather();
  const [stats, setStats] = useState({ total: 0, clean: 0, laundry: 0 });

  // Every time Home is shown: reload closet counts and (if the data is old) the weather
  useFocusEffect(
    useCallback(() => {
      (async () => setStats(await getStats()))();
      refresh(false);
    }, [refresh])
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const isGuest = !user || user.isGuest;
  const c = weather?.current;

  const place = weather
    ? [weather.city, weather.country].filter(Boolean).join(', ') || 'Your location'
    : '';

  const hourly = weather
    ? [
        { time: 'Now', icon: c.icon, temp: c.temp },
        ...weather.hourly.slice(0, 5).map((h) => ({ time: hourLabel(h.time), icon: h.icon, temp: h.temp })),
      ]
    : [];

  const problem = getWeatherProblem(error);
  const handleProblemAction = () => {
    if (problem.action === 'settings') navigation.navigate('Settings');
    else if (problem.action === 'phone') Linking.openSettings();
    else refresh(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading && !!weather}
            onRefresh={() => refresh(true)}
            tintColor={colors.primary}
          />
        }
      >
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

        {/* Showing saved weather instead of fresh weather */}
        {weather && source === 'cache' && (
          <OfflineBanner message={cacheBannerText(error, weather.fetchedAt)} />
        )}

        {/* Weather: live data / loading / problem */}
        {weather ? (
          <View style={styles.hero}>
            <View style={[styles.circle, { width: 220, height: 220, top: -70, right: -60 }]} />
            <View style={[styles.circle, { width: 120, height: 120, bottom: -40, left: -30 }]} />

            <View style={styles.heroTop}>
              <View style={styles.locRow}>
                <Ionicons name="location" size={15} color="rgba(255,255,255,0.8)" />
                <Text style={styles.loc} numberOfLines={1}>
                  {place}
                </Text>
              </View>
              <Text style={styles.hiLo}>
                H {tempValue(c.high, units)}°  L {tempValue(c.low, units)}°
              </Text>
            </View>

            <View style={styles.heroMid}>
              <View style={{ flex: 1 }}>
                <Text style={styles.temp}>{tempValue(c.temp, units)}°</Text>
                <Text style={styles.cond}>{c.description}</Text>
                <Text style={styles.feels}>Feels like {tempValue(c.feelsLike, units)}°</Text>
              </View>
              <Ionicons name={c.icon} size={92} color={iconColor(c.icon)} />
            </View>

            <View style={styles.metrics}>
              <Metric icon="water-outline" label="Rain" value={`${c.precipChance}%`} />
              <Metric icon="speedometer-outline" label="Wind" value={windText(c.windKmh, units)} />
              <Metric icon="thermometer-outline" label="Humidity" value={`${c.humidity}%`} />
            </View>
          </View>
        ) : loading || !error ? (
          <View style={[styles.hero, styles.heroLoading]}>
            <ActivityIndicator color="#fff" size="large" />
            <Text style={styles.loadingText}>Finding your location and weather...</Text>
          </View>
        ) : (
          <View style={styles.problemCard}>
            <View style={styles.problemIcon}>
              <Ionicons name={problem.icon} size={30} color={colors.primary} />
            </View>
            <Text style={styles.problemTitle}>{problem.title}</Text>
            <Text style={styles.problemText}>{problem.text}</Text>
            <PrimaryButton
              title={problem.button}
              onPress={handleProblemAction}
              style={{ marginTop: 16, alignSelf: 'stretch' }}
            />
          </View>
        )}

        {/* Hourly */}
        {weather && (
          <>
            <SectionHeader title="Next hours" style={{ marginTop: 28 }} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }}>
              <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
                {hourly.map((h, i) => (
                  <View key={`${h.time}-${i}`} style={[styles.hour, i === 0 && styles.hourActive]}>
                    <Text style={[styles.hourTime, i === 0 && { color: '#fff' }]}>{h.time}</Text>
                    <Ionicons
                      name={h.icon}
                      size={24}
                      color={i === 0 ? colors.sun : iconColor(h.icon, true)}
                      style={{ marginVertical: 8 }}
                    />
                    <Text style={[styles.hourTemp, i === 0 && { color: '#fff' }]}>
                      {tempValue(h.temp, units)}°
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </>
        )}

        {/* Outfit call-to-action (the AI suggestion arrives in the next step) */}
        <SectionHeader title="Today's outfit" style={{ marginTop: 24 }} />
        <View style={styles.outfitCard}>
          <View style={styles.outfitRow}>
            <View style={styles.outfitIcon}>
              <Ionicons name="sparkles" size={26} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.outfitTitle}>What should I wear?</Text>
              <Text style={styles.outfitText}>
                {weather
                  ? `Get an outfit for ${tempValue(c.temp, units)}° and ${c.description.toLowerCase()}, picked from your clean clothes.`
                  : 'Get an outfit picked from your clean clothes, based on the weather.'}
              </Text>
            </View>
          </View>
          <PrimaryButton
            title="Open outfit assistant"
            icon="arrow-forward"
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
  heroLoading: { height: 260, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: 'rgba(255,255,255,0.8)', marginTop: 16, fontSize: 14, fontWeight: '600' },
  circle: { position: 'absolute', borderRadius: 999, backgroundColor: colors.navySoft },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  loc: { color: 'rgba(255,255,255,0.8)', marginLeft: 4, fontWeight: '600', fontSize: 14, flexShrink: 1 },
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

  problemCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: 24,
    alignItems: 'center',
    ...shadow.card,
  },
  problemIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  problemTitle: { fontSize: 18, fontWeight: '800', color: colors.ink, textAlign: 'center' },
  problemText: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 21, marginTop: 6 },

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
  outfitRow: { flexDirection: 'row', alignItems: 'center' },
  outfitIcon: {
    width: 56,
    height: 56,
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outfitTitle: { fontSize: 17, fontWeight: '800', color: colors.ink },
  outfitText: { fontSize: 13, lineHeight: 19, color: colors.muted, marginTop: 3 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { width: '31%', borderRadius: radius.lg, paddingVertical: 18, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '900' },
  statLabel: { fontSize: 13, fontWeight: '700', marginTop: 2 },
});
