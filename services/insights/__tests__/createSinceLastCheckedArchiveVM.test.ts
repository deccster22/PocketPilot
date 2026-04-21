import type { MarketEvent } from '@/core/types/marketEvent';
import { createSinceLastCheckedArchiveVM } from '@/services/insights/createSinceLastCheckedArchiveVM';

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
      signalTitle: 'Raw signal title',
    },
  };
}

describe('createSinceLastCheckedArchiveVM', () => {
  it('keeps one calm viewed continuity entry after Snapshot has already cleared', () => {
    const viewedAt = '2026-03-23T00:00:00.000Z';
    const history = [
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:btc:100',
        timestamp: Date.parse('2026-03-21T00:00:00.000Z'),
        symbol: 'BTC',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:eth:101',
        timestamp: Date.parse('2026-03-22T00:00:00.000Z'),
        eventType: 'DIP_DETECTED',
        symbol: 'ETH',
        pctChange: -0.04,
      }),
      createMarketEvent({
        eventId: 'acct-2:strategy-alpha:sol:102',
        timestamp: Date.parse('2026-03-22T00:00:00.000Z'),
        accountId: 'acct-2',
        eventType: 'ESTIMATED_PRICE',
        symbol: 'SOL',
        certainty: 'estimated',
        pctChange: null,
      }),
    ];

    expect(
      createSinceLastCheckedArchiveVM({
        generatedAt: '2026-04-03T00:00:00.000Z',
        accountId: 'acct-1',
        history,
        snapshotSinceLastChecked: {
          sinceTimestamp: Date.parse(viewedAt),
          accountId: 'acct-1',
          events: [],
          summaryCount: 0,
        },
        snapshotViewedAt: viewedAt,
      }),
    ).toEqual({
      generatedAt: '2026-04-03T00:00:00.000Z',
      availability: {
        status: 'AVAILABLE',
        entries: [
          {
            title: 'Most recently cleared from Snapshot',
            summary:
              'The last Snapshot Since Last Checked briefing was acknowledged and remains available here for continuity.',
            items: [
              {
                title: 'ETH pullback entered view',
                summary: 'A measured pullback around ETH entered recent interpreted history.',
                emphasis: 'CHANGE',
              },
              {
                title: 'BTC price picture shifted',
                summary: 'Price context for BTC moved up by 3.00% in the recent interpreted picture.',
                emphasis: 'CHANGE',
              },
            ],
            surfacedAt: '2026-03-22T00:00:00.000Z',
            viewedAt: '2026-03-23T00:00:00.000Z',
          },
        ],
      },
    });
  });

  it('adds one current continuity entry when newer meaningful changes appear after Snapshot was cleared', () => {
    const result = createSinceLastCheckedArchiveVM({
      generatedAt: '2026-04-03T00:00:00.000Z',
      accountId: 'acct-1',
      history: [
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:btc:100',
          timestamp: Date.parse('2026-03-21T00:00:00.000Z'),
          symbol: 'BTC',
        }),
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:eth:101',
          timestamp: Date.parse('2026-03-22T00:00:00.000Z'),
          eventType: 'DIP_DETECTED',
          symbol: 'ETH',
          pctChange: -0.04,
        }),
      ],
      snapshotSinceLastChecked: {
        sinceTimestamp: Date.parse('2026-03-23T00:00:00.000Z'),
        accountId: 'acct-1',
        events: [
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:sol:103',
            timestamp: Date.parse('2026-03-24T00:00:00.000Z'),
            eventType: 'ESTIMATED_PRICE',
            certainty: 'estimated',
            symbol: 'SOL',
            pctChange: null,
          }),
        ],
        summaryCount: 1,
      },
      snapshotViewedAt: '2026-03-23T00:00:00.000Z',
    });

    expect(result.availability.status).toBe('AVAILABLE');

    if (result.availability.status !== 'AVAILABLE') {
      throw new Error('Expected available since-last-checked continuity archive.');
    }

    expect(result.availability.entries).toMatchObject([
      {
        title: 'Current Snapshot continuity',
        viewedAt: null,
        items: [
          {
            title: 'SOL price context stayed estimated',
            emphasis: 'CONTEXT',
          },
        ],
      },
      {
        title: 'Most recently cleared from Snapshot',
        viewedAt: '2026-03-23T00:00:00.000Z',
      },
    ]);
  });

  it('is account-scoped, deterministic, and stays out of inbox or notification language', () => {
    const params = {
      generatedAt: '2026-04-03T00:00:00.000Z',
      accountId: 'acct-1',
      history: [
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:btc:100',
          timestamp: Date.parse('2026-03-21T00:00:00.000Z'),
          symbol: 'BTC',
        }),
        createMarketEvent({
          eventId: 'acct-2:strategy-alpha:eth:101',
          timestamp: Date.parse('2026-03-22T00:00:00.000Z'),
          accountId: 'acct-2',
          symbol: 'ETH',
          eventType: 'DIP_DETECTED',
          pctChange: -0.04,
        }),
      ],
      snapshotSinceLastChecked: {
        sinceTimestamp: Date.parse('2026-03-23T00:00:00.000Z'),
        accountId: 'acct-1',
        events: [],
        summaryCount: 0,
      },
      snapshotViewedAt: '2026-03-23T00:00:00.000Z',
    };

    const baseline = createSinceLastCheckedArchiveVM(params);
    const reversedHistory = createSinceLastCheckedArchiveVM({
      ...params,
      history: [...params.history].reverse(),
    });

    expect(baseline).toEqual(reversedHistory);
    expect(JSON.stringify(baseline)).not.toMatch(/acct-2|unread|badge|inbox|push|notification|feed/i);
  });

  it('returns unavailable when account context is missing', () => {
    expect(
      createSinceLastCheckedArchiveVM({
        generatedAt: '2026-04-03T00:00:00.000Z',
        history: [],
      }),
    ).toEqual({
      generatedAt: '2026-04-03T00:00:00.000Z',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NO_ACCOUNT_CONTEXT',
      },
    });
  });
});
