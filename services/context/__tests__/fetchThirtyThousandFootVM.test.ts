import { readFileSync } from 'node:fs';
import { join } from 'node:path';

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
  accountContext?: SnapshotVM['accountContext'];
}): SnapshotVM {
  return {
    accountContext:
      overrides?.accountContext ??
      ({
        status: 'AVAILABLE',
        account: {
          accountId: 'acct-1',
          displayName: 'Primary account',
          selectionMode: 'PRIMARY_FALLBACK',
          baseCurrency: 'USD',
          strategyId: 'momentum_basics',
        },
      } as NonNullable<SnapshotVM['accountContext']>),
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

  it('keeps fit account-scoped when a different account has more stressed events', async () => {
    const result = await fetchThirtyThousandFootVM({
      snapshot: createSnapshot({
        strategyAlignment: 'Aligned',
        change24h: 0.01,
        currentTrendDirection: 'UP',
        events: [
          {
            eventId: 'acct-basic:momentum_basics:signal:ETH:2',
            timestamp: Date.parse('2026-04-05T00:00:01.000Z'),
            accountId: 'acct-basic',
            symbol: 'ETH',
            strategyId: 'momentum_basics',
            eventType: 'PRICE_MOVEMENT',
            alignmentState: 'NEEDS_REVIEW',
            signalsTriggered: ['snapshot_move_threshold_met'],
            confidenceScore: 0.95,
            certainty: 'confirmed',
            price: 90,
            pctChange: -0.08,
            metadata: {
              direction: 'down',
            },
          },
        ],
      }),
      surface: 'SNAPSHOT',
    });

    expect(result.fit).toEqual({
      state: 'FAVOURABLE',
      summary:
        'Conditions look broadly favourable for this strategy. Broader structure remains stable and volatility is closer to recent norms.',
    });
  });

  it('keeps the service on the shared surface-account seam instead of rebuilding selected-account branching locally', () => {
    const serviceSource = readFileSync(
      join(process.cwd(), 'services', 'context', 'fetchThirtyThousandFootVM.ts'),
      'utf8',
    );

    expect(serviceSource).toMatch(/createSurfaceAccountContext/);
    expect(serviceSource).not.toMatch(/snapshot\.accountContext\?\.status === 'AVAILABLE'/);
  });
});
