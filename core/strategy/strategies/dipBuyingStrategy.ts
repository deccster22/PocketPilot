import type { Strategy, StrategySignal } from '@/core/strategy/types';

const STRATEGY_ID = 'dip_buying';
const DIP_THRESHOLD = -0.04;
const MAX_SYMBOL_SIGNALS = 5;

function formatDipPct(pct: number): string {
  return `${Math.abs(pct * 100).toFixed(1)}%`;
}

export const dipBuyingStrategy: Strategy = {
  id: STRATEGY_ID,
  name: 'Dip Buying',
  evaluate: (scan, ctx) => {
    if (!scan.pctChangeBySymbol || Object.keys(scan.pctChangeBySymbol).length === 0) {
      return [];
    }

    const estimatedSymbols = new Set(
      scan.quotes.filter((quote) => quote.estimated).map((quote) => quote.symbol),
    );

    const candidates = Object.entries(scan.pctChangeBySymbol)
      .filter(([, pct]) => pct <= DIP_THRESHOLD)
      .sort((a, b) => {
        const pctDiff = a[1] - b[1];
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
        symbol,
        severity: 'WATCH',
        title: 'Dip detected',
        message: `${symbol} is down ~${formatDipPct(pct)} vs baseline. Some dip strategies look for confirmation before acting.${estimatedSymbols.has(symbol) ? ' (estimated quote)' : ''}`,
        timestampMs: ctx.nowMs,
        tags: ['delta', 'dip', 'beginner'],
      }));

    if (candidates.length > MAX_SYMBOL_SIGNALS) {
      signals.push({
        strategyId: STRATEGY_ID,
        severity: 'INFO',
        title: 'More dips',
        message: `${candidates.length} symbols are down >=4% vs baseline.`,
        timestampMs: ctx.nowMs,
        tags: ['delta', 'dip', 'beginner'],
      });
    }

    return signals;
  },
};
