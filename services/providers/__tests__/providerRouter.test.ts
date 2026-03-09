import type { Quote } from '@/core/types/quote';
import { getQuotesForSymbols, type QuoteProvider } from '@/services/providers/providerRouter';

describe('providerRouter', () => {
  const nowMs = 1_700_000_000_000;

  it('returns structured quotes and metadata from primary provider', async () => {
    const primary: QuoteProvider = {
      id: 'primary-provider',
      getQuotes: jest.fn(async (_accountId: string, symbols: string[]) =>
        symbols.map(
          (symbol): Quote => ({
            symbol,
            price: 100,
            source: 'primary-feed',
            estimated: symbol === 'MSFT',
            timestamp: nowMs,
          }),
        ),
      ),
    };

    const result = await getQuotesForSymbols(
      { primary },
      {
        accountId: 'acct-1',
        symbols: ['AAPL', 'MSFT'],
        nowMs,
      },
    );

    expect(result.quotes.AAPL).toEqual(
      expect.objectContaining({ symbol: 'AAPL', source: 'primary-feed', estimated: false }),
    );
    expect(result.quotes.MSFT?.estimated).toBe(true);
    expect(result.meta).toEqual(
      expect.objectContaining({
        provider: 'primary-provider',
        fallbackUsed: false,
        requestedSymbols: ['AAPL', 'MSFT'],
        returnedSymbols: ['AAPL', 'MSFT'],
        missingSymbols: [],
        timestampMs: nowMs,
        providersTried: ['primary-provider'],
      }),
    );
  });

  it('handles missing symbols explicitly and keeps fallbackUsed false without fallback provider', async () => {
    const primary: QuoteProvider = {
      id: 'primary-provider',
      getQuotes: jest.fn(async (_accountId: string, symbols: string[]) =>
        symbols
          .filter((symbol) => symbol !== 'MISSING')
          .map(
            (symbol): Quote => ({
              symbol,
              price: 10,
              source: 'primary-feed',
              estimated: false,
              timestamp: nowMs,
            }),
          ),
      ),
    };

    const result = await getQuotesForSymbols(
      { primary },
      {
        accountId: 'acct-1',
        symbols: ['AAPL', 'MISSING'],
        nowMs,
      },
    );

    expect(result.meta.fallbackUsed).toBe(false);
    expect(result.meta.returnedSymbols).toEqual(['AAPL']);
    expect(result.meta.missingSymbols).toEqual(['MISSING']);
    expect(result.quotes.MISSING).toBeUndefined();
  });

  it('uses fallback provider when primary misses symbols', async () => {
    const primary: QuoteProvider = {
      id: 'primary-provider',
      getQuotes: jest.fn(async (_accountId: string, symbols: string[]) =>
        symbols
          .filter((symbol) => symbol !== 'SOL')
          .map(
            (symbol): Quote => ({
              symbol,
              price: 20,
              source: 'primary-feed',
              estimated: false,
              timestamp: nowMs,
            }),
          ),
      ),
    };

    const fallback: QuoteProvider = {
      id: 'fallback-provider',
      getQuotes: jest.fn(async (_accountId: string, symbols: string[]) =>
        symbols.map(
          (symbol): Quote => ({
            symbol,
            price: 19,
            source: 'fallback-feed',
            estimated: true,
            timestamp: nowMs,
          }),
        ),
      ),
    };

    const result = await getQuotesForSymbols(
      { primary, fallback },
      {
        accountId: 'acct-1',
        symbols: ['BTC', 'SOL'],
        nowMs,
      },
    );

    expect(result.meta.fallbackUsed).toBe(true);
    expect(result.meta.returnedSymbols).toEqual(['BTC', 'SOL']);
    expect(result.meta.missingSymbols).toEqual([]);
    expect(result.quotes.SOL).toEqual(
      expect.objectContaining({ source: 'fallback-feed', estimated: true }),
    );
  });
});
