import type { StrategyContext, StrategyScanInput } from '@/core/strategy/types';
import { dipBuyingStrategy } from '@/core/strategy/strategies/dipBuyingStrategy';

describe('dipBuyingStrategy', () => {
  const ctx: StrategyContext = { nowMs: 1_700_003_000_000 };

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
    const result = dipBuyingStrategy.evaluate(createScan(), ctx);

    expect(result).toEqual([]);
  });

  it('emits WATCH when pct <= -4%', () => {
    const result = dipBuyingStrategy.evaluate(
      createScan({
        pctChangeBySymbol: {
          AAPL: -0.04,
          MSFT: -0.039,
          TSLA: -0.071,
        },
      }),
      ctx,
    );

    expect(result).toHaveLength(2);
    expect(result.every((signal) => signal.severity === 'WATCH')).toBe(true);
    expect(result.map((signal) => signal.symbol)).toEqual(['TSLA', 'AAPL']);
  });

  it('sorts most negative first; ties by symbol', () => {
    const result = dipBuyingStrategy.evaluate(
      createScan({
        pctChangeBySymbol: {
          ZZZ: -0.05,
          AAA: -0.05,
          BBB: -0.07,
        },
      }),
      ctx,
    );

    expect(result.map((signal) => signal.symbol)).toEqual(['BBB', 'AAA', 'ZZZ']);
  });

  it('caps to 5 and adds summary when more symbols qualify', () => {
    const result = dipBuyingStrategy.evaluate(
      createScan({
        pctChangeBySymbol: {
          AAA: -0.041,
          BBB: -0.042,
          CCC: -0.043,
          DDD: -0.044,
          EEE: -0.045,
          FFF: -0.046,
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
    expect(result[5]).toEqual({
      strategyId: 'dip_buying',
      severity: 'INFO',
      title: 'More dips',
      message: '6 symbols are down >=4% vs baseline.',
      timestampMs: ctx.nowMs,
      tags: ['delta', 'dip', 'beginner'],
    });
  });

  it('includes estimated quote note when matching quote is estimated', () => {
    const result = dipBuyingStrategy.evaluate(
      createScan({
        quotes: [
          {
            symbol: 'AAPL',
            price: 100,
            source: 'test',
            timestampMs: 1,
            estimated: true,
          },
        ],
        pctChangeBySymbol: {
          AAPL: -0.05,
        },
      }),
      ctx,
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.message).toContain('(estimated quote)');
  });

  it('uses ctx.nowMs for all signals', () => {
    const result = dipBuyingStrategy.evaluate(
      createScan({
        pctChangeBySymbol: {
          AAPL: -0.04,
          TSLA: -0.06,
        },
      }),
      ctx,
    );

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((signal) => signal.timestampMs === ctx.nowMs)).toBe(true);
  });
});
