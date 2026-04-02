import type { EventLedger, EventLedgerEntry } from '@/core/types/eventLedger';
import type { StrategySignal } from '@/core/strategy/types';
import type { MarketEvent } from '@/core/types/marketEvent';
import type { Quote } from '@/core/types/quote';
import { fetchRuntimeDiagnosticsVM } from '@/services/debug/fetchRuntimeDiagnosticsVM';
import type { RuntimeDiagnosticsVM } from '@/services/debug/runtimeDiagnosticsTypes';
import type { ProviderRouterResult } from '@/services/providers/providerRouter';

export type DebugObservatoryQuoteMeta = ProviderRouterResult['meta'];

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
  runtimeDiagnostics: RuntimeDiagnosticsVM;
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
  quoteMeta: ProviderRouterResult['meta'];
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
  quoteMeta: ProviderRouterResult['meta'],
): DebugObservatoryQuoteMeta {
  return quoteMeta;
}

export function buildDebugObservatoryPayload(
  params: BuildDebugObservatoryPayloadParams,
): DebugObservatoryPayload {
  const quoteMeta = buildQuoteMeta(params.quoteMeta);

  return {
    timestampMs: params.timestampMs,
    symbols: params.symbols,
    quoteResult: {
      quotes: params.quotes,
      meta: quoteMeta,
    },
    runtimeDiagnostics: fetchRuntimeDiagnosticsVM({
      quoteResult: {
        quotes: params.quotes,
        meta: quoteMeta,
      },
      symbols: params.symbols,
    }),
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
