import type { UserProfile } from '@/core/profile/types';
import type {
  ProtectionPlan,
  ProtectionPlanIntentType,
  TradeHubActionState,
  TradeHubPlanCard,
  TradeHubSurfaceModel,
} from '@/services/trade/types';

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

function resolveActionState(plan: ProtectionPlan): TradeHubActionState {
  if (plan.intentType === 'WAIT' || plan.riskProfile.certainty === 'LOW') {
    return 'WAIT';
  }

  if (
    plan.intentType === 'HOLD' ||
    plan.riskProfile.alignment !== 'ALIGNED' ||
    plan.riskProfile.certainty === 'MEDIUM'
  ) {
    return 'CAUTION';
  }

  return 'READY';
}

function createPlanCard(plan: ProtectionPlan): TradeHubPlanCard {
  return {
    planId: plan.planId,
    intentType: plan.intentType,
    symbol: plan.symbol,
    alignment: plan.riskProfile.alignment,
    certainty: plan.riskProfile.certainty,
    summary: plan.rationale.summary,
    supportingEventCount: plan.rationale.supportingEventIds.length,
    actionState: resolveActionState(plan),
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
}): TradeHubSurfaceModel {
  const planCards = sortPlanCards(params.protectionPlans.map(createPlanCard));
  const primaryPlan = planCards[0] ?? null;
  const alternativeLimit = ALTERNATIVE_LIMIT_BY_PROFILE[params.profile];

  return {
    primaryPlan,
    alternativePlans: planCards.slice(1, 1 + alternativeLimit),
    meta: {
      hasPrimaryPlan: primaryPlan !== null,
      profile: params.profile,
      requiresConfirmation: true,
    },
  };
}
