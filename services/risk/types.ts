import type { TradeHubHelpAffordanceAvailability } from '@/services/knowledge/types';

export type RiskReferenceSource = 'USER_INPUT' | 'PREPARED_QUOTE' | 'PREPARED_PLAN' | 'UNAVAILABLE';

export type RiskReferenceValue = {
  value: number | null;
  source: RiskReferenceSource;
};

export type PreparedRiskQuoteContext = {
  currentPrice: number | null;
};

export type PreparedRiskPlanContext = {
  entryPrice: number | null;
  stopPrice: number | null;
  targetPrice: number | null;
};

export type RiskToolReferences = {
  entryReference: RiskReferenceValue;
  stopReference: RiskReferenceValue;
  targetReference: RiskReferenceValue;
};

export type RiskToolInput = {
  accountSize: number | null;
  riskAmount: number | null;
  riskPercent: number | null;
  entryPrice: number | null;
  stopPrice: number | null;
  targetPrice: number | null;
  symbol: string | null;
  allowPreparedReferences?: boolean;
};

export type RiskToolState = 'UNAVAILABLE' | 'INCOMPLETE' | 'READY';

export type RiskToolSummary = {
  state: RiskToolState;
  symbol: string | null;
  entryPrice: number | null;
  stopPrice: number | null;
  targetPrice: number | null;
  entryReference: RiskReferenceValue;
  stopReference: RiskReferenceValue;
  targetReference: RiskReferenceValue;
  stopDistance: number | null;
  riskAmount: number | null;
  riskPercent: number | null;
  positionSize: number | null;
  rewardRiskRatio: number | null;
  notes: ReadonlyArray<string>;
};

export type RiskToolVM = {
  generatedAt: string | null;
  summary: RiskToolSummary;
  inlineHelpAffordances: TradeHubHelpAffordanceAvailability;
};
