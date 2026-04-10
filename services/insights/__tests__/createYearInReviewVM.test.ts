import type { MarketEvent } from '@/core/types/marketEvent';
import { createYearInReviewVM } from '@/services/insights/createYearInReviewVM';

function createMarketEvent(
  overrides: Partial<MarketEvent> & Pick<MarketEvent, 'eventId'>,
): MarketEvent {
  return {
    eventId: overrides.eventId,
    timestamp: overrides.timestamp ?? Date.parse('2025-11-20T00:00:00.000Z'),
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

describe('createYearInReviewVM', () => {
  it('keeps a low-change year valid instead of treating calm history as a failure', () => {
    expect(
      createYearInReviewVM({
        generatedAt: '2026-04-15T00:00:00.000Z',
        period: 'LAST_YEAR',
        history: [
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
            timestamp: Date.parse('2025-11-20T00:00:00.000Z'),
            symbol: 'BTC',
            eventType: 'PRICE_MOVEMENT',
          }),
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:price-b:BTC:101',
            timestamp: Date.parse('2025-08-10T00:00:00.000Z'),
            symbol: 'BTC',
            eventType: 'PRICE_MOVEMENT',
          }),
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:price-c:BTC:102',
            timestamp: Date.parse('2025-03-05T00:00:00.000Z'),
            symbol: 'BTC',
            eventType: 'PRICE_MOVEMENT',
          }),
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:future-ignore:ETH:103',
            timestamp: Date.parse('2026-02-04T00:00:00.000Z'),
            symbol: 'ETH',
            eventType: 'DIP_DETECTED',
          }),
        ],
      }),
    ).toEqual({
      generatedAt: '2026-04-15T00:00:00.000Z',
      availability: {
        status: 'AVAILABLE',
        period: 'LAST_YEAR',
        title: '2025 in review',
        summary:
          'Across 2025, interpreted history stayed centered more on price shifts than on a new interpreted pattern.',
        items: [
          {
            label: 'What stood out most',
            value: 'Price shifts appeared most often in interpreted history across the year.',
            emphasis: 'NEUTRAL',
          },
          {
            label: 'How the year developed',
            value:
              'The year stayed centered on price shifts rather than taking on a different interpreted pattern.',
            emphasis: 'NEUTRAL',
          },
          {
            label: 'Recurring symbol',
            value: 'BTC appeared most often in interpreted notes across the year.',
            emphasis: 'NEUTRAL',
          },
        ],
        limitations: [
          'This review is drawn from a lighter stretch of interpreted history, so it stays brief.',
          'Most of the year returned to one recurring interpreted pattern, so the debrief emphasizes continuity over change.',
        ],
      },
    });
  });

  it('describes a year-level shift without leaking provider or runtime detail', () => {
    const result = createYearInReviewVM({
      generatedAt: '2026-04-15T00:00:00.000Z',
      period: 'LAST_YEAR',
      history: [
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:estimate-a:SOL:100',
          timestamp: Date.parse('2025-11-10T00:00:00.000Z'),
          symbol: 'SOL',
          eventType: 'ESTIMATED_PRICE',
          certainty: 'estimated',
          pctChange: null,
        }),
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:data-a:SOL:101',
          timestamp: Date.parse('2025-09-10T00:00:00.000Z'),
          symbol: 'SOL',
          eventType: 'DATA_QUALITY',
          pctChange: null,
        }),
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:price-a:BTC:102',
          timestamp: Date.parse('2025-05-10T00:00:00.000Z'),
          symbol: 'BTC',
          eventType: 'PRICE_MOVEMENT',
        }),
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:price-b:BTC:103',
          timestamp: Date.parse('2025-02-10T00:00:00.000Z'),
          symbol: 'BTC',
          eventType: 'PRICE_MOVEMENT',
        }),
      ],
    });

    expect(result).toEqual({
      generatedAt: '2026-04-15T00:00:00.000Z',
      availability: {
        status: 'AVAILABLE',
        period: 'LAST_YEAR',
        title: '2025 in review',
        summary:
          'Across 2025, interpreted history moved from price shifts toward provisional context.',
        items: [
          {
            label: 'What stood out most',
            value:
              'Provisional context appeared most often in interpreted history across the year.',
            emphasis: 'NEUTRAL',
          },
          {
            label: 'How the year developed',
            value:
              'The later part of the year leaned more on provisional context, while the earlier part leaned more on price shifts.',
            emphasis: 'SHIFT',
          },
          {
            label: 'Context note',
            value:
              'Some supporting price context stayed estimated or partial during the year, so this debrief remains directional rather than exhaustive.',
            emphasis: 'CONTEXT',
          },
        ],
        limitations: [
          'This review is drawn from a lighter stretch of interpreted history, so it stays brief.',
        ],
      },
    });
    expect(JSON.stringify(result)).not.toMatch(
      /eventId|signalsTriggered|strategy-alpha|strategyId|providerId|broker:live|raw_signal_code|signalTitle/i,
    );
  });

  it('returns unavailable honestly when a selected year only has two interpreted events', () => {
    expect(
      createYearInReviewVM({
        generatedAt: '2026-04-15T00:00:00.000Z',
        period: 'LAST_YEAR',
        history: [
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:single-a:BTC:100',
            timestamp: Date.parse('2025-11-20T00:00:00.000Z'),
            eventType: 'ESTIMATED_PRICE',
            certainty: 'estimated',
            pctChange: null,
          }),
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:single-b:BTC:101',
            timestamp: Date.parse('2025-08-20T00:00:00.000Z'),
            eventType: 'PRICE_MOVEMENT',
          }),
        ],
      }),
    ).toEqual({
      generatedAt: '2026-04-15T00:00:00.000Z',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'INSUFFICIENT_HISTORY',
      },
    });
  });

  it('returns unavailable when no annual period has been selected yet', () => {
    expect(
      createYearInReviewVM({
        generatedAt: '2026-04-15T00:00:00.000Z',
        period: null,
        history: [
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
            timestamp: Date.parse('2025-11-20T00:00:00.000Z'),
          }),
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:price-b:BTC:101',
            timestamp: Date.parse('2025-08-10T00:00:00.000Z'),
          }),
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:price-c:BTC:102',
            timestamp: Date.parse('2025-03-05T00:00:00.000Z'),
          }),
        ],
      }),
    ).toEqual({
      generatedAt: '2026-04-15T00:00:00.000Z',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NO_PERIOD_SELECTED',
      },
    });
  });

  it('keeps year-in-review language calm and non-moralizing', () => {
    const result = createYearInReviewVM({
      generatedAt: '2026-04-15T00:00:00.000Z',
      period: 'LAST_YEAR',
      history: [
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
          timestamp: Date.parse('2025-10-10T00:00:00.000Z'),
          eventType: 'PRICE_MOVEMENT',
        }),
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:dip-a:ETH:101',
          timestamp: Date.parse('2025-07-10T00:00:00.000Z'),
          eventType: 'DIP_DETECTED',
          symbol: 'ETH',
        }),
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:estimate-a:SOL:102',
          timestamp: Date.parse('2025-03-10T00:00:00.000Z'),
          eventType: 'ESTIMATED_PRICE',
          symbol: 'SOL',
          certainty: 'estimated',
          pctChange: null,
        }),
      ],
    });

    expect(JSON.stringify(result)).not.toMatch(
      /urgent|act now|good user|bad user|discipline score|performance score|win rate|should have|shame|failure|predict|advice/i,
    );
  });

  it('is deterministic for identical interpreted inputs regardless of input order', () => {
    const history = [
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:estimate-a:SOL:100',
        timestamp: Date.parse('2025-11-10T00:00:00.000Z'),
        symbol: 'SOL',
        eventType: 'ESTIMATED_PRICE',
        certainty: 'estimated',
        pctChange: null,
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:data-a:SOL:101',
        timestamp: Date.parse('2025-09-10T00:00:00.000Z'),
        symbol: 'SOL',
        eventType: 'DATA_QUALITY',
        pctChange: null,
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-a:BTC:102',
        timestamp: Date.parse('2025-05-10T00:00:00.000Z'),
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-b:BTC:103',
        timestamp: Date.parse('2025-02-10T00:00:00.000Z'),
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
      }),
    ];

    expect(
      createYearInReviewVM({
        generatedAt: '2026-04-15T00:00:00.000Z',
        period: 'LAST_YEAR',
        history,
      }),
    ).toEqual(
      createYearInReviewVM({
        generatedAt: '2026-04-15T00:00:00.000Z',
        period: 'LAST_YEAR',
        history: [...history].reverse(),
      }),
    );
  });
});
