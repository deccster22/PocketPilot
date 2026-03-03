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
        severity: 'WATCH',
        title: 'Scan incomplete',
        message: `${scan.instrumentation.symbolsBlocked} symbols were blocked by quote budget limits, so some quotes may be missing.`,
        timestampMs: ctx.nowMs,
        tags: ['data', 'budget'],
      });
    }

    const estimatedQuotes = scan.quotes
      .filter((quote) => quote.estimated)
      .sort((a, b) => a.symbol.localeCompare(b.symbol));

    const estimatedSymbolSignals = estimatedQuotes.slice(0, MAX_ESTIMATED_SYMBOL_SIGNALS);

    for (const quote of estimatedSymbolSignals) {
      signals.push({
        strategyId: STRATEGY_ID,
        symbol: quote.symbol,
        severity: 'INFO',
        title: 'Estimated quote',
        message: 'Price may be delayed or inferred.',
        timestampMs: ctx.nowMs,
        tags: ['data', 'estimated'],
      });
    }

    if (estimatedQuotes.length > MAX_ESTIMATED_SYMBOL_SIGNALS) {
      signals.push({
        strategyId: STRATEGY_ID,
        severity: 'INFO',
        title: 'Estimated quotes present',
        message: `${estimatedQuotes.length} symbols are estimated.`,
        timestampMs: ctx.nowMs,
        tags: ['data', 'estimated'],
      });
    }

    return signals;
  },
};
