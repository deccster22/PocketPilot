import type { MarketEvent } from '@/core/types/marketEvent';

import { createComparisonWindowVM } from '@/services/insights/createComparisonWindowVM';

function createMarketEvent(overrides: Partial<MarketEvent> & Pick<MarketEvent, 'eventId'>): MarketEvent {
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

describe('createComparisonWindowVM', () => {
  it('builds one calm bounded comparison for the selected compare window', () => {
    expect(
      createComparisonWindowVM({
        generatedAt: '2026-04-11T00:00:00.000Z',
        window: 'LAST_90_DAYS_VS_PREVIOUS_90_DAYS',
        history: [
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:earlier-a:BTC:100',
            timestamp: Date.parse('2025-11-20T00:00:00.000Z'),
            symbol: 'BTC',
            eventType: 'PRICE_MOVEMENT',
            alignmentState: 'WATCHFUL',
          }),
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:earlier-b:BTC:101',
            timestamp: Date.parse('2025-12-15T00:00:00.000Z'),
            symbol: 'BTC',
            eventType: 'PRICE_MOVEMENT',
            alignmentState: 'WATCHFUL',
          }),
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:newer-a:SOL:102',
            timestamp: Date.parse('2026-02-05T00:00:00.000Z'),
            symbol: 'SOL',
            eventType: 'ESTIMATED_PRICE',
            alignmentState: 'WATCHFUL',
            certainty: 'estimated',
            pctChange: null,
          }),
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:newer-b:SOL:103',
            timestamp: Date.parse('2026-03-10T00:00:00.000Z'),
            symbol: 'SOL',
            eventType: 'ESTIMATED_PRICE',
            alignmentState: 'WATCHFUL',
            certainty: 'estimated',
            pctChange: null,
          }),
        ],
      }),
    ).toEqual({
      generatedAt: '2026-04-11T00:00:00.000Z',
      availability: {
        status: 'AVAILABLE',
        window: 'LAST_90_DAYS_VS_PREVIOUS_90_DAYS',
        title: 'Last 90 days compared with the previous 90 days',
        summary:
          'Compared with the previous 90 days, the last 90 days leaned more on provisional context than on price shifts.',
        items: [
          {
            label: 'Most visible pattern',
            value:
              'the last 90 days leaned more on provisional context, while the previous 90 days leaned more on price shifts.',
            emphasis: 'SHIFT',
          },
          {
            label: 'Interpreted posture',
            value: 'Across both windows, the interpreted posture stayed watchful rather than settled.',
            emphasis: 'NEUTRAL',
          },
          {
            label: 'Context note',
            value:
              'Some supporting price context stayed more provisional in the last 90 days, so that side remains a little less settled.',
            emphasis: 'CONTEXT',
          },
        ],
        limitations: [
          'At least one side of this comparison comes from a lighter stretch of interpreted history, so the read stays brief.',
        ],
      },
    });
  });

  it('keeps low-difference windows valid instead of treating them as a failed comparison', () => {
    const result = createComparisonWindowVM({
      generatedAt: '2026-05-15T00:00:00.000Z',
      window: 'LAST_QUARTER_VS_PREVIOUS_QUARTER',
      history: [
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:earlier-a:BTC:100',
          timestamp: Date.parse('2025-10-12T00:00:00.000Z'),
          symbol: 'BTC',
          eventType: 'PRICE_MOVEMENT',
          alignmentState: 'ALIGNED',
        }),
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:earlier-b:BTC:101',
          timestamp: Date.parse('2025-12-02T00:00:00.000Z'),
          symbol: 'BTC',
          eventType: 'PRICE_MOVEMENT',
          alignmentState: 'ALIGNED',
        }),
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:newer-a:BTC:102',
          timestamp: Date.parse('2026-01-17T00:00:00.000Z'),
          symbol: 'BTC',
          eventType: 'PRICE_MOVEMENT',
          alignmentState: 'ALIGNED',
        }),
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:newer-b:BTC:103',
          timestamp: Date.parse('2026-03-04T00:00:00.000Z'),
          symbol: 'BTC',
          eventType: 'PRICE_MOVEMENT',
          alignmentState: 'ALIGNED',
        }),
      ],
    });

    expect(result.availability.status).toBe('AVAILABLE');

    if (result.availability.status !== 'AVAILABLE') {
      throw new Error('Expected low-difference comparison to remain available.');
    }

    expect(result.availability.title).toBe('Q1 2026 compared with Q4 2025');
    expect(result.availability.summary).toBe(
      'Across Q1 2026 and Q4 2025, interpreted history stayed centered on price shifts rather than a different pattern.',
    );
    expect(result.availability.items).toEqual([
      {
        label: 'Most visible pattern',
        value: 'Both windows stayed centered on price shifts rather than a different interpreted pattern.',
        emphasis: 'NEUTRAL',
      },
      {
        label: 'Interpreted posture',
        value: 'Across both windows, the interpreted posture stayed aligned rather than conflicted.',
        emphasis: 'NEUTRAL',
      },
      {
        label: 'Recurring symbol',
        value: 'BTC stayed the clearest recurring symbol across both windows.',
        emphasis: 'NEUTRAL',
      },
    ]);
  });

  it('returns honest unavailable states when the compare window is missing or history is too thin', () => {
    expect(
      createComparisonWindowVM({
        generatedAt: '2026-04-11T00:00:00.000Z',
        window: null,
        history: [],
      }),
    ).toEqual({
      generatedAt: '2026-04-11T00:00:00.000Z',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NO_WINDOW_SELECTED',
      },
    });

    expect(
      createComparisonWindowVM({
        generatedAt: '2026-05-15T00:00:00.000Z',
        window: 'LAST_YEAR_VS_PREVIOUS_YEAR',
        history: [
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:last-year-only:BTC:100',
            timestamp: Date.parse('2025-06-15T00:00:00.000Z'),
            symbol: 'BTC',
          }),
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:previous-year-a:ETH:101',
            timestamp: Date.parse('2024-03-05T00:00:00.000Z'),
            symbol: 'ETH',
          }),
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:previous-year-b:ETH:102',
            timestamp: Date.parse('2024-07-11T00:00:00.000Z'),
            symbol: 'ETH',
          }),
        ],
      }),
    ).toEqual({
      generatedAt: '2026-05-15T00:00:00.000Z',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'INSUFFICIENT_HISTORY',
      },
    });
  });

  it('returns unsupported when the selected comparison needs a boundary the current history spine does not record', () => {
    expect(
      createComparisonWindowVM({
        generatedAt: '2026-05-15T00:00:00.000Z',
        window: 'BEFORE_STRATEGY_CHANGE_VS_AFTER_STRATEGY_CHANGE',
        history: [
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:a:BTC:100',
          }),
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:b:ETH:101',
            timestamp: Date.parse('2026-05-14T00:00:00.000Z'),
            symbol: 'ETH',
          }),
        ],
      }),
    ).toEqual({
      generatedAt: '2026-05-15T00:00:00.000Z',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'UNSUPPORTED_WINDOW',
      },
    });
  });

  it('keeps compare output free of raw ledger details, advice language, and scorekeeping', () => {
    const result = createComparisonWindowVM({
      generatedAt: '2026-04-11T00:00:00.000Z',
      window: 'LAST_90_DAYS_VS_PREVIOUS_90_DAYS',
      history: [
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:earlier-a:BTC:100',
          timestamp: Date.parse('2025-11-20T00:00:00.000Z'),
          symbol: 'BTC',
        }),
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:earlier-b:BTC:101',
          timestamp: Date.parse('2025-12-15T00:00:00.000Z'),
          symbol: 'BTC',
        }),
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:newer-a:SOL:102',
          timestamp: Date.parse('2026-02-05T00:00:00.000Z'),
          symbol: 'SOL',
          eventType: 'ESTIMATED_PRICE',
          certainty: 'estimated',
        }),
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:newer-b:SOL:103',
          timestamp: Date.parse('2026-03-10T00:00:00.000Z'),
          symbol: 'SOL',
          eventType: 'ESTIMATED_PRICE',
          certainty: 'estimated',
        }),
      ],
    });

    expect(JSON.stringify(result)).not.toMatch(
      /eventId|signalsTriggered|strategy-alpha|strategyId|providerId|broker:live|raw_signal_code|signalTitle|win rate|score|good user|bad user|should have|act now|predict/i,
    );
  });

  it('is deterministic for identical interpreted inputs regardless of input order', () => {
    const history = [
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:earlier-a:BTC:100',
        timestamp: Date.parse('2025-10-12T00:00:00.000Z'),
        symbol: 'BTC',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:earlier-b:BTC:101',
        timestamp: Date.parse('2025-12-02T00:00:00.000Z'),
        symbol: 'BTC',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:newer-a:BTC:102',
        timestamp: Date.parse('2026-01-17T00:00:00.000Z'),
        symbol: 'BTC',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:newer-b:BTC:103',
        timestamp: Date.parse('2026-03-04T00:00:00.000Z'),
        symbol: 'BTC',
      }),
    ];

    expect(
      createComparisonWindowVM({
        generatedAt: '2026-05-15T00:00:00.000Z',
        window: 'LAST_QUARTER_VS_PREVIOUS_QUARTER',
        history,
      }),
    ).toEqual(
      createComparisonWindowVM({
        generatedAt: '2026-05-15T00:00:00.000Z',
        window: 'LAST_QUARTER_VS_PREVIOUS_QUARTER',
        history: [...history].reverse(),
      }),
    );
  });
});
