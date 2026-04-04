import type { MarketEvent } from '@/core/types/marketEvent';
import { createEventLedgerQueries } from '@/services/events/eventLedgerQueries';
import { createEventLedgerService } from '@/services/events/eventLedgerService';
import { fetchReflectionComparisonVM } from '@/services/insights/fetchReflectionComparisonVM';
import {
  createInMemoryLastViewedState,
  INSIGHTS_LAST_VIEWED_SURFACE_ID,
} from '@/services/orientation/lastViewedState';

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
    },
  };
}

describe('fetchReflectionComparisonVM', () => {
  it('returns one canonical prepared comparison VM for the Insights reflection path', () => {
    const ledger = createEventLedgerService([
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
        timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
        accountId: 'acct-1',
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
        pctChange: 0.03,
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-b:BTC:101',
        timestamp: Date.parse('2026-03-21T00:00:00.000Z'),
        accountId: 'acct-1',
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
        pctChange: 0.04,
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:dip-a:ETH:102',
        timestamp: Date.parse('2026-03-22T00:00:00.000Z'),
        accountId: 'acct-1',
        symbol: 'ETH',
        eventType: 'DIP_DETECTED',
        pctChange: -0.05,
      }),
      createMarketEvent({
        eventId: 'acct-2:strategy-alpha:other:SOL:103',
        timestamp: Date.parse('2026-03-22T00:00:00.000Z'),
        accountId: 'acct-2',
        symbol: 'SOL',
        eventType: 'ESTIMATED_PRICE',
        certainty: 'estimated',
        pctChange: null,
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:estimate-a:SOL:104',
        timestamp: Date.parse('2026-03-23T00:00:00.000Z'),
        accountId: 'acct-1',
        symbol: 'SOL',
        eventType: 'ESTIMATED_PRICE',
        certainty: 'estimated',
        pctChange: null,
      }),
    ]);
    const lastViewedState = createInMemoryLastViewedState([
      {
        surfaceId: INSIGHTS_LAST_VIEWED_SURFACE_ID,
        accountId: 'acct-1',
        timestamp: Date.parse('2026-03-22T12:00:00.000Z'),
      },
    ]);

    const result = fetchReflectionComparisonVM({
      surface: 'INSIGHTS_SCREEN',
      nowProvider: () => Date.parse('2026-04-03T00:00:00.000Z'),
      accountId: 'acct-1',
      eventLedger: ledger,
      eventLedgerQueries: createEventLedgerQueries(ledger),
      lastViewedState,
    });

    expect(result).toEqual({
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
    expect(JSON.stringify(result)).not.toMatch(/acct-2|broker:live|strategy-alpha|raw_signal_code/);
  });

  it('returns unavailable instead of enabling reflection comparison on other surfaces', () => {
    const ledger = createEventLedgerService([
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
        timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:momentum-a:ETH:101',
        timestamp: Date.parse('2026-03-21T00:00:00.000Z'),
        symbol: 'ETH',
        eventType: 'MOMENTUM_BUILDING',
      }),
    ]);

    expect(
      fetchReflectionComparisonVM({
        surface: 'DASHBOARD',
        nowProvider: () => Date.parse('2026-04-03T00:00:00.000Z'),
        eventLedger: ledger,
        eventLedgerQueries: createEventLedgerQueries(ledger),
      }),
    ).toEqual({
      generatedAt: '2026-04-03T00:00:00.000Z',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NOT_ENABLED_FOR_SURFACE',
      },
    });
  });

  it('can honestly return unavailable when interpreted history is too thin to compare', () => {
    const ledger = createEventLedgerService([
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:single:BTC:100',
        timestamp: Date.parse('2026-03-23T00:00:00.000Z'),
        eventType: 'ESTIMATED_PRICE',
        certainty: 'estimated',
      }),
    ]);

    expect(
      fetchReflectionComparisonVM({
        surface: 'INSIGHTS_SCREEN',
        nowProvider: () => Date.parse('2026-04-03T00:00:00.000Z'),
        eventLedger: ledger,
        eventLedgerQueries: createEventLedgerQueries(ledger),
      }),
    ).toEqual({
      generatedAt: '2026-04-03T00:00:00.000Z',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'INSUFFICIENT_INTERPRETED_HISTORY',
      },
    });
  });

  it('remains deterministic for identical inputs', () => {
    const ledger = createEventLedgerService([
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
        timestamp: Date.parse('2026-03-23T00:00:00.000Z'),
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:dip-a:ETH:101',
        timestamp: Date.parse('2026-03-22T00:00:00.000Z'),
        symbol: 'ETH',
        eventType: 'DIP_DETECTED',
      }),
    ]);
    const params = {
      surface: 'INSIGHTS_SCREEN' as const,
      nowProvider: () => Date.parse('2026-04-03T00:00:00.000Z'),
      eventLedger: ledger,
      eventLedgerQueries: createEventLedgerQueries(ledger),
    };

    expect(fetchReflectionComparisonVM(params)).toEqual(fetchReflectionComparisonVM(params));
  });
});
