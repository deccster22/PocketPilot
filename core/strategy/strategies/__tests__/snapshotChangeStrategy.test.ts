import type { StrategyContext, StrategyScanInput } from '@/core/strategy/types';
import { snapshotChangeStrategy } from '@/core/strategy/strategies/snapshotChangeStrategy';

describe('snapshotChangeStrategy', () => {
  const ctx: StrategyContext = { nowMs: 1_700_002_000_000 };

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

  it('returns [] when pctChangeBySymbol is missing', () => {
    const result = snapshotChangeStrategy.evaluate(createScan(), ctx);

    expect(result).toEqual([]);
  });

  it('emits WATCH signals for symbols moving by >=3%', () => {
    const result = snapshotChangeStrategy.evaluate(
      createScan({
        pctChangeBySymbol: {
          AAPL: 0.032,
          MSFT: -0.03,
          GOOG: 0.029,
        },
      }),
      ctx,
    );

    expect(result).toHaveLength(2);
    expect(result.map((signal) => signal.symbol)).toEqual(['AAPL', 'MSFT']);
    expect(result.every((signal) => signal.severity === 'WATCH')).toBe(true);
    expect(result.every((signal) => signal.eventHint.eventType === 'PRICE_MOVEMENT')).toBe(true);
    expect(result[0]?.message).toBe('AAPL is up ~3.2% vs baseline.');
    expect(result[1]?.message).toBe('MSFT is down ~3.0% vs baseline.');
  });

  it('sorts by absolute change descending, then symbol ascending', () => {
    const result = snapshotChangeStrategy.evaluate(
      createScan({
        pctChangeBySymbol: {
          BBB: 0.04,
          AAA: -0.04,
          ZZZ: 0.06,
        },
      }),
      ctx,
    );

    expect(result.map((signal) => signal.symbol)).toEqual(['ZZZ', 'AAA', 'BBB']);
  });

  it('caps symbol signals at 5 and adds a summary when more qualify', () => {
    const result = snapshotChangeStrategy.evaluate(
      createScan({
        pctChangeBySymbol: {
          AAA: 0.031,
          BBB: 0.032,
          CCC: 0.033,
          DDD: 0.034,
          EEE: 0.035,
          FFF: 0.036,
        },
      }),
      ctx,
    );

    expect(result).toHaveLength(6);
    expect(result.slice(0, 5).map((signal) => signal.symbol)).toEqual([
      'FFF',
      'EEE',
      'DDD',
      'CCC',
      'BBB',
    ]);
    expect(result[5]).toEqual(
      expect.objectContaining({
        strategyId: 'snapshot_change',
        signalCode: 'snapshot_move_summary',
        severity: 'INFO',
        title: 'More movers',
        message: '6 symbols moved >=3% vs baseline.',
        timestampMs: ctx.nowMs,
        tags: ['delta', 'snapshot'],
      }),
    );
  });

  it('uses ctx.nowMs for every signal timestamp', () => {
    const result = snapshotChangeStrategy.evaluate(
      createScan({
        pctChangeBySymbol: {
          AAPL: 0.05,
          MSFT: -0.031,
        },
      }),
      ctx,
    );

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((signal) => signal.timestampMs === ctx.nowMs)).toBe(true);
  });
});
