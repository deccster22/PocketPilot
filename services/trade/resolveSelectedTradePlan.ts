import type { UserProfile } from '@/core/profile/types';
import { createTradeHubSurfaceModel } from '@/services/trade/createTradeHubSurfaceModel';
import type { ProtectionPlan } from '@/services/trade/types';

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
  }).primaryPlan?.planId;

  if (!primaryPlanId) {
    return null;
  }

  return params.protectionPlans.find((plan) => plan.planId === primaryPlanId) ?? null;
}
