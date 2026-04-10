import type {
  MessagePolicyAvailability,
  MessagePolicyKind,
  MessagePriority,
} from '@/services/messages/types';
import type {
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
    };
  risk: TradeHubRiskViewData | null;
  primaryPlan: TradeHubScreenPlanViewData | null;
  alternativePlans: TradeHubScreenPlanViewData[];
};

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
    primaryPlan: surface.primaryPlan ? formatPlanCard(surface.primaryPlan) : null,
    alternativePlans: surface.alternativePlans.map(formatPlanCard),
  };
}
