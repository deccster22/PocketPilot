import type { UserProfile } from '@/core/profile/types';
import { createSurfaceAccountContext } from '@/services/accounts/createSurfaceAccountContext';
import { enforceAccountScopedTruth } from '@/services/accounts/enforceAccountScopedTruth';
import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import type { LastViewedState } from '@/services/orientation/lastViewedState';
import { createProtectionPlans } from '@/services/trade/createProtectionPlans';
import { createTradePlanConfirmationShell } from '@/services/trade/createTradePlanConfirmationShell';
import { getAccountCapabilities } from '@/services/trade/getAccountCapabilities';
import { resolveExecutionCapability } from '@/services/trade/resolveExecutionCapability';
import { resolveSelectedTradePlan } from '@/services/trade/resolveSelectedTradePlan';
import { selectAccountScopedProtectionPlans } from '@/services/trade/selectAccountScopedProtectionPlans';
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

  if (!selectedPlan) {
    return {
      confirmationShell: null,
      selectedPlanId: null,
      scan: upstream.scan,
    };
  }

  const capabilities = await getAccountCapabilities(selectedPlan.accountId);
  const capabilityResolution = resolveExecutionCapability(capabilities);
  const confirmationShell =
    surfaceAccountContext.selectedAccount
      ? enforceAccountScopedTruth({
          label: 'Execution support',
          selectedAccount: surfaceAccountContext.selectedAccount,
          accountIds: [selectedPlan.accountId, capabilityResolution.accountId],
          value: createTradePlanConfirmationShell({
            plan: selectedPlan,
            capabilityResolution,
          }),
        })
      : createTradePlanConfirmationShell({
          plan: selectedPlan,
          capabilityResolution,
        });

  return {
    confirmationShell,
    selectedPlanId: selectedPlan.planId,
    scan: upstream.scan,
  };
}
