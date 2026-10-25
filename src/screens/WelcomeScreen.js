import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { colors, radius } from '../theme';

export default function WelcomeScreen({ navigation }) {
  const { continueAsGuest } = useAuth();

  const enterApp = async () => {
    await continueAsGuest();
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* decorative background shapes */}
      <View style={[styles.blob, styles.blobA]} />
      <View style={[styles.blob, styles.blobB]} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <View style={styles.logo}>
            <Text style={styles.logoEmoji}>🌤️</Text>
          </View>
          <Text style={styles.brand}>WearCast</Text>
          <Text style={styles.tagline}>
            Your digital closet and a personal stylist that checks the weather for you.
          </Text>

          <View style={styles.pills}>
            {['📸 Snap your clothes', '🌦️ Live weather', '✨ AI outfits'].map((t) => (
              <View key={t} style={styles.pill}>
                <Text style={styles.pillText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sheet}>
          <PrimaryButton title="Create account" onPress={() => navigation.navigate('SignUp')} />
          <PrimaryButton
            title="I already have an account"
            variant="secondary"
            style={{ marginTop: 12 }}
            onPress={() => navigation.navigate('Login')}
          />
          <PrimaryButton
            title="Continue as guest"
            variant="ghost"
            style={{ marginTop: 4 }}
            onPress={enterApp}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  safe: { flex: 1, justifyContent: 'space-between' },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(79,91,255,0.35)' },
  blobA: { width: 320, height: 320, top: -80, right: -100 },
  blobB: { width: 240, height: 240, top: 220, left: -120, backgroundColor: 'rgba(255,181,71,0.18)' },
  hero: { paddingHorizontal: 28, paddingTop: 60 },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoEmoji: { fontSize: 42 },
  brand: { fontSize: 44, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  tagline: { fontSize: 17, lineHeight: 25, color: 'rgba(255,255,255,0.75)', marginTop: 12 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 26 },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  pillText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 24,
    paddingBottom: 20,
  },
});
