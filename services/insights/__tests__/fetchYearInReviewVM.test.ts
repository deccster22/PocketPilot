import type { MarketEvent } from '@/core/types/marketEvent';
import { createEventLedgerQueries } from '@/services/events/eventLedgerQueries';
import { createEventLedgerService } from '@/services/events/eventLedgerService';
import { fetchYearInReviewVM } from '@/services/insights/fetchYearInReviewVM';

function createMarketEvent(
  overrides: Partial<MarketEvent> & Pick<MarketEvent, 'eventId'>,
): MarketEvent {
  return {
    eventId: overrides.eventId,
    timestamp: overrides.timestamp ?? Date.parse('2025-11-10T00:00:00.000Z'),
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

describe('fetchYearInReviewVM', () => {
  it('returns one canonical prepared year-in-review VM for Insights', () => {
    const ledger = createEventLedgerService([
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:estimate-a:SOL:100',
        accountId: 'acct-1',
        timestamp: Date.parse('2025-11-10T00:00:00.000Z'),
        symbol: 'SOL',
        eventType: 'ESTIMATED_PRICE',
        certainty: 'estimated',
        pctChange: null,
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:data-a:SOL:101',
        accountId: 'acct-1',
        timestamp: Date.parse('2025-09-10T00:00:00.000Z'),
        symbol: 'SOL',
        eventType: 'DATA_QUALITY',
        pctChange: null,
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-a:BTC:102',
        accountId: 'acct-1',
        timestamp: Date.parse('2025-05-10T00:00:00.000Z'),
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-b:BTC:103',
        accountId: 'acct-1',
        timestamp: Date.parse('2025-02-10T00:00:00.000Z'),
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
      }),
      createMarketEvent({
        eventId: 'acct-2:strategy-alpha:other:BTC:104',
        accountId: 'acct-2',
        timestamp: Date.parse('2025-07-12T00:00:00.000Z'),
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:future-ignore:ETH:105',
        accountId: 'acct-1',
        timestamp: Date.parse('2026-01-12T00:00:00.000Z'),
        symbol: 'ETH',
        eventType: 'MOMENTUM_BUILDING',
      }),
    ]);

    const result = fetchYearInReviewVM({
      surface: 'INSIGHTS_SCREEN',
      nowProvider: () => Date.parse('2026-04-15T00:00:00.000Z'),
      accountId: 'acct-1',
      eventLedger: ledger,
      eventLedgerQueries: createEventLedgerQueries(ledger),
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
    expect(JSON.stringify(result)).not.toMatch(/acct-2|broker:live|strategy-alpha|raw_signal_code/);
  });

  it('returns unavailable instead of enabling year in review on other surfaces', () => {
    const ledger = createEventLedgerService([
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
    ]);

    expect(
      fetchYearInReviewVM({
        surface: 'DASHBOARD',
        nowProvider: () => Date.parse('2026-04-15T00:00:00.000Z'),
        eventLedger: ledger,
        eventLedgerQueries: createEventLedgerQueries(ledger),
      }),
    ).toEqual({
      generatedAt: '2026-04-15T00:00:00.000Z',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NOT_ENABLED_FOR_SURFACE',
      },
    });
  });

  it('remains deterministic for identical inputs', () => {
    const ledger = createEventLedgerService([
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
    ]);
    const params = {
      surface: 'INSIGHTS_SCREEN' as const,
      nowProvider: () => Date.parse('2026-04-15T00:00:00.000Z'),
      eventLedger: ledger,
      eventLedgerQueries: createEventLedgerQueries(ledger),
    };

    expect(fetchYearInReviewVM(params)).toEqual(fetchYearInReviewVM(params));
  });
});
