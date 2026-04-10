import type { MarketEvent } from '@/core/types/marketEvent';
import { createSummaryArchiveVM } from '@/services/insights/createSummaryArchiveVM';

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

describe('createSummaryArchiveVM', () => {
  it('creates calm prepared archive entries in canonical order for the current summary periods', () => {
    const result = createSummaryArchiveVM({
      generatedAt: '2026-04-15T00:00:00.000Z',
      history: [
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:jan-price:BTC:100',
          timestamp: Date.parse('2026-01-10T00:00:00.000Z'),
          symbol: 'BTC',
          eventType: 'PRICE_MOVEMENT',
        }),
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:feb-dip:ETH:101',
          timestamp: Date.parse('2026-02-10T00:00:00.000Z'),
          symbol: 'ETH',
          eventType: 'DIP_DETECTED',
        }),
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:mar-price:BTC:102',
          timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
          symbol: 'BTC',
          eventType: 'PRICE_MOVEMENT',
        }),
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:mar-estimate:SOL:103',
          timestamp: Date.parse('2026-03-10T00:00:00.000Z'),
          symbol: 'SOL',
          eventType: 'ESTIMATED_PRICE',
          certainty: 'estimated',
          pctChange: null,
        }),
      ],
    });

    expect(result.generatedAt).toBe('2026-04-15T00:00:00.000Z');
    expect(result.availability.status).toBe('AVAILABLE');

    if (result.availability.status !== 'AVAILABLE') {
      throw new Error('Expected archive entries to be available.');
    }

    expect(result.availability.entries).toHaveLength(2);
    expect(result.availability.entries[0]).toMatchObject({
      archiveId: 'period-summary:last_month',
      period: 'LAST_MONTH',
      title: 'Last month',
      coveredRangeLabel: 'Covered period: March 2026',
      generatedAtLabel: 'Prepared 2026-04-15',
    });
    expect(result.availability.entries[1]).toMatchObject({
      archiveId: 'period-summary:last_quarter',
      period: 'LAST_QUARTER',
      title: 'Last quarter',
      coveredRangeLabel: 'Covered period: January to March 2026',
      generatedAtLabel: 'Prepared 2026-04-15',
    });
    expect(result.availability.entries.every((entry) => entry.summary.length <= 120)).toBe(true);
    expect(JSON.stringify(result)).not.toMatch(
      /eventId|signalsTriggered|strategy-alpha|strategyId|providerId|broker:live|raw_signal_code|signalTitle|confidenceScore|metadata/i,
    );
  });

  it('returns an honest unavailable state when no archived summaries are ready', () => {
    expect(
      createSummaryArchiveVM({
        generatedAt: '2026-04-15T00:00:00.000Z',
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
        reason: 'NO_ARCHIVED_SUMMARIES',
      },
    });
  });

  it('keeps archive copy calm and non-moralizing', () => {
    const result = createSummaryArchiveVM({
      generatedAt: '2026-04-15T00:00:00.000Z',
      history: [
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:jan-price:BTC:100',
          timestamp: Date.parse('2026-01-10T00:00:00.000Z'),
          eventType: 'PRICE_MOVEMENT',
        }),
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:feb-dip:ETH:101',
          timestamp: Date.parse('2026-02-10T00:00:00.000Z'),
          eventType: 'DIP_DETECTED',
          symbol: 'ETH',
        }),
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:mar-price:BTC:102',
          timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
          eventType: 'PRICE_MOVEMENT',
          symbol: 'BTC',
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
        eventId: 'acct-1:strategy-alpha:jan-price:BTC:100',
        timestamp: Date.parse('2026-01-10T00:00:00.000Z'),
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:feb-dip:ETH:101',
        timestamp: Date.parse('2026-02-10T00:00:00.000Z'),
        eventType: 'DIP_DETECTED',
        symbol: 'ETH',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:mar-price:BTC:102',
        timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:mar-estimate:SOL:103',
        timestamp: Date.parse('2026-03-10T00:00:00.000Z'),
        eventType: 'ESTIMATED_PRICE',
        certainty: 'estimated',
        pctChange: null,
        symbol: 'SOL',
      }),
    ];

    expect(
      createSummaryArchiveVM({
        generatedAt: '2026-04-15T00:00:00.000Z',
        history,
      }),
    ).toEqual(
      createSummaryArchiveVM({
        generatedAt: '2026-04-15T00:00:00.000Z',
        history: [...history].reverse(),
      }),
    );
  });
});
