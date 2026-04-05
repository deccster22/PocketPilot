import { fetchMessagePolicyVM } from '@/services/messages/fetchMessagePolicyVM';
import { fetchSnapshotSurfaceVM } from '@/services/snapshot/fetchSnapshotSurfaceVM';
import type { SnapshotSurfaceVM } from '@/services/snapshot/fetchSnapshotSurfaceVM';

jest.mock('@/services/snapshot/fetchSnapshotSurfaceVM');

function createSnapshotSurface(): SnapshotSurfaceVM {
  return {
    snapshot: {
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
            value: 0.05,
          },
          strategyStatus: {
            label: 'Strategy Status',
            value: 'Watchful',
          },
        },
      },
      portfolioValue: 100,
      change24h: 0.05,
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
        quoteMeta: {
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
          timestampMs: Date.parse('2026-04-05T00:00:00.000Z'),
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
        },
      },
      signals: [],
      marketEvents: [],
      eventStream: {
        accountId: 'acct-1',
        timestamp: Date.parse('2026-04-05T00:00:00.000Z'),
        events: [],
      },
      orientationContext: {
        accountId: 'acct-1',
        currentState: {
          latestRelevantEvent: {
            eventId: 'evt-price-move-3',
            timestamp: Date.parse('2026-04-05T00:00:00.000Z'),
            accountId: 'acct-1',
            symbol: 'ETH',
            strategyId: 'momentum_basics',
            eventType: 'PRICE_MOVEMENT',
            alignmentState: 'WATCHFUL',
            signalsTriggered: ['momentum_signal'],
            confidenceScore: 0.95,
            certainty: 'confirmed',
            price: 120,
            pctChange: 0.08,
            metadata: {
              signalTitle: 'Momentum spike',
            },
          },
          strategyAlignment: 'WATCHFUL',
          certainty: 'confirmed',
        },
        historyContext: {
          eventsSinceLastViewed: [],
          sinceLastChecked: null,
        },
      },
    },
    reorientation: {
      status: 'HIDDEN',
      reason: 'NOT_NEEDED',
      summary: null,
      dismissible: false,
    },
    briefing: {
      status: 'HIDDEN',
      reason: 'NO_REORIENTATION',
    },
  };
}

describe('fetchMessagePolicyVM', () => {
  const mockFetchSnapshotSurfaceVM = jest.mocked(fetchSnapshotSurfaceVM);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('uses a provided Snapshot surface instead of fetching a second time', async () => {
    const snapshotSurface = createSnapshotSurface();

    const result = await fetchMessagePolicyVM({
      surface: 'SNAPSHOT',
      profile: 'ADVANCED',
      snapshotSurface,
    });

    expect(mockFetchSnapshotSurfaceVM).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: 'AVAILABLE',
      messages: [
        {
          kind: 'ALERT',
          title: 'Meaningful change noticed',
          summary:
            'ETH is standing out in recent interpreted context. Review Snapshot before deciding whether it changes your plan.',
          priority: 'HIGH',
          surface: 'SNAPSHOT',
          dismissible: false,
        },
      ],
    });
  });

  it('fetches the Snapshot surface when one is not supplied', async () => {
    const snapshotSurface = createSnapshotSurface();
    mockFetchSnapshotSurfaceVM.mockResolvedValue(snapshotSurface);

    const result = await fetchMessagePolicyVM({
      surface: 'SNAPSHOT',
      profile: 'ADVANCED',
      baselineScan: snapshotSurface.snapshot.scan,
      reorientationDismissState: {
        dismissedAt: null,
      },
      currentSessionDismissState: {
        dismissedAt: null,
      },
    });

    expect(mockFetchSnapshotSurfaceVM).toHaveBeenCalledWith({
      profile: 'ADVANCED',
      baselineScan: snapshotSurface.snapshot.scan,
      nowProvider: undefined,
      includeDebugObservatory: undefined,
      eventLedger: undefined,
      eventLedgerQueries: undefined,
      lastViewedTimestamp: undefined,
      lastViewedState: undefined,
      preference: undefined,
      reorientationDismissState: {
        dismissedAt: null,
      },
      currentSessionDismissState: {
        dismissedAt: null,
      },
      reorientationVisibility: undefined,
    });
    expect(result).toMatchObject({
      status: 'AVAILABLE',
      messages: [
        {
          kind: 'ALERT',
          surface: 'SNAPSHOT',
        },
      ],
    });
  });

  it('returns surface filtering decisions through the canonical fetch seam', async () => {
    const snapshotSurface = createSnapshotSurface();

    await expect(
      fetchMessagePolicyVM({
        surface: 'SNAPSHOT',
        profile: 'ADVANCED',
        snapshotSurface,
        guardedStop: {
          title: 'Pause here',
          summary: 'PocketPilot cannot continue this path safely with the current context.',
        },
      }),
    ).resolves.toEqual({
      status: 'AVAILABLE',
      messages: [
        {
          kind: 'ALERT',
          title: 'Meaningful change noticed',
          summary:
            'ETH is standing out in recent interpreted context. Review Snapshot before deciding whether it changes your plan.',
          priority: 'HIGH',
          surface: 'SNAPSHOT',
          dismissible: false,
        },
      ],
    });
  });
});
