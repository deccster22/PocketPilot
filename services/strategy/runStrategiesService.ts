import type {
  Strategy,
  StrategyContext,
  StrategyScanInput,
  StrategySignal,
} from '@/core/strategy/types';
import type { ForegroundScanResult } from '@/services/types/scan';

export function runStrategies(params: {
  scan: ForegroundScanResult;
  strategies: Strategy[];
  nowMs: number;
}): StrategySignal[] {
  const input: StrategyScanInput = {
    accountId: params.scan.accountId,
    symbols: params.scan.symbols,
    quotes: params.scan.quotes,
    instrumentation: params.scan.instrumentation,
  };

  const context: StrategyContext = {
    nowMs: params.nowMs,
  };

  return params.strategies.flatMap((strategy) => strategy.evaluate(input, context));
}
