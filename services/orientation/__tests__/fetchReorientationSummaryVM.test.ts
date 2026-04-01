import { fetchReorientationSummaryVM } from '@/services/orientation/fetchReorientationSummaryVM';
import { fetchSnapshotVM } from '@/services/snapshot/snapshotService';

jest.mock('@/services/snapshot/snapshotService');

describe('fetchReorientationSummaryVM', () => {
  const mockFetchSnapshotVM = jest.mocked(fetchSnapshotVM);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('consumes prepared snapshot and orientation seams instead of pushing interpretation into app', async () => {
    mockFetchSnapshotVM.mockResolvedValue({
      model: {
        profile: 'BEGINNER',
        core: {
          currentState: {
            label: 'Current State',
            value: 'Up',
            trendDirection: 'UP',
          },
          change24h: {
            label: 'Last 24h Change',
            value: 0.03,
          },
          strategyStatus: {
            label: 'Strategy Status',
            value: 'Watchful',
          },
        },
        history: {
          hasNewSinceLastCheck: true,
        },
      },
      portfolioValue: 100,
      change24h: 0.03,
      strategyAlignment: 'Watchful',
      bundleName: 'Beginner Core',
      scan: {
        accountId: 'acct-1',
        symbols: [],
        quotes: {},
        baselineQuotes: undefined,
        pctChangeBySymbol: {},
        estimatedFlags: {},
        instrumentation: {
          requests: 0,
          symbolsRequested: 0,
          symbolsFetched: 0,
          symbolsBlocked: 0,
        },
      },
      signals: [],
      marketEvents: [],
      eventStream: {
        accountId: 'acct-1',
        timestamp: Date.parse('2026-04-01T00:00:00.000Z'),
        events: [],
      },
      orientationContext: {
        accountId: 'acct-1',
        currentState: {
          latestRelevantEvent: null,
          strategyAlignment: 'Watchful',
          certainty: null,
        },
        historyContext: {
          eventsSinceLastViewed: [
            {
              eventId: 'acct-1:data_quality:budget_blocked_symbols:BTC:1',
              timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
              accountId: 'acct-1',
              symbol: 'BTC',
              strategyId: 'data_quality',
              eventType: 'DATA_QUALITY',
              alignmentState: 'WATCHFUL',
              signalsTriggered: ['budget_blocked_symbols'],
              confidenceScore: 0.9,
              certainty: 'confirmed',
              price: 100,
              pctChange: null,
              metadata: {
                signalTitle: 'Scan incomplete',
              },
            },
            {
              eventId: 'acct-1:momentum_basics:estimated_quote:ETH:2',
              timestamp: Date.parse('2026-03-21T00:00:00.000Z'),
              accountId: 'acct-1',
              symbol: 'ETH',
              strategyId: 'momentum_basics',
              eventType: 'ESTIMATED_PRICE',
              alignmentState: 'WATCHFUL',
              signalsTriggered: ['estimated_quote'],
              confidenceScore: 0.7,
              certainty: 'estimated',
              price: 200,
              pctChange: -0.01,
              metadata: {
                signalTitle: 'Estimated quote',
              },
            },
          ],
          sinceLastChecked: {
            sinceTimestamp: Date.parse('2026-02-28T00:00:00.000Z'),
            accountId: 'acct-1',
            summaryCount: 2,
            events: [],
          },
        },
      },
      eventsSinceLastViewed: [],
      sinceLastChecked: {
        sinceTimestamp: Date.parse('2026-02-28T00:00:00.000Z'),
        accountId: 'acct-1',
        summaryCount: 2,
        events: [],
      },
    } as unknown as Awaited<ReturnType<typeof fetchSnapshotVM>>);

    const result = await fetchReorientationSummaryVM({
      profile: 'BEGINNER',
      nowProvider: () => Date.parse('2026-04-01T00:00:00.000Z'),
    });

    expect(mockFetchSnapshotVM).toHaveBeenCalledWith({
      profile: 'BEGINNER',
      baselineScan: undefined,
      nowProvider: expect.any(Function),
      eventLedger: undefined,
      eventLedgerQueries: undefined,
      lastViewedTimestamp: undefined,
      lastViewedState: undefined,
    });
    expect(result).toMatchObject({
      status: 'AVAILABLE',
      profileId: 'BEGINNER',
      inactiveDays: 32,
      maxItems: 3,
    });

    if (result.status !== 'AVAILABLE') {
      return;
    }

    expect(result.summaryItems).toEqual([
      {
        kind: 'ACCOUNT_CONTEXT',
        label: 'Data context',
        detail: 'Some recent market context was captured with data quality limits in view.',
      },
      {
        kind: 'ACCOUNT_CONTEXT',
        label: 'ETH price context',
        detail: 'Recent pricing context for ETH remains estimated.',
      },
      {
        kind: 'MARKET_EVENT',
        label: 'Current orientation',
        detail: 'Snapshot reads up with strategy status at watchful.',
      },
    ]);
  });

  it('returns no meaningful change when the prepared history seam is unavailable', async () => {
    mockFetchSnapshotVM.mockResolvedValue({
      model: {
        profile: 'ADVANCED',
        core: {
          currentState: {
            label: 'Current State',
            value: 'Flat',
            trendDirection: 'FLAT',
          },
          change24h: {
            label: 'Last 24h Change',
            value: 0,
          },
          strategyStatus: {
            label: 'Strategy Status',
            value: 'Aligned',
          },
        },
      },
      portfolioValue: 100,
      change24h: 0,
      strategyAlignment: 'Aligned',
      bundleName: 'Advanced Core',
      scan: {
        accountId: 'acct-1',
        symbols: [],
        quotes: {},
        baselineQuotes: undefined,
        pctChangeBySymbol: {},
        estimatedFlags: {},
        instrumentation: {
          requests: 0,
          symbolsRequested: 0,
          symbolsFetched: 0,
          symbolsBlocked: 0,
        },
      },
      signals: [],
      marketEvents: [],
      eventStream: {
        accountId: 'acct-1',
        timestamp: Date.parse('2026-04-01T00:00:00.000Z'),
        events: [],
      },
      orientationContext: {
        currentState: {
          latestRelevantEvent: null,
          strategyAlignment: 'Aligned',
          certainty: null,
        },
        historyContext: {
          eventsSinceLastViewed: [],
          sinceLastChecked: null,
        },
      },
    } as unknown as Awaited<ReturnType<typeof fetchSnapshotVM>>);

    await expect(
      fetchReorientationSummaryVM({
        profile: 'ADVANCED',
        nowProvider: () => Date.parse('2026-04-01T00:00:00.000Z'),
        preference: {
          enabled: true,
        },
      }),
    ).resolves.toEqual({
      status: 'NOT_NEEDED',
      reason: 'NO_MEANINGFUL_CHANGE',
    });
  });
});
