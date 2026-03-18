import type { AlignmentState, EventType, MarketEventMetadata } from '@/core/types/marketEvent';
import type { Quote } from '@/core/types/quote';

export type StrategyId = string;

export type StrategySignalSeverity = 'INFO' | 'WATCH' | 'ACTION';

export type StrategySignal = {
  strategyId: StrategyId;
  signalCode: string;
  symbol?: string;
  severity: StrategySignalSeverity;
  title: string;
  message: string;
  timestampMs: number;
  tags?: string[];
  eventHint: StrategySignalEventHint;
};

export type StrategySignalEventHint = {
  eventType: EventType;
  alignmentState: AlignmentState;
  confidenceScore: number;
  relatedSymbols?: string[];
  metadata?: MarketEventMetadata;
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
  baselineQuotesBySymbol?: Record<string, Quote>;
  pctChangeBySymbol?: Record<string, number>;
};

export type Strategy = {
  id: StrategyId;
  name: string;
  evaluate: (scan: StrategyScanInput, ctx: StrategyContext) => StrategySignal[];
};
