import type { Quote } from '@/core/types/quote';
import { QuoteBroker } from '@/providers/quoteBroker';
import type { Account } from '@/services/account/accountSelector';
import { runForegroundScan } from '@/services/scan/foregroundScanService';

describe('runForegroundScan', () => {
  const nowMs = 1_700_000_000_000;

  function createBroker() {
    const fetcher = jest.fn(
      async (accountId: string, symbols: string[], timestampMs: number): Promise<Quote[]> => {
        return symbols.map((symbol) => ({
          symbol,
          price: 100,
          source: accountId,
          timestampMs,
          estimated: true,
        }));
      },
    );

    const broker = new QuoteBroker({
      mode: 'CALM',
      fetcher,
      nowProvider: () => nowMs,
    });

    return { broker, fetcher };
  }

  it('returns accountId chosen by account selector (primary account)', async () => {
    const accounts: Account[] = [
      { id: 'acct-1', portfolioValue: 22_000 },
      { id: 'acct-primary', portfolioValue: 1_000, isPrimary: true },
    ];

    const symbols = ['AAPL', 'MSFT', 'NVDA'];
    const { broker } = createBroker();

    const result = await runForegroundScan({ broker }, { accounts, symbols });

    expect(result.accountId).toBe('acct-primary');
  });

  it('returns instrumentation reflecting CALM mode caps', async () => {
    const accounts: Account[] = [{ id: 'acct-primary', portfolioValue: 9_000, isPrimary: true }];
    const symbols = Array.from({ length: 25 }, (_, i) => `SYM${i}`);
    const { broker } = createBroker();

    const result = await runForegroundScan({ broker }, { accounts, symbols });

    expect(result.instrumentation.symbolsFetched).toBeLessThanOrEqual(20);
    expect(result.instrumentation.symbolsBlocked).toBe(
      symbols.length - result.instrumentation.symbolsFetched,
    );
  });

  it('returns quotes length matching fetched symbols and returns symbols unchanged', async () => {
    const accounts: Account[] = [{ id: 'acct-primary', portfolioValue: 9_000, isPrimary: true }];
    const symbols = Array.from({ length: 25 }, (_, i) => `SYM${i}`);
    const { broker } = createBroker();

    const result = await runForegroundScan({ broker }, { accounts, symbols });

    expect(result.quotes).toHaveLength(20);
    expect(result.quotes).toHaveLength(result.instrumentation.symbolsFetched);
    expect(result.symbols).toBe(symbols);
  });
});
