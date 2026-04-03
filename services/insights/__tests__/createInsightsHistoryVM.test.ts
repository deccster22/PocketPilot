import type { MarketEvent } from '@/core/types/marketEvent';
import { createSinceLastChecked } from '@/services/events/createSinceLastChecked';
import { createEventLedgerQueries } from '@/services/events/eventLedgerQueries';
import { createEventLedgerService } from '@/services/events/eventLedgerService';
import { createInsightsHistoryVM } from '@/services/insights/createInsightsHistoryVM';
import { INSIGHTS_LAST_VIEWED_SECTION_ID } from '@/services/insights/types';
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

describe('createInsightsHistoryVM', () => {
  it('builds a calm interpreted history with meaningful sections and compression', () => {
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
      sinceTimestamp: Date.parse('2026-03-21T12:00:00.000Z'),
      accountId: 'acct-1',
      eventQueries: queries,
    });

    const result = createInsightsHistoryVM({
      generatedAt: '2026-04-03T00:00:00.000Z',
      history: ledger.getAllEvents(),
      orientationContext: createOrientationContext({
        accountId: 'acct-1',
        sinceLastChecked,
      }),
    });

    expect(result).toEqual({
      generatedAt: '2026-04-03T00:00:00.000Z',
      availability: {
        status: 'AVAILABLE',
        sections: [
          {
            id: INSIGHTS_LAST_VIEWED_SECTION_ID,
            title: 'Since you last viewed Insights',
            items: [
              {
                title: 'SOL price context stayed estimated',
                summary:
                  'Recent pricing context for SOL remained estimated, so this part of the picture stayed provisional.',
                timestamp: '2026-03-23T00:00:00.000Z',
                symbol: 'SOL',
                eventKind: 'CONTEXT',
              },
              {
                title: 'ETH pullback entered view',
                summary: 'A measured pullback around ETH entered recent interpreted history.',
                timestamp: '2026-03-22T00:00:00.000Z',
                symbol: 'ETH',
                eventKind: 'VOLATILITY',
              },
            ],
          },
          {
            id: 'earlier-context',
            title: 'Earlier context',
            items: [
              {
                title: 'BTC price picture shifted',
                summary:
                  'Price context for BTC moved up by 4.00% in the recent interpreted picture. The same interpreted picture appeared across 2 recent updates.',
                timestamp: '2026-03-21T00:00:00.000Z',
                symbol: 'BTC',
                eventKind: 'STATE_CHANGE',
              },
            ],
          },
        ],
      },
    });
  });

  it('returns unavailable when no canonical event history exists', () => {
    expect(
      createInsightsHistoryVM({
        generatedAt: '2026-04-03T00:00:00.000Z',
        history: [],
      }),
    ).toEqual({
      generatedAt: '2026-04-03T00:00:00.000Z',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NO_EVENT_HISTORY',
      },
    });
  });

  it('returns unavailable when interpreted history is too thin for a dedicated history surface', () => {
    expect(
      createInsightsHistoryVM({
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

  it('does not leak raw ids, signal codes, strategy ids, or provider metadata into user-facing history', () => {
    const result = createInsightsHistoryVM({
      generatedAt: '2026-04-03T00:00:00.000Z',
      history: [
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
          timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
          symbol: 'BTC',
          eventType: 'PRICE_MOVEMENT',
          pctChange: 0.03,
        }),
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:dip-a:ETH:102',
          timestamp: Date.parse('2026-03-22T00:00:00.000Z'),
          symbol: 'ETH',
          eventType: 'DIP_DETECTED',
          pctChange: -0.05,
        }),
      ],
    });

    const serialized = JSON.stringify(result);

    expect(serialized).not.toMatch(
      /eventId|signalsTriggered|strategy-alpha|strategyId|providerId|broker:live|raw_signal_code|signalTitle/i,
    );
  });

  it('is deterministic for identical interpreted inputs regardless of ledger order', () => {
    const history = [
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
        timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
        pctChange: 0.03,
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
    ];

    expect(
      createInsightsHistoryVM({
        generatedAt: '2026-04-03T00:00:00.000Z',
        history,
      }),
    ).toEqual(
      createInsightsHistoryVM({
        generatedAt: '2026-04-03T00:00:00.000Z',
        history: [...history].reverse(),
      }),
    );
  });

  it('keeps history copy calm and non-moralizing', () => {
    const result = createInsightsHistoryVM({
      generatedAt: '2026-04-03T00:00:00.000Z',
      history: [
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
          timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
          symbol: 'BTC',
          eventType: 'PRICE_MOVEMENT',
          pctChange: 0.03,
        }),
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:dip-a:ETH:102',
          timestamp: Date.parse('2026-03-22T00:00:00.000Z'),
          symbol: 'ETH',
          eventType: 'DIP_DETECTED',
          pctChange: -0.05,
        }),
      ],
    });

    expect(JSON.stringify(result)).not.toMatch(
      /urgent|act now|good user|bad user|discipline score|should have|win rate|shame|failure/i,
    );
  });
});
