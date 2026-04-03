import type { MarketEvent } from '@/core/types/marketEvent';
import { createEventLedgerQueries } from '@/services/events/eventLedgerQueries';
import { createEventLedgerService } from '@/services/events/eventLedgerService';
import { fetchInsightsHistoryVM } from '@/services/insights/fetchInsightsHistoryVM';
import { INSIGHTS_LAST_VIEWED_SECTION_ID } from '@/services/insights/types';
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

describe('fetchInsightsHistoryVM', () => {
  it('returns one canonical history VM for the top-level Insights surface', () => {
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
        eventId: 'acct-1:strategy-alpha:momentum-a:ETH:101',
        timestamp: Date.parse('2026-03-21T00:00:00.000Z'),
        accountId: 'acct-1',
        symbol: 'ETH',
        eventType: 'MOMENTUM_BUILDING',
      }),
      createMarketEvent({
        eventId: 'acct-2:strategy-alpha:other:SOL:102',
        timestamp: Date.parse('2026-03-22T00:00:00.000Z'),
        accountId: 'acct-2',
        symbol: 'SOL',
        eventType: 'ESTIMATED_PRICE',
        certainty: 'estimated',
        pctChange: null,
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:estimate-a:SOL:103',
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

    const result = fetchInsightsHistoryVM({
      surface: 'INSIGHTS_SCREEN',
      nowProvider: () => Date.parse('2026-04-03T00:00:00.000Z'),
      accountId: 'acct-1',
      eventLedger: ledger,
      eventLedgerQueries: createEventLedgerQueries(ledger),
      lastViewedState,
    });

    expect(result.generatedAt).toBe('2026-04-03T00:00:00.000Z');
    expect(result.availability).toMatchObject({
      status: 'AVAILABLE',
      sections: [
        {
          id: INSIGHTS_LAST_VIEWED_SECTION_ID,
          title: 'Since you last viewed Insights',
          items: [
            {
              title: 'SOL price context stayed estimated',
              symbol: 'SOL',
            },
          ],
        },
        {
          id: 'earlier-context',
          title: 'Earlier context',
          items: [
            {
              title: 'ETH momentum kept building',
              symbol: 'ETH',
            },
            {
              title: 'BTC price picture shifted',
              symbol: 'BTC',
            },
          ],
        },
      ],
    });
    expect(result.continuity).toEqual({
      state: 'NEW_HISTORY_AVAILABLE',
      viewedAt: '2026-03-22T12:00:00.000Z',
      newestEventAt: '2026-03-23T00:00:00.000Z',
      newItemCount: 1,
      summary: 'Since you last viewed Insights, 1 newer interpreted history note is available.',
    });

    if (result.availability.status !== 'AVAILABLE') {
      throw new Error('Expected available insights history.');
    }

    expect(JSON.stringify(result)).not.toMatch(/acct-2|broker:live|strategy-alpha|raw_signal_code/);
  });

  it('returns unavailable instead of enabling the history contract on other surfaces', () => {
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
      fetchInsightsHistoryVM({
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
      continuity: {
        state: 'NO_HISTORY',
        viewedAt: null,
        newestEventAt: null,
        newItemCount: 0,
        summary: null,
      },
    });
  });

  it('can honestly return NO_NEW_HISTORY when interpreted history exists but nothing is newer than the Insights boundary', () => {
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
    const lastViewedState = createInMemoryLastViewedState([
      {
        surfaceId: INSIGHTS_LAST_VIEWED_SURFACE_ID,
        accountId: 'acct-1',
        timestamp: Date.parse('2026-03-22T12:00:00.000Z'),
      },
    ]);

    const result = fetchInsightsHistoryVM({
      surface: 'INSIGHTS_SCREEN',
      nowProvider: () => Date.parse('2026-04-03T00:00:00.000Z'),
      accountId: 'acct-1',
      eventLedger: ledger,
      eventLedgerQueries: createEventLedgerQueries(ledger),
      lastViewedState,
    });

    expect(result.availability).toMatchObject({
      status: 'AVAILABLE',
      sections: [
        {
          id: 'recent-history',
          title: 'Recent history',
        },
      ],
    });
    expect(result.continuity).toEqual({
      state: 'NO_NEW_HISTORY',
      viewedAt: '2026-03-22T12:00:00.000Z',
      newestEventAt: '2026-03-21T00:00:00.000Z',
      newItemCount: 0,
      summary: 'Since you last viewed Insights, no newer interpreted history is available.',
    });
  });

  it('remains deterministic for identical inputs', () => {
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
    const params = {
      surface: 'INSIGHTS_SCREEN' as const,
      nowProvider: () => Date.parse('2026-04-03T00:00:00.000Z'),
      eventLedger: ledger,
      eventLedgerQueries: createEventLedgerQueries(ledger),
    };

    expect(fetchInsightsHistoryVM(params)).toEqual(fetchInsightsHistoryVM(params));
  });
});
