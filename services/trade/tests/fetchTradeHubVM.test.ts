import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { MarketEvent } from '@/core/types/marketEvent';
import { fetchTradeHubVM } from '@/services/trade/fetchTradeHubVM';
import { fetchSurfaceContext } from '@/services/upstream/fetchSurfaceContext';

jest.mock('@/services/upstream/fetchSurfaceContext');

function createEvent(overrides: Partial<MarketEvent> = {}): MarketEvent {
  return {
    eventId: 'acct-live:momentum_basics:signal:BTC:100',
    timestamp: 100,
    accountId: 'acct-live',
    symbol: 'BTC',
    strategyId: 'momentum_basics',
    eventType: 'MOMENTUM_BUILDING',
    alignmentState: 'ALIGNED',
    signalsTriggered: ['hidden-signal'],
    confidenceScore: 0.9,
    certainty: 'confirmed',
    price: 100,
    pctChange: 0.04,
    metadata: {
      hidden: true,
    },
    ...overrides,
  };
}

describe('fetchTradeHubVM', () => {
  const mockFetchSurfaceContext = jest.mocked(fetchSurfaceContext);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('builds a prepared trade hub surface from shared upstream truth', async () => {
    const upstreamEvent = createEvent();
    const nowProvider = () => 1_700_000_000_100;

    mockFetchSurfaceContext.mockResolvedValue({
      selectedAccountContext: {
        status: 'AVAILABLE',
        account: {
          accountId: 'acct-live',
          displayName: 'Live account',
          selectionMode: 'PRIMARY_FALLBACK',
          baseCurrency: 'USD',
          strategyId: 'momentum_basics',
        },
      },
      portfolioValue: 300,
      change24h: 0.02,
      strategyAlignment: 'Aligned',
      bundleName: 'Advanced Core',
      eventLedger: {
        appendEvents: jest.fn(),
        getEventsByAccount: jest.fn().mockReturnValue([]),
      } as never,
      scan: {
        accountId: 'acct-live',
        symbols: ['BTC'],
        quotes: {
          BTC: {
            symbol: 'BTC',
            price: 100,
            source: 'stub',
            timestampMs: 1_700_000_000_000,
            estimated: false,
          },
        },
        baselineQuotes: undefined,
        pctChangeBySymbol: { BTC: 0.04 },
        estimatedFlags: { BTC: false },
        instrumentation: {
          requests: 1,
          symbolsRequested: 1,
          symbolsFetched: 1,
          symbolsBlocked: 0,
        },
        quoteMeta: {
          role: 'execution',
          providerId: 'broker:live',
          freshness: 'FRESH',
          certainty: 'CONFIRMED',
          lastUpdatedAt: '2023-11-14T22:13:20.000Z',
          lastGoodAt: null,
          usedLastGood: false,
          fallbackUsed: false,
          requestedSymbols: ['BTC'],
          returnedSymbols: ['BTC'],
          missingSymbols: [],
          timestampMs: 1_700_000_000_000,
          providersTried: ['broker:live'],
          sourceBySymbol: { BTC: 'stub' },
          coalescedRequest: false,
          policyStateBySymbol: { BTC: 'FRESH' },
          providerHealthSummary: {
            'broker:live': {
              providerId: 'broker:live',
              requests: 1,
              symbolsRequested: 1,
              symbolsFetched: 1,
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
        },
      },
      signals: [],
      marketEvents: [upstreamEvent],
      eventStream: {
        accountId: 'acct-live',
        timestamp: 100,
        events: [upstreamEvent],
      },
      orientationContext: {
        accountId: 'acct-live',
        symbol: 'BTC',
        strategyId: 'momentum_basics',
        currentState: {
          latestRelevantEvent: upstreamEvent,
          strategyAlignment: 'Aligned',
          certainty: 'confirmed',
        },
        historyContext: {
          eventsSinceLastViewed: [],
          sinceLastChecked: null,
        },
      },
      eventsSinceLastViewed: undefined,
      sinceLastChecked: undefined,
    });

    const result = await fetchTradeHubVM({
      profile: 'ADVANCED',
      nowProvider,
    });

    expect(mockFetchSurfaceContext).toHaveBeenCalledWith({
      profile: 'ADVANCED',
      baselineScan: undefined,
      nowProvider,
      eventLedger: undefined,
      eventLedgerQueries: undefined,
      lastViewedTimestamp: undefined,
      lastViewedState: undefined,
    });
    expect(result.scan.accountId).toBe('acct-live');
    expect(result.model).toEqual({
      primaryPlan: {
        planId:
          'acct-live:momentum_basics:BTC:ACCUMULATE:acct-live:momentum_basics:signal:BTC:100',
        intentType: 'ACCUMULATE',
        symbol: 'BTC',
        alignment: 'ALIGNED',
        certainty: 'HIGH',
        summary:
          'Accumulation setup is supported by confirmed momentum building. Focus symbol: BTC.',
        supportingEventCount: 1,
        actionState: 'READY',
      },
      alternativePlans: [],
      meta: {
        hasPrimaryPlan: true,
        profile: 'ADVANCED',
        requiresConfirmation: true,
      },
    });
    expect(JSON.stringify(result.model)).not.toContain('hidden-signal');
    expect(JSON.stringify(result.model)).not.toContain('hidden');
  });

  it('stays decoupled from snapshot and dashboard service paths', () => {
    const serviceSource = readFileSync(
      join(process.cwd(), 'services', 'trade', 'fetchTradeHubVM.ts'),
      'utf8',
    );

    expect(serviceSource).not.toMatch(/fetchSnapshotVM/);
    expect(serviceSource).not.toMatch(/snapshotService/);
    expect(serviceSource).not.toMatch(/fetchDashboardSurfaceVM/);
    expect(serviceSource).not.toMatch(/dashboardSurfaceService/);
  });
});
