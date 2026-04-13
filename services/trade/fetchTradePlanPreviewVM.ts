import type { UserProfile } from '@/core/profile/types';
import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import type { LastViewedState } from '@/services/orientation/lastViewedState';
import { createSurfaceAccountContext } from '@/services/accounts/createSurfaceAccountContext';
import { createPreparedTradeRiskLane } from '@/services/trade/createPreparedTradeRiskLane';
import { createProtectionPlans } from '@/services/trade/createProtectionPlans';
import { fetchPreferredRiskBasis } from '@/services/trade/fetchPreferredRiskBasis';
import { createTradePlanPreview } from '@/services/trade/createTradePlanPreview';
import type { PreferredRiskBasisStore } from '@/services/trade/preferredRiskBasisStore';
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
  preferredRiskBasisStore?: Pick<PreferredRiskBasisStore, 'load'>;
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
  const surfaceAccountContext = createSurfaceAccountContext({
    selectedAccountContext: upstream.selectedAccountContext,
    selectedAccountPortfolioValue: upstream.selectedAccountPortfolioValue,
  });
  const protectionPlans = selectAccountScopedProtectionPlans({
    selectedAccountContext: surfaceAccountContext.selectedAccountContext,
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
  const selectedAccountSizingContext = surfaceAccountContext.riskContext;
  const preferredRiskBasisAvailability = await fetchPreferredRiskBasis({
    accountId: surfaceAccountContext.selectedAccountId,
    isEnabledForSurface: selectedPlan !== null,
    preferredRiskBasisStore: params.preferredRiskBasisStore,
  });
  const risk = createPreparedTradeRiskLane({
    plan: selectedPlan,
    requestedBasis: params.selectedRiskBasis,
    preferredBasis:
      preferredRiskBasisAvailability.status === 'AVAILABLE'
        ? preferredRiskBasisAvailability.preferredBasis
        : null,
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
