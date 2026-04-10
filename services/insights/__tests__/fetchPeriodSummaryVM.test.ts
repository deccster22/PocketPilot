import type { MarketEvent } from '@/core/types/marketEvent';
import { createEventLedgerQueries } from '@/services/events/eventLedgerQueries';
import { createEventLedgerService } from '@/services/events/eventLedgerService';
import { fetchPeriodSummaryVM } from '@/services/insights/fetchPeriodSummaryVM';

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
    },
  };
}

describe('fetchPeriodSummaryVM', () => {
  it('returns one canonical prepared period summary VM for the Insights summary path', () => {
    const ledger = createEventLedgerService([
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
        accountId: 'acct-1',
        timestamp: Date.parse('2026-01-10T00:00:00.000Z'),
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:dip-a:ETH:101',
        accountId: 'acct-1',
        timestamp: Date.parse('2026-02-10T00:00:00.000Z'),
        symbol: 'ETH',
        eventType: 'DIP_DETECTED',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:estimate-a:SOL:102',
        accountId: 'acct-1',
        timestamp: Date.parse('2026-03-10T00:00:00.000Z'),
        symbol: 'SOL',
        eventType: 'ESTIMATED_PRICE',
        certainty: 'estimated',
        pctChange: null,
      }),
      createMarketEvent({
        eventId: 'acct-2:strategy-alpha:other:BTC:103',
        accountId: 'acct-2',
        timestamp: Date.parse('2026-03-12T00:00:00.000Z'),
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:april-ignore:BTC:104',
        accountId: 'acct-1',
        timestamp: Date.parse('2026-04-12T00:00:00.000Z'),
        symbol: 'BTC',
        eventType: 'MOMENTUM_BUILDING',
      }),
    ]);

    const result = fetchPeriodSummaryVM({
      surface: 'INSIGHTS_SCREEN',
      period: 'LAST_QUARTER',
      nowProvider: () => Date.parse('2026-04-15T00:00:00.000Z'),
      accountId: 'acct-1',
      eventLedger: ledger,
      eventLedgerQueries: createEventLedgerQueries(ledger),
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
    expect(JSON.stringify(result)).not.toMatch(/acct-2|broker:live|strategy-alpha|raw_signal_code/);
  });

  it('returns unavailable instead of enabling period summaries on other surfaces', () => {
    const ledger = createEventLedgerService([
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
        timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-b:BTC:101',
        timestamp: Date.parse('2026-03-10T00:00:00.000Z'),
      }),
    ]);

    expect(
      fetchPeriodSummaryVM({
        surface: 'DASHBOARD',
        period: 'LAST_MONTH',
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

  it('can honestly return unavailable when no period has been selected yet', () => {
    const ledger = createEventLedgerService([
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
        timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-b:BTC:101',
        timestamp: Date.parse('2026-03-10T00:00:00.000Z'),
      }),
    ]);

    expect(
      fetchPeriodSummaryVM({
        surface: 'INSIGHTS_SCREEN',
        period: null,
        nowProvider: () => Date.parse('2026-04-15T00:00:00.000Z'),
        eventLedger: ledger,
        eventLedgerQueries: createEventLedgerQueries(ledger),
      }),
    ).toEqual({
      generatedAt: '2026-04-15T00:00:00.000Z',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NO_PERIOD_SELECTED',
      },
    });
  });

  it('remains deterministic for identical inputs', () => {
    const ledger = createEventLedgerService([
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
    ]);
    const params = {
      surface: 'INSIGHTS_SCREEN' as const,
      period: 'LAST_QUARTER' as const,
      nowProvider: () => Date.parse('2026-04-15T00:00:00.000Z'),
      eventLedger: ledger,
      eventLedgerQueries: createEventLedgerQueries(ledger),
    };

    expect(fetchPeriodSummaryVM(params)).toEqual(fetchPeriodSummaryVM(params));
  });
});
