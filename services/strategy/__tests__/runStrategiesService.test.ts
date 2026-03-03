import type { Strategy } from '@/core/strategy/types';
import { noopStrategy } from '@/core/strategy/strategies/noopStrategy';
import { runStrategies } from '@/services/strategy/runStrategiesService';
import type { ForegroundScanResult } from '@/services/types/scan';

describe('runStrategies', () => {
  const baseScan: ForegroundScanResult = {
    accountId: 'acct-1',
    symbols: ['AAPL', 'MSFT'],
    quotes: [
      {
        symbol: 'AAPL',
        price: 101,
        source: 'stub-feed',
        timestampMs: 1_700_000_000_000,
        estimated: true,
      },
      {
        symbol: 'MSFT',
        price: 202,
        source: 'stub-feed',
        timestampMs: 1_700_000_000_000,
        estimated: true,
      },
    ],
    instrumentation: {
      requests: 1,
      symbolsRequested: 2,
      symbolsFetched: 2,
      symbolsBlocked: 0,
    },
  };

  it('returns empty signals for noop strategy', () => {
    const result = runStrategies({
      scan: baseScan,
      strategies: [noopStrategy],
      nowMs: 1_700_000_123_456,
    });

    expect(result).toEqual([]);
  });

  it('preserves deterministic ordering by strategy then signal', () => {
    const strategyA: Strategy = {
      id: 'strategy-a',
      name: 'Strategy A',
      evaluate: (_scan, ctx) => [
        {
          strategyId: 'strategy-a',
          severity: 'INFO',
          title: 'A1',
          message: 'first from A',
          timestampMs: ctx.nowMs,
        },
        {
          strategyId: 'strategy-a',
          severity: 'WATCH',
          title: 'A2',
          message: 'second from A',
          timestampMs: ctx.nowMs,
        },
      ],
    };

    const strategyB: Strategy = {
      id: 'strategy-b',
      name: 'Strategy B',
      evaluate: (_scan, ctx) => [
        {
          strategyId: 'strategy-b',
          severity: 'ACTION',
          title: 'B1',
          message: 'first from B',
          timestampMs: ctx.nowMs,
        },
      ],
    };

    const result = runStrategies({
      scan: baseScan,
      strategies: [strategyA, strategyB],
      nowMs: 1_700_000_222_333,
    });

    expect(result.map((signal) => signal.title)).toEqual(['A1', 'A2', 'B1']);
  });

  it('passes nowMs through strategy context', () => {
    const nowMs = 1_700_000_999_111;

    const passthroughStrategy: Strategy = {
      id: 'ctx-check',
      name: 'Context Check',
      evaluate: (_scan, ctx) => [
        {
          strategyId: 'ctx-check',
          severity: 'INFO',
          title: 'ctx',
          message: 'uses provided nowMs',
          timestampMs: ctx.nowMs,
        },
      ],
    };

    const [signal] = runStrategies({
      scan: baseScan,
      strategies: [passthroughStrategy],
      nowMs,
    });

    expect(signal.timestampMs).toBe(nowMs);
  });
});
