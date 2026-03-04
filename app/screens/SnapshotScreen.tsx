import { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ChangeListTile, type ChangeListItem } from '@/app/components/ChangeListTile';
import { ProfileSelector } from '@/app/components/ProfileSelector';
import { SignalsList } from '@/app/components/SignalsList';
import { DEFAULT_USER_PROFILE, type UserProfile } from '@/app/state/profileState';
import { runDemoScan } from '@/services/scan/runDemoScan';

function topMovers(pctChangeBySymbol: Record<string, number>, estimatedBySymbol: Record<string, boolean>) {
  return Object.entries(pctChangeBySymbol)
    .filter(([, pct]) => pct > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map<ChangeListItem>(([symbol, pct]) => ({
      symbol,
      pct,
      estimated: estimatedBySymbol[symbol] ?? false,
    }));
}

function topDips(pctChangeBySymbol: Record<string, number>, estimatedBySymbol: Record<string, boolean>) {
  return Object.entries(pctChangeBySymbol)
    .filter(([, pct]) => pct < 0)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map<ChangeListItem>(([symbol, pct]) => ({
      symbol,
      pct,
      estimated: estimatedBySymbol[symbol] ?? false,
    }));
}

export function SnapshotScreen() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const snapshot = useMemo(
    () => runDemoScan({ profile, nowMs: 1_700_000_000_000 }),
    [profile],
  );

  const estimatedBySymbol = useMemo(
    () =>
      snapshot.scan.quotes.reduce<Record<string, boolean>>((acc, quote) => {
        acc[quote.symbol] = quote.estimated;
        return acc;
      }, {}),
    [snapshot.scan.quotes],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>PocketPilot</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Profile</Text>
          <ProfileSelector value={profile} onChange={setProfile} />
          <Text style={styles.bundleLabel}>Bundle: {snapshot.bundleName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current state (estimated where noted)</Text>
          <View style={styles.tiles}>
            <ChangeListTile
              title="Top Movers"
              items={topMovers(snapshot.pctChangeBySymbol, estimatedBySymbol)}
            />
            <ChangeListTile
              title="Top Dips"
              items={topDips(snapshot.pctChangeBySymbol, estimatedBySymbol)}
            />
          </View>
        </View>

        <SignalsList signals={snapshot.signals} />

        <Text style={styles.footer}>Demo data</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    padding: 16,
    gap: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
  },
  bundleLabel: {
    fontSize: 14,
    color: '#1f2937',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  tiles: {
    gap: 10,
  },
  footer: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 12,
  },
});
