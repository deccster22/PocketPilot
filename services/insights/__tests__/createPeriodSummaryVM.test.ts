import type { MarketEvent } from '@/core/types/marketEvent';
import { createPeriodSummaryVM } from '@/services/insights/createPeriodSummaryVM';

function createMarketEvent(
  overrides: Partial<MarketEvent> & Pick<MarketEvent, 'eventId'>,
): MarketEvent {
  return {
    eventId: overrides.eventId,
    timestamp: overrides.timestamp ?? Date.parse('2026-03-20T00:00:00.000Z'),
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

describe('createPeriodSummaryVM', () => {
  it('keeps a low-change last month valid instead of treating calm history as a failure', () => {
    expect(
      createPeriodSummaryVM({
        generatedAt: '2026-04-15T00:00:00.000Z',
        period: 'LAST_MONTH',
        history: [
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
            timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
            symbol: 'BTC',
            eventType: 'PRICE_MOVEMENT',
          }),
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:price-b:BTC:101',
            timestamp: Date.parse('2026-03-10T00:00:00.000Z'),
            symbol: 'BTC',
            eventType: 'PRICE_MOVEMENT',
          }),
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:april-ignore:ETH:102',
            timestamp: Date.parse('2026-04-04T00:00:00.000Z'),
            symbol: 'ETH',
            eventType: 'DIP_DETECTED',
          }),
        ],
      }),
    ).toEqual({
      generatedAt: '2026-04-15T00:00:00.000Z',
      availability: {
        status: 'AVAILABLE',
        period: 'LAST_MONTH',
        title: 'Last month',
        summary:
          'Last month stayed centered more on price shifts than on a new interpreted pattern.',
        items: [
          {
            label: 'What stayed most visible',
            value: "Price shifts appeared most often in this period's interpreted history.",
            emphasis: 'NEUTRAL',
          },
          {
            label: 'How the period developed',
            value:
              'The period stayed centered on price shifts rather than taking on a different interpreted pattern.',
            emphasis: 'NEUTRAL',
          },
          {
            label: 'Recurring symbol',
            value: 'BTC appeared most often in interpreted notes across this period.',
            emphasis: 'NEUTRAL',
          },
        ],
        limitations: [
          'This summary is drawn from a lighter stretch of interpreted history, so it stays brief.',
          'Most of this period returned to one recurring interpreted pattern, so the summary emphasizes continuity over change.',
        ],
      },
    });
  });

  it('describes a last quarter shift without leaking provider or runtime detail', () => {
    const result = createPeriodSummaryVM({
      generatedAt: '2026-04-15T00:00:00.000Z',
      period: 'LAST_QUARTER',
      history: [
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
          timestamp: Date.parse('2026-01-10T00:00:00.000Z'),
          symbol: 'BTC',
          eventType: 'PRICE_MOVEMENT',
        }),
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:dip-a:ETH:101',
          timestamp: Date.parse('2026-02-10T00:00:00.000Z'),
          symbol: 'ETH',
          eventType: 'DIP_DETECTED',
        }),
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:estimate-a:SOL:102',
          timestamp: Date.parse('2026-03-10T00:00:00.000Z'),
          symbol: 'SOL',
          eventType: 'ESTIMATED_PRICE',
          certainty: 'estimated',
          pctChange: null,
        }),
      ],
    });

    expect(result).toEqual({
      generatedAt: '2026-04-15T00:00:00.000Z',
      availability: {
        status: 'AVAILABLE',
        period: 'LAST_QUARTER',
        title: 'Last quarter',
        summary:
          'Last quarter moved from price shifts toward provisional context in interpreted history.',
        items: [
          {
            label: 'What stayed most visible',
            value: "Provisional context appeared most often in this period's interpreted history.",
            emphasis: 'NEUTRAL',
          },
          {
            label: 'How the period developed',
            value:
              'The later part leaned more on provisional context, while the earlier part leaned more on price shifts.',
            emphasis: 'SHIFT',
          },
          {
            label: 'Context note',
            value:
              'Some supporting price context stayed estimated or partial, so this summary remains directional rather than exhaustive.',
            emphasis: 'CONTEXT',
          },
        ],
        limitations: [
          'This summary is drawn from a lighter stretch of interpreted history, so it stays brief.',
        ],
      },
    });
    expect(JSON.stringify(result)).not.toMatch(
      /eventId|signalsTriggered|strategy-alpha|strategyId|providerId|broker:live|raw_signal_code|signalTitle/i,
    );
  });

  it('returns unavailable honestly when a selected period only has one interpreted event', () => {
    expect(
      createPeriodSummaryVM({
        generatedAt: '2026-04-15T00:00:00.000Z',
        period: 'LAST_MONTH',
        history: [
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:single:BTC:100',
            timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
            eventType: 'ESTIMATED_PRICE',
            certainty: 'estimated',
            pctChange: null,
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

  it('returns unavailable when no period has been selected yet', () => {
    expect(
      createPeriodSummaryVM({
        generatedAt: '2026-04-15T00:00:00.000Z',
        period: null,
        history: [
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
            timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
          }),
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:price-b:BTC:101',
            timestamp: Date.parse('2026-03-10T00:00:00.000Z'),
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

  it('keeps summary language calm and non-moralizing', () => {
    const result = createPeriodSummaryVM({
      generatedAt: '2026-04-15T00:00:00.000Z',
      period: 'LAST_QUARTER',
      history: [
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
          timestamp: Date.parse('2026-01-10T00:00:00.000Z'),
          eventType: 'PRICE_MOVEMENT',
        }),
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:dip-a:ETH:101',
          timestamp: Date.parse('2026-02-10T00:00:00.000Z'),
          eventType: 'DIP_DETECTED',
          symbol: 'ETH',
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
        eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
        timestamp: Date.parse('2026-01-10T00:00:00.000Z'),
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:dip-a:ETH:101',
        timestamp: Date.parse('2026-02-10T00:00:00.000Z'),
        symbol: 'ETH',
        eventType: 'DIP_DETECTED',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:estimate-a:SOL:102',
        timestamp: Date.parse('2026-03-10T00:00:00.000Z'),
        symbol: 'SOL',
        eventType: 'ESTIMATED_PRICE',
        certainty: 'estimated',
        pctChange: null,
      }),
    ];

    expect(
      createPeriodSummaryVM({
        generatedAt: '2026-04-15T00:00:00.000Z',
        period: 'LAST_QUARTER',
        history,
      }),
    ).toEqual(
      createPeriodSummaryVM({
        generatedAt: '2026-04-15T00:00:00.000Z',
        period: 'LAST_QUARTER',
        history: [...history].reverse(),
      }),
    );
  });
});
