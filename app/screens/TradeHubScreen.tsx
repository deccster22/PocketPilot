import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { MessageRationaleNote } from '@/app/components/MessageRationaleNote';
import { ProfileSelector } from '@/app/components/ProfileSelector';
import { DEFAULT_USER_PROFILE, type UserProfile } from '@/app/state/profileState';
import { createTradeConfirmationFlowViewData } from '@/app/screens/tradeConfirmationFlowView';
import { createTradeExecutionAdapterViewData } from '@/app/screens/tradeExecutionAdapterView';
import { createTradeExecutionReadinessViewData } from '@/app/screens/tradeExecutionReadinessView';
import { createTradeExecutionPreviewViewData } from '@/app/screens/tradeExecutionPreviewView';
import { createRiskToolScreenViewData } from '@/app/screens/riskToolScreenView';
import { createTradePlanConfirmationViewData } from '@/app/screens/tradePlanConfirmationView';
import { createTradePlanPreviewViewData } from '@/app/screens/tradePlanPreviewView';
import { createTradeSubmissionIntentViewData } from '@/app/screens/tradeSubmissionIntentView';
import { fetchMessagePolicyVM } from '@/services/messages/fetchMessagePolicyVM';
import { fetchRiskToolVM } from '@/services/risk/fetchRiskToolVM';
import { fetchExecutionAdapterResponseVM } from '@/services/trade/fetchExecutionAdapterResponseVM';
import { createTradeHubScreenViewData } from '@/app/screens/tradeHubScreenView';
import { updateGuardrailPreferences } from '@/services/trade/updateGuardrailPreferences';
import { fetchConfirmationSessionVM } from '@/services/trade/fetchConfirmationSessionVM';
import { fetchExecutionReadinessVM } from '@/services/trade/fetchExecutionReadinessVM';
import { fetchExecutionPreviewVM } from '@/services/trade/fetchExecutionPreviewVM';
import { fetchSubmissionIntentVM } from '@/services/trade/fetchSubmissionIntentVM';
import { fetchTradeHubVM } from '@/services/trade/fetchTradeHubVM';
import { updatePreferredRiskBasis } from '@/services/trade/updatePreferredRiskBasis';
import type { MessagePolicyLane } from '@/services/messages/types';
import type { ConfirmationSessionVM } from '@/services/trade/fetchConfirmationSessionVM';
import type { RiskToolVM } from '@/services/risk/types';
import type {
  ExecutionAdapterAttemptResult,
  ExecutionPreviewVM,
  ExecutionReadiness,
  GuardrailPreferences,
  RiskBasis,
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

type RiskToolInputFormState = {
  entryPrice: string;
  stopPrice: string;
  targetPrice: string;
  accountSize: string;
  riskAmount: string;
  riskPercent: string;
};

type GuardrailPreferenceKey = 'riskLimitPerTrade' | 'dailyLossThreshold' | 'cooldownAfterLoss';

const GUARDRAIL_PRESET_LABELS: Record<GuardrailPreferenceKey, string> = {
  riskLimitPerTrade: '2%',
  dailyLossThreshold: '4%',
  cooldownAfterLoss: '1 day',
};

function RiskToolInputField(props: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText(value: string): void;
}) {
  return (
    <View style={styles.inputField}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        accessibilityLabel={props.label}
        keyboardType="decimal-pad"
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor="#9ca3af"
        style={styles.input}
        value={props.value}
      />
    </View>
  );
}

function parseNumericInput(value: string): number | null {
  const trimmedValue = value.trim();

  if (!trimmedValue.length) {
    return null;
  }

  const parsedValue = Number(trimmedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function updateGuardrailPreferenceValue(
  preferences: GuardrailPreferences,
  key: GuardrailPreferenceKey,
): GuardrailPreferences {
  switch (key) {
    case 'riskLimitPerTrade':
      return {
        ...preferences,
        riskLimitPerTrade: preferences.riskLimitPerTrade.isEnabled
          ? {
              isEnabled: false,
              thresholdLabel: null,
            }
          : {
              isEnabled: true,
              thresholdLabel: GUARDRAIL_PRESET_LABELS.riskLimitPerTrade,
            },
      };
    case 'dailyLossThreshold':
      return {
        ...preferences,
        dailyLossThreshold: preferences.dailyLossThreshold.isEnabled
          ? {
              isEnabled: false,
              thresholdLabel: null,
            }
          : {
              isEnabled: true,
              thresholdLabel: GUARDRAIL_PRESET_LABELS.dailyLossThreshold,
            },
      };
    default:
      return {
        ...preferences,
        cooldownAfterLoss: preferences.cooldownAfterLoss.isEnabled
          ? {
              isEnabled: false,
              windowLabel: null,
            }
          : {
              isEnabled: true,
              windowLabel: GUARDRAIL_PRESET_LABELS.cooldownAfterLoss,
            },
      };
  }
}

function formatGuardrailPreferenceActionText(
  key: GuardrailPreferenceKey,
  isEnabled: boolean,
): string {
  if (isEnabled) {
    return 'Turn off';
  }

  return `Set ${GUARDRAIL_PRESET_LABELS[key]}`;
}

export function TradeHubScreen() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [surfaceModel, setSurfaceModel] = useState<TradeHubSurfaceModel | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>();
  const [selectedRiskBasis, setSelectedRiskBasis] = useState<RiskBasis | undefined>();
  const [messagePolicyLane, setMessagePolicyLane] = useState<MessagePolicyLane | null>(null);
  const [confirmationSessionVm, setConfirmationSessionVm] = useState<ConfirmationSessionVM | null>(
    null,
  );
  const [executionPreviewVm, setExecutionPreviewVm] = useState<ExecutionPreviewVM | null>(null);
  const [executionReadinessVm, setExecutionReadinessVm] = useState<ExecutionReadiness | null>(null);
  const [submissionIntentVm, setSubmissionIntentVm] = useState<SubmissionIntentResult | null>(null);
  const [executionAdapterVm, setExecutionAdapterVm] =
    useState<ExecutionAdapterAttemptResult | null>(null);
  const [riskToolVm, setRiskToolVm] = useState<RiskToolVM | null>(null);
  const [baselineScan, setBaselineScan] = useState<ForegroundScanResult>();
  const [guardrailPreferencesRefreshNonce, setGuardrailPreferencesRefreshNonce] = useState(0);
  const [riskToolInput, setRiskToolInput] = useState<RiskToolInputFormState>({
    entryPrice: '',
    stopPrice: '',
    targetPrice: '',
    accountSize: '',
    riskAmount: '',
    riskPercent: '',
  });

  useEffect(() => {
    setSelectedPlanId(undefined);
  }, [profile]);

  useEffect(() => {
    let isMounted = true;

    fetchTradeHubVM({
      profile,
      baselineScan,
      selectedPlanId,
      selectedRiskBasis,
    })
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
  }, [guardrailPreferencesRefreshNonce, profile, baselineScan, selectedPlanId, selectedRiskBasis]);

  const preferredRiskBasisAvailability = surfaceModel?.riskLane.preferredRiskBasisAvailability;
  const preferredRiskBasisAccountId =
    preferredRiskBasisAvailability?.status === 'AVAILABLE'
      ? preferredRiskBasisAvailability.accountId
      : null;

  useEffect(() => {
    setSelectedRiskBasis(undefined);
  }, [preferredRiskBasisAccountId]);

  const screenView = useMemo(
    () => createTradeHubScreenViewData(surfaceModel, messagePolicyLane),
    [messagePolicyLane, surfaceModel],
  );
  const riskLaneView = screenView?.riskLane;
  const tradeHubRiskView = riskLaneView?.risk;
  const guardrailPreferencesView = riskLaneView?.guardrailPreferences;
  const guardrailEvaluationView = riskLaneView?.guardrailEvaluation;
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
  const parsedRiskToolInput = useMemo(
    () => ({
      accountSize: parseNumericInput(riskToolInput.accountSize),
      allowPreparedReferences: true,
      riskAmount: parseNumericInput(riskToolInput.riskAmount),
      riskPercent: parseNumericInput(riskToolInput.riskPercent),
      entryPrice: parseNumericInput(riskToolInput.entryPrice),
      stopPrice: parseNumericInput(riskToolInput.stopPrice),
      targetPrice: parseNumericInput(riskToolInput.targetPrice),
      symbol: null,
    }),
    [riskToolInput],
  );
  const riskToolView = useMemo(() => createRiskToolScreenViewData(riskToolVm), [riskToolVm]);
  const executionAdapterView = useMemo(
    () => (executionAdapterVm ? createTradeExecutionAdapterViewData(executionAdapterVm) : null),
    [executionAdapterVm],
  );

  useEffect(() => {
    let isMounted = true;

    fetchConfirmationSessionVM({
      profile,
      baselineScan,
      selectedPlanId,
      selectedRiskBasis,
    })
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
  }, [profile, baselineScan, selectedPlanId, selectedRiskBasis]);

  useEffect(() => {
    let isMounted = true;

    if (!confirmationSessionVm) {
      setMessagePolicyLane(null);
      return () => {
        isMounted = false;
      };
    }

    fetchMessagePolicyVM({
      surface: 'TRADE_HUB',
      profile,
      confirmationSession: confirmationSessionVm.session,
    })
      .then((result) => {
        if (!isMounted) {
          return;
        }

        setMessagePolicyLane(result);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setMessagePolicyLane(null);
      });

    return () => {
      isMounted = false;
    };
  }, [confirmationSessionVm, profile]);

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

    fetchRiskToolVM({
      confirmationSession: confirmationSessionVm?.session ?? null,
      preparedQuoteScan: confirmationSessionVm?.scan ?? baselineScan,
      input: parsedRiskToolInput,
    })
      .then((result) => {
        if (!isMounted) {
          return;
        }

        setRiskToolVm(result);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setRiskToolVm(null);
      });

    return () => {
      isMounted = false;
    };
  }, [confirmationSessionVm, parsedRiskToolInput]);

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
    setSelectedPlanId(planId);
  }

  function handleSelectRiskBasis(basis: RiskBasis) {
    setSelectedRiskBasis(basis);

    void updatePreferredRiskBasis({
      accountId: preferredRiskBasisAccountId,
      riskBasis: basis,
    }).catch(() => undefined);
  }

  function handleToggleGuardrailPreference(key: GuardrailPreferenceKey) {
    const availability = surfaceModel?.riskLane.guardrailPreferencesAvailability;

    if (availability?.status !== 'AVAILABLE') {
      return;
    }

    void updateGuardrailPreferences({
      accountId: availability.accountId,
      preferences: updateGuardrailPreferenceValue(availability.preferences, key),
    })
      .then((result) => {
        if (result.status !== 'REJECTED') {
          setGuardrailPreferencesRefreshNonce((current) => current + 1);
        }
      })
      .catch(() => undefined);
  }

  function handleRiskToolInputChange(field: keyof RiskToolInputFormState, value: string) {
    setRiskToolInput((currentInput) => ({
      ...currentInput,
      [field]: value,
    }));
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
        {screenView?.message.visible ? (
          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>{screenView.message.title}</Text>
            <Text style={styles.noteSummary}>{screenView.message.summary}</Text>
            <MessageRationaleNote rationale={screenView.message.rationale} />
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.label}>
            Prepared surface for {screenView?.profileLabel ?? profile}
          </Text>
          {screenView?.primaryPlan ? (
            <TradeHubPlanCard
              title="Primary Plan"
              plan={screenView.primaryPlan}
              selected={
                (selectedPlanId ?? confirmationSessionVm?.session.planId) ===
                screenView.primaryPlan.planId
              }
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
                selected={(selectedPlanId ?? confirmationSessionVm?.session.planId) === plan.planId}
                onPress={() => handleSelectPlan(plan.planId)}
              />
            ))
          ) : (
            <Text style={styles.emptyState}>No alternative plans are prepared.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Basis</Text>
          <Text style={styles.supportText}>
            {tradeHubRiskView?.summary ??
              'Risk framing appears when a prepared plan can carry an explicit basis.'}
          </Text>
          {tradeHubRiskView ? (
            <View style={styles.card}>
              <Text style={styles.cardEyebrow}>Prepared risk framing</Text>
              <Text style={styles.cardTitle}>{tradeHubRiskView.selectedBasisLabel}</Text>
              <Text style={styles.cardMeta}>{tradeHubRiskView.preferredRiskBasisText}</Text>
              <Text style={styles.cardMeta}>{tradeHubRiskView.statusText}</Text>
              <Text style={styles.cardMeta}>{tradeHubRiskView.headline}</Text>
              <View style={styles.toggleRow}>
                {tradeHubRiskView.options.map((option) => {
                  const isSelected =
                    (selectedRiskBasis ?? confirmationSessionVm?.session.preview?.risk.activeBasis) ===
                    option.basis || (!selectedRiskBasis && option.isSelected);

                  return (
                    <Pressable
                      key={option.basis}
                      accessibilityRole="button"
                      onPress={() => handleSelectRiskBasis(option.basis)}
                      style={({ pressed }) => [
                        styles.toggleButton,
                        isSelected ? styles.selectedToggleButton : null,
                        pressed ? styles.stepButtonPressed : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.toggleButtonText,
                          isSelected ? styles.selectedToggleButtonText : null,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              </View>
          ) : (
            <Text style={styles.emptyState}>Risk basis is not available right now.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guardrail Preferences</Text>
          <Text style={styles.supportText}>
            {guardrailPreferencesView?.summaryText ??
              'Optional guardrails stay off by default until an account is available.'}
          </Text>
          {guardrailPreferencesView ? (
            <View style={styles.card}>
              <Text style={styles.cardEyebrow}>Optional, explicit, account-scoped</Text>
              <Text style={styles.cardTitle}>{guardrailPreferencesView.statusText}</Text>
              <Text style={styles.cardMeta}>{guardrailPreferencesView.accountText}</Text>
              {guardrailPreferencesView.items.length ? (
                guardrailPreferencesView.items.map((item) => (
                  <View key={item.key} style={styles.guardrailItem}>
                    <Text style={styles.cardMeta}>{item.label}</Text>
                    <Text style={styles.cardSummary}>{item.stateText}</Text>
                    <Text style={styles.cardMeta}>{item.detailText}</Text>
                    {guardrailPreferencesView.canEdit ? (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => handleToggleGuardrailPreference(item.key)}
                        style={({ pressed }) => [
                          styles.stepButton,
                          styles.guardrailButton,
                          pressed ? styles.stepButtonPressed : null,
                        ]}
                      >
                        <Text style={styles.stepButtonText}>
                          {formatGuardrailPreferenceActionText(item.key, item.isEnabled)}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyState}>
                  No account context is available to remember guardrails yet.
                </Text>
              )}
            </View>
          ) : (
            <Text style={styles.emptyState}>No guardrail preferences are prepared right now.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guardrail Evaluation</Text>
          {guardrailEvaluationView ? (
            <View style={styles.card}>
              <Text style={styles.cardEyebrow}>Prepared, descriptive only</Text>
              <Text style={styles.cardTitle}>{guardrailEvaluationView.titleText}</Text>
              <Text style={styles.cardSummary}>{guardrailEvaluationView.summaryText}</Text>
              {guardrailEvaluationView.items.map((item) => (
                <View key={item.key} style={styles.guardrailItem}>
                  <Text style={styles.cardMeta}>{item.label}</Text>
                  <Text style={styles.cardSummary}>{item.statusText}</Text>
                  <Text style={styles.cardMeta}>{item.summaryText}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyState}>No guardrail evaluation is prepared right now.</Text>
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
              <Text style={styles.cardMeta}>{previewView.riskBasisText}</Text>
              <Text style={styles.cardMeta}>{previewView.riskStatusText}</Text>
              <Text style={styles.cardMeta}>{previewView.riskHeadline}</Text>
              <Text style={styles.cardMeta}>{previewView.riskSummary}</Text>
              {previewView.riskItems.map((item) => (
                <Text key={`${item.label}:${item.value}`} style={styles.cardMeta}>
                  {item.label}: {item.value}
                </Text>
              ))}
              {previewView.riskInputGuidance.status === 'AVAILABLE' ? (
                <View style={styles.noteCard}>
                  <Text style={styles.noteTitle}>
                    {previewView.riskInputGuidance.guidance.title}
                  </Text>
                  <Text style={styles.noteSummary}>
                    {previewView.riskInputGuidance.guidance.summary}
                  </Text>
                  {previewView.riskInputGuidance.guidance.items.map((item) => (
                    <Text key={item} style={styles.cardMeta}>
                      {item}
                    </Text>
                  ))}
                </View>
              ) : null}
              <Text style={styles.cardMeta}>{previewView.positionSizing.statusText}</Text>
              <Text style={styles.cardMeta}>{previewView.positionSizing.headline}</Text>
              <Text style={styles.cardSummary}>{previewView.positionSizing.summary}</Text>
              {previewView.positionSizing.details.map((item) => (
                <View key={`${item.label}:${item.value}`} style={styles.detailRow}>
                  <Text style={styles.cardMeta}>
                    {item.label}: {item.value}
                  </Text>
                </View>
              ))}
              <Text style={styles.cardMeta}>
                Notes:{' '}
                {previewView.positionSizing.notes.length
                  ? previewView.positionSizing.notes.join(' | ')
                  : 'None'}
              </Text>
              <Text style={styles.cardMeta}>{previewView.confirmationText}</Text>
              <Text style={styles.cardMeta}>{previewView.placeholderText}</Text>
              <Text style={styles.cardId}>Plan: {previewView.planId}</Text>
            </View>
          ) : (
            <Text style={styles.emptyState}>No plan preview is prepared right now.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Tool</Text>
          <Text style={styles.supportText}>
            {riskToolView?.boundaryText ??
              'Risk framing stays support-only. It does not create an order or imply execution readiness.'}
          </Text>
          <Text style={styles.supportText}>
            Use the selected plan as context, then add only the entry, stop, and risk inputs you
            want to frame.
          </Text>
          <Text style={styles.supportText}>
            Prepared references stay optional starting points. Your own values remain authoritative
            whenever you enter them.
          </Text>
          <View style={styles.inputGrid}>
            <RiskToolInputField
              label="Entry reference"
              onChangeText={(value) => handleRiskToolInputChange('entryPrice', value)}
              placeholder="e.g. 100"
              value={riskToolInput.entryPrice}
            />
            <RiskToolInputField
              label="Stop reference"
              onChangeText={(value) => handleRiskToolInputChange('stopPrice', value)}
              placeholder="e.g. 95"
              value={riskToolInput.stopPrice}
            />
            <RiskToolInputField
              label="Target reference"
              onChangeText={(value) => handleRiskToolInputChange('targetPrice', value)}
              placeholder="optional"
              value={riskToolInput.targetPrice}
            />
            <RiskToolInputField
              label="Account size"
              onChangeText={(value) => handleRiskToolInputChange('accountSize', value)}
              placeholder="optional"
              value={riskToolInput.accountSize}
            />
            <RiskToolInputField
              label="Risk amount"
              onChangeText={(value) => handleRiskToolInputChange('riskAmount', value)}
              placeholder="optional"
              value={riskToolInput.riskAmount}
            />
            <RiskToolInputField
              label="Risk percent"
              onChangeText={(value) => handleRiskToolInputChange('riskPercent', value)}
              placeholder="optional"
              value={riskToolInput.riskPercent}
            />
          </View>
          {riskToolView ? (
            <View style={styles.card}>
              <Text style={styles.cardEyebrow}>Service-owned sizing summary</Text>
              <Text style={styles.cardTitle}>{riskToolView.stateText}</Text>
              <Text style={styles.cardMeta}>{riskToolView.statusText}</Text>
              <Text style={styles.cardMeta}>{riskToolView.symbolText}</Text>
              {riskToolView.generatedAtText ? (
                <Text style={styles.cardMeta}>{riskToolView.generatedAtText}</Text>
              ) : null}
              {riskToolView.detailRows.map((row) => (
                <View key={row.label} style={styles.detailRow}>
                  <Text style={styles.cardMeta}>
                    {row.label}: {row.value}
                  </Text>
                  {row.supportingText ? (
                    <Text style={styles.cardId}>{row.supportingText}</Text>
                  ) : null}
                </View>
              ))}
              <Text style={styles.cardMeta}>
                Notes: {riskToolView.notes.length ? riskToolView.notes.join(' | ') : 'None'}
              </Text>
            </View>
          ) : (
            <Text style={styles.emptyState}>No risk summary is prepared right now.</Text>
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
            <Text style={styles.emptyState}>
              No execution adapter response is prepared right now.
            </Text>
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
  inputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  inputField: {
    flexGrow: 1,
    flexBasis: 160,
    gap: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111827',
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
  toggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toggleButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectedToggleButton: {
    borderColor: '#475569',
    backgroundColor: '#e2e8f0',
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  selectedToggleButtonText: {
    color: '#0f172a',
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
  noteCard: {
    gap: 6,
    borderWidth: 1,
    borderColor: '#dbe4ea',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    padding: 12,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  noteSummary: {
    fontSize: 13,
    color: '#4b5563',
  },
  cardId: {
    fontSize: 11,
    color: '#6b7280',
  },
  detailRow: {
    gap: 2,
  },
  guardrailItem: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  guardrailButton: {
    alignSelf: 'flex-start',
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
