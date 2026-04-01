import type { Quote } from '@/core/types/quote';
import { type Account } from '@/services/account/accountSelector';
import { fetchQuotes } from '@/services/quotes/quotesService';
import type { ProviderRouterResult } from '@/services/providers/providerRouter';

describe('fetchQuotes', () => {
  const nowMs = 1_700_000_000_000;
  const nowIso = new Date(nowMs).toISOString();

  function createRouterResult(
    quotes: Record<string, Quote>,
    overrides: Partial<ProviderRouterResult['meta']> = {},
  ): ProviderRouterResult {
    return {
      quotes,
      meta: {
        role: 'execution',
        providerId: 'broker:primary',
        freshness: 'FRESH',
        certainty: 'ESTIMATED',
        lastUpdatedAt: nowIso,
        lastGoodAt: null,
        usedLastGood: false,
        fallbackUsed: false,
        requestedSymbols: Object.keys(quotes),
        returnedSymbols: Object.keys(quotes),
        missingSymbols: [],
        timestampMs: nowMs,
        providersTried: ['broker:primary'],
        sourceBySymbol: Object.keys(quotes).reduce<Record<string, string | undefined>>(
          (acc, symbol) => {
            acc[symbol] = quotes[symbol]?.source;
            return acc;
          },
          {},
        ),
        coalescedRequest: false,
        policyStateBySymbol: Object.keys(quotes).reduce<
          ProviderRouterResult['meta']['policyStateBySymbol']
        >((acc, symbol) => {
          acc[symbol] = 'FRESH';
          return acc;
        }, {}),
        providerHealthSummary: {
          'broker:primary': {
            providerId: 'broker:primary',
            requests: 1,
            symbolsRequested: Object.keys(quotes).length,
            symbolsFetched: Object.keys(quotes).length,
            symbolsBlocked: 0,
            cooldown: 'INACTIVE',
          },
        },
        policy: {
          staleIfError: 'NOT_NEEDED',
          staleWhileRevalidate: 'NOT_IMPLEMENTED_FOREGROUND_ONLY',
          cooldown: 'INACTIVE',
          cooldownSkippedProviders: [],
        },
        ...overrides,
      },
    };
  }

  it('passes explicit execution context to the router and preserves trust metadata', async () => {
    const accounts: Account[] = [
      { id: 'acct-1', portfolioValue: 12_000 },
      { id: 'acct-2', portfolioValue: 3_000, isPrimary: true },
    ];
    const symbols = ['AAPL', 'MSFT'];
    const getQuotesForSymbols = jest.fn(async (): Promise<ProviderRouterResult> =>
      createRouterResult({
        AAPL: {
          symbol: 'AAPL',
          price: 100,
          source: 'acct-2',
          timestamp: nowMs,
          estimated: true,
        },
        MSFT: {
          symbol: 'MSFT',
          price: 101,
          source: 'acct-2',
          timestamp: nowMs,
          estimated: false,
        },
      }),
    );

    const result = await fetchQuotes(
      { getQuotesForSymbols, nowProvider: () => nowMs },
      {
        accounts,
        symbols,
        context: {
          role: 'execution',
          budgetClass: 'WATCHING_NOW',
        },
      },
    );

    expect(result.accountId).toBe('acct-2');
    expect(getQuotesForSymbols).toHaveBeenCalledWith({
      accountId: 'acct-2',
      symbols,
      nowMs,
      cachedQuotes: undefined,
      context: {
        role: 'execution',
        budgetClass: 'WATCHING_NOW',
        accountId: 'acct-2',
        symbols,
      },
    });
    expect(result.routerMeta).toEqual(
      expect.objectContaining({
        role: 'execution',
        providerId: 'broker:primary',
        freshness: 'FRESH',
        certainty: 'ESTIMATED',
        coalescedRequest: false,
        policyStateBySymbol: {
          AAPL: 'FRESH',
          MSFT: 'FRESH',
        },
      }),
    );
  });

  it('preserves richer runtime policy metadata without app-side inference', async () => {
    const accounts: Account[] = [{ id: 'acct-2', portfolioValue: 9_500 }];
    const getQuotesForSymbols = jest.fn(async (): Promise<ProviderRouterResult> =>
      createRouterResult(
        {
          NVDA: {
            symbol: 'NVDA',
            price: 100,
            source: 'acct-2',
            timestamp: nowMs,
            estimated: false,
          },
        },
        {
          freshness: 'LAST_GOOD',
          lastGoodAt: nowIso,
          usedLastGood: true,
          coalescedRequest: true,
          policyStateBySymbol: {
            NVDA: 'LAST_GOOD',
          },
          providerHealthSummary: {
            'broker:primary': {
              providerId: 'broker:primary',
              requests: 2,
              symbolsRequested: 2,
              symbolsFetched: 1,
              symbolsBlocked: 1,
              cooldown: 'ACTIVE_SKIP',
            },
          },
          policy: {
            staleIfError: 'USED_LAST_GOOD',
            staleWhileRevalidate: 'NOT_IMPLEMENTED_FOREGROUND_ONLY',
            cooldown: 'ACTIVE_SKIP',
            cooldownSkippedProviders: ['broker:primary'],
          },
        },
      ),
    );

    const result = await fetchQuotes(
      { getQuotesForSymbols, nowProvider: () => nowMs },
      {
        accounts,
        symbols: ['NVDA'],
        context: {
          role: 'execution',
          budgetClass: 'CALM',
        },
      },
    );

    expect(result.routerMeta).toEqual(
      expect.objectContaining({
        freshness: 'LAST_GOOD',
        lastGoodAt: nowIso,
        usedLastGood: true,
        coalescedRequest: true,
        policyStateBySymbol: {
          NVDA: 'LAST_GOOD',
        },
      }),
    );
    expect(result.routerMeta.providerHealthSummary).toEqual({
      'broker:primary': {
        providerId: 'broker:primary',
        requests: 2,
        symbolsRequested: 2,
        symbolsFetched: 1,
        symbolsBlocked: 1,
        cooldown: 'ACTIVE_SKIP',
      },
    });
    expect(result.routerMeta.policy).toEqual({
      staleIfError: 'USED_LAST_GOOD',
      staleWhileRevalidate: 'NOT_IMPLEMENTED_FOREGROUND_ONLY',
      cooldown: 'ACTIVE_SKIP',
      cooldownSkippedProviders: ['broker:primary'],
    });
  });

  it('uses the highest-value account when no primary is marked', async () => {
    const accounts: Account[] = [
      { id: 'acct-1', portfolioValue: 2_500 },
      { id: 'acct-2', portfolioValue: 9_500 },
    ];

    const getQuotesForSymbols = jest.fn(async (): Promise<ProviderRouterResult> =>
      createRouterResult({
        NVDA: {
          symbol: 'NVDA',
          price: 100,
          source: 'acct-2',
          timestamp: nowMs,
          estimated: false,
        },
      }),
    );

    const result = await fetchQuotes(
      { getQuotesForSymbols, nowProvider: () => nowMs },
      {
        accounts,
        symbols: ['NVDA'],
        context: {
          role: 'execution',
          budgetClass: 'CALM',
        },
      },
    );

    expect(result.accountId).toBe('acct-2');
    expect(getQuotesForSymbols).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: 'acct-2',
        context: expect.objectContaining({
          role: 'execution',
          budgetClass: 'CALM',
        }),
      }),
    );
  });
});
