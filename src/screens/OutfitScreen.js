import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Chip from '../components/Chip';
import PrimaryButton from '../components/PrimaryButton';
import OfflineBanner from '../components/OfflineBanner';
import { useWeather } from '../context/WeatherContext';
import { getClothes, saveOutfitForUser, deleteSavedOutfit } from '../utils/storage';
import { suggestOutfit } from '../services/ai';
import { getAiProblem } from '../utils/aiMessages';
import { tempValue, windText, iconColor } from '../utils/units';
import { formalities, radius, getCategoryMeta } from '../theme';
import { useStyles } from '../context/ThemeContext';

export default function OutfitScreen({ navigation }) {
  const { colors, styles, isDark } = useStyles(makeStyles);
  const [occasion, setOccasion] = useState('Casual');
  const [result, setResult] = useState(null); // { pieces:[{item, reason}], tip, occasion }
  const [aiError, setAiError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [cleanItems, setCleanItems] = useState([]); // swap candidates
  const [savedId, setSavedId] = useState(null); // id of the saved copy, if saved
  const [saving, setSaving] = useState(false);
  const { weather, source, error, loading, units, refresh } = useWeather();
  const c = weather?.current;
  const isOffline = error === 'OFFLINE';

  // Make sure the weather is loaded (and fresh) whenever this tab is opened
  useFocusEffect(
    useCallback(() => {
      refresh(false);
    }, [refresh])
  );

  const handleGenerate = async () => {
    if (generating) return;
    setAiError(null);
    setGenerating(true);
    try {
      const outfit = await suggestOutfit({
        weather,
        occasion,
        previousItemIds: result ? result.pieces.map((p) => p.item.id) : [],
      });
      setResult(outfit);
      setSavedId(null);
      setCleanItems((await getClothes()).filter((i) => i.status === 'Clean'));
    } catch (e) {
      setAiError(e.code || 'SERVER');
    } finally {
      setGenerating(false);
    }
  };

  // Other clean pieces of the same category that are not already in the outfit
  const alternativesFor = (piece) =>
    cleanItems.filter((i) => i.category === piece.item.category && i.id !== piece.item.id);

  // Swap is local (no AI, no internet): cycles to the next clean piece of that category
  const handleSwap = (index) => {
    const piece = result.pieces[index];
    const sameCategory = cleanItems.filter((i) => i.category === piece.item.category);
    const at = sameCategory.findIndex((i) => i.id === piece.item.id);
    const next = sameCategory[(at + 1) % sameCategory.length];
    if (!next || next.id === piece.item.id) return;
    const pieces = result.pieces.map((p, i) => (i === index ? { item: next, reason: '' } : p));
    setResult({ ...result, pieces });
    setSavedId(null); // it is a different outfit now
  };

  const handleToggleSave = async () => {
    if (saving || !result) return;
    setSaving(true);
    try {
      if (savedId) {
        await deleteSavedOutfit(savedId);
        setSavedId(null);
      } else {
        const id = await saveOutfitForUser({
          occasion: result.occasion,
          tip: result.tip,
          weather: weather ? `${tempValue(c.temp, units)}° · ${c.description}` : '',
          pieces: result.pieces,
        });
        setSavedId(id);
      }
    } catch (e) {
      console.error('Saving outfit failed', e);
    } finally {
      setSaving(false);
    }
  };

  const problem = aiError ? getAiProblem(aiError) : null;
  const handleProblemAction = () => {
    if (problem.action === 'settings') navigation.navigate('Settings');
    else if (problem.action === 'closet') navigation.navigate('Closet');
    else if (problem.action === 'weather') refresh(true);
    else handleGenerate();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Outfit Assistant</Text>
        <Text style={styles.subtitle}>AI picks from your clean clothes, based on today's weather.</Text>

        {isOffline && (
          <OfflineBanner message="AI suggestions need an internet connection. You can still browse your closet." />
        )}

        {/* Weather summary (live) */}
        <TouchableOpacity activeOpacity={0.85} style={styles.weather} onPress={() => refresh(true)}>
          <View style={styles.weatherIcon}>
            <Ionicons
              name={weather ? c.icon : 'cloud-offline-outline'}
              size={28}
              color={weather ? iconColor(c.icon, true) : colors.faint}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.weatherTitle}>
              {weather
                ? `${tempValue(c.temp, units)}° · ${c.description}`
                : loading
                ? 'Loading weather...'
                : 'Weather unavailable'}
            </Text>
            <Text style={styles.weatherSub}>
              {weather
                ? `Rain ${c.precipChance}% · Wind ${windText(c.windKmh, units)}${source === 'cache' ? ' · saved' : ''}`
                : 'Tap to try again'}
            </Text>
          </View>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="refresh" size={20} color={colors.faint} />
          )}
        </TouchableOpacity>

        {/* Occasion */}
        <Text style={styles.label}>What's the occasion?</Text>
        <View style={styles.chips}>
          {formalities.map((f) => (
            <Chip key={f} label={f} active={occasion === f} onPress={() => setOccasion(f)} />
          ))}
        </View>

        <PrimaryButton
          title={result ? 'Generate a new outfit' : 'Generate outfit'}
          icon="sparkles"
          onPress={handleGenerate}
          loading={generating}
          style={{ marginTop: 6 }}
        />

        {/* Problem */}
        {problem && (
          <View style={styles.problemCard}>
            <View style={styles.problemIcon}>
              <Ionicons name={problem.icon} size={26} color={colors.primary} />
            </View>
            <Text style={styles.problemTitle}>{problem.title}</Text>
            <Text style={styles.problemText}>{problem.text}</Text>
            <PrimaryButton
              title={problem.button}
              variant="secondary"
              onPress={handleProblemAction}
              style={{ marginTop: 14, alignSelf: 'stretch' }}
            />
          </View>
        )}

        {/* Waiting for the AI */}
        {generating && !result && (
          <View style={styles.emptyCard}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.emptyTitle}>Styling your outfit...</Text>
            <Text style={styles.emptyText}>Checking the weather and your clean clothes.</Text>
          </View>
        )}

        {/* Nothing generated yet */}
        {!result && !generating && !problem && (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 44 }}>✨</Text>
            <Text style={styles.emptyTitle}>Ready when you are</Text>
            <Text style={styles.emptyText}>
              Pick an occasion and tap Generate. The assistant chooses from your clean clothes using today's weather.
            </Text>
          </View>
        )}

        {/* Result */}
        {result && (
          <View style={{ opacity: generating ? 0.5 : 1 }}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Your {result.occasion.toLowerCase()} outfit</Text>
              <View style={styles.aiTag}>
                <Ionicons name="sparkles" size={12} color={colors.primary} />
                <Text style={styles.aiTagText}>AI</Text>
              </View>
            </View>

            <View style={styles.card}>
              {result.pieces.map(({ item, reason }, i) => {
                const meta = getCategoryMeta(item.category, isDark);
                return (
                  <View key={item.id} style={[styles.pieceRow, i > 0 && styles.pieceDivider]}>
                    <View style={[styles.pieceBox, { backgroundColor: meta.tint }]}>
                      {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.pieceImage} />
                      ) : (
                        <Text style={{ fontSize: 28 }}>{meta.emoji}</Text>
                      )}
                    </View>
                    <View style={{ flex: 1, marginLeft: 14 }}>
                      <Text style={styles.pieceName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.pieceNote}>
                        {item.category}
                        {reason ? ` · ${reason}` : ''}
                      </Text>
                    </View>
                    {alternativesFor({ item }).length > 0 && (
                      <TouchableOpacity onPress={() => handleSwap(i)} hitSlop={10} style={styles.swapBtn}>
                        <Ionicons name="swap-horizontal" size={20} color={colors.primary} />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>

            <PrimaryButton
              title={savedId ? 'Saved ✓ (tap to remove)' : 'Save outfit'}
              icon={savedId ? 'heart' : 'heart-outline'}
              variant={savedId ? 'secondary' : 'primary'}
              onPress={handleToggleSave}
              loading={saving}
              style={{ marginTop: 16 }}
            />

            {!!result.tip && (
              <View style={styles.note}>
                <Text style={styles.noteTitle}>💡 Stylist note</Text>
                <Text style={styles.noteText}>{result.tip}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = ({ colors, shadow }) => StyleSheet.create({
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
  pieceBox: { width: 58, height: 58, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  pieceImage: { width: '100%', height: '100%' },
  swapBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  pieceName: { fontSize: 16, fontWeight: '700', color: colors.ink },
  pieceNote: { fontSize: 13, color: colors.muted, marginTop: 3 },

  note: { backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: 18, marginTop: 16 },
  noteTitle: { fontSize: 14, fontWeight: '800', color: colors.primaryDark, marginBottom: 6 },
  noteText: { fontSize: 14, lineHeight: 21, color: colors.ink },

  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: 28,
    marginTop: 24,
    alignItems: 'center',
    ...shadow.card,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.ink, marginTop: 12 },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 21, marginTop: 6 },

  problemCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: 22,
    marginTop: 24,
    alignItems: 'center',
    ...shadow.card,
  },
  problemIcon: {
    width: 56,
    height: 56,
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  problemTitle: { fontSize: 17, fontWeight: '800', color: colors.ink, textAlign: 'center' },
  problemText: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 21, marginTop: 6 },
});
