import type { UserProfile } from '@/core/profile/types';
import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import type { LastViewedState } from '@/services/orientation/lastViewedState';
import { createProtectionPlans } from '@/services/trade/createProtectionPlans';
import { createTradePlanConfirmationShell } from '@/services/trade/createTradePlanConfirmationShell';
import { getAccountCapabilities } from '@/services/trade/getAccountCapabilities';
import { resolveSelectedTradePlan } from '@/services/trade/resolveSelectedTradePlan';
import type { TradePlanConfirmationShell } from '@/services/trade/types';
import type { ForegroundScanResult } from '@/services/types/scan';
import { fetchSurfaceContext } from '@/services/upstream/fetchSurfaceContext';

export type TradePlanConfirmationVM = {
  confirmationShell: TradePlanConfirmationShell | null;
  selectedPlanId: string | null;
  scan: ForegroundScanResult;
};

export async function fetchTradePlanConfirmationVM(params: {
  profile: UserProfile;
  selectedPlanId?: string;
  baselineScan?: ForegroundScanResult;
  nowProvider?: () => number;
  eventLedger?: EventLedgerService;
  eventLedgerQueries?: EventLedgerQueries;
  lastViewedTimestamp?: number;
  lastViewedState?: Pick<LastViewedState, 'getLastViewedTimestamp'>;
}): Promise<TradePlanConfirmationVM> {
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
    selectedPlanId: params.selectedPlanId,
  });

  if (!selectedPlan) {
    return {
      confirmationShell: null,
      selectedPlanId: null,
      scan: upstream.scan,
    };
  }

  const capabilities = await getAccountCapabilities(selectedPlan.accountId);

  return {
    confirmationShell: createTradePlanConfirmationShell({
      plan: selectedPlan,
      capabilities,
    }),
    selectedPlanId: selectedPlan.planId,
    scan: upstream.scan,
  };
}
