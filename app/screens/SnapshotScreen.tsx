import { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ChangeListTile, type ChangeListItem } from '@/app/components/ChangeListTile';
import { DebugObservatoryPanel } from '@/app/components/debug/DebugObservatoryPanel';
import { ProfileSelector } from '@/app/components/ProfileSelector';
import { SignalsList } from '@/app/components/SignalsList';
import { DEFAULT_USER_PROFILE, type UserProfile } from '@/app/state/profileState';
import { Config } from '@/core/config/Config';
import { fetchSnapshotVM, type SnapshotVM } from '@/services/snapshot/snapshotService';

function topMovers(
  pctChangeBySymbol: Record<string, number>,
  estimatedBySymbol: Record<string, boolean>,
) {
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
  const [snapshot, setSnapshot] = useState<SnapshotVM | null>(null);
  const [baselineScan, setBaselineScan] = useState<SnapshotVM['scan']>();
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  const isDebugPanelEnabled = __DEV__ && Config.ENABLE_DEBUG_PANEL;

  useEffect(() => {
    let isMounted = true;

    fetchSnapshotVM({ profile, baselineScan, includeDebugObservatory: isDebugPanelEnabled })
      .then((nextSnapshot) => {
        if (!isMounted) {
          return;
        }

        setSnapshot(nextSnapshot);
        setBaselineScan((currentBaseline) => currentBaseline ?? nextSnapshot.scan);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setSnapshot(null);
      });

    return () => {
      isMounted = false;
    };
  }, [profile, baselineScan, isDebugPanelEnabled]);

  const pctChangeBySymbol = snapshot?.scan.pctChangeBySymbol ?? {};
  const estimatedBySymbol = useMemo(
    () => snapshot?.scan.estimatedFlags ?? {},
    [snapshot?.scan.estimatedFlags],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>PocketPilot</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Profile</Text>
          <ProfileSelector value={profile} onChange={setProfile} />
          <Text style={styles.bundleLabel}>Bundle: {snapshot?.bundleName ?? 'Loading...'}</Text>
          <Text style={styles.bundleLabel}>Portfolio Value: {snapshot?.portfolioValue.toFixed(2) ?? '--'}</Text>
          <Text style={styles.bundleLabel}>
            24h Change: {((snapshot?.snapshotModel.core.currentState.pctChange24h ?? 0) * 100).toFixed(2)}%
          </Text>
          <Text style={styles.bundleLabel}>
            Strategy Alignment: {snapshot?.snapshotModel.core.strategyStatus.alignmentState ?? '--'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current state (estimated where noted)</Text>
          <View style={styles.tiles}>
            <ChangeListTile title="Top Movers" items={topMovers(pctChangeBySymbol, estimatedBySymbol)} />
            <ChangeListTile title="Top Dips" items={topDips(pctChangeBySymbol, estimatedBySymbol)} />
          </View>
        </View>

        <SignalsList signals={snapshot?.signals ?? []} />

        {isDebugPanelEnabled ? (
          <View style={styles.section}>
            <Pressable
              style={styles.debugToggle}
              onPress={() => {
                setShowDebugPanel((current) => !current);
              }}
            >
              <Text style={styles.debugToggleText}>
                {showDebugPanel ? 'Hide Debug Observatory' : 'Show Debug Observatory'}
              </Text>
            </Pressable>
            {showDebugPanel && snapshot?.debugObservatory ? (
              <DebugObservatoryPanel payload={snapshot.debugObservatory} />
            ) : null}
          </View>
        ) : null}

        <Text style={styles.footer}>Live quotes via QuoteBroker</Text>
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
  debugToggle: {
    borderWidth: 1,
    borderColor: '#9ca3af',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  debugToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  footer: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 12,
  },
});
