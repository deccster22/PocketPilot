import { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ProfileSelector } from '@/app/components/ProfileSelector';
import { DEFAULT_USER_PROFILE, type UserProfile } from '@/app/state/profileState';
import { createTradeConfirmationFlowViewData } from '@/app/screens/tradeConfirmationFlowView';
import { createTradePlanPreviewViewData } from '@/app/screens/tradePlanPreviewView';
import { createTradeHubScreenViewData } from '@/app/screens/tradeHubScreenView';
import { fetchConfirmationFlowVM } from '@/services/trade/fetchConfirmationFlowVM';
import { fetchTradePlanPreviewVM } from '@/services/trade/fetchTradePlanPreviewVM';
import type {
  ConfirmationFlow,
  ConfirmationFlowActions,
  TradePlanPreview,
} from '@/services/trade/types';
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
  const [confirmationFlow, setConfirmationFlow] = useState<ConfirmationFlow | null>(null);
  const [confirmationFlowActions, setConfirmationFlowActions] =
    useState<ConfirmationFlowActions | null>(null);
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
  const confirmationFlowView = useMemo(
    () => createTradeConfirmationFlowViewData(confirmationFlow),
    [confirmationFlow],
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

    fetchConfirmationFlowVM({ profile, baselineScan })
      .then((result) => {
        if (!isMounted) {
          return;
        }

        setConfirmationFlow(result.confirmationFlow);
        setConfirmationFlowActions(result.actions);
        setBaselineScan((currentBaseline) => currentBaseline ?? result.scan);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setConfirmationFlow(null);
        setConfirmationFlowActions(null);
      });

    return () => {
      isMounted = false;
    };
  }, [profile, baselineScan]);

  function handleAcknowledgeStep(stepId: string) {
    if (!confirmationFlowActions) {
      return;
    }

    setConfirmationFlow((currentFlow) =>
      currentFlow ? confirmationFlowActions.acknowledgeStep(currentFlow, stepId) : currentFlow,
    );
  }

  function handleUnacknowledgeStep(stepId: string) {
    if (!confirmationFlowActions) {
      return;
    }

    setConfirmationFlow((currentFlow) =>
      currentFlow ? confirmationFlowActions.unacknowledgeStep(currentFlow, stepId) : currentFlow,
    );
  }

  function handleResetFlow() {
    if (!confirmationFlowActions) {
      return;
    }

    setConfirmationFlow((currentFlow) =>
      currentFlow ? confirmationFlowActions.resetFlow(currentFlow) : currentFlow,
    );
  }

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
          <Text style={styles.sectionTitle}>Confirmation Flow</Text>
          {confirmationFlowView ? (
            <View style={styles.card}>
              <Text style={styles.cardEyebrow}>Step-based confirmation</Text>
              <Text style={styles.cardTitle}>
                Current step: {confirmationFlowView.currentStepId}
              </Text>
              <Text style={styles.cardMeta}>{confirmationFlowView.canProceedText}</Text>
              <Text style={styles.cardMeta}>
                {confirmationFlowView.allRequiredAcknowledgedText}
              </Text>
              <Text style={styles.cardMeta}>{confirmationFlowView.blockedReasonText}</Text>
              {confirmationFlowView.steps.map((step) => (
                <View key={step.stepId} style={styles.stepRow}>
                  <Text style={styles.cardMeta}>
                    {step.type} | {step.label} | {step.statusText}
                  </Text>
                  {step.acknowledgementLabel ? (
                    <View style={styles.stepActions}>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => handleAcknowledgeStep(step.stepId)}
                        style={({ pressed }) => [
                          styles.stepButton,
                          pressed ? styles.stepButtonPressed : null,
                        ]}
                      >
                        <Text style={styles.stepButtonText}>{step.acknowledgementLabel}</Text>
                      </Pressable>
                      {step.acknowledged ? (
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => handleUnacknowledgeStep(step.stepId)}
                          style={({ pressed }) => [
                            styles.stepButton,
                            styles.secondaryStepButton,
                            pressed ? styles.stepButtonPressed : null,
                          ]}
                        >
                          <Text style={styles.stepButtonText}>Undo acknowledgement</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              ))}
              <Pressable
                accessibilityRole="button"
                onPress={handleResetFlow}
                style={({ pressed }) => [
                  styles.stepButton,
                  styles.secondaryStepButton,
                  pressed ? styles.stepButtonPressed : null,
                ]}
              >
                <Text style={styles.stepButtonText}>Reset acknowledgement flow</Text>
              </Pressable>
              <Text style={styles.cardId}>Plan: {confirmationFlowView.planId}</Text>
            </View>
          ) : (
            <Text style={styles.emptyState}>No confirmation flow is prepared right now.</Text>
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
  stepRow: {
    gap: 6,
  },
  stepActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stepButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  secondaryStepButton: {
    backgroundColor: '#f8fafc',
  },
  stepButtonPressed: {
    opacity: 0.8,
  },
  stepButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  emptyState: {
    fontSize: 13,
    color: '#6b7280',
  },
});
