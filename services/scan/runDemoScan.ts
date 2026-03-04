import { STRATEGY_BUNDLES } from '@/core/strategy/bundles';
import { defaultBundleIdsForProfile } from '@/core/strategy/profileDefaults';
import { indexQuotesBySymbol } from '@/core/utils/quoteIndex';
import { resolveActiveStrategies } from '@/services/strategy/activeStrategiesService';
import { runStrategies } from '@/services/strategy/runStrategiesService';
import type { ForegroundScanResult } from '@/services/types/scan';

import type { UserProfile } from '@/app/state/profileState';

const DEMO_SYMBOLS = ['BTC', 'ETH', 'SOL', 'DOGE'] as const;

type DemoScanOutput = {
  scan: ForegroundScanResult;
  signals: ReturnType<typeof runStrategies>;
  pctChangeBySymbol: Record<string, number>;
  bundleName: string;
};

function buildBaselineScan(nowMs: number): ForegroundScanResult {
  return {
    accountId: 'acct-demo',
    symbols: [...DEMO_SYMBOLS],
    quotes: [
      { symbol: 'BTC', price: 100, source: 'demo-feed', timestampMs: nowMs - 60_000, estimated: false },
      { symbol: 'ETH', price: 100, source: 'demo-feed', timestampMs: nowMs - 60_000, estimated: false },
      { symbol: 'SOL', price: 100, source: 'demo-feed', timestampMs: nowMs - 60_000, estimated: false },
      { symbol: 'DOGE', price: 100, source: 'demo-feed', timestampMs: nowMs - 60_000, estimated: true },
    ],
    instrumentation: {
      requests: 1,
      symbolsRequested: DEMO_SYMBOLS.length,
      symbolsFetched: DEMO_SYMBOLS.length,
      symbolsBlocked: 0,
    },
  };
}

function buildCurrentScan(nowMs: number): ForegroundScanResult {
  return {
    accountId: 'acct-demo',
    symbols: [...DEMO_SYMBOLS],
    quotes: [
      { symbol: 'BTC', price: 106, source: 'demo-feed', timestampMs: nowMs, estimated: false },
      { symbol: 'ETH', price: 94, source: 'demo-feed', timestampMs: nowMs, estimated: false },
      { symbol: 'SOL', price: 102, source: 'demo-feed', timestampMs: nowMs, estimated: false },
      { symbol: 'DOGE', price: 89, source: 'demo-feed', timestampMs: nowMs, estimated: true },
    ],
    instrumentation: {
      requests: 1,
      symbolsRequested: DEMO_SYMBOLS.length,
      symbolsFetched: DEMO_SYMBOLS.length,
      symbolsBlocked: 0,
    },
  };
}

function calculatePctChangeBySymbol(
  baselineScan: ForegroundScanResult,
  currentScan: ForegroundScanResult,
): Record<string, number> {
  const baselineBySymbol = indexQuotesBySymbol(baselineScan.quotes);
  const currentBySymbol = indexQuotesBySymbol(currentScan.quotes);

  return currentScan.symbols.reduce<Record<string, number>>((acc, symbol) => {
    const baseline = baselineBySymbol[symbol];
    const current = currentBySymbol[symbol];

    if (!baseline || !current || baseline.price === 0) {
      return acc;
    }

    acc[symbol] = (current.price - baseline.price) / baseline.price;
    return acc;
  }, {});
}

export function runDemoScan(params: { profile: UserProfile; nowMs: number }): DemoScanOutput {
  const baselineScan = buildBaselineScan(params.nowMs);
  const scan = buildCurrentScan(params.nowMs);
  const strategies = resolveActiveStrategies({ profile: params.profile });
  const signals = runStrategies({
    scan,
    baselineScan,
    strategies,
    nowMs: params.nowMs,
  });

  const defaultBundleId = defaultBundleIdsForProfile(params.profile)[0];
  const bundleName =
    STRATEGY_BUNDLES.find((bundle) => bundle.id === defaultBundleId)?.name ?? 'Unknown bundle';

  return {
    scan,
    signals,
    pctChangeBySymbol: calculatePctChangeBySymbol(baselineScan, scan),
    bundleName,
  };
}
