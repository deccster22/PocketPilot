import type { StrategySignal } from '@/core/strategy/types';
import type { MarketEvent } from '@/core/types/marketEvent';
import type { Quote } from '@/core/types/quote';
import { buildDebugObservatoryPayload } from '@/services/debug/debugObservatoryService';
import { createEventLedgerService } from '@/services/events/eventLedgerService';
import type { ProviderRouterResult } from '@/services/providers/providerRouter';

describe('debugObservatoryService', () => {
  const nowMs = 1_700_000_000_000;
  const nowIso = new Date(nowMs).toISOString();
  const symbols = ['BTC', 'ETH'];
  const quotes: Record<string, Quote> = {
    BTC: {
      symbol: 'BTC',
      price: 100_000,
      source: 'primary-feed',
      estimated: false,
      timestamp: nowMs,
    },
    ETH: {
      symbol: 'ETH',
      price: 4_000,
      source: 'fallback-feed',
      estimated: true,
      timestamp: nowMs,
    },
  };

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
      symbolsRequested: 2,
      symbolsFetched: 2,
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

  function createQuoteMeta(
    overrides: Partial<ProviderRouterResult['meta']> = {},
  ): ProviderRouterResult['meta'] {
    return {
      role: 'execution',
      providerId: 'router:primary',
      freshness: 'FRESH',
      certainty: 'ESTIMATED',
      lastUpdatedAt: nowIso,
      lastGoodAt: null,
      usedLastGood: false,
      fallbackUsed: false,
      requestedSymbols: symbols,
      returnedSymbols: symbols,
      missingSymbols: [],
      timestampMs: nowMs,
      providersTried: ['router:primary'],
      sourceBySymbol: {
        BTC: 'primary-feed',
        ETH: 'fallback-feed',
      },
      coalescedRequest: false,
      policyStateBySymbol: {
        BTC: 'FRESH',
        ETH: 'FRESH',
      },
      providerHealthSummary: {
        'router:primary': createProviderHealthEntry('router:primary'),
      },
      policy: {
        staleIfError: 'NOT_NEEDED',
        staleWhileRevalidate: 'NOT_IMPLEMENTED_FOREGROUND_ONLY',
        cooldown: 'INACTIVE',
        cooldownSkippedProviders: [],
      },
      ...overrides,
    };
  }

  it('returns structured payload and preserves router metadata', () => {
    const result = buildDebugObservatoryPayload({
      timestampMs: nowMs,
      symbols,
      quotes,
      quoteMeta: createQuoteMeta({
        fallbackUsed: true,
        providersTried: ['router:primary', 'router:fallback'],
        providerHealthSummary: {
          'router:primary': createProviderHealthEntry('router:primary', {
            requests: 3,
            symbolsRequested: 4,
            symbolsFetched: 2,
            symbolsBlocked: 2,
            cooldown: 'ACTIVE_SKIP',
            window: {
              providerId: 'router:primary',
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
              providerId: 'router:primary',
              role: 'execution',
              state: 'COOLDOWN_ACTIVE',
              score: 50,
              reason:
                'Cooldown is active in the current recent window: 1 success, 1 failure, 1 cooldown skip.',
            },
          }),
        },
      }),
      deltas: { BTC: 0.1, ETH: -0.05 },
    });

    expect(result.timestampMs).toBe(nowMs);
    expect(result.symbols).toEqual(symbols);
    expect(result.quoteResult.quotes.BTC?.price).toBe(100_000);
    expect(result.quoteResult.meta).toEqual(
      expect.objectContaining({
        providerId: 'router:primary',
        role: 'execution',
        freshness: 'FRESH',
        certainty: 'ESTIMATED',
        fallbackUsed: true,
        requestedSymbols: ['BTC', 'ETH'],
        returnedSymbols: ['BTC', 'ETH'],
        missingSymbols: [],
        providersTried: ['router:primary', 'router:fallback'],
        coalescedRequest: false,
        policyStateBySymbol: {
          BTC: 'FRESH',
          ETH: 'FRESH',
        },
      }),
    );
    expect(result.quoteResult.meta.providerHealthSummary).toEqual({
      'router:primary': createProviderHealthEntry('router:primary', {
        requests: 3,
        symbolsRequested: 4,
        symbolsFetched: 2,
        symbolsBlocked: 2,
        cooldown: 'ACTIVE_SKIP',
        window: {
          providerId: 'router:primary',
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
          providerId: 'router:primary',
          role: 'execution',
          state: 'COOLDOWN_ACTIVE',
          score: 50,
          reason:
            'Cooldown is active in the current recent window: 1 success, 1 failure, 1 cooldown skip.',
        },
      }),
    });
    expect(result.quoteResult.meta.providerHealthSummary['router:primary']?.score?.state).toBe(
      'COOLDOWN_ACTIVE',
    );
    expect(result.quoteResult.meta.policy.cooldownSkippedProviders).toEqual([]);
    expect(result.runtimeDiagnostics).toEqual({
      generatedAt: nowIso,
      role: 'execution',
      providers: [
        {
          providerId: 'router:primary',
          role: 'execution',
          healthState: 'COOLDOWN_ACTIVE',
          score: 50,
          recentAttempts: 2,
          recentSuccesses: 1,
          recentFailures: 1,
          recentCooldownSkips: 1,
          lastAttemptAt: nowIso,
          lastSuccessAt: nowIso,
          lastFailureAt: nowIso,
        },
        {
          providerId: 'router:fallback',
          role: 'execution',
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
      quotePolicy: {
        coalescedRequest: false,
        providersTried: ['router:primary', 'router:fallback'],
        cooldownSkippedProviders: [],
        usedLastGood: false,
        freshness: 'FRESH',
        certainty: 'ESTIMATED',
      },
      symbols: [
        {
          symbol: 'BTC',
          providerId: 'primary-feed',
          policyState: 'FRESH',
          lastUpdatedAt: nowIso,
          lastGoodAt: null,
        },
        {
          symbol: 'ETH',
          providerId: 'fallback-feed',
          policyState: 'FRESH',
          lastUpdatedAt: nowIso,
          lastGoodAt: null,
        },
      ],
      notes: ['Foreground-only runtime: stale-while-revalidate is not implemented.'],
    });
  });

  it('includes strategy signals, market events, and snapshot output when present', () => {
    const strategySignals: StrategySignal[] = [
      {
        strategyId: 'momentum-basics',
        signalCode: 'momentum_threshold_met',
        symbol: 'BTC',
        severity: 'WATCH',
        title: 'Momentum cooling',
        message: 'Change trend has flattened',
        timestampMs: nowMs,
        eventHint: {
          eventType: 'MOMENTUM_BUILDING',
          alignmentState: 'WATCHFUL',
          confidenceScore: 0.77,
        },
      },
    ];
    const marketEvents: MarketEvent[] = [
      {
        eventId: 'acct-live:momentum-basics:momentum_threshold_met:BTC:1700000000000',
        timestamp: nowMs,
        accountId: 'acct-live',
        symbol: 'BTC',
        strategyId: 'momentum-basics',
        eventType: 'MOMENTUM_BUILDING',
        alignmentState: 'WATCHFUL',
        signalsTriggered: ['momentum_threshold_met'],
        confidenceScore: 0.77,
        certainty: 'confirmed',
        price: 100_000,
        pctChange: 0.05,
        metadata: {
          signalSeverity: 'WATCH',
          signalTitle: 'Momentum cooling',
          signalTags: [],
          relatedSymbols: ['BTC'],
        },
      },
    ];

    const result = buildDebugObservatoryPayload({
      timestampMs: nowMs,
      symbols,
      quotes,
      quoteMeta: createQuoteMeta(),
      strategySignals,
      marketEvents,
      snapshot: {
        portfolioValue: 104_000,
        change24h: 0.025,
        strategyAlignment: 'Needs review',
        bundleName: 'Calm Starter',
        accountId: 'acct-live',
      },
    });

    expect(result.strategySignals).toEqual(strategySignals);
    expect(result.marketEvents).toEqual(marketEvents);
    expect(JSON.stringify(result.runtimeDiagnostics)).not.toMatch(
      /momentum_threshold_met|signalsTriggered|confidenceScore/,
    );
    expect(result.snapshot).toEqual(
      expect.objectContaining({
        portfolioValue: 104_000,
        strategyAlignment: 'Needs review',
        bundleName: 'Calm Starter',
      }),
    );
  });

  it('can compare live events against persisted ledger entries', () => {
    const ledger = createEventLedgerService();
    const marketEvents: MarketEvent[] = [
      {
        eventId: 'acct-live:momentum-basics:momentum_threshold_met:BTC:1700000000000',
        timestamp: nowMs,
        accountId: 'acct-live',
        symbol: 'BTC',
        strategyId: 'momentum-basics',
        eventType: 'MOMENTUM_BUILDING',
        alignmentState: 'WATCHFUL',
        signalsTriggered: ['momentum_threshold_met'],
        confidenceScore: 0.77,
        certainty: 'confirmed',
        price: 100_000,
        pctChange: 0.05,
        metadata: {
          signalSeverity: 'WATCH',
          signalTitle: 'Momentum cooling',
          signalTags: [],
          relatedSymbols: ['BTC'],
        },
      },
    ];
    ledger.appendEvents(marketEvents);

    const result = buildDebugObservatoryPayload({
      timestampMs: nowMs,
      symbols,
      quotes,
      quoteMeta: createQuoteMeta(),
      marketEvents,
      eventLedger: ledger,
      accountId: 'acct-live',
    });

    expect(result.eventLedger).toEqual(
      expect.objectContaining({
        liveEventIds: [marketEvents[0]?.eventId],
        persistedEventIds: [marketEvents[0]?.eventId],
        countsMatch: true,
        sequencesMatch: true,
      }),
    );
  });

  it('degrades safely when optional sections are missing', () => {
    const result = buildDebugObservatoryPayload({
      timestampMs: nowMs,
      symbols,
      quotes,
      quoteMeta: createQuoteMeta(),
    });

    expect(result.deltas).toBeUndefined();
    expect(result.strategySignals).toBeUndefined();
    expect(result.marketEvents).toBeUndefined();
    expect(result.eventLedger).toBeUndefined();
    expect(result.snapshot).toBeUndefined();
    expect(result.quoteResult.meta.providerId).toBe('router:primary');
    expect(result.quoteResult.meta.fallbackUsed).toBe(false);
    expect(result.quoteResult.meta.coalescedRequest).toBe(false);
    expect(result.quoteResult.meta.requestedSymbols).toEqual(['BTC', 'ETH']);
    expect(result.quoteResult.meta.returnedSymbols).toEqual(['BTC', 'ETH']);
    expect(result.quoteResult.meta.missingSymbols).toEqual([]);
    expect(result.quoteResult.meta.policyStateBySymbol).toEqual({
      BTC: 'FRESH',
      ETH: 'FRESH',
    });
    expect(result.quoteResult.meta.sourceBySymbol).toEqual({
      BTC: 'primary-feed',
      ETH: 'fallback-feed',
    });
    expect(result.quoteResult.meta.policy.staleWhileRevalidate).toBe(
      'NOT_IMPLEMENTED_FOREGROUND_ONLY',
    );
  });

  it('preserves explicit missing symbol metadata', () => {
    const result = buildDebugObservatoryPayload({
      timestampMs: nowMs,
      symbols,
      quotes: { BTC: quotes.BTC },
      quoteMeta: createQuoteMeta({
        returnedSymbols: ['BTC'],
        missingSymbols: ['ETH'],
        sourceBySymbol: { BTC: 'primary-feed' },
      }),
    });

    expect(result.quoteResult.meta.returnedSymbols).toEqual(['BTC']);
    expect(result.quoteResult.meta.missingSymbols).toEqual(['ETH']);
  });
});
