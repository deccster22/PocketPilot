import type { UserProfile } from '@/core/profile/types';
import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import type { LastViewedState } from '@/services/orientation/lastViewedState';
import { createPreparedTradeRiskLane } from '@/services/trade/createPreparedTradeRiskLane';
import { createProtectionPlans } from '@/services/trade/createProtectionPlans';
import { createTradePlanPreview } from '@/services/trade/createTradePlanPreview';
import { resolveSelectedTradePlan } from '@/services/trade/resolveSelectedTradePlan';
import { selectAccountScopedProtectionPlans } from '@/services/trade/selectAccountScopedProtectionPlans';
import type { RiskBasis, TradePlanPreview } from '@/services/trade/types';
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
  selectedRiskBasis?: RiskBasis | null;
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
  const protectionPlans = selectAccountScopedProtectionPlans({
    selectedAccountContext: upstream.selectedAccountContext,
    protectionPlans: createProtectionPlans({
      orientationContext: upstream.orientationContext,
      marketEvents: upstream.marketEvents,
    }),
  });
  const selectedPlan = resolveSelectedTradePlan({
    protectionPlans,
    profile: params.profile,
    selectedPlanId: params.selectedPlanId,
  });
  const selectedAccountSizingContext =
    upstream.selectedAccountContext.status === 'AVAILABLE'
      ? {
          portfolioValue: upstream.selectedAccountPortfolioValue ?? null,
          baseCurrency: upstream.selectedAccountContext.account.baseCurrency,
        }
      : null;
  const risk = createPreparedTradeRiskLane({
    plan: selectedPlan,
    requestedBasis: params.selectedRiskBasis,
    accountContext: selectedAccountSizingContext,
  });

  return {
    preview: selectedPlan
      ? createTradePlanPreview(selectedPlan, risk, selectedAccountSizingContext)
      : null,
    selectedPlanId: selectedPlan?.planId ?? null,
    scan: upstream.scan,
  };
}
