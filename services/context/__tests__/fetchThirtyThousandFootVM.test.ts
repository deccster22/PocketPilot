import { fetchThirtyThousandFootVM } from '@/services/context/fetchThirtyThousandFootVM';
import { fetchSnapshotVM } from '@/services/snapshot/snapshotService';
import type { SnapshotVM } from '@/services/snapshot/snapshotService';

jest.mock('@/services/snapshot/snapshotService');

function createSnapshot(overrides?: {
  strategyAlignment?: string;
  change24h?: number;
  currentState?: string;
  currentTrendDirection?: SnapshotVM['model']['core']['currentState']['trendDirection'];
  events?: SnapshotVM['eventStream']['events'];
}): SnapshotVM {
  return {
    model: {
      profile: 'BEGINNER',
      core: {
        currentState: {
          label: 'Current State',
          value: overrides?.currentState ?? 'Down',
          trendDirection: overrides?.currentTrendDirection ?? 'DOWN',
        },
        change24h: {
          label: 'Last 24h Change',
          value: overrides?.change24h ?? -0.05,
        },
        strategyStatus: {
          label: 'Strategy Status',
          value: overrides?.strategyAlignment ?? 'Watchful',
        },
      },
    },
    portfolioValue: 100,
    change24h: overrides?.change24h ?? -0.05,
    strategyAlignment: overrides?.strategyAlignment ?? 'Watchful',
    bundleName: 'Beginner Core',
    scan: {} as SnapshotVM['scan'],
    signals: [],
    marketEvents: overrides?.events ?? [],
    eventStream: {
      accountId: 'acct-1',
      timestamp: Date.parse('2026-04-05T00:00:00.000Z'),
      events: overrides?.events ?? [
        {
          eventId: 'acct-1:snapshot_change:snapshot_move_threshold_met:BTC:1',
          timestamp: Date.parse('2026-04-05T00:00:00.000Z'),
          accountId: 'acct-1',
          symbol: 'BTC',
          strategyId: 'snapshot_change',
          eventType: 'PRICE_MOVEMENT',
          alignmentState: 'WATCHFUL',
          signalsTriggered: ['snapshot_move_threshold_met'],
          confidenceScore: 0.81,
          certainty: 'confirmed',
          price: 100,
          pctChange: -0.05,
          metadata: {
            direction: 'down',
          },
        },
      ],
    },
    orientationContext: {
      accountId: 'acct-1',
      currentState: {
        latestRelevantEvent: null,
        strategyAlignment: (overrides?.strategyAlignment ?? 'Watchful')
          .toUpperCase()
          .replace(/\s+/g, '_'),
        certainty: null,
      },
      historyContext: {
        eventsSinceLastViewed: [],
        sinceLastChecked: null,
      },
    },
    eventsSinceLastViewed: [],
    sinceLastChecked: undefined,
    debugObservatory: undefined,
  };
}

describe('fetchThirtyThousandFootVM', () => {
  const mockFetchSnapshotVM = jest.mocked(fetchSnapshotVM);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('reuses a prepared snapshot when one is supplied', async () => {
    const snapshot = createSnapshot();

    const result = await fetchThirtyThousandFootVM({
      snapshot,
      surface: 'SNAPSHOT',
    });

    expect(mockFetchSnapshotVM).not.toHaveBeenCalled();
    expect(result.availability).toEqual({
      status: 'AVAILABLE',
      title: 'Broader conditions look mixed',
      summary:
        'Volatility or broader structure looks less settled than Snapshot usually needs to show.',
      details: [
        'Volatility is elevated relative to recent conditions.',
        'Broader structure still leans down, but the broader picture remains mixed.',
        'Current strategy fit currently reads mixed under this backdrop.',
      ],
    });
  });

  it('fetches one canonical prepared snapshot when needed', async () => {
    mockFetchSnapshotVM.mockResolvedValue(createSnapshot());

    const result = await fetchThirtyThousandFootVM({
      profile: 'BEGINNER',
      surface: 'SNAPSHOT',
      nowProvider: () => Date.parse('2026-04-05T00:00:00.000Z'),
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
    expect(result.generatedAt).toBe('2026-04-05T00:00:00.000Z');
    expect(result.fit).toEqual({
      state: 'MIXED',
      summary:
        'Conditions look mixed for this strategy while volatility stays elevated relative to recent conditions.',
    });
  });

  it('keeps raw signal and runtime fields out of the prepared user-facing VM', async () => {
    const result = await fetchThirtyThousandFootVM({
      snapshot: createSnapshot(),
      surface: 'SNAPSHOT',
    });

    expect(JSON.stringify(result)).not.toMatch(
      /eventId|strategyId|signalsTriggered|metadata|providerId|broker:live|accountId/,
    );
  });
});
