import type { Quote } from '@/core/types/quote';

export type StrategyId = string;

export type StrategySignalSeverity = 'INFO' | 'WATCH' | 'ACTION';

export type StrategySignal = {
  strategyId: StrategyId;
  symbol?: string;
  severity: StrategySignalSeverity;
  title: string;
  message: string;
  timestampMs: number;
  tags?: string[];
};

export type StrategyContext = {
  nowMs: number;
};

export type StrategyScanInstrumentation = {
  requests: number;
  symbolsRequested: number;
  symbolsFetched: number;
  symbolsBlocked: number;
};

export type StrategyScanInput = {
  accountId: string;
  symbols: string[];
  quotes: Quote[];
  instrumentation: StrategyScanInstrumentation;
};

export type Strategy = {
  id: StrategyId;
  name: string;
  evaluate: (scan: StrategyScanInput, ctx: StrategyContext) => StrategySignal[];
};
