import type { Strategy, StrategySignal } from '@/core/strategy/types';

const STRATEGY_ID = 'momentum_basics';
const MOMENTUM_THRESHOLD = 0.04;
const MAX_SYMBOL_SIGNALS = 5;

function formatMomentumPct(pct: number): string {
  return `${(pct * 100).toFixed(1)}%`;
}

export const momentumBasicsStrategy: Strategy = {
  id: STRATEGY_ID,
  name: 'Momentum Basics',
  evaluate: (scan, ctx) => {
    if (!scan.pctChangeBySymbol || Object.keys(scan.pctChangeBySymbol).length === 0) {
      return [];
    }

    const estimatedSymbols = new Set(
      scan.quotes.filter((quote) => quote.estimated).map((quote) => quote.symbol),
    );

    const candidates = Object.entries(scan.pctChangeBySymbol)
      .filter(([, pct]) => pct >= MOMENTUM_THRESHOLD)
      .sort((a, b) => {
        const pctDiff = b[1] - a[1];
        if (pctDiff !== 0) {
          return pctDiff;
        }

        return a[0].localeCompare(b[0]);
      });

    if (candidates.length === 0) {
      return [];
    }

    const signals: StrategySignal[] = candidates
      .slice(0, MAX_SYMBOL_SIGNALS)
      .map(([symbol, pct]) => ({
        strategyId: STRATEGY_ID,
        signalCode: 'momentum_threshold_met',
        symbol,
        severity: 'WATCH',
        title: 'Momentum building',
        message: `${symbol} is up ~${formatMomentumPct(pct)} vs baseline. Some momentum approaches wait for pullbacks or confirmation to avoid chasing.${estimatedSymbols.has(symbol) ? ' (estimated quote)' : ''}`,
        timestampMs: ctx.nowMs,
        tags: ['delta', 'momentum', 'beginner'],
        eventHint: {
          eventType: 'MOMENTUM_BUILDING',
          alignmentState: 'WATCHFUL',
          confidenceScore: Math.min(0.95, 0.7 + pct),
          relatedSymbols: [symbol],
          metadata: {
            threshold: MOMENTUM_THRESHOLD,
            estimatedQuote: estimatedSymbols.has(symbol),
            strategyPreparedRiskContext: {
              stopPrice: {
                basis: 'BASELINE_PRICE',
              },
            },
          },
        },
      }));

    if (candidates.length > MAX_SYMBOL_SIGNALS) {
      signals.push({
        strategyId: STRATEGY_ID,
        signalCode: 'momentum_summary',
        severity: 'INFO',
        title: 'More movers',
        message: `${candidates.length} symbols are up >=4% vs baseline.`,
        timestampMs: ctx.nowMs,
        tags: ['delta', 'momentum', 'beginner'],
        eventHint: {
          eventType: 'MOMENTUM_BUILDING',
          alignmentState: 'WATCHFUL',
          confidenceScore: 0.78,
          relatedSymbols: candidates.map(([symbol]) => symbol),
          metadata: {
            qualifyingCount: candidates.length,
            threshold: MOMENTUM_THRESHOLD,
          },
        },
      });
    }

    return signals;
  },
};
