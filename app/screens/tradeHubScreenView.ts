import type {
  MessagePolicyAvailability,
  MessagePolicyKind,
  MessagePriority,
  MessageRationaleAvailability,
} from '@/services/messages/types';
import type {
  GuardrailPreferencesAvailability,
  TradeHubActionState,
  TradeHubPlanCard,
  TradeHubSurfaceModel,
} from '@/services/trade/types';

export type TradeHubScreenPlanViewData = {
  planId: string;
  intentLabel: string;
  symbolLabel: string;
  summary: string;
  alignmentText: string;
  certaintyText: string;
  actionStateText: string;
  supportingEventsText: string;
};

export type TradeHubRiskViewData = {
  selectedBasisLabel: string;
  preferredRiskBasisText: string;
  statusText: string;
  headline: string;
  summary: string;
  options: ReadonlyArray<{
    basis: 'ACCOUNT_PERCENT' | 'FIXED_CURRENCY' | 'POSITION_PERCENT';
    label: string;
    isSelected: boolean;
  }>;
  items: ReadonlyArray<{
    label: string;
    value: string;
  }>;
};

export type TradeHubGuardrailPreferenceViewData = {
  key: 'riskLimitPerTrade' | 'dailyLossThreshold' | 'cooldownAfterLoss';
  label: string;
  isEnabled: boolean;
  stateText: string;
  detailText: string;
  inputPlaceholder: string;
};

export type TradeHubGuardrailPreferencesViewData = {
  accountText: string;
  summaryText: string;
  statusText: string;
  canEdit: boolean;
  items: ReadonlyArray<TradeHubGuardrailPreferenceViewData>;
};

export type TradeHubScreenViewData = {
  profileLabel: string;
  safetyText: string;
  confirmationText: string;
  message:
    | {
        visible: false;
      }
    | {
        visible: true;
        kind: MessagePolicyKind;
        priority: MessagePriority;
        title: string;
        summary: string;
        rationale: MessageRationaleAvailability;
      };
  risk: TradeHubRiskViewData | null;
  guardrailPreferences: TradeHubGuardrailPreferencesViewData;
  primaryPlan: TradeHubScreenPlanViewData | null;
  alternativePlans: TradeHubScreenPlanViewData[];
};

function formatPreferredRiskBasisText(surface: TradeHubSurfaceModel): string {
  const preferredRiskBasisAvailability = surface.meta.preferredRiskBasisAvailability;

  if (preferredRiskBasisAvailability.status === 'UNAVAILABLE') {
    switch (preferredRiskBasisAvailability.reason) {
      case 'NO_ACCOUNT_CONTEXT':
        return 'No account context is available to remember a usual basis.';
      default:
        return 'Preferred basis is not enabled for this surface.';
    }
  }

  if (preferredRiskBasisAvailability.preferredBasis === null) {
    return 'Usual basis for this account: not saved yet.';
  }

  const preferredLabel =
    surface.risk.basisAvailability.status === 'AVAILABLE'
      ? surface.risk.basisAvailability.options.find(
          (option) => option.basis === preferredRiskBasisAvailability.preferredBasis,
        )?.label ?? preferredRiskBasisAvailability.preferredBasis
      : preferredRiskBasisAvailability.preferredBasis;

  return `Usual basis for this account: ${preferredLabel}`;
}

function formatIntentLabel(plan: TradeHubPlanCard): string {
  switch (plan.intentType) {
    case 'ACCUMULATE':
      return 'Accumulate';
    case 'REDUCE':
      return 'Reduce';
    case 'HOLD':
      return 'Hold';
    default:
      return 'Wait';
  }
}

function formatActionStateText(actionState: TradeHubActionState): string {
  switch (actionState) {
    case 'READY':
      return 'Ready for confirmation';
    case 'CAUTION':
      return 'Caution before confirmation';
    default:
      return 'Wait for better conditions';
  }
}

function formatPlanCard(plan: TradeHubPlanCard): TradeHubScreenPlanViewData {
  return {
    planId: plan.planId,
    intentLabel: formatIntentLabel(plan),
    symbolLabel: plan.symbol ?? 'Portfolio-level',
    summary: plan.summary,
    alignmentText: plan.alignment.toLowerCase(),
    certaintyText: plan.certainty.toLowerCase(),
    actionStateText: formatActionStateText(plan.actionState),
    supportingEventsText: `${plan.supportingEventCount} supporting event${
      plan.supportingEventCount === 1 ? '' : 's'
    }`,
  };
}

function createTradeHubMessageViewData(
  messagePolicy?: MessagePolicyAvailability | null,
): TradeHubScreenViewData['message'] {
  if (messagePolicy?.status === 'AVAILABLE' && messagePolicy.messages[0]) {
    return {
      visible: true,
      kind: messagePolicy.messages[0].kind,
      priority: messagePolicy.messages[0].priority,
      title: messagePolicy.messages[0].title,
      summary: messagePolicy.messages[0].summary,
      rationale: messagePolicy.rationale,
    };
  }

  return {
    visible: false,
  };
}

function createTradeHubRiskViewData(surface: TradeHubSurfaceModel): TradeHubRiskViewData | null {
  if (
    surface.risk.basisAvailability.status !== 'AVAILABLE' ||
    surface.risk.context === null ||
    surface.risk.activeBasisLabel === null
  ) {
    return null;
  }

  return {
    selectedBasisLabel: surface.risk.activeBasisLabel,
    preferredRiskBasisText: formatPreferredRiskBasisText(surface),
    statusText:
      surface.risk.context.status === 'AVAILABLE'
        ? 'Prepared risk context available'
        : 'Prepared risk context unavailable',
    headline: surface.risk.context.headline,
    summary: surface.risk.context.summary,
    options: surface.risk.basisAvailability.options.map((option) => ({
      basis: option.basis,
      label: option.label,
      isSelected: option.isSelected,
    })),
    items: surface.risk.context.items.map((item) => ({
      label: item.label,
      value: item.value,
    })),
  };
}

function formatGuardrailStateText(isEnabled: boolean, label: string | null): string {
  if (!isEnabled) {
    return 'Off by default';
  }

  return label ? `Enabled - ${label}` : 'Enabled';
}

function formatGuardrailDetailText(
  key: TradeHubGuardrailPreferenceViewData['key'],
  isEnabled: boolean,
  label: string | null,
): string {
  const labelPrefix = key === 'cooldownAfterLoss' ? 'Window' : 'Threshold';

  if (!isEnabled) {
    return `${labelPrefix} not set`;
  }

  return label ? `${labelPrefix}: ${label}` : `${labelPrefix} needed`;
}

function createUnavailableGuardrailPreferencesViewData(
  reason: Extract<GuardrailPreferencesAvailability, { status: 'UNAVAILABLE' }>['reason'],
): TradeHubGuardrailPreferencesViewData {
  switch (reason) {
    case 'NO_ACCOUNT_CONTEXT':
      return {
        accountText: 'Account context is needed before guardrails can be remembered.',
        summaryText: 'Optional guardrails stay off by default until an account is available.',
        statusText: 'No account context is available to remember guardrails yet.',
        canEdit: false,
        items: [],
      };
    default:
      return {
        accountText: 'This surface is not currently showing guardrails.',
        summaryText: 'Optional guardrails are not enabled for this surface.',
        statusText: 'Guardrails are not enabled for this surface.',
        canEdit: false,
        items: [],
      };
  }
}

function createTradeHubGuardrailPreferencesViewData(
  preferencesAvailability: GuardrailPreferencesAvailability,
): TradeHubGuardrailPreferencesViewData {
  if (preferencesAvailability.status === 'UNAVAILABLE') {
    return createUnavailableGuardrailPreferencesViewData(preferencesAvailability.reason);
  }

  const preferences = preferencesAvailability.preferences;
  const items: TradeHubGuardrailPreferencesViewData['items'] = [
    {
      key: 'riskLimitPerTrade',
      label: 'Risk limit per trade',
      isEnabled: preferences.riskLimitPerTrade.isEnabled,
      stateText: formatGuardrailStateText(
        preferences.riskLimitPerTrade.isEnabled,
        preferences.riskLimitPerTrade.thresholdLabel,
      ),
      detailText: formatGuardrailDetailText(
        'riskLimitPerTrade',
        preferences.riskLimitPerTrade.isEnabled,
        preferences.riskLimitPerTrade.thresholdLabel,
      ),
      inputPlaceholder: 'e.g. 2%',
    },
    {
      key: 'dailyLossThreshold',
      label: 'Daily loss threshold',
      isEnabled: preferences.dailyLossThreshold.isEnabled,
      stateText: formatGuardrailStateText(
        preferences.dailyLossThreshold.isEnabled,
        preferences.dailyLossThreshold.thresholdLabel,
      ),
      detailText: formatGuardrailDetailText(
        'dailyLossThreshold',
        preferences.dailyLossThreshold.isEnabled,
        preferences.dailyLossThreshold.thresholdLabel,
      ),
      inputPlaceholder: 'e.g. 4%',
    },
    {
      key: 'cooldownAfterLoss',
      label: 'Cooldown after loss',
      isEnabled: preferences.cooldownAfterLoss.isEnabled,
      stateText: formatGuardrailStateText(
        preferences.cooldownAfterLoss.isEnabled,
        preferences.cooldownAfterLoss.windowLabel,
      ),
      detailText: formatGuardrailDetailText(
        'cooldownAfterLoss',
        preferences.cooldownAfterLoss.isEnabled,
        preferences.cooldownAfterLoss.windowLabel,
      ),
      inputPlaceholder: 'e.g. 1 day',
    },
  ];
  const enabledCount = items.filter((item) => item.isEnabled).length;
  const disabledCount = items.length - enabledCount;

  return {
    accountText: `Account: ${preferencesAvailability.accountId}`,
    summaryText:
      enabledCount === 0
        ? 'Optional guardrails are off by default for this account.'
        : `${enabledCount} optional guardrail${enabledCount === 1 ? ' is' : 's are'} enabled and ${disabledCount} are off by default.`,
    statusText: 'Guardrail preferences are ready for this account.',
    canEdit: true,
    items,
  };
}

export function createTradeHubScreenViewData(
  surface: TradeHubSurfaceModel | null,
  messagePolicy?: MessagePolicyAvailability | null,
): TradeHubScreenViewData | null {
  if (!surface) {
    return null;
  }

  return {
    profileLabel: surface.meta.profile,
    safetyText: 'Trade Hub frames possible actions only. Nothing here executes a trade.',
    confirmationText: surface.meta.requiresConfirmation
      ? 'Every action remains confirmation-safe and non-executing in this phase.'
      : 'Confirmation rules are not required.',
    message: createTradeHubMessageViewData(messagePolicy),
    risk: createTradeHubRiskViewData(surface),
    guardrailPreferences: createTradeHubGuardrailPreferencesViewData(
      surface.meta.guardrailPreferencesAvailability,
    ),
    primaryPlan: surface.primaryPlan ? formatPlanCard(surface.primaryPlan) : null,
    alternativePlans: surface.alternativePlans.map(formatPlanCard),
  };
}
