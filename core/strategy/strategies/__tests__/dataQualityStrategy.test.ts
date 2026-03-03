import type { StrategyContext, StrategyScanInput } from '@/core/strategy/types';
import { dataQualityStrategy } from '@/core/strategy/strategies/dataQualityStrategy';

describe('dataQualityStrategy', () => {
  const ctx: StrategyContext = { nowMs: 1_700_000_555_123 };

  function createScan(overrides?: Partial<StrategyScanInput>): StrategyScanInput {
    return {
      accountId: 'acct-1',
      symbols: [],
      quotes: [],
      instrumentation: {
        requests: 1,
        symbolsRequested: 0,
        symbolsFetched: 0,
        symbolsBlocked: 0,
      },
      ...overrides,
    };
  }

  it('returns WATCH signal when symbolsBlocked > 0', () => {
    const result = dataQualityStrategy.evaluate(
      createScan({
        instrumentation: {
          requests: 1,
          symbolsRequested: 10,
          symbolsFetched: 8,
          symbolsBlocked: 2,
        },
      }),
      ctx,
    );

    expect(result).toContainEqual({
      strategyId: 'data_quality',
      severity: 'WATCH',
      title: 'Scan incomplete',
      message: '2 symbols were blocked by quote budget limits, so some quotes may be missing.',
      timestampMs: ctx.nowMs,
      tags: ['data', 'budget'],
    });
  });

  it('returns per-symbol estimated signals sorted by symbol', () => {
    const result = dataQualityStrategy.evaluate(
      createScan({
        quotes: [
          { symbol: 'MSFT', price: 201, source: 'stub', timestampMs: 10, estimated: true },
          { symbol: 'AAPL', price: 101, source: 'stub', timestampMs: 10, estimated: true },
          { symbol: 'GOOG', price: 301, source: 'stub', timestampMs: 10, estimated: false },
        ],
      }),
      ctx,
    );

    expect(result).toHaveLength(2);
    expect(result.map((signal) => signal.symbol)).toEqual(['AAPL', 'MSFT']);
    expect(result.map((signal) => signal.title)).toEqual(['Estimated quote', 'Estimated quote']);
  });

  it('caps to 5 per-symbol + adds summary when more than 5 estimated quotes exist', () => {
    const result = dataQualityStrategy.evaluate(
      createScan({
        quotes: [
          { symbol: 'EEE', price: 5, source: 'stub', timestampMs: 10, estimated: true },
          { symbol: 'AAA', price: 1, source: 'stub', timestampMs: 10, estimated: true },
          { symbol: 'DDD', price: 4, source: 'stub', timestampMs: 10, estimated: true },
          { symbol: 'GGG', price: 7, source: 'stub', timestampMs: 10, estimated: true },
          { symbol: 'CCC', price: 3, source: 'stub', timestampMs: 10, estimated: true },
          { symbol: 'BBB', price: 2, source: 'stub', timestampMs: 10, estimated: true },
          { symbol: 'FFF', price: 6, source: 'stub', timestampMs: 10, estimated: true },
        ],
      }),
      ctx,
    );

    expect(result).toHaveLength(6);
    expect(result.slice(0, 5).map((signal) => signal.symbol)).toEqual([
      'AAA',
      'BBB',
      'CCC',
      'DDD',
      'EEE',
    ]);

    expect(result[5]).toEqual({
      strategyId: 'data_quality',
      severity: 'INFO',
      title: 'Estimated quotes present',
      message: '7 symbols are estimated.',
      timestampMs: ctx.nowMs,
      tags: ['data', 'estimated'],
    });
  });

  it('returns [] when no issues', () => {
    const result = dataQualityStrategy.evaluate(
      createScan({
        quotes: [
          { symbol: 'AAPL', price: 101, source: 'stub', timestampMs: 10, estimated: false },
          { symbol: 'MSFT', price: 201, source: 'stub', timestampMs: 10, estimated: false },
        ],
      }),
      ctx,
    );

    expect(result).toEqual([]);
  });

  it('uses ctx.nowMs for every emitted signal timestamp', () => {
    const result = dataQualityStrategy.evaluate(
      createScan({
        quotes: [{ symbol: 'AAPL', price: 101, source: 'stub', timestampMs: 10, estimated: true }],
        instrumentation: {
          requests: 1,
          symbolsRequested: 1,
          symbolsFetched: 0,
          symbolsBlocked: 1,
        },
      }),
      ctx,
    );

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((signal) => signal.timestampMs === ctx.nowMs)).toBe(true);
  });
});
