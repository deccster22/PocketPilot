import type { UserProfile } from '@/core/profile/types';
import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import type { LastViewedState } from '@/services/orientation/lastViewedState';
import { createSurfaceAccountContext } from '@/services/accounts/createSurfaceAccountContext';
import { createContextualKnowledgeLane } from '@/services/knowledge/createContextualKnowledgeLane';
import { createInlineGlossaryHelp } from '@/services/knowledge/createInlineGlossaryHelp';
import type { InlineGlossaryAvailability } from '@/services/knowledge/types';
import { createTradeHubRiskLane } from '@/services/trade/createTradeHubRiskLane';
import { createProtectionPlans } from '@/services/trade/createProtectionPlans';
import { createTradeHubSurfaceModel } from '@/services/trade/createTradeHubSurfaceModel';
import type { GuardrailPreferencesStore } from '@/services/trade/guardrailPreferencesStore';
import type { PreferredRiskBasisStore } from '@/services/trade/preferredRiskBasisStore';
import { resolveSelectedTradePlan } from '@/services/trade/resolveSelectedTradePlan';
import { selectAccountScopedProtectionPlans } from '@/services/trade/selectAccountScopedProtectionPlans';
import { TRADE_HUB_SAFETY_TEXT } from '@/services/trade/tradeHubCopy';
import type { RiskBasis, TradeHubSurfaceModel } from '@/services/trade/types';
import type { ForegroundScanResult } from '@/services/types/scan';
import { fetchSurfaceContext } from '@/services/upstream/fetchSurfaceContext';

export type TradeHubVM = {
  contextualKnowledgeLane: ReturnType<typeof createContextualKnowledgeLane>;
  inlineGlossaryHelp: InlineGlossaryAvailability;
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
  guardrailPreferencesStore?: Pick<GuardrailPreferencesStore, 'load'>;
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
    selectedPlanId: params.selectedPlanId ?? undefined,
  });
  const riskLane = await createTradeHubRiskLane({
    plan: selectedPlan,
    selectedRiskBasis: params.selectedRiskBasis,
    accountId: surfaceAccountContext.selectedAccountId,
    accountContext: surfaceAccountContext.riskContext,
    guardrailPreferencesStore: params.guardrailPreferencesStore,
    preferredRiskBasisStore: params.preferredRiskBasisStore,
  });
  const model = createTradeHubSurfaceModel({
    profile: params.profile,
    protectionPlans,
    riskLane,
  });
  const inlineGlossaryHelp = createInlineGlossaryHelp({
    profile: params.profile,
    surface: 'TRADE_HUB_SAFETY',
    text: TRADE_HUB_SAFETY_TEXT,
    accountId: surfaceAccountContext.selectedAccountId,
  });

  return {
    contextualKnowledgeLane: createContextualKnowledgeLane({
      profile: params.profile,
      surface: 'TRADE_HUB',
      tradeHubSurface: model,
      marketEvents: upstream.marketEvents,
    }),
    inlineGlossaryHelp,
    model,
    scan: upstream.scan,
  };
}
