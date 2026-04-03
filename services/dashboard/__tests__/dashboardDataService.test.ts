import type { MarketEvent } from '@/core/types/marketEvent';
import { fetchDashboardData } from '@/services/dashboard/dashboardDataService';
import { fetchSurfaceContext } from '@/services/upstream/fetchSurfaceContext';

jest.mock('@/services/upstream/fetchSurfaceContext');

function createEvent(overrides: Partial<MarketEvent> = {}): MarketEvent {
  return {
    eventId: 'acct-live:strategy-a:signal:BTC:100',
    timestamp: 100,
    accountId: 'acct-live',
    symbol: 'BTC',
    strategyId: 'strategy-a',
    eventType: 'MOMENTUM_BUILDING',
    alignmentState: 'WATCHFUL',
    signalsTriggered: ['signal'],
    confidenceScore: 0.8,
    certainty: 'confirmed',
    price: 100,
    pctChange: 0.03,
    metadata: {
      signalTitle: 'Momentum building',
      nested: { hidden: true },
    },
    ...overrides,
  };
}

describe('fetchDashboardData', () => {
  const mockFetchSurfaceContext = jest.mocked(fetchSurfaceContext);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('builds a dedicated dashboard upstream payload from shared surface truth', async () => {
    const upstreamEvent = createEvent();
    const historyEvent = createEvent({
      eventId: 'acct-live:strategy-a:signal:BTC:95',
      timestamp: 95,
      certainty: 'estimated',
    });
    const upstreamOrientationContext = {
      accountId: 'acct-live',
      symbol: 'BTC',
      strategyId: 'strategy-a',
      currentState: {
        latestRelevantEvent: upstreamEvent,
        strategyAlignment: 'Watchful',
        certainty: 'confirmed' as const,
      },
      historyContext: {
        eventsSinceLastViewed: [historyEvent],
        sinceLastChecked: {
          sinceTimestamp: 90,
          accountId: 'acct-live',
          summaryCount: 1,
          events: [historyEvent],
        },
      },
    };
    const nowProvider = () => 1_700_000_000_100;

    mockFetchSurfaceContext.mockResolvedValue({
      portfolioValue: 300,
      change24h: 0.02,
      strategyAlignment: 'Watchful',
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
        pctChangeBySymbol: { BTC: 0.03 },
        estimatedFlags: { BTC: false },
        instrumentation: {
          requests: 1,
          symbolsRequested: 1,
          symbolsFetched: 1,
          symbolsBlocked: 0,
        },
        quoteMeta: {
          provider: 'broker:live',
          fallbackUsed: false,
          requestedSymbols: ['BTC'],
          returnedSymbols: ['BTC'],
          missingSymbols: [],
          timestampMs: 1_700_000_000_000,
          providersTried: ['broker:live'],
          sourceBySymbol: { BTC: 'stub' },
        },
      },
      signals: [],
      marketEvents: [upstreamEvent],
      eventStream: {
        accountId: 'acct-live',
        timestamp: 100,
        events: [upstreamEvent],
      },
      orientationContext: upstreamOrientationContext,
      eventsSinceLastViewed: undefined,
      sinceLastChecked: undefined,
    });

    const result = await fetchDashboardData({
      profile: 'ADVANCED',
      nowProvider,
    });

    expect(mockFetchSurfaceContext).toHaveBeenCalledWith({
      profile: 'ADVANCED',
      nowProvider,
    });
    expect(result.scan.accountId).toBe('acct-live');
    expect(result.orientationContext).toEqual({
      profile: 'ADVANCED',
      assets: [],
    });
    expect(result.events).toEqual([upstreamEvent]);
    expect(result.events[0]).not.toBe(upstreamEvent);
    expect(result.events[0].signalsTriggered).not.toBe(upstreamEvent.signalsTriggered);
    expect(result.events[0].metadata).not.toBe(upstreamEvent.metadata);
    expect(result.explanationContext.currentState.latestRelevantEvent).toEqual(upstreamEvent);
    expect(result.explanationContext.currentState.latestRelevantEvent).not.toBe(upstreamEvent);
    expect(result.explanationContext.historyContext.eventsSinceLastViewed).toEqual([historyEvent]);
    expect(result.explanationContext.historyContext.eventsSinceLastViewed).not.toBe(
      upstreamOrientationContext.historyContext.eventsSinceLastViewed,
    );
    expect(result.explanationContext.historyContext.sinceLastChecked?.events[0]).toEqual(historyEvent);
    expect(result.explanationContext.historyContext.sinceLastChecked?.events).not.toBe(
      upstreamOrientationContext.historyContext.sinceLastChecked.events,
    );
  });
});
