import type { StrategySignal } from '@/core/strategy/types';
import type { Quote } from '@/core/types/quote';
import { buildDebugObservatoryPayload } from '@/services/debug/debugObservatoryService';

describe('debugObservatoryService', () => {
  const nowMs = 1_700_000_000_000;
  const symbols = ['BTC', 'ETH'];
  const quotes: Record<string, Quote> = {
    BTC: { symbol: 'BTC', price: 100_000, source: 'primary-feed', estimated: false, timestamp: nowMs },
    ETH: { symbol: 'ETH', price: 4_000, source: 'fallback-feed', estimated: true, timestamp: nowMs },
  };

  it('returns structured payload and preserves router metadata', () => {
    const result = buildDebugObservatoryPayload({
      timestampMs: nowMs,
      symbols,
      quotes,
      quoteMeta: {
        provider: 'router:primary',
        fallbackUsed: true,
        requestedSymbols: symbols,
        returnedSymbols: symbols,
        missingSymbols: [],
        timestampMs: nowMs,
        providersTried: ['router:primary', 'router:fallback'],
        sourceBySymbol: {
          BTC: 'primary-feed',
          ETH: 'fallback-feed',
        },
      },
      deltas: { BTC: 0.1, ETH: -0.05 },
    });

    expect(result.timestampMs).toBe(nowMs);
    expect(result.symbols).toEqual(symbols);
    expect(result.quoteResult.quotes.BTC?.price).toBe(100_000);
    expect(result.quoteResult.meta).toEqual(
      expect.objectContaining({
        provider: 'router:primary',
        fallbackUsed: true,
        requestedSymbols: ['BTC', 'ETH'],
        returnedSymbols: ['BTC', 'ETH'],
        missingSymbols: [],
        providersTried: ['router:primary', 'router:fallback'],
      }),
    );
  });

  it('includes strategy signals and snapshot output when present', () => {
    const strategySignals: StrategySignal[] = [
      {
        strategyId: 'momentum-basics',
        symbol: 'BTC',
        severity: 'WATCH',
        title: 'Momentum cooling',
        message: 'Change trend has flattened',
        timestampMs: nowMs,
      },
    ];

    const result = buildDebugObservatoryPayload({
      timestampMs: nowMs,
      symbols,
      quotes,
      strategySignals,
      snapshot: {
        portfolioValue: 104_000,
        change24h: 0.025,
        strategyAlignment: 'Needs review',
        bundleName: 'Calm Starter',
        accountId: 'acct-live',
      },
    });

    expect(result.strategySignals).toEqual(strategySignals);
    expect(result.snapshot).toEqual(
      expect.objectContaining({
        portfolioValue: 104_000,
        strategyAlignment: 'Needs review',
        bundleName: 'Calm Starter',
      }),
    );
  });

  it('degrades safely when optional sections are missing', () => {
    const result = buildDebugObservatoryPayload({
      timestampMs: nowMs,
      symbols,
      quotes,
    });

    expect(result.deltas).toBeUndefined();
    expect(result.strategySignals).toBeUndefined();
    expect(result.snapshot).toBeUndefined();
    expect(result.quoteResult.meta.provider).toBe('unknown');
    expect(result.quoteResult.meta.fallbackUsed).toBe(false);
    expect(result.quoteResult.meta.requestedSymbols).toEqual(['BTC', 'ETH']);
    expect(result.quoteResult.meta.returnedSymbols).toEqual(['BTC', 'ETH']);
    expect(result.quoteResult.meta.missingSymbols).toEqual([]);
    expect(result.quoteResult.meta.sourceBySymbol).toEqual({
      BTC: 'primary-feed',
      ETH: 'fallback-feed',
    });
  });

  it('preserves explicit missing symbol metadata', () => {
    const result = buildDebugObservatoryPayload({
      timestampMs: nowMs,
      symbols,
      quotes: { BTC: quotes.BTC },
      quoteMeta: {
        provider: 'router:primary',
        fallbackUsed: false,
        requestedSymbols: symbols,
        returnedSymbols: ['BTC'],
        missingSymbols: ['ETH'],
        timestampMs: nowMs,
        providersTried: ['router:primary'],
        sourceBySymbol: { BTC: 'primary-feed' },
      },
    });

    expect(result.quoteResult.meta.returnedSymbols).toEqual(['BTC']);
    expect(result.quoteResult.meta.missingSymbols).toEqual(['ETH']);
  });
});
