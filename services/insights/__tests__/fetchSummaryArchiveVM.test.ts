import type { MarketEvent } from '@/core/types/marketEvent';
import { createEventLedgerQueries } from '@/services/events/eventLedgerQueries';
import { createEventLedgerService } from '@/services/events/eventLedgerService';
import { fetchSummaryArchiveVM } from '@/services/insights/fetchSummaryArchiveVM';

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

describe('fetchSummaryArchiveVM', () => {
  it('returns one canonical prepared summary archive VM for Insights', () => {
    const ledger = createEventLedgerService([
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:jan-price:BTC:100',
        accountId: 'acct-1',
        timestamp: Date.parse('2026-01-10T00:00:00.000Z'),
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:feb-dip:ETH:101',
        accountId: 'acct-1',
        timestamp: Date.parse('2026-02-10T00:00:00.000Z'),
        symbol: 'ETH',
        eventType: 'DIP_DETECTED',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:mar-price:BTC:102',
        accountId: 'acct-1',
        timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:mar-estimate:SOL:103',
        accountId: 'acct-1',
        timestamp: Date.parse('2026-03-10T00:00:00.000Z'),
        symbol: 'SOL',
        eventType: 'ESTIMATED_PRICE',
        certainty: 'estimated',
        pctChange: null,
      }),
      createMarketEvent({
        eventId: 'acct-2:strategy-alpha:other:BTC:104',
        accountId: 'acct-2',
        timestamp: Date.parse('2026-03-12T00:00:00.000Z'),
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
      }),
    ]);

    const result = fetchSummaryArchiveVM({
      surface: 'INSIGHTS_SCREEN',
      nowProvider: () => Date.parse('2026-04-15T00:00:00.000Z'),
      accountId: 'acct-1',
      eventLedger: ledger,
      eventLedgerQueries: createEventLedgerQueries(ledger),
    });

    expect(result.generatedAt).toBe('2026-04-15T00:00:00.000Z');
    expect(result.availability.status).toBe('AVAILABLE');

    if (result.availability.status !== 'AVAILABLE') {
      throw new Error('Expected summary archive to be available.');
    }

    expect(result.availability.entries.map((entry) => entry.period)).toEqual([
      'LAST_MONTH',
      'LAST_QUARTER',
    ]);
    expect(result.availability.entries[0]).toMatchObject({
      archiveId: 'period-summary:last_month',
      coveredRangeLabel: 'Covered period: March 2026',
      generatedAtLabel: 'Prepared 2026-04-15',
    });
    expect(result.availability.entries[1]).toMatchObject({
      archiveId: 'period-summary:last_quarter',
      coveredRangeLabel: 'Covered period: January to March 2026',
      generatedAtLabel: 'Prepared 2026-04-15',
    });
    expect(JSON.stringify(result)).not.toMatch(/acct-2|broker:live|strategy-alpha|raw_signal_code/);
  });

  it('returns unavailable instead of enabling summary archive on other surfaces', () => {
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
      fetchSummaryArchiveVM({
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

  it('can honestly return unavailable when no archiveable summaries are ready yet', () => {
    const ledger = createEventLedgerService([
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:single:BTC:100',
        timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
        eventType: 'ESTIMATED_PRICE',
        certainty: 'estimated',
        pctChange: null,
      }),
    ]);

    expect(
      fetchSummaryArchiveVM({
        surface: 'INSIGHTS_SCREEN',
        nowProvider: () => Date.parse('2026-04-15T00:00:00.000Z'),
        eventLedger: ledger,
        eventLedgerQueries: createEventLedgerQueries(ledger),
      }),
    ).toEqual({
      generatedAt: '2026-04-15T00:00:00.000Z',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NO_ARCHIVED_SUMMARIES',
      },
    });
  });
});
