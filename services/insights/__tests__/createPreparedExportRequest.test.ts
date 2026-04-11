import type { EventLedgerEntry, UserActionEvent } from '@/core/types/eventLedger';
import type { JournalEntry } from '@/services/insights/types';
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

function createLinkedJournalEntry(): JournalEntry {
  return {
    entryId: 'journal:PERIOD_SUMMARY:2026-03',
    contextType: 'PERIOD_SUMMARY',
    contextId: '2026-03',
    title: 'Summary note',
    linkageLabel: 'Linked to March 2026 summary',
    body: 'A slower month still felt steadier once the pullback settled.',
    updatedAtLabel: 'Updated 2026-04-14 09:30 UTC',
  };
}

describe('createPreparedExportRequest', () => {
  it('prepares a calm PDF summary request with explicit dispatch availability and journal follow-through', () => {
    const result = createPreparedExportRequest({
      generatedAt: '2026-04-15T00:00:00.000Z',
      profile: 'BEGINNER',
      history: createReflectionHistory(),
      format: 'PDF_SUMMARY',
      period: 'LAST_MONTH',
      timezoneLabel: 'Australia/Sydney',
      linkedJournalEntry: createLinkedJournalEntry(),
      includeJournalReference: true,
    });

    expect(result.availability.status).toBe('AVAILABLE');

    if (result.availability.status !== 'AVAILABLE') {
      throw new Error('Expected PDF summary request to be available.');
    }

    expect(result.availability.request).toEqual(
      expect.objectContaining({
        format: 'PDF_SUMMARY',
        title: 'Last month reflection summary',
        coveredRangeLabel: 'Covered period: March 2026',
        timezoneLabel: 'Australia/Sydney',
        journalReferenceIncluded: true,
        dispatchAvailability: {
          status: 'AVAILABLE',
          format: 'PDF_SUMMARY',
          fileLabel: 'last-month-reflection-summary-2026-04-15.pdf',
          canShare: false,
          journalFollowThroughLabel: 'Include linked summary note',
        },
        payloadSummary: expect.arrayContaining([
          {
            label: 'Journal note',
            value: 'Includes the linked summary note as a final PDF section.',
          },
        ]),
        document: {
          kind: 'SUMMARY',
          sections: expect.arrayContaining([
            expect.objectContaining({
              title: 'Last month',
              summary: expect.stringContaining('Last month'),
            }),
            expect.objectContaining({
              title: '2025 in review',
            }),
          ]),
          limitationNotes: expect.arrayContaining([
            'This summary is drawn from a lighter stretch of interpreted history, so it stays brief.',
          ]),
          journalReference: {
            title: 'Summary note',
            linkageLabel: 'Linked to March 2026 summary',
            updatedAtLabel: 'Updated 2026-04-14 09:30 UTC',
            body: 'A slower month still felt steadier once the pullback settled.',
          },
        },
      }),
    );
  });

  it('does not auto-include journal linkage unless the PDF request explicitly selects it', () => {
    const pdfResult = createPreparedExportRequest({
      generatedAt: '2026-04-15T00:00:00.000Z',
      profile: 'BEGINNER',
      history: createReflectionHistory(),
      format: 'PDF_SUMMARY',
      period: 'LAST_MONTH',
      timezoneLabel: 'UTC',
      linkedJournalEntry: createLinkedJournalEntry(),
      includeJournalReference: false,
    });

    expect(pdfResult.availability.status).toBe('AVAILABLE');

    if (pdfResult.availability.status !== 'AVAILABLE') {
      throw new Error('Expected PDF summary request to be available.');
    }

    expect(pdfResult.availability.request.journalReferenceIncluded).toBe(false);
    expect(pdfResult.availability.request.dispatchAvailability).toEqual({
      status: 'AVAILABLE',
      format: 'PDF_SUMMARY',
      fileLabel: 'last-month-reflection-summary-2026-04-15.pdf',
      canShare: false,
      journalFollowThroughLabel: 'Include linked summary note',
    });
    expect(pdfResult.availability.request.document).toEqual(
      expect.objectContaining({
        kind: 'SUMMARY',
        journalReference: null,
      }),
    );
    expect(pdfResult.availability.request.payloadSummary).toContainEqual({
      label: 'Journal note',
      value: 'Keeps the linked summary note out unless you choose to include it.',
    });

    const csvResult = createPreparedExportRequest({
      generatedAt: '2026-04-15T00:00:00.000Z',
      profile: 'ADVANCED',
      history: createReflectionHistory(),
      format: 'CSV_SUMMARY',
      period: 'LAST_MONTH',
      timezoneLabel: 'UTC',
      linkedJournalEntry: createLinkedJournalEntry(),
      includeJournalReference: true,
    });

    expect(csvResult.availability.status).toBe('AVAILABLE');

    if (csvResult.availability.status !== 'AVAILABLE') {
      throw new Error('Expected CSV summary request to be available.');
    }

    expect(csvResult.availability.request.journalReferenceIncluded).toBe(false);
    expect(csvResult.availability.request.dispatchAvailability).toEqual({
      status: 'AVAILABLE',
      format: 'CSV_SUMMARY',
      fileLabel: 'last-month-reflection-summary-2026-04-15.csv',
      canShare: false,
      journalFollowThroughLabel: null,
    });
  });

  it('returns explicit dispatch unavailability when file creation is not enabled', () => {
    const result = createPreparedExportRequest({
      generatedAt: '2026-04-15T00:00:00.000Z',
      profile: 'BEGINNER',
      history: createReflectionHistory(),
      format: 'PDF_SUMMARY',
      period: 'LAST_MONTH',
      timezoneLabel: 'UTC',
      dispatchSupported: false,
    });

    expect(result.availability.status).toBe('AVAILABLE');

    if (result.availability.status !== 'AVAILABLE') {
      throw new Error('Expected PDF summary request to remain previewable.');
    }

    expect(result.availability.request.dispatchAvailability).toEqual({
      status: 'UNAVAILABLE',
      reason: 'DISPATCH_NOT_SUPPORTED',
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
      throw new Error('Expected event-ledger request to be available.');
    }

    expect(result.availability.request).toEqual(
      expect.objectContaining({
        format: 'CSV_EVENT_LEDGER',
        title: 'Last month event ledger (CSV)',
        coveredRangeLabel: 'Covered period: March 2026',
        timezoneLabel: 'UTC',
        journalReferenceIncluded: false,
        dispatchAvailability: {
          status: 'AVAILABLE',
          format: 'CSV_EVENT_LEDGER',
          fileLabel: 'last-month-event-ledger-2026-04-15.csv',
          canShare: false,
          journalFollowThroughLabel: null,
        },
        payloadSummary: [
          {
            label: 'Contains',
            value: '3 ledger rows from the selected period: 2 market and 1 user action.',
          },
          {
            label: 'Columns',
            value:
              'Timestamp, timezone, event class, event label, account, symbol, strategy, alignment, certainty, price, and percent change when present.',
          },
          {
            label: 'Timezone',
            value: 'Each row keeps UTC visible alongside the exported timestamp.',
          },
          {
            label: 'Excludes',
            value:
              'Provider diagnostics, raw signal codes, confidence scores, and metadata payloads stay out of this export path.',
          },
        ],
        document: {
          kind: 'EVENT_LEDGER',
          journalReference: null,
          rows: [
            {
              timestampLabel: '2026-03-10 00:00',
              timezoneLabel: 'UTC',
              eventClass: 'MARKET',
              eventLabel: 'Price Movement',
              accountLabel: 'acct-1',
              symbol: 'BTC',
              strategyLabel: 'strategy-alpha',
              alignmentLabel: 'Watchful',
              certaintyLabel: 'Confirmed',
              priceLabel: '100.00',
              percentChangeLabel: '3.00%',
            },
            {
              timestampLabel: '2026-03-14 00:00',
              timezoneLabel: 'UTC',
              eventClass: 'MARKET',
              eventLabel: 'Dip Detected',
              accountLabel: 'acct-1',
              symbol: 'ETH',
              strategyLabel: 'strategy-alpha',
              alignmentLabel: 'Watchful',
              certaintyLabel: 'Confirmed',
              priceLabel: '100.00',
              percentChangeLabel: '3.00%',
            },
            {
              timestampLabel: '2026-03-16 00:00',
              timezoneLabel: 'UTC',
              eventClass: 'USER_ACTION',
              eventLabel: 'Note Recorded',
              accountLabel: 'acct-1',
              symbol: null,
              strategyLabel: null,
              alignmentLabel: null,
              certaintyLabel: null,
              priceLabel: null,
              percentChangeLabel: null,
            },
          ],
        },
      }),
    );
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
