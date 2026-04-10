import type { UserProfile } from '@/core/profile/types';
import { createTradeHubSurfaceModel } from '@/services/trade/createTradeHubSurfaceModel';
import type { PreparedTradeRiskLane, ProtectionPlan } from '@/services/trade/types';

const EMPTY_RISK_LANE: PreparedTradeRiskLane = {
  activeBasis: null,
  activeBasisLabel: null,
  basisAvailability: {
    status: 'UNAVAILABLE',
    reason: 'NOT_ENABLED_FOR_SURFACE',
  },
  context: null,
};

export function resolveSelectedTradePlan(params: {
  protectionPlans: ReadonlyArray<ProtectionPlan>;
  profile: UserProfile;
  selectedPlanId?: string;
}): ProtectionPlan | null {
  if (params.selectedPlanId) {
    return (
      params.protectionPlans.find((plan) => plan.planId === params.selectedPlanId) ?? null
    );
  }

  const primaryPlanId = createTradeHubSurfaceModel({
    profile: params.profile,
    protectionPlans: params.protectionPlans,
    risk: EMPTY_RISK_LANE,
  }).primaryPlan?.planId;

  if (!primaryPlanId) {
    return null;
  }

  return params.protectionPlans.find((plan) => plan.planId === primaryPlanId) ?? null;
}
