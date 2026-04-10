import type { EventLedgerEntry, UserActionEvent } from '@/core/types/eventLedger';
import type { MarketEvent } from '@/core/types/marketEvent';
import { createExportOptionsVM } from '@/services/insights/createExportOptionsVM';

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

describe('createExportOptionsVM', () => {
  it('returns explicit profile-aware export options for the same reflection context', () => {
    const beginnerResult = createExportOptionsVM({
      generatedAt: '2026-04-15T00:00:00.000Z',
      profile: 'BEGINNER',
      history: createReflectionHistory(),
    });
    const advancedResult = createExportOptionsVM({
      generatedAt: '2026-04-15T00:00:00.000Z',
      profile: 'ADVANCED',
      history: createReflectionHistory(),
    });

    expect(beginnerResult.availability.status).toBe('AVAILABLE');
    expect(advancedResult.availability.status).toBe('AVAILABLE');

    if (
      beginnerResult.availability.status !== 'AVAILABLE' ||
      advancedResult.availability.status !== 'AVAILABLE'
    ) {
      throw new Error('Expected export options to be available.');
    }

    expect(beginnerResult.availability.options).toEqual([
      {
        format: 'PDF_SUMMARY',
        label: 'PDF summary',
        description:
          'A calm formatted export of the prepared reflection notes that are already ready under Insights.',
        isAvailable: true,
      },
      {
        format: 'CSV_SUMMARY',
        label: 'CSV summary',
        description:
          'A row-based export of the selected period summary with timezone labeling and no internal diagnostics.',
        isAvailable: false,
        unavailableReason: 'Available on the Intermediate and Advanced profiles.',
      },
      {
        format: 'CSV_EVENT_LEDGER',
        label: 'CSV event ledger',
        description:
          'An event-level export of ledger rows in the selected period for deeper review when you want it.',
        isAvailable: false,
        unavailableReason: 'Available on the Advanced profile.',
      },
    ]);
    expect(advancedResult.availability.options).toEqual([
      {
        format: 'PDF_SUMMARY',
        label: 'PDF summary',
        description:
          'A calm formatted export of the prepared reflection notes that are already ready under Insights.',
        isAvailable: true,
      },
      {
        format: 'CSV_SUMMARY',
        label: 'CSV summary',
        description:
          'A row-based export of the selected period summary with timezone labeling and no internal diagnostics.',
        isAvailable: true,
      },
      {
        format: 'CSV_EVENT_LEDGER',
        label: 'CSV event ledger',
        description:
          'An event-level export of ledger rows in the selected period for deeper review when you want it.',
        isAvailable: true,
      },
    ]);
  });

  it('can expose only the event-ledger export when summary content is still too thin', () => {
    const result = createExportOptionsVM({
      generatedAt: '2026-04-15T00:00:00.000Z',
      profile: 'ADVANCED',
      history: [
        createMarketEvent({
          eventId: 'acct-1:strategy-alpha:only-ledger:BTC:100',
          timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
          eventType: 'ESTIMATED_PRICE',
          certainty: 'estimated',
          pctChange: null,
        }),
      ],
    });

    expect(result).toEqual({
      generatedAt: '2026-04-15T00:00:00.000Z',
      profile: 'ADVANCED',
      availability: {
        status: 'AVAILABLE',
        options: [
          {
            format: 'PDF_SUMMARY',
            label: 'PDF summary',
            description:
              'A calm formatted export of the prepared reflection notes that are already ready under Insights.',
            isAvailable: false,
            unavailableReason: 'Prepared period or annual reflection notes are not ready yet.',
          },
          {
            format: 'CSV_SUMMARY',
            label: 'CSV summary',
            description:
              'A row-based export of the selected period summary with timezone labeling and no internal diagnostics.',
            isAvailable: false,
            unavailableReason: 'A prepared monthly or quarterly summary is not ready yet.',
          },
          {
            format: 'CSV_EVENT_LEDGER',
            label: 'CSV event ledger',
            description:
              'An event-level export of ledger rows in the selected period for deeper review when you want it.',
            isAvailable: true,
          },
        ],
      },
    });
  });

  it('returns an honest unavailable state when nothing exportable is ready for this profile', () => {
    expect(
      createExportOptionsVM({
        generatedAt: '2026-04-15T00:00:00.000Z',
        profile: 'MIDDLE',
        history: [],
      }),
    ).toEqual({
      generatedAt: '2026-04-15T00:00:00.000Z',
      profile: 'MIDDLE',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NO_EXPORTABLE_CONTENT',
      },
    });
  });

  it('stays deterministic and calm for identical interpreted inputs', () => {
    const history = createReflectionHistory();
    const first = createExportOptionsVM({
      generatedAt: '2026-04-15T00:00:00.000Z',
      profile: 'ADVANCED',
      history,
    });
    const second = createExportOptionsVM({
      generatedAt: '2026-04-15T00:00:00.000Z',
      profile: 'ADVANCED',
      history: [...history].reverse(),
    });

    expect(first).toEqual(second);
    expect(JSON.stringify(first)).not.toMatch(
      /urgent|act now|should have|win rate|score|performance|shame|predict|advice|providerId|broker:live|raw_signal_code|runtimeState|privateRuntimeFlag/i,
    );
  });
});
