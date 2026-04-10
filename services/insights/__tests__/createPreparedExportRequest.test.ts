import type { EventLedgerEntry, UserActionEvent } from '@/core/types/eventLedger';
import type { MarketEvent } from '@/core/types/marketEvent';
import { createPreparedExportRequest } from '@/services/insights/createPreparedExportRequest';

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
      runtimeState: 'internal-only',
    },
  };
}

function createUserActionEvent(
  overrides: Partial<UserActionEvent> & Pick<UserActionEvent, 'eventId'>,
): UserActionEvent {
  return {
    eventId: overrides.eventId,
    timestamp: overrides.timestamp ?? Date.parse('2026-03-16T00:00:00.000Z'),
    accountId: overrides.accountId ?? 'acct-1',
    actionType: overrides.actionType ?? 'NOTE_RECORDED',
    metadata: overrides.metadata ?? {
      privateRuntimeFlag: true,
    },
  };
}

function createReflectionHistory(): EventLedgerEntry[] {
  return [
    createMarketEvent({
      eventId: 'acct-1:strategy-alpha:2025-jan:BTC:100',
      timestamp: Date.parse('2025-01-10T00:00:00.000Z'),
      eventType: 'PRICE_MOVEMENT',
      symbol: 'BTC',
    }),
    createMarketEvent({
      eventId: 'acct-1:strategy-alpha:2025-jul:ETH:101',
      timestamp: Date.parse('2025-07-11T00:00:00.000Z'),
      eventType: 'DIP_DETECTED',
      symbol: 'ETH',
    }),
    createMarketEvent({
      eventId: 'acct-1:strategy-alpha:2025-nov:SOL:102',
      timestamp: Date.parse('2025-11-22T00:00:00.000Z'),
      eventType: 'MOMENTUM_BUILDING',
      symbol: 'SOL',
    }),
    createMarketEvent({
      eventId: 'acct-1:strategy-alpha:2026-mar-a:BTC:103',
      timestamp: Date.parse('2026-03-10T00:00:00.000Z'),
      eventType: 'PRICE_MOVEMENT',
      symbol: 'BTC',
    }),
    createMarketEvent({
      eventId: 'acct-1:strategy-alpha:2026-mar-b:ETH:104',
      timestamp: Date.parse('2026-03-14T00:00:00.000Z'),
      eventType: 'DIP_DETECTED',
      symbol: 'ETH',
    }),
    createUserActionEvent({
      eventId: 'acct-1:user-action:2026-mar-c',
      timestamp: Date.parse('2026-03-16T00:00:00.000Z'),
    }),
  ];
}

describe('createPreparedExportRequest', () => {
  it('prepares a calm PDF summary request with explicit coverage and timezone labeling', () => {
    const result = createPreparedExportRequest({
      generatedAt: '2026-04-15T00:00:00.000Z',
      profile: 'BEGINNER',
      history: createReflectionHistory(),
      format: 'PDF_SUMMARY',
      period: 'LAST_MONTH',
      timezoneLabel: 'Australia/Sydney',
    });

    expect(result.availability.status).toBe('AVAILABLE');

    if (result.availability.status !== 'AVAILABLE') {
      throw new Error('Expected PDF summary request to be available.');
    }

    expect(result.availability.request).toEqual({
      format: 'PDF_SUMMARY',
      title: 'Last month reflection summary',
      coveredRangeLabel: 'Covered period: March 2026',
      timezoneLabel: 'Australia/Sydney',
      payloadSummary: [
        {
          label: 'Contains',
          value:
            'A calm formatted cover plus the selected prepared summary, its key notes, and any honest limitation notes.',
        },
        {
          label: 'Selected period',
          value: 'Last month with 3 prepared notes.',
        },
        {
          label: 'Archive source',
          value: 'Matches the prepared archive entry labeled "Last month" on the Insights shelf.',
        },
        {
          label: 'Wider context',
          value:
            'Also carries a short 2025 in review appendix when you want a broader reflection frame.',
        },
        {
          label: 'Limitations',
          value: '1 limitation note remains visible in the export.',
        },
        {
          label: 'Excludes',
          value:
            'Internal diagnostics, provider details, raw signal codes, and runtime metadata stay out.',
        },
      ],
    });
  });

  it('prepares an advanced event-ledger CSV request without leaking diagnostics fields', () => {
    const result = createPreparedExportRequest({
      generatedAt: '2026-04-15T00:00:00.000Z',
      profile: 'ADVANCED',
      history: createReflectionHistory(),
      format: 'CSV_EVENT_LEDGER',
      period: 'LAST_MONTH',
      timezoneLabel: 'UTC',
    });

    expect(result.availability.status).toBe('AVAILABLE');

    if (result.availability.status !== 'AVAILABLE') {
      throw new Error('Expected event ledger request to be available.');
    }

    expect(result.availability.request).toEqual({
      format: 'CSV_EVENT_LEDGER',
      title: 'Last month event ledger (CSV)',
      coveredRangeLabel: 'Covered period: March 2026',
      timezoneLabel: 'UTC',
      payloadSummary: [
        {
          label: 'Contains',
          value: '3 ledger rows from the selected period: 2 market and 1 user action.',
        },
        {
          label: 'Columns',
          value:
            'Timestamp, event class, event type or action type, account, symbol, strategy, alignment, certainty, price, and percent change when present.',
        },
        {
          label: 'Excludes',
          value:
            'Provider diagnostics, raw signal codes, confidence scores, and metadata payloads stay out of this export foundation.',
        },
      ],
    });
    expect(JSON.stringify(result)).not.toMatch(
      /providerId|broker:live|raw_signal_code|runtimeState|privateRuntimeFlag|urgent|should have|scorecard|win rate|predict|advice/i,
    );
  });

  it('returns unsupported format when the selected profile should not receive that export', () => {
    expect(
      createPreparedExportRequest({
        generatedAt: '2026-04-15T00:00:00.000Z',
        profile: 'BEGINNER',
        history: createReflectionHistory(),
        format: 'CSV_SUMMARY',
        period: 'LAST_MONTH',
        timezoneLabel: 'UTC',
      }),
    ).toEqual({
      generatedAt: '2026-04-15T00:00:00.000Z',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'UNSUPPORTED_FORMAT',
      },
    });
  });

  it('returns insufficient content when the selected period cannot support the export', () => {
    expect(
      createPreparedExportRequest({
        generatedAt: '2026-04-15T00:00:00.000Z',
        profile: 'ADVANCED',
        history: [
          createMarketEvent({
            eventId: 'acct-1:strategy-alpha:single:BTC:100',
            timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
            eventType: 'ESTIMATED_PRICE',
            certainty: 'estimated',
            pctChange: null,
          }),
        ],
        format: 'PDF_SUMMARY',
        period: 'LAST_MONTH',
        timezoneLabel: 'UTC',
      }),
    ).toEqual({
      generatedAt: '2026-04-15T00:00:00.000Z',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'INSUFFICIENT_CONTENT',
      },
    });
  });
});
