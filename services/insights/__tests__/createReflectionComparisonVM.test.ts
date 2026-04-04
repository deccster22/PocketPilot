import type { MarketEvent } from '@/core/types/marketEvent';
import { createSinceLastChecked } from '@/services/events/createSinceLastChecked';
import { createEventLedgerQueries } from '@/services/events/eventLedgerQueries';
import { createEventLedgerService } from '@/services/events/eventLedgerService';
import { createInsightsHistoryVM } from '@/services/insights/createInsightsHistoryVM';
import { createReflectionComparisonVM } from '@/services/insights/createReflectionComparisonVM';
import { createOrientationContext } from '@/services/orientation/createOrientationContext';

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

describe('createReflectionComparisonVM', () => {
  it('builds one calm interpreted comparison between two prepared history slices', () => {
    const ledger = createEventLedgerService([
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
        timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
        pctChange: 0.03,
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-b:BTC:101',
        timestamp: Date.parse('2026-03-21T00:00:00.000Z'),
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
        pctChange: 0.04,
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:dip-a:ETH:102',
        timestamp: Date.parse('2026-03-22T00:00:00.000Z'),
        symbol: 'ETH',
        eventType: 'DIP_DETECTED',
        pctChange: -0.05,
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:estimate-a:SOL:103',
        timestamp: Date.parse('2026-03-23T00:00:00.000Z'),
        symbol: 'SOL',
        eventType: 'ESTIMATED_PRICE',
        certainty: 'estimated',
        pctChange: null,
      }),
    ]);
    const queries = createEventLedgerQueries(ledger);
    const sinceLastChecked = createSinceLastChecked({
      sinceTimestamp: Date.parse('2026-03-22T12:00:00.000Z'),
      accountId: 'acct-1',
      eventQueries: queries,
    });
    const orientationContext = createOrientationContext({
      accountId: 'acct-1',
      sinceLastChecked,
    });
    const historyVM = createInsightsHistoryVM({
      generatedAt: '2026-04-03T00:00:00.000Z',
      history: ledger.getAllEvents(),
      orientationContext,
    });

    expect(
      createReflectionComparisonVM({
        generatedAt: '2026-04-03T00:00:00.000Z',
        history: ledger.getAllEvents(),
        historyVM,
        orientationContext,
      }),
    ).toEqual({
      generatedAt: '2026-04-03T00:00:00.000Z',
      availability: {
        status: 'AVAILABLE',
        leftWindow: {
          id: 'since-last-viewed',
          title: 'Since you last viewed Insights',
          startAt: '2026-03-23T00:00:00.000Z',
          endAt: '2026-03-23T00:00:00.000Z',
        },
        rightWindow: {
          id: 'earlier-context',
          title: 'Earlier context',
          startAt: '2026-03-21T00:00:00.000Z',
          endAt: '2026-03-22T00:00:00.000Z',
        },
        items: [
          {
            title: 'Interpreted focus shifted',
            summary:
              'The newer window leaned more toward provisional context, while the earlier window was led more by price shifts.',
            emphasis: 'SHIFT',
          },
          {
            title: 'Symbol focus changed',
            summary:
              'The newer window centered more on SOL, while the earlier window leaned more toward BTC.',
            emphasis: 'SHIFT',
          },
          {
            title: 'The newer window stayed more provisional',
            summary:
              'Some supporting price context remained more provisional in the newer window, so that side stayed a little less settled.',
            emphasis: 'CONTEXT',
          },
        ],
        limitations: [],
      },
    });
  });

  it('can use two nearby interpreted slices when only one recent section is available', () => {
    const history = [
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
        timestamp: Date.parse('2026-03-23T00:00:00.000Z'),
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
        alignmentState: 'ALIGNED',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-b:BTC:101',
        timestamp: Date.parse('2026-03-22T00:00:00.000Z'),
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
        alignmentState: 'WATCHFUL',
        certainty: 'estimated',
      }),
    ];

    const result = createReflectionComparisonVM({
      generatedAt: '2026-04-03T00:00:00.000Z',
      history,
    });

    expect(result).toEqual({
      generatedAt: '2026-04-03T00:00:00.000Z',
      availability: {
        status: 'AVAILABLE',
        leftWindow: {
          id: 'more-recent-context',
          title: 'More recent context',
          startAt: '2026-03-23T00:00:00.000Z',
          endAt: '2026-03-23T00:00:00.000Z',
        },
        rightWindow: {
          id: 'earlier-recent-context',
          title: 'Earlier recent context',
          startAt: '2026-03-22T00:00:00.000Z',
          endAt: '2026-03-22T00:00:00.000Z',
        },
        items: [
          {
            title: 'Interpreted focus stayed steady',
            summary: 'Both windows stayed centered more on price shifts than on a new pattern.',
            emphasis: 'STABLE',
          },
          {
            title: 'Posture shifted',
            summary:
              'The interpreted posture moved from watchful rather than settled toward aligned rather than conflicted across the two windows.',
            emphasis: 'SHIFT',
          },
          {
            title: 'Earlier context was more provisional',
            summary:
              'Earlier context carried more estimated or partial supporting pricing, while the newer window stayed a little less provisional.',
            emphasis: 'CONTEXT',
          },
        ],
        limitations: ['This comparison uses two nearby interpreted slices from recent history.'],
      },
    });
  });

  it('returns unavailable honestly when interpreted history is too thin to compare', () => {
    expect(
      createReflectionComparisonVM({
        generatedAt: '2026-04-03T00:00:00.000Z',
        history: [
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:single:BTC:100',
            timestamp: Date.parse('2026-03-23T00:00:00.000Z'),
            eventType: 'ESTIMATED_PRICE',
            certainty: 'estimated',
          }),
        ],
      }),
    ).toEqual({
      generatedAt: '2026-04-03T00:00:00.000Z',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'INSUFFICIENT_INTERPRETED_HISTORY',
      },
    });
  });

  it('does not leak raw ids, signal detail, strategy ids, or provider metadata into reflection copy', () => {
    const result = createReflectionComparisonVM({
      generatedAt: '2026-04-03T00:00:00.000Z',
      history: [
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
          timestamp: Date.parse('2026-03-23T00:00:00.000Z'),
          symbol: 'BTC',
          eventType: 'PRICE_MOVEMENT',
        }),
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:dip-a:ETH:101',
          timestamp: Date.parse('2026-03-22T00:00:00.000Z'),
          symbol: 'ETH',
          eventType: 'DIP_DETECTED',
          certainty: 'estimated',
        }),
      ],
    });

    expect(JSON.stringify(result)).not.toMatch(
      /eventId|signalsTriggered|strategy-alpha|strategyId|providerId|broker:live|raw_signal_code|signalTitle/i,
    );
  });

  it('keeps reflection language calm and non-performance-scored', () => {
    const result = createReflectionComparisonVM({
      generatedAt: '2026-04-03T00:00:00.000Z',
      history: [
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
          timestamp: Date.parse('2026-03-23T00:00:00.000Z'),
          symbol: 'BTC',
          eventType: 'PRICE_MOVEMENT',
        }),
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:dip-a:ETH:101',
          timestamp: Date.parse('2026-03-22T00:00:00.000Z'),
          symbol: 'ETH',
          eventType: 'DIP_DETECTED',
        }),
      ],
    });

    expect(JSON.stringify(result)).not.toMatch(
      /urgent|act now|good user|bad user|discipline score|performance score|win rate|should have|shame|failure/i,
    );
  });

  it('is deterministic for identical interpreted inputs regardless of input order', () => {
    const history = [
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
        timestamp: Date.parse('2026-03-23T00:00:00.000Z'),
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:dip-a:ETH:101',
        timestamp: Date.parse('2026-03-22T00:00:00.000Z'),
        symbol: 'ETH',
        eventType: 'DIP_DETECTED',
      }),
    ];

    expect(
      createReflectionComparisonVM({
        generatedAt: '2026-04-03T00:00:00.000Z',
        history,
      }),
    ).toEqual(
      createReflectionComparisonVM({
        generatedAt: '2026-04-03T00:00:00.000Z',
        history: [...history].reverse(),
      }),
    );
  });
});
