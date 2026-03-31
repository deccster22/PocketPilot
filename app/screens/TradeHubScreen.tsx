import { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ProfileSelector } from '@/app/components/ProfileSelector';
import { DEFAULT_USER_PROFILE, type UserProfile } from '@/app/state/profileState';
import { createTradeConfirmationFlowViewData } from '@/app/screens/tradeConfirmationFlowView';
import { createTradeExecutionAdapterViewData } from '@/app/screens/tradeExecutionAdapterView';
import { createTradeExecutionReadinessViewData } from '@/app/screens/tradeExecutionReadinessView';
import { createTradeExecutionPreviewViewData } from '@/app/screens/tradeExecutionPreviewView';
import { createTradePlanConfirmationViewData } from '@/app/screens/tradePlanConfirmationView';
import { createTradePlanPreviewViewData } from '@/app/screens/tradePlanPreviewView';
import { createTradeSubmissionIntentViewData } from '@/app/screens/tradeSubmissionIntentView';
import { fetchExecutionAdapterResponseVM } from '@/services/trade/fetchExecutionAdapterResponseVM';
import { createTradeHubScreenViewData } from '@/app/screens/tradeHubScreenView';
import { fetchConfirmationSessionVM } from '@/services/trade/fetchConfirmationSessionVM';
import { fetchExecutionReadinessVM } from '@/services/trade/fetchExecutionReadinessVM';
import { fetchExecutionPreviewVM } from '@/services/trade/fetchExecutionPreviewVM';
import { fetchSubmissionIntentVM } from '@/services/trade/fetchSubmissionIntentVM';
import { fetchTradeHubVM } from '@/services/trade/fetchTradeHubVM';
import type { ConfirmationSessionVM } from '@/services/trade/fetchConfirmationSessionVM';
import type {
  ExecutionAdapterAttemptResult,
  ExecutionPreviewVM,
  ExecutionReadiness,
  SubmissionIntentResult,
  TradeHubSurfaceModel,
} from '@/services/trade/types';
import type { ForegroundScanResult } from '@/services/types/scan';

function TradeHubPlanCard(props: {
  title: string;
  selected?: boolean;
  onPress?: () => void;
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
  const cardStyle = [styles.card, props.selected ? styles.selectedCard : null];

  const content = (
    <View style={cardStyle}>
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
      {props.selected ? <Text style={styles.cardMeta}>Selected confirmation session</Text> : null}
    </View>
  );

  if (!props.onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={props.onPress}
      style={({ pressed }) => [pressed ? styles.stepButtonPressed : null]}
    >
      {content}
    </Pressable>
  );
}

export function TradeHubScreen() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [surfaceModel, setSurfaceModel] = useState<TradeHubSurfaceModel | null>(null);
  const [confirmationSessionVm, setConfirmationSessionVm] = useState<ConfirmationSessionVM | null>(
    null,
  );
  const [executionPreviewVm, setExecutionPreviewVm] = useState<ExecutionPreviewVM | null>(null);
  const [executionReadinessVm, setExecutionReadinessVm] = useState<ExecutionReadiness | null>(null);
  const [submissionIntentVm, setSubmissionIntentVm] = useState<SubmissionIntentResult | null>(null);
  const [executionAdapterVm, setExecutionAdapterVm] = useState<ExecutionAdapterAttemptResult | null>(
    null,
  );
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

  const screenView = useMemo(() => createTradeHubScreenViewData(surfaceModel), [surfaceModel]);
  const previewView = useMemo(
    () => createTradePlanPreviewViewData(confirmationSessionVm?.session.preview ?? null),
    [confirmationSessionVm],
  );
  const confirmationShellView = useMemo(
    () => createTradePlanConfirmationViewData(confirmationSessionVm?.session.shell ?? null),
    [confirmationSessionVm],
  );
  const confirmationFlowView = useMemo(
    () => createTradeConfirmationFlowViewData(confirmationSessionVm?.session.flow ?? null),
    [confirmationSessionVm],
  );
  const executionPreviewView = useMemo(
    () => createTradeExecutionPreviewViewData(executionPreviewVm),
    [executionPreviewVm],
  );
  const executionReadinessView = useMemo(
    () =>
      executionReadinessVm ? createTradeExecutionReadinessViewData(executionReadinessVm) : null,
    [executionReadinessVm],
  );
  const submissionIntentView = useMemo(
    () => (submissionIntentVm ? createTradeSubmissionIntentViewData(submissionIntentVm) : null),
    [submissionIntentVm],
  );
  const executionAdapterView = useMemo(
    () =>
      executionAdapterVm ? createTradeExecutionAdapterViewData(executionAdapterVm) : null,
    [executionAdapterVm],
  );

  useEffect(() => {
    let isMounted = true;

    fetchConfirmationSessionVM({ profile, baselineScan })
      .then((result) => {
        if (!isMounted) {
          return;
        }

        setConfirmationSessionVm(result);
        setBaselineScan((currentBaseline) => currentBaseline ?? result.scan);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setConfirmationSessionVm(null);
      });

    return () => {
      isMounted = false;
    };
  }, [profile, baselineScan]);

  useEffect(() => {
    let isMounted = true;

    fetchExecutionPreviewVM({
      confirmationSession: confirmationSessionVm?.session ?? null,
    })
      .then((result) => {
        if (!isMounted) {
          return;
        }

        setExecutionPreviewVm(result);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setExecutionPreviewVm(null);
      });

    return () => {
      isMounted = false;
    };
  }, [confirmationSessionVm]);

  useEffect(() => {
    let isMounted = true;

    if (!submissionIntentVm) {
      setExecutionAdapterVm(null);
      return () => {
        isMounted = false;
      };
    }

    fetchExecutionAdapterResponseVM({
      submissionIntent: submissionIntentVm,
    })
      .then((result) => {
        if (!isMounted) {
          return;
        }

        setExecutionAdapterVm(result);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setExecutionAdapterVm(null);
      });

    return () => {
      isMounted = false;
    };
  }, [submissionIntentVm]);

  useEffect(() => {
    let isMounted = true;

    fetchExecutionReadinessVM({
      confirmationSession: confirmationSessionVm?.session ?? null,
      executionPreview: executionPreviewVm,
    })
      .then((result) => {
        if (!isMounted) {
          return;
        }

        setExecutionReadinessVm(result);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setExecutionReadinessVm(null);
      });

    return () => {
      isMounted = false;
    };
  }, [confirmationSessionVm, executionPreviewVm]);

  useEffect(() => {
    let isMounted = true;

    fetchSubmissionIntentVM({
      confirmationSession: confirmationSessionVm?.session ?? null,
    })
      .then((result) => {
        if (!isMounted) {
          return;
        }

        setSubmissionIntentVm(result);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setSubmissionIntentVm(null);
      });

    return () => {
      isMounted = false;
    };
  }, [confirmationSessionVm]);

  function handleAcknowledgeStep(stepId: string) {
    setConfirmationSessionVm((currentVm) =>
      currentVm
        ? {
            ...currentVm,
            session: currentVm.actions.acknowledgeStep(stepId),
          }
        : currentVm,
    );
  }

  function handleUnacknowledgeStep(stepId: string) {
    setConfirmationSessionVm((currentVm) =>
      currentVm
        ? {
            ...currentVm,
            session: currentVm.actions.unacknowledgeStep(stepId),
          }
        : currentVm,
    );
  }

  function handleResetFlow() {
    setConfirmationSessionVm((currentVm) =>
      currentVm
        ? {
            ...currentVm,
            session: currentVm.actions.resetFlow(),
          }
        : currentVm,
    );
  }

  function handleSelectPlan(planId: string) {
    const currentVm = confirmationSessionVm;

    if (!currentVm) {
      return;
    }

    currentVm.actions
      .selectPlan(planId)
      .then((session) => {
        setConfirmationSessionVm((latestVm) =>
          latestVm && latestVm.actions === currentVm.actions
            ? {
                ...latestVm,
                session,
              }
            : latestVm,
        );
      })
      .catch(() => {
        setConfirmationSessionVm((latestVm) => latestVm);
      });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>PocketPilot</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trade Hub</Text>
          <Text style={styles.label}>Profile</Text>
          <ProfileSelector value={profile} onChange={setProfile} />
          <Text style={styles.supportText}>
            {screenView?.safetyText ?? 'Preparing Trade Hub...'}
          </Text>
          <Text style={styles.supportText}>
            {screenView?.confirmationText ?? 'Trade actions remain read-only in this phase.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Prepared surface for {screenView?.profileLabel ?? profile}
          </Text>
          {screenView?.primaryPlan ? (
            <TradeHubPlanCard
              title="Primary Plan"
              plan={screenView.primaryPlan}
              selected={confirmationSessionVm?.session.planId === screenView.primaryPlan.planId}
              onPress={() => handleSelectPlan(screenView.primaryPlan.planId)}
            />
          ) : (
            <Text style={styles.emptyState}>No primary plan is prepared right now.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alternatives</Text>
          {screenView?.alternativePlans.length ? (
            screenView.alternativePlans.map((plan) => (
              <TradeHubPlanCard
                key={plan.planId}
                title="Alternative Plan"
                plan={plan}
                selected={confirmationSessionVm?.session.planId === plan.planId}
                onPress={() => handleSelectPlan(plan.planId)}
              />
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
          {confirmationShellView ? (
            <View style={styles.card}>
              <Text style={styles.cardEyebrow}>Capability-aware confirmation</Text>
              <Text style={styles.cardTitle}>
                {confirmationShellView.intentLabel} - {confirmationShellView.symbolLabel}
              </Text>
              <Text style={styles.cardMeta}>{confirmationShellView.actionStateText}</Text>
              <Text style={styles.cardMeta}>{confirmationShellView.readinessText}</Text>
              <Text style={styles.cardMeta}>{confirmationShellView.confirmationText}</Text>
              <Text style={styles.cardMeta}>{confirmationShellView.constraintsText}</Text>
              <Text style={styles.cardMeta}>{confirmationShellView.placeholderText}</Text>
              <Text style={styles.cardId}>Plan: {confirmationShellView.planId}</Text>
            </View>
          ) : (
            <Text style={styles.emptyState}>No confirmation shell is prepared right now.</Text>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Execution Preview</Text>
          {executionPreviewView ? (
            <View style={styles.card}>
              <Text style={styles.cardEyebrow}>Non-executing payload boundary</Text>
              <Text style={styles.cardTitle}>{executionPreviewView.pathText}</Text>
              <Text style={styles.cardMeta}>{executionPreviewView.adapterText}</Text>
              <Text style={styles.cardMeta}>{executionPreviewView.payloadText}</Text>
              <Text style={styles.cardMeta}>{executionPreviewView.fieldsText}</Text>
              <Text style={styles.cardMeta}>{executionPreviewView.executableText}</Text>
              <Text style={styles.cardId}>Plan: {executionPreviewView.planId}</Text>
            </View>
          ) : (
            <Text style={styles.emptyState}>No execution preview is prepared right now.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Execution Readiness</Text>
          {executionReadinessView ? (
            <View style={styles.card}>
              <Text style={styles.cardEyebrow}>Service-owned submission gate</Text>
              <Text style={styles.cardTitle}>{executionReadinessView.eligibilityText}</Text>
              <Text style={styles.cardMeta}>{executionReadinessView.blockerCountText}</Text>
              <Text style={styles.cardMeta}>{executionReadinessView.warningCountText}</Text>
              {executionReadinessView.summaryText.map((summaryLine) => (
                <Text key={summaryLine} style={styles.cardMeta}>
                  {summaryLine}
                </Text>
              ))}
              <Text style={styles.cardMeta}>
                Blockers:{' '}
                {executionReadinessView.blockers.length
                  ? executionReadinessView.blockers.join(' | ')
                  : 'None'}
              </Text>
              <Text style={styles.cardMeta}>
                Warnings:{' '}
                {executionReadinessView.warnings.length
                  ? executionReadinessView.warnings.join(' | ')
                  : 'None'}
              </Text>
            </View>
          ) : (
            <Text style={styles.emptyState}>No execution readiness is prepared right now.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Submission Intent</Text>
          {submissionIntentView ? (
            <View style={styles.card}>
              <Text style={styles.cardEyebrow}>Prepared non-dispatching seam</Text>
              <Text style={styles.cardTitle}>{submissionIntentView.statusText}</Text>
              <Text style={styles.cardMeta}>{submissionIntentView.detailText}</Text>
              <Text style={styles.cardMeta}>{submissionIntentView.warningCountText}</Text>
              <Text style={styles.cardMeta}>{submissionIntentView.placeholderText}</Text>
              <Text style={styles.cardMeta}>
                Blockers:{' '}
                {submissionIntentView.blockers.length
                  ? submissionIntentView.blockers.join(' | ')
                  : 'None'}
              </Text>
              <Text style={styles.cardMeta}>
                Warnings:{' '}
                {submissionIntentView.warnings.length
                  ? submissionIntentView.warnings.join(' | ')
                  : 'None'}
              </Text>
              <Text style={styles.cardMeta}>
                Payload:{' '}
                {submissionIntentView.payloadSummary.length
                  ? submissionIntentView.payloadSummary.join(' | ')
                  : 'None'}
              </Text>
            </View>
          ) : (
            <Text style={styles.emptyState}>No submission intent is prepared right now.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Execution Adapter</Text>
          {executionAdapterView ? (
            <View style={styles.card}>
              <Text style={styles.cardEyebrow}>Simulated-only adapter seam</Text>
              <Text style={styles.cardTitle}>{executionAdapterView.statusText}</Text>
              <Text style={styles.cardMeta}>{executionAdapterView.detailText}</Text>
              <Text style={styles.cardMeta}>{executionAdapterView.warningsText}</Text>
              <Text style={styles.cardMeta}>{executionAdapterView.orderSummaryText}</Text>
              <Text style={styles.cardMeta}>
                Blockers:{' '}
                {executionAdapterView.blockers.length
                  ? executionAdapterView.blockers.join(' | ')
                  : 'None'}
              </Text>
              <Text style={styles.cardMeta}>
                Warnings:{' '}
                {executionAdapterView.warnings.length
                  ? executionAdapterView.warnings.join(' | ')
                  : 'None'}
              </Text>
              <Text style={styles.cardMeta}>
                Simulated IDs: {executionAdapterView.simulatedOrderIdsText}
              </Text>
            </View>
          ) : (
            <Text style={styles.emptyState}>No execution adapter response is prepared right now.</Text>
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
  selectedCard: {
    borderColor: '#2563eb',
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
