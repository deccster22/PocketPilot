import type { Quote } from '@/core/types/quote';
import { type Account } from '@/services/account/accountSelector';
import { fetchQuotes } from '@/services/quotes/quotesService';

describe('fetchQuotes', () => {
  const nowMs = 1_700_000_000_000;

  it('uses primary account when present and returns router metadata', async () => {
    const accounts: Account[] = [
      { id: 'acct-1', portfolioValue: 12_000 },
      { id: 'acct-2', portfolioValue: 3_000, isPrimary: true },
    ];
    const symbols = ['AAPL', 'MSFT'];

    const getQuotesForSymbols = jest.fn(async (): Promise<{
      quotes: Record<string, Quote>;
      meta: {
        provider: string;
        fallbackUsed: boolean;
        requestedSymbols: string[];
        returnedSymbols: string[];
        missingSymbols: string[];
        timestampMs: number;
        providersTried: string[];
        sourceBySymbol: Record<string, string | undefined>;
      };
    }> => ({
      quotes: {
        AAPL: { symbol: 'AAPL', price: 100, source: 'acct-2', timestamp: nowMs, estimated: true },
        MSFT: { symbol: 'MSFT', price: 101, source: 'acct-2', timestamp: nowMs, estimated: false },
      },
      meta: {
        provider: 'broker:primary',
        fallbackUsed: false,
        requestedSymbols: symbols,
        returnedSymbols: symbols,
        missingSymbols: [],
        timestampMs: nowMs,
        providersTried: ['broker:primary'],
        sourceBySymbol: { AAPL: 'acct-2', MSFT: 'acct-2' },
      },
    }));

    const result = await fetchQuotes(
      { getQuotesForSymbols, nowProvider: () => nowMs },
      { accounts, symbols },
    );

    expect(result.accountId).toBe('acct-2');
    expect(getQuotesForSymbols).toHaveBeenCalledWith({
      accountId: 'acct-2',
      symbols,
      nowMs,
      cachedQuotes: undefined,
    });
    expect(result.quotes.AAPL).toEqual(
      expect.objectContaining({ symbol: 'AAPL', estimated: true, timestamp: nowMs }),
    );
    expect(result.routerMeta.fallbackUsed).toBe(false);
  });

  it('uses highest portfolio account when no primary exists', async () => {
    const accounts: Account[] = [
      { id: 'acct-1', portfolioValue: 2_500 },
      { id: 'acct-2', portfolioValue: 9_500 },
    ];

    const getQuotesForSymbols = jest.fn(async () => ({
      quotes: {
        NVDA: { symbol: 'NVDA', price: 100, source: 'acct-2', timestamp: nowMs, estimated: true },
      },
      meta: {
        provider: 'broker:primary',
        fallbackUsed: false,
        requestedSymbols: ['NVDA'],
        returnedSymbols: ['NVDA'],
        missingSymbols: [],
        timestampMs: nowMs,
        providersTried: ['broker:primary'],
        sourceBySymbol: { NVDA: 'acct-2' },
      },
    }));

    const result = await fetchQuotes(
      { getQuotesForSymbols, nowProvider: () => nowMs },
      { accounts, symbols: ['NVDA'] },
    );

    expect(result.accountId).toBe('acct-2');
    expect(getQuotesForSymbols).toHaveBeenCalledWith({
      accountId: 'acct-2',
      symbols: ['NVDA'],
      nowMs,
      cachedQuotes: undefined,
    });
  });
});
