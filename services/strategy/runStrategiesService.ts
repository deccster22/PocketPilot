import type {
  Strategy,
  StrategyContext,
  StrategyScanInput,
  StrategySignal,
} from '@/core/strategy/types';
import { pctChange } from '@/core/utils/pctChange';

import type { ForegroundScanResult } from '@/services/types/scan';

export function runStrategies(params: {
  scan: ForegroundScanResult;
  baselineScan?: ForegroundScanResult;
  strategies: Strategy[];
  nowMs: number;
}): StrategySignal[] {
  const input: StrategyScanInput = {
    accountId: params.scan.accountId,
    symbols: params.scan.symbols,
    quotes: Object.values(params.scan.quotes),
    instrumentation: params.scan.instrumentation,
  };

  if (params.baselineScan) {
    const baselineQuotesBySymbol = params.baselineScan.quotes;
    const currentQuotesBySymbol = params.scan.quotes;
    const pctChangeBySymbol: Record<string, number> = {};

    for (const symbol of params.scan.symbols) {
      const baselineQuote = baselineQuotesBySymbol[symbol];
      const currentQuote = currentQuotesBySymbol[symbol];

      if (!baselineQuote || !currentQuote) {
        continue;
      }

      const delta = pctChange({ previous: baselineQuote.price, current: currentQuote.price });
      if (delta !== null) {
        pctChangeBySymbol[symbol] = delta;
      }
    }

    input.baselineQuotesBySymbol = baselineQuotesBySymbol;
    input.pctChangeBySymbol = pctChangeBySymbol;
  }

  const context: StrategyContext = {
    nowMs: params.nowMs,
  };

  return params.strategies.flatMap((strategy) => strategy.evaluate(input, context));
}
