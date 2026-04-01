import type { Strategy } from '@/core/strategy/types';
import { dataQualityStrategy } from '@/core/strategy/strategies/dataQualityStrategy';
import { noopStrategy } from '@/core/strategy/strategies/noopStrategy';
import { runStrategies } from '@/services/strategy/runStrategiesService';
import type { ForegroundScanResult } from '@/services/types/scan';

describe('runStrategies', () => {
  const baseScan: ForegroundScanResult = {
    accountId: 'acct-1',
    symbols: ['AAPL', 'MSFT'],
    quotes: {
      AAPL: {
        symbol: 'AAPL',
        price: 101,
        source: 'stub-feed',
        timestamp: 1_700_000_000_000,
        estimated: true,
      },
      MSFT: {
        symbol: 'MSFT',
        price: 202,
        source: 'stub-feed',
        timestamp: 1_700_000_000_000,
        estimated: true,
      },
    },
    estimatedFlags: { AAPL: true, MSFT: true },
    instrumentation: {
      requests: 1,
      symbolsRequested: 2,
      symbolsFetched: 2,
      symbolsBlocked: 0,
    },
    quoteMeta: {
      role: 'execution',
      providerId: 'broker:live',
      freshness: 'FRESH',
      certainty: 'ESTIMATED',
      lastUpdatedAt: '2023-11-14T22:13:20.000Z',
      lastGoodAt: null,
      usedLastGood: false,
      fallbackUsed: false,
      requestedSymbols: ['AAPL', 'MSFT'],
      returnedSymbols: ['AAPL', 'MSFT'],
      missingSymbols: [],
      timestampMs: 1_700_000_000_000,
      providersTried: ['broker:live'],
      sourceBySymbol: {
        AAPL: 'stub-feed',
        MSFT: 'stub-feed',
      },
      policy: {
        staleIfError: 'NOT_NEEDED',
        staleWhileRevalidate: 'NOT_IMPLEMENTED_FOREGROUND_ONLY',
        cooldown: 'INACTIVE',
      },
    },
  };

  it('returns empty signals for noop strategy with or without baseline', () => {
    const withoutBaseline = runStrategies({
      scan: baseScan,
      strategies: [noopStrategy],
      nowMs: 1_700_000_123_456,
    });
    const withBaseline = runStrategies({
      scan: baseScan,
      baselineScan: baseScan,
      strategies: [noopStrategy],
      nowMs: 1_700_000_123_456,
    });

    expect(withoutBaseline).toEqual([]);
    expect(withBaseline).toEqual([]);
  });

  it('baseline is optional and does not affect data quality output', () => {
    const withoutBaseline = runStrategies({
      scan: baseScan,
      strategies: [dataQualityStrategy],
      nowMs: 1_700_000_123_456,
    });
    const withBaseline = runStrategies({
      scan: baseScan,
      baselineScan: {
        ...baseScan,
        quotes: {
          AAPL: { ...baseScan.quotes.AAPL, price: 50 },
          MSFT: { ...baseScan.quotes.MSFT, price: 100 },
        },
      },
      strategies: [dataQualityStrategy],
      nowMs: 1_700_000_123_456,
    });

    expect(withBaseline).toEqual(withoutBaseline);
  });

  it('provides pctChangeBySymbol when baselineScan is supplied', () => {
    const captureScanInputStrategy: Strategy = {
      id: 'capture-input',
      name: 'Capture Input',
      evaluate: (scan) => [
        {
          strategyId: 'capture-input',
          signalCode: 'capture_scan_input',
          severity: 'INFO',
          title: 'capture',
          message: JSON.stringify(scan.pctChangeBySymbol),
          timestampMs: 0,
          eventHint: {
            eventType: 'PRICE_MOVEMENT',
            alignmentState: 'WATCHFUL',
            confidenceScore: 0.5,
          },
        },
      ],
    };

    const result = runStrategies({
      scan: {
        ...baseScan,
        symbols: ['MSFT', 'AAPL', 'MISSING', 'ZERO'],
        quotes: {
          MSFT: { ...baseScan.quotes.MSFT, symbol: 'MSFT', price: 210 },
          AAPL: { ...baseScan.quotes.AAPL, symbol: 'AAPL', price: 121 },
          ZERO: { symbol: 'ZERO', price: 7, source: 'stub-feed', timestamp: 1, estimated: true },
        },
      },
      baselineScan: {
        ...baseScan,
        quotes: {
          MSFT: { ...baseScan.quotes.MSFT, symbol: 'MSFT', price: 200 },
          AAPL: { ...baseScan.quotes.AAPL, symbol: 'AAPL', price: 110 },
          ZERO: { symbol: 'ZERO', price: 0, source: 'stub-feed', timestamp: 1, estimated: true },
        },
      },
      strategies: [captureScanInputStrategy],
      nowMs: 1,
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.message).toBe(JSON.stringify({ MSFT: 0.05, AAPL: 0.1 }));
  });
});
