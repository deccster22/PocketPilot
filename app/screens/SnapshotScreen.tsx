import { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DebugObservatoryPanel } from '@/app/components/debug/DebugObservatoryPanel';
import { ProfileSelector } from '@/app/components/ProfileSelector';
import { ReorientationSummaryCard } from '@/app/components/ReorientationSummaryCard';
import { DEFAULT_USER_PROFILE, type UserProfile } from '@/app/state/profileState';
import { Config } from '@/core/config/Config';
import { createSnapshotScreenViewData } from '@/app/screens/snapshotScreenView';
import {
  fetchSnapshotSurfaceVM,
  type SnapshotSurfaceVM,
} from '@/services/snapshot/fetchSnapshotSurfaceVM';

export function SnapshotScreen() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [snapshotSurface, setSnapshotSurface] = useState<SnapshotSurfaceVM | null>(null);
  const [baselineScan, setBaselineScan] = useState<SnapshotSurfaceVM['snapshot']['scan']>();
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [currentSessionDismissed, setCurrentSessionDismissed] = useState(false);

  const isDebugPanelEnabled = __DEV__ && Config.ENABLE_DEBUG_PANEL;

  function handleProfileChange(nextProfile: UserProfile) {
    setProfile(nextProfile);
    setCurrentSessionDismissed(false);
  }

  useEffect(() => {
    let isMounted = true;

    fetchSnapshotSurfaceVM({
      profile,
      baselineScan,
      includeDebugObservatory: isDebugPanelEnabled,
      reorientationVisibility: {
        currentSessionDismissed,
      },
    })
      .then((nextSurface) => {
        if (!isMounted) {
          return;
        }

        setSnapshotSurface(nextSurface);
        setBaselineScan((currentBaseline) => currentBaseline ?? nextSurface.snapshot.scan);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setSnapshotSurface(null);
      });

    return () => {
      isMounted = false;
    };
  }, [profile, baselineScan, currentSessionDismissed, isDebugPanelEnabled]);

  const screenView = useMemo(
    () => createSnapshotScreenViewData(snapshotSurface),
    [snapshotSurface],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>PocketPilot</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Snapshot</Text>
          <Text style={styles.label}>Profile</Text>
          <ProfileSelector value={profile} onChange={handleProfileChange} />
          <Text style={styles.bundleLabel}>
            {screenView?.currentStateLabel ?? 'Current State'}: {screenView?.currentStateValue ?? '--'}
          </Text>
          <Text style={styles.bundleLabel}>
            {screenView?.change24hLabel ?? 'Last 24h Change'}: {screenView?.change24hValue ?? '--'}
          </Text>
          <Text style={styles.bundleLabel}>
            {screenView?.strategyStatusLabel ?? 'Strategy Status'}: {screenView?.strategyStatusValue ?? '--'}
          </Text>
          {screenView?.reorientation.visible ? (
            <View style={styles.briefingSection}>
              <Text style={styles.briefingLabel}>Briefing</Text>
              <ReorientationSummaryCard
                summary={screenView.reorientation}
                onDismiss={
                  screenView.reorientation.dismissible
                    ? () => {
                        setCurrentSessionDismissed(true);
                      }
                    : undefined
                }
              />
            </View>
          ) : null}
        </View>

        {screenView?.bundleName || screenView?.portfolioValueText ? (
          <View style={styles.section}>
            <Text style={styles.label}>Context</Text>
            {screenView?.bundleName ? (
              <Text style={styles.bundleLabel}>Bundle: {screenView.bundleName}</Text>
            ) : null}
            {screenView?.portfolioValueText ? (
              <Text style={styles.bundleLabel}>Portfolio Value: {screenView.portfolioValueText}</Text>
            ) : null}
          </View>
        ) : null}

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
            {showDebugPanel && snapshotSurface?.snapshot.debugObservatory ? (
              <DebugObservatoryPanel payload={snapshotSurface.snapshot.debugObservatory} />
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
  briefingSection: {
    gap: 8,
    marginTop: 4,
  },
  briefingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
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
