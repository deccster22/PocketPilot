import type { EventLedgerEntry } from '@/core/types/eventLedger';
import { createInMemoryLastViewedState } from '@/services/orientation/lastViewedState';
import { createSinceLastCheckedDisplayState } from '@/services/orientation/createSinceLastCheckedDisplayState';
import type { SnapshotVM } from '@/services/snapshot/snapshotService';

function createEvent(params: {
  accountId: string;
  eventId: string;
  eventType: 'DATA_QUALITY' | 'ESTIMATED_PRICE' | 'MOMENTUM_BUILDING' | 'DIP_DETECTED';
  symbol?: string;
  timestamp: number;
}): EventLedgerEntry {
  return {
    eventId: params.eventId,
    timestamp: params.timestamp,
    accountId: params.accountId,
    symbol: params.symbol ?? null,
    strategyId: 'data_quality',
    eventType: params.eventType,
    alignmentState: 'WATCHFUL' as const,
    signalsTriggered: ['signal'],
    confidenceScore: 0.9,
    certainty: 'confirmed',
    price: 100,
    pctChange: 0.03,
    metadata: {},
  };
}

function createSnapshot(overrides?: Partial<Pick<SnapshotVM, 'model' | 'orientationContext'>>): Pick<
  SnapshotVM,
  'model' | 'orientationContext'
> {
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
      accountId: 'acct-1',
      currentState: {
        latestRelevantEvent: null,
        strategyAlignment: 'WATCHFUL',
        certainty: null,
      },
      historyContext: {
        eventsSinceLastViewed: [
          createEvent({
            accountId: 'acct-1',
            eventId: 'acct-1:data_quality:1',
            eventType: 'DATA_QUALITY',
            symbol: 'BTC',
            timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
          }),
          createEvent({
            accountId: 'acct-1',
            eventId: 'acct-1:estimated_price:2',
            eventType: 'ESTIMATED_PRICE',
            symbol: 'ETH',
            timestamp: Date.parse('2026-03-21T00:00:00.000Z'),
          }),
          createEvent({
            accountId: 'acct-1',
            eventId: 'acct-1:momentum:3',
            eventType: 'MOMENTUM_BUILDING',
            symbol: 'SOL',
            timestamp: Date.parse('2026-03-22T00:00:00.000Z'),
          }),
          createEvent({
            accountId: 'acct-1',
            eventId: 'acct-1:dip:4',
            eventType: 'DIP_DETECTED',
            symbol: 'DOGE',
            timestamp: Date.parse('2026-03-23T00:00:00.000Z'),
          }),
          createEvent({
            accountId: 'acct-2',
            eventId: 'acct-2:dip:5',
            eventType: 'DIP_DETECTED',
            symbol: 'XRP',
            timestamp: Date.parse('2026-03-24T00:00:00.000Z'),
          }),
        ],
        sinceLastChecked: {
          sinceTimestamp: Date.parse('2026-02-28T00:00:00.000Z'),
          accountId: 'acct-1',
          summaryCount: 5,
          events: [],
        },
      },
    },
    ...overrides,
  };
}

describe('createSinceLastCheckedDisplayState', () => {
  it('is deterministic for identical inputs', () => {
    const params = {
      snapshot: createSnapshot(),
    };

    expect(createSinceLastCheckedDisplayState(params)).toEqual(
      createSinceLastCheckedDisplayState(params),
    );
  });

  it('returns a visible briefing and keeps the output capped at three items', () => {
    const result = createSinceLastCheckedDisplayState({
      snapshot: createSnapshot(),
    });

    expect(result).toEqual({
      status: 'VISIBLE',
      title: 'Since last checked',
      summary: 'A calm read on the most meaningful interpreted changes since your last visit.',
      items: [
        {
          title: 'Data context',
          summary: 'Some recent market context was captured with data quality limits in view.',
          emphasis: 'CONTEXT',
        },
        {
          title: 'ETH price context',
          summary: 'Recent pricing context for ETH remains estimated.',
          emphasis: 'CONTEXT',
        },
        {
          title: 'DOGE pullback',
          summary: 'A measured pullback was recorded for DOGE while you were away.',
          emphasis: 'CHANGE',
        },
      ],
    });
    expect(JSON.stringify(result)).not.toContain('SOL momentum');
    expect(JSON.stringify(result)).not.toContain('XRP pullback');
    expect(JSON.stringify(result)).not.toContain('inbox');
    expect(JSON.stringify(result)).not.toContain('badge');
    expect(JSON.stringify(result)).not.toContain('push');
    expect(JSON.stringify(result)).not.toContain('notification');
  });

  it('collapses to already viewed when the boundary has already been acknowledged', () => {
    const lastViewedState = createInMemoryLastViewedState([
      {
        surfaceId: 'snapshot',
        accountId: 'acct-1',
        timestamp: Date.parse('2026-04-01T00:00:00.000Z'),
      },
    ]);

    const result = createSinceLastCheckedDisplayState({
      snapshot: createSnapshot({
        orientationContext: {
          accountId: 'acct-1',
          currentState: {
            latestRelevantEvent: null,
            strategyAlignment: 'WATCHFUL',
            certainty: null,
          },
          historyContext: {
            eventsSinceLastViewed: [],
            sinceLastChecked: {
              sinceTimestamp: Date.parse('2026-04-01T00:00:00.000Z'),
              accountId: 'acct-1',
              summaryCount: 0,
              events: [],
            },
          },
        },
      }),
      lastViewedState,
    });

    expect(result).toEqual({
      status: 'HIDDEN',
      reason: 'ALREADY_VIEWED',
    });
  });

  it('keeps the non-Snapshot surfaces hidden without inventing a display lane', () => {
    expect(
      createSinceLastCheckedDisplayState({
        snapshot: createSnapshot(),
        surface: 'DASHBOARD',
      }),
    ).toEqual({
      status: 'HIDDEN',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });
  });
});
