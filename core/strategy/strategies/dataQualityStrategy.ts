import type { Strategy, StrategySignal } from '@/core/strategy/types';

const STRATEGY_ID = 'data_quality';
const MAX_ESTIMATED_SYMBOL_SIGNALS = 5;

export const dataQualityStrategy: Strategy = {
  id: STRATEGY_ID,
  name: 'Data Quality',
  evaluate: (scan, ctx) => {
    const signals: StrategySignal[] = [];

    if (scan.instrumentation.symbolsBlocked > 0) {
      signals.push({
        strategyId: STRATEGY_ID,
        signalCode: 'budget_blocked_symbols',
        severity: 'WATCH',
        title: 'Scan incomplete',
        message: `${scan.instrumentation.symbolsBlocked} symbols were blocked by quote budget limits, so some quotes may be missing.`,
        timestampMs: ctx.nowMs,
        tags: ['data', 'budget'],
        eventHint: {
          eventType: 'DATA_QUALITY',
          alignmentState: 'NEEDS_REVIEW',
          confidenceScore: 0.98,
          metadata: {
            blockedSymbols: scan.instrumentation.symbolsBlocked,
            requestedSymbols: scan.instrumentation.symbolsRequested,
          },
        },
      });
    }

    const estimatedQuotes = scan.quotes
      .filter((quote) => quote.estimated)
      .sort((a, b) => a.symbol.localeCompare(b.symbol));

    const estimatedSymbolSignals = estimatedQuotes.slice(0, MAX_ESTIMATED_SYMBOL_SIGNALS);

    for (const quote of estimatedSymbolSignals) {
      signals.push({
        strategyId: STRATEGY_ID,
        signalCode: 'estimated_quote',
        symbol: quote.symbol,
        severity: 'INFO',
        title: 'Estimated quote',
        message: 'Price may be delayed or inferred.',
        timestampMs: ctx.nowMs,
        tags: ['data', 'estimated'],
        eventHint: {
          eventType: 'ESTIMATED_PRICE',
          alignmentState: 'WATCHFUL',
          confidenceScore: 0.8,
          relatedSymbols: [quote.symbol],
          metadata: {
            quoteSource: quote.source ?? 'unknown',
          },
        },
      });
    }

    if (estimatedQuotes.length > MAX_ESTIMATED_SYMBOL_SIGNALS) {
      signals.push({
        strategyId: STRATEGY_ID,
        signalCode: 'estimated_quotes_present',
        severity: 'INFO',
        title: 'Estimated quotes present',
        message: `${estimatedQuotes.length} symbols are estimated.`,
        timestampMs: ctx.nowMs,
        tags: ['data', 'estimated'],
        eventHint: {
          eventType: 'ESTIMATED_PRICE',
          alignmentState: 'WATCHFUL',
          confidenceScore: 0.82,
          relatedSymbols: estimatedQuotes.map((quote) => quote.symbol),
          metadata: {
            estimatedSymbols: estimatedQuotes.map((quote) => quote.symbol),
            estimatedCount: estimatedQuotes.length,
          },
        },
      });
    }

    return signals;
  },
};
