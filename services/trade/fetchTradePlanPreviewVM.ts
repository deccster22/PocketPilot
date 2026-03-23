import type { UserProfile } from '@/core/profile/types';
import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import type { LastViewedState } from '@/services/orientation/lastViewedState';
import { createProtectionPlans } from '@/services/trade/createProtectionPlans';
import { createTradeHubSurfaceModel } from '@/services/trade/createTradeHubSurfaceModel';
import { createTradePlanPreview } from '@/services/trade/createTradePlanPreview';
import type { ProtectionPlan, TradePlanPreview } from '@/services/trade/types';
import type { ForegroundScanResult } from '@/services/types/scan';
import { fetchSurfaceContext } from '@/services/upstream/fetchSurfaceContext';

export type TradePlanPreviewVM = {
  preview: TradePlanPreview | null;
  selectedPlanId: string | null;
  scan: ForegroundScanResult;
};

function resolveSelectedPlan(params: {
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

export async function fetchTradePlanPreviewVM(params: {
  profile: UserProfile;
  selectedPlanId?: string;
  baselineScan?: ForegroundScanResult;
  nowProvider?: () => number;
  eventLedger?: EventLedgerService;
  eventLedgerQueries?: EventLedgerQueries;
  lastViewedTimestamp?: number;
  lastViewedState?: Pick<LastViewedState, 'getLastViewedTimestamp'>;
}): Promise<TradePlanPreviewVM> {
  const upstream = await fetchSurfaceContext({
    profile: params.profile,
    baselineScan: params.baselineScan,
    nowProvider: params.nowProvider,
    eventLedger: params.eventLedger,
    eventLedgerQueries: params.eventLedgerQueries,
    lastViewedTimestamp: params.lastViewedTimestamp,
    lastViewedState: params.lastViewedState,
  });
  const protectionPlans = createProtectionPlans({
    orientationContext: upstream.orientationContext,
    marketEvents: upstream.marketEvents,
  });
  const selectedPlan = resolveSelectedPlan({
    protectionPlans,
    profile: params.profile,
    selectedPlanId: params.selectedPlanId,
  });

  return {
    preview: selectedPlan ? createTradePlanPreview(selectedPlan) : null,
    selectedPlanId: selectedPlan?.planId ?? null,
    scan: upstream.scan,
  };
}
