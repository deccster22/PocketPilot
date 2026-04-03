import { fetchSnapshotVM } from '@/services/snapshot/snapshotService';
import { fetchSnapshotSurfaceVM } from '@/services/snapshot/fetchSnapshotSurfaceVM';
import type { ProviderRouterResult } from '@/services/providers/providerRouter';

jest.mock('@/services/snapshot/snapshotService');

describe('fetchSnapshotSurfaceVM', () => {
  const mockFetchSnapshotVM = jest.mocked(fetchSnapshotVM);
  const createQuoteMeta = (): ProviderRouterResult['meta'] => ({
    role: 'execution',
    providerId: 'broker:live',
    freshness: 'UNAVAILABLE',
    certainty: 'UNAVAILABLE',
    lastUpdatedAt: null,
    lastGoodAt: null,
    usedLastGood: false,
    fallbackUsed: false,
    requestedSymbols: [],
    returnedSymbols: [],
    missingSymbols: [],
    timestampMs: Date.parse('2026-04-01T00:00:00.000Z'),
    providersTried: ['broker:live'],
    sourceBySymbol: {},
    coalescedRequest: false,
    policyStateBySymbol: {},
    providerHealthSummary: {
      'broker:live': {
        providerId: 'broker:live',
        requests: 0,
        symbolsRequested: 0,
        symbolsFetched: 0,
        symbolsBlocked: 0,
        cooldown: 'INACTIVE',
      },
    },
    policy: {
      staleIfError: 'FAILED_WITHOUT_LAST_GOOD',
      staleWhileRevalidate: 'NOT_IMPLEMENTED_FOREGROUND_ONLY',
      cooldown: 'INACTIVE',
      cooldownSkippedProviders: [],
    },
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('composes snapshot and reorientation into one prepared Snapshot surface VM', async () => {
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
        quoteMeta: createQuoteMeta(),
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
          strategyAlignment: 'WATCHFUL',
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
          ],
          sinceLastChecked: {
            sinceTimestamp: Date.parse('2026-02-28T00:00:00.000Z'),
            accountId: 'acct-1',
            summaryCount: 1,
            events: [],
          },
        },
      },
      eventsSinceLastViewed: [],
      sinceLastChecked: {
        sinceTimestamp: Date.parse('2026-02-28T00:00:00.000Z'),
        accountId: 'acct-1',
        summaryCount: 1,
        events: [],
      },
    } as Awaited<ReturnType<typeof fetchSnapshotVM>>);

    const result = await fetchSnapshotSurfaceVM({
      profile: 'BEGINNER',
      nowProvider: () => Date.parse('2026-04-01T00:00:00.000Z'),
    });

    expect(mockFetchSnapshotVM).toHaveBeenCalledWith({
      profile: 'BEGINNER',
      baselineScan: undefined,
      nowProvider: expect.any(Function),
      includeDebugObservatory: undefined,
      eventLedger: undefined,
      eventLedgerQueries: undefined,
      lastViewedTimestamp: undefined,
      lastViewedState: undefined,
    });
    expect(result.snapshot.model.core.currentState.value).toBe('Up');
    expect(result.reorientation).toMatchObject({
      status: 'VISIBLE',
      reason: 'AVAILABLE',
      dismissible: true,
    });

    expect(result.reorientation.summary).toMatchObject({
      status: 'AVAILABLE',
      summaryItems: [
        {
          label: 'Data context',
          detail: 'Some recent market context was captured with data quality limits in view.',
        },
        {
          label: 'Current orientation',
          detail: 'Snapshot reads up with strategy status at watchful.',
        },
      ],
    });
    expect(result.briefing).toEqual({
      status: 'VISIBLE',
      kind: 'REORIENTATION',
      title: 'Welcome back',
      subtitle: 'Welcome back. Here is a quick briefing to help you get your bearings.',
      items: [
        {
          label: 'Data context',
          detail: 'Some recent market context was captured with data quality limits in view.',
        },
        {
          label: 'Current orientation',
          detail: 'Snapshot reads up with strategy status at watchful.',
        },
      ],
      dismissible: true,
    });
    expect(JSON.stringify(result.reorientation.summary)).not.toMatch(/signalsTriggered|budget_blocked_symbols|signalTitle/);
  });

  it('uses Since Last Checked when reorientation is not available', async () => {
    mockFetchSnapshotVM.mockResolvedValue({
      model: {
        profile: 'ADVANCED',
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
      },
      portfolioValue: 100,
      change24h: 0.03,
      strategyAlignment: 'Watchful',
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
        quoteMeta: createQuoteMeta(),
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
          strategyAlignment: 'WATCHFUL',
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
          ],
          sinceLastChecked: {
            sinceTimestamp: Date.parse('2026-02-28T00:00:00.000Z'),
            accountId: 'acct-1',
            summaryCount: 1,
            events: [],
          },
        },
      },
      eventsSinceLastViewed: [],
      sinceLastChecked: {
        sinceTimestamp: Date.parse('2026-02-28T00:00:00.000Z'),
        accountId: 'acct-1',
        summaryCount: 1,
        events: [],
      },
    } as Awaited<ReturnType<typeof fetchSnapshotVM>>);

    const result = await fetchSnapshotSurfaceVM({
      profile: 'ADVANCED',
      nowProvider: () => Date.parse('2026-04-01T00:00:00.000Z'),
    });

    expect(result.reorientation).toMatchObject({
      status: 'HIDDEN',
      reason: 'NOT_NEEDED',
    });
    expect(result.briefing).toEqual({
      status: 'VISIBLE',
      kind: 'SINCE_LAST_CHECKED',
      title: 'Since last checked',
      subtitle: 'A calm read on the most meaningful interpreted changes since your last visit.',
      items: [
        {
          label: 'Data context',
          detail: 'Some recent market context was captured with data quality limits in view.',
        },
        {
          label: 'Current orientation',
          detail: 'Snapshot reads up with strategy status at watchful.',
        },
      ],
      dismissible: false,
    });
  });

  it('hides the card when no meaningful reorientation summary is needed', async () => {
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
        quoteMeta: createQuoteMeta(),
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
          strategyAlignment: 'ALIGNED',
          certainty: null,
        },
        historyContext: {
          eventsSinceLastViewed: [],
          sinceLastChecked: null,
        },
      },
    } as Awaited<ReturnType<typeof fetchSnapshotVM>>);

    await expect(
      fetchSnapshotSurfaceVM({
        profile: 'ADVANCED',
        nowProvider: () => Date.parse('2026-04-01T00:00:00.000Z'),
      }),
    ).resolves.toMatchObject({
      briefing: {
        status: 'HIDDEN',
        reason: 'NO_REORIENTATION',
      },
      reorientation: {
        status: 'HIDDEN',
        reason: 'NOT_NEEDED',
        summary: null,
        dismissible: false,
      },
    });
  });

  it('hides the card when the current session has already dismissed it', async () => {
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
        quoteMeta: createQuoteMeta(),
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
          strategyAlignment: 'WATCHFUL',
          certainty: null,
        },
        historyContext: {
          eventsSinceLastViewed: [
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
            summaryCount: 1,
            events: [],
          },
        },
      },
      eventsSinceLastViewed: [],
      sinceLastChecked: {
        sinceTimestamp: Date.parse('2026-02-28T00:00:00.000Z'),
        accountId: 'acct-1',
        summaryCount: 1,
        events: [],
      },
    } as Awaited<ReturnType<typeof fetchSnapshotVM>>);

    await expect(
      fetchSnapshotSurfaceVM({
        profile: 'BEGINNER',
        nowProvider: () => Date.parse('2026-04-01T00:00:00.000Z'),
        currentSessionDismissState: {
          dismissedAt: '2026-04-01T00:00:00.000Z',
        },
      }),
    ).resolves.toMatchObject({
      briefing: {
        status: 'HIDDEN',
        reason: 'NO_MEANINGFUL_BRIEFING',
      },
      reorientation: {
        status: 'HIDDEN',
        reason: 'DISMISSED',
        dismissible: true,
      },
    });
  });

  it('honors persisted dismissal across reloads without mutating the underlying summary truth', async () => {
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
        quoteMeta: createQuoteMeta(),
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
          strategyAlignment: 'WATCHFUL',
          certainty: null,
        },
        historyContext: {
          eventsSinceLastViewed: [
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
            summaryCount: 1,
            events: [],
          },
        },
      },
      eventsSinceLastViewed: [],
      sinceLastChecked: {
        sinceTimestamp: Date.parse('2026-02-28T00:00:00.000Z'),
        accountId: 'acct-1',
        summaryCount: 1,
        events: [],
      },
    } as Awaited<ReturnType<typeof fetchSnapshotVM>>);

    const result = await fetchSnapshotSurfaceVM({
      profile: 'BEGINNER',
      nowProvider: () => Date.parse('2026-04-01T00:00:00.000Z'),
      reorientationDismissState: {
        dismissedAt: '2026-04-01T00:00:00.000Z',
      },
    });

    expect(result.reorientation).toMatchObject({
      status: 'HIDDEN',
      reason: 'DISMISSED',
      dismissible: true,
    });
    expect(result.briefing).toEqual({
      status: 'HIDDEN',
      reason: 'NO_MEANINGFUL_BRIEFING',
    });
    expect(result.reorientation.summary).toMatchObject({
      status: 'AVAILABLE',
      generatedFrom: {
        lastActiveAt: '2026-02-28T00:00:00.000Z',
        now: '2026-04-01T00:00:00.000Z',
      },
    });
  });

  it('lets a newer eligible summary reappear after the previous dismissal boundary becomes stale', async () => {
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
        quoteMeta: createQuoteMeta(),
      },
      signals: [],
      marketEvents: [],
      eventStream: {
        accountId: 'acct-1',
        timestamp: Date.parse('2026-05-10T00:00:00.000Z'),
        events: [],
      },
      orientationContext: {
        accountId: 'acct-1',
        currentState: {
          latestRelevantEvent: null,
          strategyAlignment: 'WATCHFUL',
          certainty: null,
        },
        historyContext: {
          eventsSinceLastViewed: [
            {
              eventId: 'acct-1:data_quality:budget_blocked_symbols:BTC:1',
              timestamp: Date.parse('2026-05-01T00:00:00.000Z'),
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
          ],
          sinceLastChecked: {
            sinceTimestamp: Date.parse('2026-04-05T00:00:00.000Z'),
            accountId: 'acct-1',
            summaryCount: 1,
            events: [],
          },
        },
      },
      eventsSinceLastViewed: [],
      sinceLastChecked: {
        sinceTimestamp: Date.parse('2026-04-05T00:00:00.000Z'),
        accountId: 'acct-1',
        summaryCount: 1,
        events: [],
      },
    } as Awaited<ReturnType<typeof fetchSnapshotVM>>);

    const result = await fetchSnapshotSurfaceVM({
      profile: 'BEGINNER',
      nowProvider: () => Date.parse('2026-05-10T00:00:00.000Z'),
      reorientationDismissState: {
        dismissedAt: '2026-04-01T00:00:00.000Z',
      },
    });

    expect(result.reorientation).toMatchObject({
      status: 'VISIBLE',
      reason: 'AVAILABLE',
      dismissible: true,
    });
    expect(result.briefing).toMatchObject({
      status: 'VISIBLE',
      kind: 'REORIENTATION',
    });
    expect(JSON.stringify(result.reorientation.summary)).not.toMatch(
      /signalsTriggered|budget_blocked_symbols|signalTitle|unread|badge|reminder|urgent/,
    );
  });

  it('stops honoring current-session dismissal when a newer eligible cycle appears', async () => {
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
        quoteMeta: createQuoteMeta(),
      },
      signals: [],
      marketEvents: [],
      eventStream: {
        accountId: 'acct-1',
        timestamp: Date.parse('2026-05-10T00:00:00.000Z'),
        events: [],
      },
      orientationContext: {
        accountId: 'acct-1',
        currentState: {
          latestRelevantEvent: null,
          strategyAlignment: 'WATCHFUL',
          certainty: null,
        },
        historyContext: {
          eventsSinceLastViewed: [
            {
              eventId: 'acct-1:data_quality:budget_blocked_symbols:BTC:1',
              timestamp: Date.parse('2026-05-01T00:00:00.000Z'),
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
          ],
          sinceLastChecked: {
            sinceTimestamp: Date.parse('2026-04-05T00:00:00.000Z'),
            accountId: 'acct-1',
            summaryCount: 1,
            events: [],
          },
        },
      },
      eventsSinceLastViewed: [],
      sinceLastChecked: {
        sinceTimestamp: Date.parse('2026-04-05T00:00:00.000Z'),
        accountId: 'acct-1',
        summaryCount: 1,
        events: [],
      },
    } as Awaited<ReturnType<typeof fetchSnapshotVM>>);

    const result = await fetchSnapshotSurfaceVM({
      profile: 'BEGINNER',
      nowProvider: () => Date.parse('2026-05-10T00:00:00.000Z'),
      currentSessionDismissState: {
        dismissedAt: '2026-04-01T00:00:00.000Z',
      },
    });

    expect(result.reorientation).toMatchObject({
      status: 'VISIBLE',
      reason: 'AVAILABLE',
      dismissible: true,
    });
    expect(result.briefing).toMatchObject({
      status: 'VISIBLE',
      kind: 'REORIENTATION',
    });
  });
});
