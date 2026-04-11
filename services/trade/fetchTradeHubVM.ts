import type { UserProfile } from '@/core/profile/types';
import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import type { LastViewedState } from '@/services/orientation/lastViewedState';
import { createPreparedTradeRiskLane } from '@/services/trade/createPreparedTradeRiskLane';
import { createProtectionPlans } from '@/services/trade/createProtectionPlans';
import { createTradeHubSurfaceModel } from '@/services/trade/createTradeHubSurfaceModel';
import { fetchPreferredRiskBasis } from '@/services/trade/fetchPreferredRiskBasis';
import type { PreferredRiskBasisStore } from '@/services/trade/preferredRiskBasisStore';
import { resolveSelectedTradePlan } from '@/services/trade/resolveSelectedTradePlan';
import { selectAccountScopedProtectionPlans } from '@/services/trade/selectAccountScopedProtectionPlans';
import type { RiskBasis, TradeHubSurfaceModel } from '@/services/trade/types';
import type { ForegroundScanResult } from '@/services/types/scan';
import { fetchSurfaceContext } from '@/services/upstream/fetchSurfaceContext';

export type TradeHubVM = {
  model: TradeHubSurfaceModel;
  scan: ForegroundScanResult;
};

export async function fetchTradeHubVM(params: {
  profile: UserProfile;
  selectedPlanId?: string | null;
  selectedRiskBasis?: RiskBasis | null;
  baselineScan?: ForegroundScanResult;
  nowProvider?: () => number;
  eventLedger?: EventLedgerService;
  eventLedgerQueries?: EventLedgerQueries;
  lastViewedTimestamp?: number;
  lastViewedState?: Pick<LastViewedState, 'getLastViewedTimestamp'>;
  preferredRiskBasisStore?: Pick<PreferredRiskBasisStore, 'load'>;
}): Promise<TradeHubVM> {
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
    selectedPlanId: params.selectedPlanId ?? undefined,
  });
  const preferredRiskBasisAvailability = await fetchPreferredRiskBasis({
    accountId:
      upstream.selectedAccountContext.status === 'AVAILABLE'
        ? upstream.selectedAccountContext.account.accountId
        : null,
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
    accountContext:
      upstream.selectedAccountContext.status === 'AVAILABLE'
        ? {
            portfolioValue: upstream.selectedAccountPortfolioValue ?? null,
            baseCurrency: upstream.selectedAccountContext.account.baseCurrency,
          }
        : null,
  });

  return {
    model: createTradeHubSurfaceModel({
      profile: params.profile,
      protectionPlans,
      risk,
      preferredRiskBasisAvailability,
    }),
    scan: upstream.scan,
  };
}
