export type RiskToolInput = {
  accountSize: number | null;
  riskAmount: number | null;
  riskPercent: number | null;
  entryPrice: number | null;
  stopPrice: number | null;
  targetPrice: number | null;
  symbol: string | null;
};

export type RiskToolState = 'UNAVAILABLE' | 'INCOMPLETE' | 'READY';

export type RiskToolSummary = {
  state: RiskToolState;
  symbol: string | null;
  entryPrice: number | null;
  stopPrice: number | null;
  targetPrice: number | null;
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
};
