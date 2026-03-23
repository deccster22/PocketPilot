import { createProtectionPlans } from '@/services/trade/createProtectionPlans';
import { createTradePlanPreview } from '@/services/trade/createTradePlanPreview';
import { resolveSelectedTradePlan } from '@/services/trade/resolveSelectedTradePlan';
import type { ProtectionPlan, TradePlanPreview } from '@/services/trade/types';
import type { ForegroundScanResult } from '@/services/types/scan';
import { fetchSurfaceContext } from '@/services/upstream/fetchSurfaceContext';

export type TradePlanPreviewVM = {
  preview: TradePlanPreview | null;
  selectedPlanId: string | null;
  scan: ForegroundScanResult;
};

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

  const selectedPlan = resolveSelectedTradePlan({
    protectionPlans,
    profile: params.profile,
    selectedPlanId: params.selectedPlanId ?? null,
  });

  return {
    preview: selectedPlan ? createTradePlanPreview(selectedPlan) : null,
    selectedPlanId: selectedPlan?.planId ?? null,
    scan: upstream.scan,
  };
}
