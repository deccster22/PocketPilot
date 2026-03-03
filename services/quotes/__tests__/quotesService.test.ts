import type { Quote } from '@/core/types/quote';
import { QuoteBroker } from '@/providers/quoteBroker';
import { type Account } from '@/services/account/accountSelector';
import { getExecutionQuotes } from '@/services/quotes/quotesService';

describe('getExecutionQuotes', () => {
  const nowMs = 1_700_000_000_000;

  it('uses primary account when present', async () => {
    const accounts: Account[] = [
      { id: 'acct-1', portfolioValue: 12_000 },
      { id: 'acct-2', portfolioValue: 3_000, isPrimary: true },
    ];
    const symbols = ['AAPL', 'MSFT'];

    const fetcher = jest.fn(async (accountId: string, requestedSymbols: string[]): Promise<Quote[]> => {
      return requestedSymbols.map((symbol) => ({
        symbol,
        price: 100,
        source: accountId,
        timestampMs: nowMs,
        estimated: true,
      }));
    });

    const broker = new QuoteBroker({
      mode: 'CALM',
      fetcher,
      nowProvider: () => nowMs,
    });

    const result = await getExecutionQuotes({ broker }, { accounts, symbols });

    expect(result.accountId).toBe('acct-2');
    expect(fetcher).toHaveBeenCalledWith('acct-2', ['AAPL', 'MSFT'], nowMs);
  });

  it('uses highest portfolio account when no primary exists', async () => {
    const accounts: Account[] = [
      { id: 'acct-1', portfolioValue: 2_500 },
      { id: 'acct-2', portfolioValue: 9_500 },
    ];

    const fetcher = jest.fn(async (accountId: string, requestedSymbols: string[]): Promise<Quote[]> => {
      return requestedSymbols.map((symbol) => ({
        symbol,
        price: 100,
        source: accountId,
        timestampMs: nowMs,
        estimated: true,
      }));
    });

    const broker = new QuoteBroker({
      mode: 'CALM',
      fetcher,
      nowProvider: () => nowMs,
    });

    const result = await getExecutionQuotes({ broker }, { accounts, symbols: ['NVDA'] });

    expect(result.accountId).toBe('acct-2');
    expect(fetcher).toHaveBeenCalledWith('acct-2', ['NVDA'], nowMs);
  });

  it('passes symbols through unchanged', async () => {
    const accounts: Account[] = [{ id: 'acct-1', portfolioValue: 1_000, isPrimary: true }];
    const symbols = ['TSLA', 'ETH-USD', 'EURUSD'];

    const fetcher = jest.fn(async (_accountId: string, requestedSymbols: string[]): Promise<Quote[]> => {
      return requestedSymbols.map((symbol) => ({
        symbol,
        price: 100,
        source: 'stub-feed',
        timestampMs: nowMs,
        estimated: true,
      }));
    });

    const broker = new QuoteBroker({
      mode: 'CALM',
      fetcher,
      nowProvider: () => nowMs,
    });

    await getExecutionQuotes({ broker }, { accounts, symbols });

    expect(fetcher).toHaveBeenCalledWith('acct-1', symbols, nowMs);
  });
});
