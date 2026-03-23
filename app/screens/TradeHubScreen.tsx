import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ProfileSelector } from '@/app/components/ProfileSelector';
import { DEFAULT_USER_PROFILE, type UserProfile } from '@/app/state/profileState';
import { createTradePlanConfirmationViewData } from '@/app/screens/tradePlanConfirmationView';
import { createTradePlanPreviewViewData } from '@/app/screens/tradePlanPreviewView';
import { createTradeHubScreenViewData } from '@/app/screens/tradeHubScreenView';
import { fetchTradePlanConfirmationVM } from '@/services/trade/fetchTradePlanConfirmationVM';
import { fetchTradePlanPreviewVM } from '@/services/trade/fetchTradePlanPreviewVM';
import type { TradePlanConfirmationShell, TradePlanPreview } from '@/services/trade/types';
import { fetchTradeHubVM } from '@/services/trade/fetchTradeHubVM';
import type { TradeHubSurfaceModel } from '@/services/trade/types';
import type { ForegroundScanResult } from '@/services/types/scan';

function TradeHubPlanCard(props: {
  title: string;
  plan: {
    planId: string;
    intentLabel: string;
    symbolLabel: string;
    summary: string;
    alignmentText: string;
    certaintyText: string;
    actionStateText: string;
    supportingEventsText: string;
  };
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardEyebrow}>{props.title}</Text>
      <Text style={styles.cardTitle}>
        {props.plan.intentLabel} - {props.plan.symbolLabel}
      </Text>
      <Text style={styles.cardSummary}>{props.plan.summary}</Text>
      <Text style={styles.cardMeta}>
        {props.plan.actionStateText} | {props.plan.certaintyText} certainty |{' '}
        {props.plan.alignmentText}
      </Text>
      <Text style={styles.cardMeta}>{props.plan.supportingEventsText}</Text>
      <Text style={styles.cardId}>Plan: {props.plan.planId}</Text>
    </View>
  );
}

export function TradeHubScreen() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [surfaceModel, setSurfaceModel] = useState<TradeHubSurfaceModel | null>(null);
  const [tradePlanPreview, setTradePlanPreview] = useState<TradePlanPreview | null>(null);
  const [confirmationShell, setConfirmationShell] =
    useState<TradePlanConfirmationShell | null>(null);
  const [baselineScan, setBaselineScan] = useState<ForegroundScanResult>();

  useEffect(() => {
    let isMounted = true;

    fetchTradeHubVM({ profile, baselineScan })
      .then((tradeHub) => {
        if (!isMounted) {
          return;
        }

        setSurfaceModel(tradeHub.model);
        setBaselineScan((currentBaseline) => currentBaseline ?? tradeHub.scan);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setSurfaceModel(null);
      });

    return () => {
      isMounted = false;
    };
  }, [profile, baselineScan]);

  const screenView = useMemo(
    () => createTradeHubScreenViewData(surfaceModel),
    [surfaceModel],
  );
  const previewView = useMemo(
    () => createTradePlanPreviewViewData(tradePlanPreview),
    [tradePlanPreview],
  );
  const confirmationView = useMemo(
    () => createTradePlanConfirmationViewData(confirmationShell),
    [confirmationShell],
  );

  useEffect(() => {
    let isMounted = true;

    fetchTradePlanPreviewVM({ profile, baselineScan })
      .then((result) => {
        if (!isMounted) {
          return;
        }

        setTradePlanPreview(result.preview);
        setBaselineScan((currentBaseline) => currentBaseline ?? result.scan);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setTradePlanPreview(null);
      });

    return () => {
      isMounted = false;
    };
  }, [profile, baselineScan]);

  useEffect(() => {
    let isMounted = true;

    fetchTradePlanConfirmationVM({ profile, baselineScan })
      .then((result) => {
        if (!isMounted) {
          return;
        }

        setConfirmationShell(result.confirmationShell);
        setBaselineScan((currentBaseline) => currentBaseline ?? result.scan);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setConfirmationShell(null);
      });

    return () => {
      isMounted = false;
    };
  }, [profile, baselineScan]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>PocketPilot</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trade Hub</Text>
          <Text style={styles.label}>Profile</Text>
          <ProfileSelector value={profile} onChange={setProfile} />
          <Text style={styles.supportText}>{screenView?.safetyText ?? 'Preparing Trade Hub...'}</Text>
          <Text style={styles.supportText}>
            {screenView?.confirmationText ?? 'Trade actions remain read-only in this phase.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Prepared surface for {screenView?.profileLabel ?? profile}</Text>
          {screenView?.primaryPlan ? (
            <TradeHubPlanCard title="Primary Plan" plan={screenView.primaryPlan} />
          ) : (
            <Text style={styles.emptyState}>No primary plan is prepared right now.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alternatives</Text>
          {screenView?.alternativePlans.length ? (
            screenView.alternativePlans.map((plan) => (
              <TradeHubPlanCard key={plan.planId} title="Alternative Plan" plan={plan} />
            ))
          ) : (
            <Text style={styles.emptyState}>No alternative plans are prepared.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan Preview</Text>
          {previewView ? (
            <View style={styles.card}>
              <Text style={styles.cardEyebrow}>Confirmation-safe detail</Text>
              <Text style={styles.cardTitle}>
                {previewView.intentLabel} - {previewView.symbolLabel}
              </Text>
              <Text style={styles.cardSummary}>{previewView.rationaleSummary}</Text>
              <Text style={styles.cardMeta}>{previewView.actionStateText}</Text>
              <Text style={styles.cardMeta}>{previewView.readinessText}</Text>
              <Text style={styles.cardMeta}>{previewView.constraintsText}</Text>
              <Text style={styles.cardMeta}>{previewView.rationaleTraceText}</Text>
              <Text style={styles.cardMeta}>{previewView.confirmationText}</Text>
              <Text style={styles.cardMeta}>{previewView.placeholderText}</Text>
              <Text style={styles.cardId}>Plan: {previewView.planId}</Text>
            </View>
          ) : (
            <Text style={styles.emptyState}>No plan preview is prepared right now.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confirmation Shell</Text>
          {confirmationView ? (
            <View style={styles.card}>
              <Text style={styles.cardEyebrow}>Capability-aware shell</Text>
              <Text style={styles.cardTitle}>
                {confirmationView.intentLabel} - {confirmationView.symbolLabel}
              </Text>
              <Text style={styles.cardMeta}>{confirmationView.actionStateText}</Text>
              <Text style={styles.cardMeta}>{confirmationView.readinessText}</Text>
              <Text style={styles.cardMeta}>{confirmationView.constraintsText}</Text>
              <Text style={styles.cardMeta}>{confirmationView.confirmationText}</Text>
              <Text style={styles.cardMeta}>{confirmationView.placeholderText}</Text>
              <Text style={styles.cardId}>Plan: {confirmationView.planId}</Text>
            </View>
          ) : (
            <Text style={styles.emptyState}>No confirmation shell is prepared right now.</Text>
          )}
        </View>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  label: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
  },
  supportText: {
    fontSize: 13,
    color: '#374151',
  },
  card: {
    gap: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 12,
  },
  cardEyebrow: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  cardSummary: {
    fontSize: 13,
    color: '#374151',
  },
  cardMeta: {
    fontSize: 12,
    color: '#4b5563',
  },
  cardId: {
    fontSize: 11,
    color: '#6b7280',
  },
  emptyState: {
    fontSize: 13,
    color: '#6b7280',
  },
});
