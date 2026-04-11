import type { UserProfile } from '@/core/profile/types';
import type {
  GuardrailPreferencesAvailability,
  PreparedTradeRiskLane,
  PreferredRiskBasisAvailability,
  ProtectionPlan,
  ProtectionPlanIntentType,
  TradeHubActionState,
  TradeHubPlanCard,
  TradeHubSurfaceModel,
} from '@/services/trade/types';
import { resolveTradeHubActionState } from '@/services/trade/resolveTradeHubActionState';

const ACTION_STATE_PRIORITY: Record<TradeHubActionState, number> = {
  READY: 0,
  CAUTION: 1,
  WAIT: 2,
};

const CERTAINTY_PRIORITY = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
} as const;

const INTENT_PRIORITY: Record<ProtectionPlanIntentType, number> = {
  ACCUMULATE: 0,
  REDUCE: 1,
  HOLD: 2,
  WAIT: 3,
};

const ALTERNATIVE_LIMIT_BY_PROFILE: Record<UserProfile, number> = {
  BEGINNER: 1,
  MIDDLE: 2,
  ADVANCED: 3,
};

const UNAVAILABLE_PREFERRED_RISK_BASIS: PreferredRiskBasisAvailability = {
  status: 'UNAVAILABLE',
  reason: 'NO_ACCOUNT_CONTEXT',
};

const UNAVAILABLE_GUARDRAIL_PREFERENCES: GuardrailPreferencesAvailability = {
  status: 'UNAVAILABLE',
  reason: 'NO_ACCOUNT_CONTEXT',
};

function createPlanCard(plan: ProtectionPlan): TradeHubPlanCard {
  return {
    planId: plan.planId,
    intentType: plan.intentType,
    symbol: plan.symbol,
    alignment: plan.riskProfile.alignment,
    certainty: plan.riskProfile.certainty,
    summary: plan.rationale.summary,
    supportingEventCount: plan.rationale.supportingEventIds.length,
    actionState: resolveTradeHubActionState(plan),
  };
}

function sortPlanCards(cards: ReadonlyArray<TradeHubPlanCard>): TradeHubPlanCard[] {
  return [...cards].sort((left, right) => {
    const actionStateDiff =
      ACTION_STATE_PRIORITY[left.actionState] - ACTION_STATE_PRIORITY[right.actionState];
    if (actionStateDiff !== 0) {
      return actionStateDiff;
    }

    const certaintyDiff = CERTAINTY_PRIORITY[left.certainty] - CERTAINTY_PRIORITY[right.certainty];
    if (certaintyDiff !== 0) {
      return certaintyDiff;
    }

    const intentDiff = INTENT_PRIORITY[left.intentType] - INTENT_PRIORITY[right.intentType];
    if (intentDiff !== 0) {
      return intentDiff;
    }

    const supportingDiff = right.supportingEventCount - left.supportingEventCount;
    if (supportingDiff !== 0) {
      return supportingDiff;
    }

    return left.planId.localeCompare(right.planId);
  });
}

export function createTradeHubSurfaceModel(params: {
  profile: UserProfile;
  protectionPlans: ReadonlyArray<ProtectionPlan>;
  risk: PreparedTradeRiskLane;
  preferredRiskBasisAvailability?: PreferredRiskBasisAvailability;
  guardrailPreferencesAvailability?: GuardrailPreferencesAvailability;
}): TradeHubSurfaceModel {
  const planCards = sortPlanCards(params.protectionPlans.map(createPlanCard));
  const primaryPlan = planCards[0] ?? null;
  const alternativeLimit = ALTERNATIVE_LIMIT_BY_PROFILE[params.profile];

  return {
    primaryPlan,
    alternativePlans: planCards.slice(1, 1 + alternativeLimit),
    risk: params.risk,
    meta: {
      hasPrimaryPlan: primaryPlan !== null,
      profile: params.profile,
      requiresConfirmation: true,
      preferredRiskBasisAvailability:
        params.preferredRiskBasisAvailability ?? UNAVAILABLE_PREFERRED_RISK_BASIS,
      guardrailPreferencesAvailability:
        params.guardrailPreferencesAvailability ?? UNAVAILABLE_GUARDRAIL_PREFERENCES,
    },
  };
}
