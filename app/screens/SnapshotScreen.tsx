import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  type AppStateStatus,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { DebugObservatoryPanel } from '@/app/components/debug/DebugObservatoryPanel';
import { ProfileSelector } from '@/app/components/ProfileSelector';
import { SnapshotBriefingCard } from '@/app/components/SnapshotBriefingCard';
import {
  refreshSnapshotScreenSurface,
  createSnapshotScreenViewData,
  shouldRefreshSnapshotOnAppForegroundTransition,
} from '@/app/screens/snapshotScreenView';
import { DEFAULT_USER_PROFILE, type UserProfile } from '@/app/state/profileState';
import { Config } from '@/core/config/Config';
import { defaultReorientationDismissStore } from '@/providers/reorientationDismissStore';
import {
  createReorientationDismissState,
  EMPTY_REORIENTATION_DISMISS_STATE,
  type ReorientationDismissState,
} from '@/services/orientation/reorientationPersistence';
import type { MessagePolicyAvailability } from '@/services/messages/types';
import type { SnapshotSurfaceVM } from '@/services/snapshot/fetchSnapshotSurfaceVM';

export function SnapshotScreen() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [snapshotSurface, setSnapshotSurface] = useState<SnapshotSurfaceVM | null>(null);
  const [snapshotMessagePolicy, setSnapshotMessagePolicy] =
    useState<MessagePolicyAvailability | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [currentSessionDismissState, setCurrentSessionDismissState] =
    useState<ReorientationDismissState>(EMPTY_REORIENTATION_DISMISS_STATE);
  const [persistedDismissState, setPersistedDismissState] = useState<ReorientationDismissState>(
    EMPTY_REORIENTATION_DISMISS_STATE,
  );
  const [isDismissStateReady, setIsDismissStateReady] = useState(false);
  const [foregroundRefreshCount, setForegroundRefreshCount] = useState(0);
  const baselineScanRef = useRef<SnapshotSurfaceVM['snapshot']['scan']>();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const isDebugPanelEnabled = __DEV__ && Config.ENABLE_DEBUG_PANEL;

  function handleProfileChange(nextProfile: UserProfile) {
    baselineScanRef.current = undefined;
    setProfile(nextProfile);
    setCurrentSessionDismissState(EMPTY_REORIENTATION_DISMISS_STATE);
  }

  useEffect(() => {
    let isMounted = true;

    defaultReorientationDismissStore
      .load()
      .then((loadedDismissState) => {
        if (!isMounted) {
          return;
        }

        setPersistedDismissState(loadedDismissState);
        setIsDismissStateReady(true);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setPersistedDismissState(EMPTY_REORIENTATION_DISMISS_STATE);
        setIsDismissStateReady(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const previousAppState = appStateRef.current;
      appStateRef.current = nextAppState;

      if (shouldRefreshSnapshotOnAppForegroundTransition(previousAppState, nextAppState)) {
        setForegroundRefreshCount((currentCount) => currentCount + 1);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!isDismissStateReady) {
      return () => {
        isMounted = false;
      };
    }

    refreshSnapshotScreenSurface({
      profile,
      baselineScan: baselineScanRef.current,
      includeDebugObservatory: isDebugPanelEnabled,
      reorientationDismissState: persistedDismissState,
      currentSessionDismissState,
    })
      .then((result) => {
        if (!isMounted) {
          return;
        }

        setSnapshotSurface(result.surface);
        setSnapshotMessagePolicy(result.messagePolicy);
        baselineScanRef.current = result.nextBaselineScan;

        if (result.shouldClearPersistedDismissState) {
          setPersistedDismissState(EMPTY_REORIENTATION_DISMISS_STATE);
          void defaultReorientationDismissStore.clear();
        }
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setSnapshotSurface(null);
        setSnapshotMessagePolicy(null);
      });

    return () => {
      isMounted = false;
    };
  }, [
    profile,
    currentSessionDismissState,
    foregroundRefreshCount,
    isDebugPanelEnabled,
    isDismissStateReady,
    persistedDismissState,
  ]);

  const screenView = useMemo(
    () => createSnapshotScreenViewData(snapshotSurface, snapshotMessagePolicy),
    [snapshotMessagePolicy, snapshotSurface],
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
          {screenView?.message.visible ? (
            <View style={styles.briefingSection}>
              <Text style={styles.briefingLabel}>Update</Text>
              <SnapshotBriefingCard
                message={screenView.message}
                onDismiss={
                  screenView.message.dismissible
                    ? () => {
                        const nextDismissState = createReorientationDismissState(
                          snapshotSurface?.reorientation.summary,
                        );

                        setCurrentSessionDismissState(nextDismissState);
                        setPersistedDismissState(nextDismissState);
                        void defaultReorientationDismissStore.save(nextDismissState);
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
