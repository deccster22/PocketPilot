import type { Quote } from '@/core/types/quote';
import { type Account } from '@/services/account/accountSelector';
import { fetchQuotes } from '@/services/quotes/quotesService';
import type { ProviderRouterResult } from '@/services/providers/providerRouter';

describe('fetchQuotes', () => {
  const nowMs = 1_700_000_000_000;
  const nowIso = new Date(nowMs).toISOString();

  function createProviderHealthEntry(
    providerId: string,
    overrides: Partial<ProviderRouterResult['meta']['providerHealthSummary'][string]> = {},
  ): ProviderRouterResult['meta']['providerHealthSummary'][string] {
    const window = {
      providerId,
      role: 'execution' as const,
      recentAttempts: 1,
      recentSuccesses: 1,
      recentFailures: 0,
      recentCooldownSkips: 0,
      lastAttemptAt: nowIso,
      lastSuccessAt: nowIso,
      lastFailureAt: null,
      ...(overrides.window ?? {}),
    };
    const score = {
      providerId,
      role: window.role,
      state: 'UNKNOWN' as const,
      score: null,
      reason: 'Recent data is too thin for a health read: 1 attempt.',
      ...(overrides.score ?? {}),
    };

    return {
      ...overrides,
      providerId,
      requests: 1,
      symbolsRequested: 0,
      symbolsFetched: 0,
      symbolsBlocked: 0,
      cooldown: 'INACTIVE',
      windowSize: 6,
      window,
      score: {
        ...score,
        role: window.role,
      },
    };
  }

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
          'broker:primary': createProviderHealthEntry('broker:primary', {
            symbolsRequested: Object.keys(quotes).length,
            symbolsFetched: Object.keys(quotes).length,
          }),
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
            'broker:primary': createProviderHealthEntry('broker:primary', {
              requests: 2,
              symbolsRequested: 2,
              symbolsFetched: 1,
              symbolsBlocked: 1,
              cooldown: 'ACTIVE_SKIP',
              window: {
                providerId: 'broker:primary',
                role: 'execution',
                recentAttempts: 2,
                recentSuccesses: 1,
                recentFailures: 1,
                recentCooldownSkips: 1,
                lastAttemptAt: nowIso,
                lastSuccessAt: nowIso,
                lastFailureAt: nowIso,
              },
              score: {
                providerId: 'broker:primary',
                role: 'execution',
                state: 'COOLDOWN_ACTIVE',
                score: 50,
                reason:
                  'Cooldown is active in the current recent window: 1 success, 1 failure, 1 cooldown skip.',
              },
            }),
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
      'broker:primary': createProviderHealthEntry('broker:primary', {
        requests: 2,
        symbolsRequested: 2,
        symbolsFetched: 1,
        symbolsBlocked: 1,
        cooldown: 'ACTIVE_SKIP',
        window: {
          providerId: 'broker:primary',
          role: 'execution',
          recentAttempts: 2,
          recentSuccesses: 1,
          recentFailures: 1,
          recentCooldownSkips: 1,
          lastAttemptAt: nowIso,
          lastSuccessAt: nowIso,
          lastFailureAt: nowIso,
        },
        score: {
          providerId: 'broker:primary',
          role: 'execution',
          state: 'COOLDOWN_ACTIVE',
          score: 50,
          reason:
            'Cooldown is active in the current recent window: 1 success, 1 failure, 1 cooldown skip.',
        },
      }),
    });
    expect(result.routerMeta.providerHealthSummary['broker:primary']?.score?.state).toBe(
      'COOLDOWN_ACTIVE',
    );
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
