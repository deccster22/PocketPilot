import type { MarketEvent } from '@/core/types/marketEvent';
import { createEventLedgerQueries } from '@/services/events/eventLedgerQueries';
import { createEventLedgerService } from '@/services/events/eventLedgerService';
import { fetchComparisonWindowVM } from '@/services/insights/fetchComparisonWindowVM';

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

describe('fetchComparisonWindowVM', () => {
  it('returns one canonical prepared comparison VM for the Insights compare path', () => {
    const ledger = createEventLedgerService([
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:earlier-a:ETH:100',
        accountId: 'acct-1',
        timestamp: Date.parse('2025-10-15T00:00:00.000Z'),
        symbol: 'ETH',
        eventType: 'MOMENTUM_BUILDING',
        alignmentState: 'WATCHFUL',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:earlier-b:ETH:101',
        accountId: 'acct-1',
        timestamp: Date.parse('2025-11-20T00:00:00.000Z'),
        symbol: 'ETH',
        eventType: 'MOMENTUM_BUILDING',
        alignmentState: 'WATCHFUL',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:newer-a:BTC:102',
        accountId: 'acct-1',
        timestamp: Date.parse('2026-01-14T00:00:00.000Z'),
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
        alignmentState: 'ALIGNED',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:newer-b:BTC:103',
        accountId: 'acct-1',
        timestamp: Date.parse('2026-03-18T00:00:00.000Z'),
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
        alignmentState: 'ALIGNED',
      }),
      createMarketEvent({
        eventId: 'acct-2:strategy-alpha:other:SOL:104',
        accountId: 'acct-2',
        timestamp: Date.parse('2026-02-11T00:00:00.000Z'),
        symbol: 'SOL',
        eventType: 'ESTIMATED_PRICE',
        certainty: 'estimated',
      }),
    ]);

    const result = fetchComparisonWindowVM({
      surface: 'INSIGHTS_SCREEN',
      window: 'LAST_QUARTER_VS_PREVIOUS_QUARTER',
      nowProvider: () => Date.parse('2026-05-15T00:00:00.000Z'),
      accountId: 'acct-1',
      eventLedger: ledger,
      eventLedgerQueries: createEventLedgerQueries(ledger),
    });

    expect(result).toEqual({
      generatedAt: '2026-05-15T00:00:00.000Z',
      availability: {
        status: 'AVAILABLE',
        window: 'LAST_QUARTER_VS_PREVIOUS_QUARTER',
        title: 'Q1 2026 compared with Q4 2025',
        summary:
          'Compared with Q4 2025, Q1 2026 leaned more on price shifts than on building momentum.',
        items: [
          {
            label: 'Most visible pattern',
            value: 'Q1 2026 leaned more on price shifts, while Q4 2025 leaned more on building momentum.',
            emphasis: 'SHIFT',
          },
          {
            label: 'Interpreted posture',
            value:
              'The later window moved from watchful rather than settled toward aligned rather than conflicted.',
            emphasis: 'SHIFT',
          },
          {
            label: 'Recurring symbol',
            value: 'BTC appeared more often in Q1 2026, while ETH appeared more often in Q4 2025.',
            emphasis: 'SHIFT',
          },
        ],
        limitations: [
          'At least one side of this comparison comes from a lighter stretch of interpreted history, so the read stays brief.',
        ],
      },
    });
    expect(JSON.stringify(result)).not.toMatch(/acct-2|broker:live|strategy-alpha|raw_signal_code/);
  });

  it('returns unavailable instead of enabling compare windows on other surfaces', () => {
    const ledger = createEventLedgerService([
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:a:BTC:100',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:b:ETH:101',
        timestamp: Date.parse('2026-04-02T00:00:00.000Z'),
        symbol: 'ETH',
      }),
    ]);

    expect(
      fetchComparisonWindowVM({
        surface: 'DASHBOARD',
        window: 'LAST_90_DAYS_VS_PREVIOUS_90_DAYS',
        nowProvider: () => Date.parse('2026-05-15T00:00:00.000Z'),
        eventLedger: ledger,
        eventLedgerQueries: createEventLedgerQueries(ledger),
      }),
    ).toEqual({
      generatedAt: '2026-05-15T00:00:00.000Z',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NOT_ENABLED_FOR_SURFACE',
      },
    });
  });

  it('returns honest unavailable states when history is thin or the selected window is not supported', () => {
    const ledger = createEventLedgerService([
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:last-year-only:BTC:100',
        timestamp: Date.parse('2025-06-15T00:00:00.000Z'),
        symbol: 'BTC',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:previous-year-a:ETH:101',
        timestamp: Date.parse('2024-03-05T00:00:00.000Z'),
        symbol: 'ETH',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:previous-year-b:ETH:102',
        timestamp: Date.parse('2024-07-11T00:00:00.000Z'),
        symbol: 'ETH',
      }),
    ]);
    const queries = createEventLedgerQueries(ledger);

    expect(
      fetchComparisonWindowVM({
        surface: 'INSIGHTS_SCREEN',
        window: 'LAST_YEAR_VS_PREVIOUS_YEAR',
        nowProvider: () => Date.parse('2026-05-15T00:00:00.000Z'),
        eventLedger: ledger,
        eventLedgerQueries: queries,
      }),
    ).toEqual({
      generatedAt: '2026-05-15T00:00:00.000Z',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'INSUFFICIENT_HISTORY',
      },
    });

    expect(
      fetchComparisonWindowVM({
        surface: 'INSIGHTS_SCREEN',
        window: 'BEFORE_STRATEGY_CHANGE_VS_AFTER_STRATEGY_CHANGE',
        nowProvider: () => Date.parse('2026-05-15T00:00:00.000Z'),
        eventLedger: ledger,
        eventLedgerQueries: queries,
      }),
    ).toEqual({
      generatedAt: '2026-05-15T00:00:00.000Z',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'UNSUPPORTED_WINDOW',
      },
    });
  });

  it('remains deterministic for identical inputs', () => {
    const ledger = createEventLedgerService([
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:earlier-a:ETH:100',
        timestamp: Date.parse('2025-10-15T00:00:00.000Z'),
        symbol: 'ETH',
        eventType: 'MOMENTUM_BUILDING',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:earlier-b:ETH:101',
        timestamp: Date.parse('2025-11-20T00:00:00.000Z'),
        symbol: 'ETH',
        eventType: 'MOMENTUM_BUILDING',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:newer-a:BTC:102',
        timestamp: Date.parse('2026-01-14T00:00:00.000Z'),
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:newer-b:BTC:103',
        timestamp: Date.parse('2026-03-18T00:00:00.000Z'),
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
      }),
    ]);
    const params = {
      surface: 'INSIGHTS_SCREEN' as const,
      window: 'LAST_QUARTER_VS_PREVIOUS_QUARTER' as const,
      nowProvider: () => Date.parse('2026-05-15T00:00:00.000Z'),
      eventLedger: ledger,
      eventLedgerQueries: createEventLedgerQueries(ledger),
    };

    expect(fetchComparisonWindowVM(params)).toEqual(fetchComparisonWindowVM(params));
  });
});
