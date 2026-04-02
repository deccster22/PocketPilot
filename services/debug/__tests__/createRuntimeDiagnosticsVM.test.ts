import type { Quote } from '@/core/types/quote';
import { createRuntimeDiagnosticsVM } from '@/services/debug/createRuntimeDiagnosticsVM';
import type { QuoteResponse } from '@/services/providers/types';

describe('createRuntimeDiagnosticsVM', () => {
  const nowMs = 1_700_000_000_000;
  const nowIso = new Date(nowMs).toISOString();
  const lastGoodQuoteMs = nowMs - 30_000;
  const lastGoodQuoteIso = new Date(lastGoodQuoteMs).toISOString();

  function createProviderHealthEntry(
    providerId: string,
    overrides: Partial<QuoteResponse['meta']['providerHealthSummary'][string]> = {},
  ): QuoteResponse['meta']['providerHealthSummary'][string] {
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
      symbolsRequested: 2,
      symbolsFetched: 1,
      symbolsBlocked: 1,
      cooldown: 'INACTIVE',
      windowSize: 6,
      window,
      score: {
        ...score,
        role: window.role,
      },
    };
  }

  function createQuoteMeta(
    overrides: Partial<QuoteResponse['meta']> = {},
  ): QuoteResponse['meta'] {
    return {
      role: 'execution',
      providerId: null,
      freshness: 'LAST_GOOD',
      certainty: 'CONFIRMED',
      lastUpdatedAt: lastGoodQuoteIso,
      lastGoodAt: lastGoodQuoteIso,
      usedLastGood: true,
      fallbackUsed: true,
      requestedSymbols: ['BTC', 'ETH'],
      returnedSymbols: ['BTC'],
      missingSymbols: ['ETH'],
      timestampMs: nowMs,
      providersTried: ['broker:primary', 'broker:fallback'],
      sourceBySymbol: {
        BTC: 'broker:fallback',
      },
      coalescedRequest: true,
      policyStateBySymbol: {
        BTC: 'LAST_GOOD',
        ETH: 'UNAVAILABLE',
      },
      providerHealthSummary: {
        'broker:primary': createProviderHealthEntry('broker:primary', {
          requests: 3,
          symbolsRequested: 3,
          symbolsFetched: 1,
          symbolsBlocked: 2,
          cooldown: 'ACTIVE_SKIP',
          window: {
            providerId: 'broker:primary',
            role: 'execution',
            recentAttempts: 2,
            recentSuccesses: 1,
            recentFailures: 1,
            recentCooldownSkips: 1,
            lastAttemptAt: nowIso,
            lastSuccessAt: lastGoodQuoteIso,
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
        'broker:fallback': createProviderHealthEntry('broker:fallback'),
      },
      policy: {
        staleIfError: 'USED_LAST_GOOD',
        staleWhileRevalidate: 'NOT_IMPLEMENTED_FOREGROUND_ONLY',
        cooldown: 'ACTIVE_SKIP',
        cooldownSkippedProviders: ['broker:primary'],
      },
      ...overrides,
    };
  }

  it('surfaces explicit policy, provider health, and symbol state without recomputing them', () => {
    const quotes: Record<string, Quote> = {
      BTC: {
        symbol: 'BTC',
        price: 100_000,
        source: 'broker:fallback',
        estimated: false,
        timestampMs: lastGoodQuoteMs,
      },
    };

    const result = createRuntimeDiagnosticsVM({
      quoteMeta: createQuoteMeta(),
      quotes,
      symbols: ['BTC', 'ETH'],
    });

    expect(result.generatedAt).toBe(nowIso);
    expect(result.role).toBe('execution');
    expect(result.quotePolicy).toEqual({
      coalescedRequest: true,
      providersTried: ['broker:primary', 'broker:fallback'],
      cooldownSkippedProviders: ['broker:primary'],
      usedLastGood: true,
      freshness: 'LAST_GOOD',
      certainty: 'CONFIRMED',
    });
    expect(result.providers).toEqual([
      {
        providerId: 'broker:primary',
        role: 'execution',
        healthState: 'COOLDOWN_ACTIVE',
        score: 50,
        recentAttempts: 2,
        recentSuccesses: 1,
        recentFailures: 1,
        recentCooldownSkips: 1,
        lastAttemptAt: nowIso,
        lastSuccessAt: lastGoodQuoteIso,
        lastFailureAt: nowIso,
      },
      {
        providerId: 'broker:fallback',
        role: 'execution',
        healthState: 'UNKNOWN',
        score: null,
        recentAttempts: 1,
        recentSuccesses: 1,
        recentFailures: 0,
        recentCooldownSkips: 0,
        lastAttemptAt: nowIso,
        lastSuccessAt: nowIso,
        lastFailureAt: null,
      },
    ]);
    expect(result.symbols).toEqual([
      {
        symbol: 'BTC',
        providerId: 'broker:fallback',
        policyState: 'LAST_GOOD',
        lastUpdatedAt: lastGoodQuoteIso,
        lastGoodAt: lastGoodQuoteIso,
      },
      {
        symbol: 'ETH',
        providerId: null,
        policyState: 'UNAVAILABLE',
        lastUpdatedAt: null,
        lastGoodAt: null,
      },
    ]);
    expect(result.notes).toEqual([
      'Foreground-only runtime: stale-while-revalidate is not implemented.',
      'Provider health uses a thin recent window and can remain UNKNOWN when recent attempt data is too thin.',
    ]);
  });

  it('keeps UNKNOWN provider health honest and does not imply cross-role substitution', () => {
    const result = createRuntimeDiagnosticsVM({
      quoteMeta: createQuoteMeta({
        providerHealthSummary: {
          'broker:primary': createProviderHealthEntry('broker:primary'),
        },
        providersTried: ['broker:primary'],
        sourceBySymbol: {
          BTC: 'broker:primary',
        },
      }),
      quotes: {
        BTC: {
          symbol: 'BTC',
          price: 100_000,
          source: 'broker:primary',
          estimated: false,
          timestampMs: lastGoodQuoteMs,
        },
      },
      symbols: ['BTC'],
    });

    expect(result.providers).toEqual([
      {
        providerId: 'broker:primary',
        role: 'execution',
        healthState: 'UNKNOWN',
        score: null,
        recentAttempts: 1,
        recentSuccesses: 1,
        recentFailures: 0,
        recentCooldownSkips: 0,
        lastAttemptAt: nowIso,
        lastSuccessAt: nowIso,
        lastFailureAt: null,
      },
    ]);
    expect(result.notes).toContain(
      'Provider health uses a thin recent window and can remain UNKNOWN when recent attempt data is too thin.',
    );
    expect(result.notes.join(' ')).not.toMatch(/reference|substitut/i);
  });

  it('can be built without inventing missing quote policy sections', () => {
    const result = createRuntimeDiagnosticsVM({
      generatedAt: '2026-04-02T00:00:00.000Z',
      role: 'macro',
      symbols: ['BTC'],
      providerHealthSummary: {
        'broker:macro': {
          providerId: 'broker:macro',
          requests: 0,
          symbolsRequested: 0,
          symbolsFetched: 0,
          symbolsBlocked: 0,
          cooldown: 'INACTIVE',
        },
      },
    });

    expect(result).toEqual({
      generatedAt: '2026-04-02T00:00:00.000Z',
      role: 'macro',
      providers: [
        {
          providerId: 'broker:macro',
          role: 'macro',
          healthState: 'UNKNOWN',
          score: null,
          recentAttempts: null,
          recentSuccesses: null,
          recentFailures: null,
          recentCooldownSkips: null,
          lastAttemptAt: null,
          lastSuccessAt: null,
          lastFailureAt: null,
        },
      ],
      quotePolicy: null,
      symbols: [
        {
          symbol: 'BTC',
          providerId: null,
          policyState: null,
          lastUpdatedAt: null,
          lastGoodAt: null,
        },
      ],
      notes: ['Quote policy diagnostics are unavailable for this call path.'],
    });
  });

  it('is deterministic and does not leak raw signal fields', () => {
    const params = {
      quoteMeta: createQuoteMeta({
        providerHealthSummary: {
          'broker:primary': createProviderHealthEntry('broker:primary', {
            score: {
              providerId: 'broker:primary',
              role: 'execution',
              state: 'HEALTHY',
              score: 100,
              reason:
                'Recent successes dominate the current window: 1 success, 0 failures, 0 cooldown skips.',
            },
          }),
        },
        providersTried: ['broker:primary'],
        sourceBySymbol: {
          BTC: 'broker:primary',
        },
        policy: {
          staleIfError: 'USED_LAST_GOOD',
          staleWhileRevalidate: 'NOT_IMPLEMENTED_FOREGROUND_ONLY',
          cooldown: 'INACTIVE',
          cooldownSkippedProviders: [],
        },
      }),
      quotes: {
        BTC: {
          symbol: 'BTC',
          price: 100_000,
          source: 'broker:primary',
          estimated: false,
          timestampMs: lastGoodQuoteMs,
        },
      },
      symbols: ['BTC'],
    } satisfies Parameters<typeof createRuntimeDiagnosticsVM>[0];

    const firstResult = createRuntimeDiagnosticsVM(params);
    const secondResult = createRuntimeDiagnosticsVM(params);

    expect(secondResult).toEqual(firstResult);
    expect(JSON.stringify(firstResult)).not.toMatch(
      /signalCode|signalsTriggered|confidenceScore|strategyId/,
    );
  });
});
