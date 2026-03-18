import type { Certainty, MarketEvent, MarketEventMetadata } from '@/core/types/marketEvent';
import type { StrategySignal } from '@/core/strategy/types';
import type { Quote } from '@/core/types/quote';

function clampConfidenceScore(confidenceScore: number): number {
  if (confidenceScore < 0) {
    return 0;
  }

  if (confidenceScore > 1) {
    return 1;
  }

  return Number(confidenceScore.toFixed(4));
}

function createEventId(params: {
  timestamp: number;
  accountId: string;
  strategyId: string;
  signalCode: string;
  symbol: string | null;
}): string {
  return [
    params.accountId,
    params.strategyId,
    params.signalCode,
    params.symbol ?? 'account',
    String(params.timestamp),
  ].join(':');
}

function resolveRelatedSymbols(signal: StrategySignal): string[] {
  if (signal.eventHint.relatedSymbols && signal.eventHint.relatedSymbols.length > 0) {
    return [...signal.eventHint.relatedSymbols];
  }

  return signal.symbol ? [signal.symbol] : [];
}

function resolveCertainty(
  quotesBySymbol: Record<string, Quote>,
  relatedSymbols: string[],
): Certainty {
  if (relatedSymbols.some((symbol) => quotesBySymbol[symbol]?.estimated)) {
    return 'estimated';
  }

  return 'confirmed';
}

function buildMetadata(signal: StrategySignal, relatedSymbols: string[]): MarketEventMetadata {
  return {
    signalSeverity: signal.severity,
    signalTitle: signal.title,
    signalTags: signal.tags ?? [],
    relatedSymbols,
    ...(signal.eventHint.metadata ?? {}),
  };
}

export function createMarketEvents(params: {
  accountId: string;
  quotesBySymbol: Record<string, Quote>;
  pctChangeBySymbol?: Record<string, number>;
  signals: StrategySignal[];
}): MarketEvent[] {
  return params.signals.map((signal) => {
    const relatedSymbols = resolveRelatedSymbols(signal);
    const primarySymbol = signal.symbol ?? relatedSymbols[0] ?? null;
    const quote = primarySymbol ? params.quotesBySymbol[primarySymbol] : undefined;

    return {
      eventId: createEventId({
        timestamp: signal.timestampMs,
        accountId: params.accountId,
        strategyId: signal.strategyId,
        signalCode: signal.signalCode,
        symbol: primarySymbol,
      }),
      timestamp: signal.timestampMs,
      accountId: params.accountId,
      symbol: primarySymbol,
      strategyId: signal.strategyId,
      eventType: signal.eventHint.eventType,
      alignmentState: signal.eventHint.alignmentState,
      signalsTriggered: [signal.signalCode],
      confidenceScore: clampConfidenceScore(signal.eventHint.confidenceScore),
      certainty: resolveCertainty(params.quotesBySymbol, relatedSymbols),
      price: quote?.price ?? null,
      pctChange: primarySymbol ? (params.pctChangeBySymbol?.[primarySymbol] ?? null) : null,
      metadata: buildMetadata(signal, relatedSymbols),
    };
  });
}
