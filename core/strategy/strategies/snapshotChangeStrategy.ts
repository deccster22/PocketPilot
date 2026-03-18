import type { Strategy, StrategySignal } from '@/core/strategy/types';

const STRATEGY_ID = 'snapshot_change';
const MOVEMENT_THRESHOLD = 0.03;
const MAX_SYMBOL_SIGNALS = 5;

function formatDirectionAndPct(pct: number): string {
  const direction = pct >= 0 ? 'up' : 'down';
  const pctText = `${Math.abs(pct * 100).toFixed(1)}%`;

  return `${direction} ~${pctText}`;
}

export const snapshotChangeStrategy: Strategy = {
  id: STRATEGY_ID,
  name: 'Snapshot Change',
  evaluate: (scan, ctx) => {
    if (!scan.pctChangeBySymbol || Object.keys(scan.pctChangeBySymbol).length === 0) {
      return [];
    }

    const qualifying = Object.entries(scan.pctChangeBySymbol)
      .filter(([, pct]) => Math.abs(pct) >= MOVEMENT_THRESHOLD)
      .sort((a, b) => {
        const absDiff = Math.abs(b[1]) - Math.abs(a[1]);
        if (absDiff !== 0) {
          return absDiff;
        }

        return a[0].localeCompare(b[0]);
      });

    if (qualifying.length === 0) {
      return [];
    }

    const signals: StrategySignal[] = qualifying
      .slice(0, MAX_SYMBOL_SIGNALS)
      .map(([symbol, pct]) => ({
        strategyId: STRATEGY_ID,
        signalCode: 'snapshot_move_threshold_met',
        symbol,
        severity: 'WATCH',
        title: 'Fast move',
        message: `${symbol} is ${formatDirectionAndPct(pct)} vs baseline.`,
        timestampMs: ctx.nowMs,
        tags: ['delta', 'snapshot'],
        eventHint: {
          eventType: 'PRICE_MOVEMENT',
          alignmentState: 'WATCHFUL',
          confidenceScore: Math.min(0.92, 0.68 + Math.abs(pct)),
          relatedSymbols: [symbol],
          metadata: {
            threshold: MOVEMENT_THRESHOLD,
            direction: pct >= 0 ? 'up' : 'down',
          },
        },
      }));

    if (qualifying.length > MAX_SYMBOL_SIGNALS) {
      signals.push({
        strategyId: STRATEGY_ID,
        signalCode: 'snapshot_move_summary',
        severity: 'INFO',
        title: 'More movers',
        message: `${qualifying.length} symbols moved >=3% vs baseline.`,
        timestampMs: ctx.nowMs,
        tags: ['delta', 'snapshot'],
        eventHint: {
          eventType: 'PRICE_MOVEMENT',
          alignmentState: 'WATCHFUL',
          confidenceScore: 0.76,
          relatedSymbols: qualifying.map(([symbol]) => symbol),
          metadata: {
            qualifyingCount: qualifying.length,
            threshold: MOVEMENT_THRESHOLD,
          },
        },
      });
    }

    return signals;
  },
};
