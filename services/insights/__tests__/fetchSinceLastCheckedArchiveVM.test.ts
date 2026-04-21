import type { MarketEvent } from '@/core/types/marketEvent';
import { createEventLedgerQueries } from '@/services/events/eventLedgerQueries';
import { createEventLedgerService } from '@/services/events/eventLedgerService';
import { fetchSinceLastCheckedArchiveVM } from '@/services/insights/fetchSinceLastCheckedArchiveVM';
import { fetchSinceLastCheckedVM } from '@/services/orientation/fetchSinceLastCheckedVM';
import {
  createInMemoryLastViewedState,
  SNAPSHOT_LAST_VIEWED_SURFACE_ID,
} from '@/services/orientation/lastViewedState';
import type { SnapshotVM } from '@/services/snapshot/snapshotService';

function createMarketEvent(
  overrides: Partial<MarketEvent> & Pick<MarketEvent, 'eventId'>,
): MarketEvent {
  return {
    eventId: overrides.eventId,
    timestamp: overrides.timestamp ?? Date.parse('2026-04-01T00:00:00.000Z'),
    accountId: overrides.accountId ?? 'acct-1',
    symbol: overrides.symbol ?? 'BTC',
    strategyId: overrides.strategyId ?? 'strategy-alpha',
    eventType: overrides.eventType ?? 'PRICE_MOVEMENT',
    alignmentState: overrides.alignmentState ?? 'WATCHFUL',
    signalsTriggered: overrides.signalsTriggered ?? ['raw_signal_code'],
    confidenceScore: overrides.confidenceScore ?? 0.72,
    certainty: overrides.certainty ?? 'confirmed',
    price: overrides.price ?? 100,
    pctChange: overrides.pctChange ?? 0.03,
    metadata: overrides.metadata ?? {
      providerId: 'broker:live',
    },
  };
}

function createSnapshotForViewedState(params: {
  accountId: string;
  viewedTimestamp: number;
}): Pick<SnapshotVM, 'model' | 'orientationContext'> {
  return {
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
    orientationContext: {
      accountId: params.accountId,
      currentState: {
        latestRelevantEvent: null,
        strategyAlignment: 'WATCHFUL',
        certainty: null,
      },
      historyContext: {
        eventsSinceLastViewed: [],
        sinceLastChecked: {
          sinceTimestamp: params.viewedTimestamp,
          accountId: params.accountId,
          summaryCount: 0,
          events: [],
        },
      },
    },
  };
}

describe('fetchSinceLastCheckedArchiveVM', () => {
  it('keeps deeper continuity available even when Snapshot has already cleared after view', async () => {
    const viewedTimestamp = Date.parse('2026-03-23T00:00:00.000Z');
    const lastViewedState = createInMemoryLastViewedState([
      {
        surfaceId: SNAPSHOT_LAST_VIEWED_SURFACE_ID,
        accountId: 'acct-1',
        timestamp: viewedTimestamp,
      },
    ]);
    const snapshotState = createSnapshotForViewedState({
      accountId: 'acct-1',
      viewedTimestamp,
    });
    const snapshotDisplay = await fetchSinceLastCheckedVM({
      snapshot: snapshotState,
      surface: 'SNAPSHOT',
      lastViewedState,
    });

    expect(snapshotDisplay).toEqual({
      status: 'HIDDEN',
      reason: 'ALREADY_VIEWED',
    });

    const ledger = createEventLedgerService([
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:btc:100',
        timestamp: Date.parse('2026-03-21T00:00:00.000Z'),
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:eth:101',
        timestamp: Date.parse('2026-03-22T00:00:00.000Z'),
        symbol: 'ETH',
        eventType: 'DIP_DETECTED',
        pctChange: -0.04,
      }),
    ]);

    const continuity = fetchSinceLastCheckedArchiveVM({
      surface: 'INSIGHTS_SCREEN',
      nowProvider: () => Date.parse('2026-04-03T00:00:00.000Z'),
      accountId: 'acct-1',
      eventLedger: ledger,
      eventLedgerQueries: createEventLedgerQueries(ledger),
      lastViewedState,
    });

    expect(continuity.availability).toMatchObject({
      status: 'AVAILABLE',
      entries: [
        {
          title: 'Most recently cleared from Snapshot',
          viewedAt: '2026-03-23T00:00:00.000Z',
        },
      ],
    });
  });

  it('creates one current continuity entry when new meaningful changes arrive after a cleared cycle', () => {
    const viewedTimestamp = Date.parse('2026-03-23T00:00:00.000Z');
    const lastViewedState = createInMemoryLastViewedState([
      {
        surfaceId: SNAPSHOT_LAST_VIEWED_SURFACE_ID,
        accountId: 'acct-1',
        timestamp: viewedTimestamp,
      },
    ]);
    const ledger = createEventLedgerService([
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:btc:100',
        timestamp: Date.parse('2026-03-21T00:00:00.000Z'),
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:eth:101',
        timestamp: Date.parse('2026-03-22T00:00:00.000Z'),
        symbol: 'ETH',
        eventType: 'DIP_DETECTED',
        pctChange: -0.04,
      }),
    ]);

    const baseline = fetchSinceLastCheckedArchiveVM({
      surface: 'INSIGHTS_SCREEN',
      nowProvider: () => Date.parse('2026-04-03T00:00:00.000Z'),
      accountId: 'acct-1',
      eventLedger: ledger,
      eventLedgerQueries: createEventLedgerQueries(ledger),
      lastViewedState,
    });
    ledger.appendEvent(
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:sol:102',
        timestamp: Date.parse('2026-03-24T00:00:00.000Z'),
        symbol: 'SOL',
        eventType: 'ESTIMATED_PRICE',
        certainty: 'estimated',
        pctChange: null,
      }),
    );
    const withNewChanges = fetchSinceLastCheckedArchiveVM({
      surface: 'INSIGHTS_SCREEN',
      nowProvider: () => Date.parse('2026-04-03T00:00:00.000Z'),
      accountId: 'acct-1',
      eventLedger: ledger,
      eventLedgerQueries: createEventLedgerQueries(ledger),
      lastViewedState,
    });

    expect(baseline.availability).toMatchObject({
      status: 'AVAILABLE',
      entries: [
        {
          title: 'Most recently cleared from Snapshot',
          viewedAt: '2026-03-23T00:00:00.000Z',
        },
      ],
    });
    expect(withNewChanges.availability).toMatchObject({
      status: 'AVAILABLE',
      entries: [
        {
          title: 'Current Snapshot continuity',
          viewedAt: null,
        },
        {
          title: 'Most recently cleared from Snapshot',
          viewedAt: '2026-03-23T00:00:00.000Z',
        },
      ],
    });
  });

  it('keeps continuity account-scoped and unavailable on non-Insights surfaces', () => {
    const ledger = createEventLedgerService([
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:btc:100',
        accountId: 'acct-1',
        timestamp: Date.parse('2026-03-21T00:00:00.000Z'),
      }),
      createMarketEvent({
        eventId: 'acct-2:strategy-alpha:eth:101',
        accountId: 'acct-2',
        symbol: 'ETH',
        eventType: 'DIP_DETECTED',
        pctChange: -0.04,
        timestamp: Date.parse('2026-03-22T00:00:00.000Z'),
      }),
    ]);

    const unavailable = fetchSinceLastCheckedArchiveVM({
      surface: 'DASHBOARD',
      nowProvider: () => Date.parse('2026-04-03T00:00:00.000Z'),
      accountId: 'acct-1',
      eventLedger: ledger,
      eventLedgerQueries: createEventLedgerQueries(ledger),
    });
    const scoped = fetchSinceLastCheckedArchiveVM({
      surface: 'INSIGHTS_SCREEN',
      nowProvider: () => Date.parse('2026-04-03T00:00:00.000Z'),
      accountId: 'acct-1',
      eventLedger: ledger,
      eventLedgerQueries: createEventLedgerQueries(ledger),
      snapshotLastViewedTimestamp: Date.parse('2026-03-23T00:00:00.000Z'),
    });

    expect(unavailable).toEqual({
      generatedAt: '2026-04-03T00:00:00.000Z',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NOT_ENABLED_FOR_SURFACE',
      },
    });
    expect(JSON.stringify(scoped)).not.toMatch(
      /acct-2|strategy-alpha|raw_signal_code|providerId|unread|badge|inbox|push|notification|feed/i,
    );
  });
});
