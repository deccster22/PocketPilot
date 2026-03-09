import type { Quote } from '@/core/types/quote';
import { QuoteBroker } from '@/providers/quoteBroker';
import { createQuoteBrokerProvider, getQuotesForSymbols } from '@/services/providers/providerRouter';
import type { Account } from '@/services/account/accountSelector';
import { runForegroundScan } from '@/services/scan/foregroundScanService';

describe('runForegroundScan', () => {
  const nowMs = 1_700_000_000_000;

  function createRouter() {
    const fetcher = jest.fn(
      async (accountId: string, symbols: string[], timestamp: number): Promise<Quote[]> => {
        return symbols.map((symbol) => ({
          symbol,
          price: symbol === 'AAPL' ? 100 : 200,
          source: accountId,
          timestamp,
          estimated: symbol === 'MSFT',
        }));
      },
    );

    const broker = new QuoteBroker({
      mode: 'CALM',
      fetcher,
      nowProvider: () => nowMs,
    });

    const primaryProvider = createQuoteBrokerProvider(broker, 'broker:test');

    return {
      broker,
      fetcher,
      getQuotesForSymbols: (params: {
        accountId: string;
        symbols: string[];
        nowMs: number;
        cachedQuotes?: Record<string, Quote>;
      }) => getQuotesForSymbols({ primary: primaryProvider }, params),
    };
  }

  it('maps quotes by symbol, passes estimated flags, and includes quote metadata', async () => {
    const accounts: Account[] = [{ id: 'acct-primary', portfolioValue: 9_000, isPrimary: true }];
    const symbols = ['AAPL', 'MSFT'];
    const { broker, getQuotesForSymbols: getQuotesForSymbolsFromRouter } = createRouter();

    const result = await runForegroundScan(
      {
        getQuotesForSymbols: getQuotesForSymbolsFromRouter,
        nowProvider: () => nowMs,
        getInstrumentation: () => broker.instrumentation,
      },
      { accounts, symbols },
    );

    expect(result.quotes.AAPL?.price).toBe(100);
    expect(result.quotes.MSFT?.estimated).toBe(true);
    expect(result.estimatedFlags).toEqual({ AAPL: false, MSFT: true });
    expect(result.quoteMeta).toEqual(
      expect.objectContaining({
        provider: 'broker:test',
        fallbackUsed: false,
        requestedSymbols: ['AAPL', 'MSFT'],
        returnedSymbols: ['AAPL', 'MSFT'],
        missingSymbols: [],
      }),
    );
  });

  it('computes pct change from baseline', async () => {
    const accounts: Account[] = [{ id: 'acct-primary', portfolioValue: 9_000, isPrimary: true }];
    const symbols = ['AAPL', 'MSFT'];
    const { broker, getQuotesForSymbols: getQuotesForSymbolsFromRouter } = createRouter();

    const result = await runForegroundScan(
      {
        getQuotesForSymbols: getQuotesForSymbolsFromRouter,
        nowProvider: () => nowMs,
        getInstrumentation: () => broker.instrumentation,
      },
      {
        accounts,
        symbols,
        baselineQuotes: {
          AAPL: { symbol: 'AAPL', price: 80, estimated: false, timestamp: nowMs - 1000 },
          MSFT: { symbol: 'MSFT', price: 250, estimated: true, timestamp: nowMs - 1000 },
        },
      },
    );

    expect(result.pctChangeBySymbol).toEqual({ AAPL: 0.25, MSFT: -0.2 });
  });
});
