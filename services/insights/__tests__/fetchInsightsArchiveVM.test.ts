import type { MarketEvent } from '@/core/types/marketEvent';
import { createEventLedgerQueries } from '@/services/events/eventLedgerQueries';
import { createEventLedgerService } from '@/services/events/eventLedgerService';
import { fetchInsightsArchiveVM } from '@/services/insights/fetchInsightsArchiveVM';
import {
  createInMemoryLastViewedState,
  INSIGHTS_LAST_VIEWED_SURFACE_ID,
  SNAPSHOT_LAST_VIEWED_SURFACE_ID,
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

describe('fetchInsightsArchiveVM', () => {
  it('returns one canonical prepared archive VM for the Insights detail path', () => {
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
        timestamp: Date.parse('2026-03-21T12:00:00.000Z'),
      },
      {
        surfaceId: SNAPSHOT_LAST_VIEWED_SURFACE_ID,
        accountId: 'acct-1',
        timestamp: Date.parse('2026-03-21T12:00:00.000Z'),
      },
    ]);

    const result = fetchInsightsArchiveVM({
      surface: 'INSIGHTS_SCREEN',
      nowProvider: () => Date.parse('2026-04-03T00:00:00.000Z'),
      accountId: 'acct-1',
      eventLedger: ledger,
      eventLedgerQueries: createEventLedgerQueries(ledger),
      lastViewedState,
    });

    expect(result).toMatchObject({
      generatedAt: '2026-04-03T00:00:00.000Z',
      availability: {
        status: 'AVAILABLE',
        sections: [
          {
            id: 'since-last-viewed',
            title: 'Since you last viewed Insights',
            items: [
              {
                title: 'SOL price context stayed estimated',
                symbol: 'SOL',
                detailNote:
                  'The interpreted posture stayed watchful rather than settled. Estimated pricing context remained part of this note, so the interpretation stayed provisional.',
              },
              {
                title: 'ETH pullback entered view',
                symbol: 'ETH',
              },
            ],
          },
          {
            id: 'earlier-context',
            title: 'Earlier context',
            items: [
              {
                title: 'BTC price picture shifted',
                symbol: 'BTC',
              },
            ],
          },
        ],
      },
      selectedSectionId: 'since-last-viewed',
      sinceLastCheckedContinuity: {
        status: 'AVAILABLE',
      },
    });
    expect(JSON.stringify(result)).not.toMatch(/acct-2|broker:live|strategy-alpha|raw_signal_code/);
  });

  it('honors a valid selected section id without moving selection logic into app', () => {
    const ledger = createEventLedgerService([
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
        timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-b:BTC:101',
        timestamp: Date.parse('2026-03-21T00:00:00.000Z'),
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
    const lastViewedState = createInMemoryLastViewedState([
      {
        surfaceId: INSIGHTS_LAST_VIEWED_SURFACE_ID,
        accountId: 'acct-1',
        timestamp: Date.parse('2026-03-21T12:00:00.000Z'),
      },
    ]);

    expect(
      fetchInsightsArchiveVM({
        surface: 'INSIGHTS_SCREEN',
        nowProvider: () => Date.parse('2026-04-03T00:00:00.000Z'),
        accountId: 'acct-1',
        eventLedger: ledger,
        eventLedgerQueries: createEventLedgerQueries(ledger),
        lastViewedState,
        selectedSectionId: 'earlier-context',
      }),
    ).toMatchObject({
      availability: {
        status: 'AVAILABLE',
      },
      selectedSectionId: 'earlier-context',
    });
  });

  it('returns unavailable instead of enabling archive detail on other surfaces', () => {
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
      fetchInsightsArchiveVM({
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
      selectedSectionId: null,
      sinceLastCheckedContinuity: {
        status: 'UNAVAILABLE',
        reason: 'NOT_ENABLED_FOR_SURFACE',
      },
    });
  });

  it('can honestly return unavailable when deeper interpreted archive history stays too thin', () => {
    const ledger = createEventLedgerService([
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
        timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:dip-a:ETH:101',
        timestamp: Date.parse('2026-03-21T00:00:00.000Z'),
        symbol: 'ETH',
        eventType: 'DIP_DETECTED',
        pctChange: -0.05,
      }),
    ]);

    expect(
      fetchInsightsArchiveVM({
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
      selectedSectionId: null,
      sinceLastCheckedContinuity: {
        status: 'UNAVAILABLE',
        reason: 'NO_ACCOUNT_CONTEXT',
      },
    });
  });

  it('remains deterministic for identical inputs', () => {
    const ledger = createEventLedgerService([
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
        timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-b:BTC:101',
        timestamp: Date.parse('2026-03-21T00:00:00.000Z'),
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
    const lastViewedState = createInMemoryLastViewedState([
      {
        surfaceId: INSIGHTS_LAST_VIEWED_SURFACE_ID,
        accountId: 'acct-1',
        timestamp: Date.parse('2026-03-21T12:00:00.000Z'),
      },
    ]);
    const params = {
      surface: 'INSIGHTS_SCREEN' as const,
      nowProvider: () => Date.parse('2026-04-03T00:00:00.000Z'),
      accountId: 'acct-1',
      eventLedger: ledger,
      eventLedgerQueries: createEventLedgerQueries(ledger),
      lastViewedState,
      selectedSectionId: 'earlier-context',
    };

    expect(fetchInsightsArchiveVM(params)).toEqual(fetchInsightsArchiveVM(params));
  });
});
