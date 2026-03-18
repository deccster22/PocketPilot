import type { EventLedger, EventLedgerEntry } from '@/core/types/eventLedger';
import type { StrategySignal } from '@/core/strategy/types';
import type { MarketEvent } from '@/core/types/marketEvent';
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
  marketEvents?: MarketEvent[];
  eventLedger?: {
    liveEvents: MarketEvent[];
    persistedEvents: EventLedgerEntry[];
    liveEventIds: string[];
    persistedEventIds: string[];
    countsMatch: boolean;
    sequencesMatch: boolean;
  };
  snapshot?: DebugObservatorySnapshot;
};

export type BuildDebugObservatoryPayloadParams = {
  timestampMs: number;
  symbols: string[];
  quotes: Record<string, Quote>;
  quoteMeta?: ProviderRouterResult['meta'];
  deltas?: Record<string, number>;
  strategySignals?: StrategySignal[];
  marketEvents?: MarketEvent[];
  eventLedger?: Pick<EventLedger, 'getEventsByAccount'>;
  accountId?: string;
  snapshot?: DebugObservatorySnapshot;
};

function buildEventLedgerComparison(params: {
  accountId?: string;
  marketEvents?: MarketEvent[];
  eventLedger?: Pick<EventLedger, 'getEventsByAccount'>;
}) {
  if (!params.marketEvents || !params.eventLedger || !params.accountId) {
    return undefined;
  }

  const persistedEvents = params
    .eventLedger.getEventsByAccount(params.accountId)
    .slice(-params.marketEvents.length);
  const liveEventIds = params.marketEvents.map((event) => event.eventId);
  const persistedEventIds = persistedEvents.map((event) => event.eventId);

  return {
    liveEvents: params.marketEvents,
    persistedEvents,
    liveEventIds,
    persistedEventIds,
    countsMatch: liveEventIds.length === persistedEventIds.length,
    sequencesMatch:
      liveEventIds.length === persistedEventIds.length &&
      liveEventIds.every((eventId, index) => eventId === persistedEventIds[index]),
  };
}

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
    marketEvents: params.marketEvents,
    eventLedger: buildEventLedgerComparison({
      accountId: params.accountId,
      marketEvents: params.marketEvents,
      eventLedger: params.eventLedger,
    }),
    snapshot: params.snapshot,
  };
}
