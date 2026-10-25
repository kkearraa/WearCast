import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { getStats } from '../utils/storage';
import { colors, radius, shadow } from '../theme';

export default function ProfileScreen({ navigation }) {
  const { user, logOut } = useAuth();
  const [stats, setStats] = useState({ total: 0, clean: 0, laundry: 0 });

  useFocusEffect(
    useCallback(() => {
      (async () => setStats(await getStats()))();
    }, [])
  );

  const isGuest = !user || user.isGuest;
  const daysUsed = user ? Math.max(1, Math.floor((Date.now() - user.createdAt) / 86400000) + 1) : 1;

  const handleLogOut = async () => {
    await logOut();
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>

        {/* User card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{isGuest ? '👤' : user.initials}</Text>
          </View>
          <Text style={styles.name}>{isGuest ? 'Guest' : user.name}</Text>
          <Text style={styles.email}>{isGuest ? 'Not signed in' : user.email}</Text>

          <View style={styles.statsRow}>
            <Stat value={stats.total} label="Items" />
            <View style={styles.divider} />
            <Stat value={stats.clean} label="Clean" />
            <View style={styles.divider} />
            <Stat value={daysUsed} label="Days used" />
          </View>
        </View>

        {/* Guests are invited to create an account */}
        {isGuest ? (
          <View style={styles.guestCard}>
            <Text style={styles.guestTitle}>Create an account</Text>
            <Text style={styles.guestText}>
              Get your own profile and a private closet that is kept separate from other accounts on this device.
            </Text>
            <PrimaryButton title="Create account" style={{ marginTop: 14 }} onPress={() => navigation.navigate('SignUp')} />
            <PrimaryButton title="Log in" variant="secondary" style={{ marginTop: 10 }} onPress={() => navigation.navigate('Login')} />
          </View>
        ) : (
          <>
            <Text style={styles.group}>Account</Text>
            <View style={styles.menu}>
              <MenuRow icon="person-outline" label="Edit profile" onPress={() => navigation.navigate('EditProfile')} />
              <MenuRow icon="lock-closed-outline" label="Change password" onPress={() => navigation.navigate('ChangePassword')} />
              <MenuRow icon="heart-outline" label="Saved outfits" last />
            </View>
          </>
        )}

        <Text style={styles.group}>Preferences</Text>
        <View style={styles.menu}>
          <MenuRow icon="notifications-outline" label="Notifications" />
          <MenuRow icon="settings-outline" label="Settings" onPress={() => navigation.navigate('Settings')} last />
        </View>

        <Text style={styles.group}>About</Text>
        <View style={styles.menu}>
          <MenuRow icon="help-circle-outline" label="Help & support" />
          <MenuRow icon="information-circle-outline" label="About WearCast" last />
        </View>

        <PrimaryButton
          title={isGuest ? 'Exit guest mode' : 'Log out'}
          icon="log-out-outline"
          variant="danger"
          style={{ marginTop: 24 }}
          onPress={handleLogOut}
        />
        <Text style={styles.version}>WearCast v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuRow({ icon, label, onPress, last }) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={[styles.menuRow, !last && styles.menuDivider]}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.faint} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 30, fontWeight: '900', color: colors.ink, letterSpacing: -0.5, marginTop: 4, marginBottom: 18 },

  userCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 20,
    ...shadow.card,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '900' },
  name: { fontSize: 22, fontWeight: '800', color: colors.ink, marginTop: 16 },
  email: { fontSize: 14, color: colors.muted, marginTop: 4 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    width: '100%',
  },
  statValue: { fontSize: 22, fontWeight: '900', color: colors.ink },
  statLabel: { fontSize: 12, color: colors.muted, marginTop: 2 },
  divider: { width: 1, height: 30, backgroundColor: colors.line },

  guestCard: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 20, marginTop: 20, ...shadow.card },
  guestTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },
  guestText: { fontSize: 14, color: colors.muted, lineHeight: 21, marginTop: 6 },

  group: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 24,
    marginBottom: 10,
    marginLeft: 4,
  },
  menu: { backgroundColor: colors.card, borderRadius: radius.lg, paddingHorizontal: 16, ...shadow.card },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  menuDivider: { borderBottomWidth: 1, borderBottomColor: colors.line },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.ink },
  version: { textAlign: 'center', color: colors.faint, fontSize: 12, marginTop: 16 },
});
