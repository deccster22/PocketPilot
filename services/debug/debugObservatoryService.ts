import type { StrategySignal } from '@/core/strategy/types';
import type { Quote } from '@/core/types/quote';
import type { ProviderRouterResult } from '@/services/providers/providerRouter';

export type DebugObservatoryQuoteMeta = {
  provider: string;
  fallbackUsed: boolean;
  requestedSymbols: string[];
  returnedSymbols: string[];
  missingSymbols: string[];
  timestampMs: number;
  providersTried?: string[];
  sourceBySymbol?: Record<string, string | undefined>;
};

export type DebugObservatorySnapshot = {
  portfolioValue: number;
  change24h: number;
  strategyAlignment: string;
  bundleName: string;
  accountId: string;
};

export type DebugObservatoryPayload = {
  timestampMs: number;
  symbols: string[];
  quoteResult: {
    quotes: Record<string, Quote>;
    meta: DebugObservatoryQuoteMeta;
  };
  deltas?: Record<string, number>;
  strategySignals?: StrategySignal[];
  snapshot?: DebugObservatorySnapshot;
};

export type BuildDebugObservatoryPayloadParams = {
  timestampMs: number;
  symbols: string[];
  quotes: Record<string, Quote>;
  quoteMeta?: ProviderRouterResult['meta'];
  deltas?: Record<string, number>;
  strategySignals?: StrategySignal[];
  snapshot?: DebugObservatorySnapshot;
};

function buildQuoteMeta(
  timestampMs: number,
  symbols: string[],
  quotes: Record<string, Quote>,
  quoteMeta?: ProviderRouterResult['meta'],
): DebugObservatoryQuoteMeta {
  const requestedSymbols = quoteMeta?.requestedSymbols ?? symbols;
  const returnedSymbols =
    quoteMeta?.returnedSymbols ?? requestedSymbols.filter((symbol) => Boolean(quotes[symbol]));
  const missingSymbols =
    quoteMeta?.missingSymbols ?? requestedSymbols.filter((symbol) => !quotes[symbol]);

  const sourceBySymbol =
    quoteMeta?.sourceBySymbol ??
    returnedSymbols.reduce<Record<string, string | undefined>>((acc, symbol) => {
      acc[symbol] = quotes[symbol]?.source;
      return acc;
    }, {});

  return {
    provider: quoteMeta?.provider ?? 'unknown',
    fallbackUsed: quoteMeta?.fallbackUsed ?? false,
    requestedSymbols,
    returnedSymbols,
    missingSymbols,
    timestampMs: quoteMeta?.timestampMs ?? timestampMs,
    providersTried: quoteMeta?.providersTried,
    sourceBySymbol,
  };
}

export function buildDebugObservatoryPayload(
  params: BuildDebugObservatoryPayloadParams,
): DebugObservatoryPayload {
  return {
    timestampMs: params.timestampMs,
    symbols: params.symbols,
    quoteResult: {
      quotes: params.quotes,
      meta: buildQuoteMeta(params.timestampMs, params.symbols, params.quotes, params.quoteMeta),
    },
    deltas: params.deltas,
    strategySignals: params.strategySignals,
    snapshot: params.snapshot,
  };
}
