import type { EventLedgerEntry, UserActionEvent } from '@/core/types/eventLedger';
import type { MarketEvent } from '@/core/types/marketEvent';

import {
  dispatchExportRequest,
  type ExportDispatchAdapter,
} from '@/services/insights/dispatchExportRequest';
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

describe('dispatchExportRequest', () => {
  it('creates a real CSV export file through the adapter and returns the dispatch summary', async () => {
    const preparedExportRequestVM = createPreparedExportRequest({
      generatedAt: '2026-04-15T00:00:00.000Z',
      profile: 'ADVANCED',
      history: createReflectionHistory(),
      format: 'CSV_EVENT_LEDGER',
      period: 'LAST_MONTH',
      timezoneLabel: 'UTC',
    });
    const writes: Array<{
      fileLabel: string;
      mimeType: string;
      content: string | Uint8Array;
    }> = [];
    const adapter: ExportDispatchAdapter = {
      dispatchSupported: true,
      canShare: false,
      async writeFile(params) {
        writes.push(params);
      },
    };

    const result = await dispatchExportRequest({
      preparedExportRequestVM,
      adapter,
    });

    expect(result).toEqual({
      status: 'AVAILABLE',
      fileLabel: 'last-month-event-ledger-2026-04-15.csv',
      mimeType: 'text/csv',
      timezoneLabel: 'UTC',
      journalReferenceIncluded: false,
    });
    expect(writes).toHaveLength(1);
    expect(writes[0].fileLabel).toBe('last-month-event-ledger-2026-04-15.csv');
    expect(writes[0].mimeType).toBe('text/csv');
    expect(typeof writes[0].content).toBe('string');
    expect(writes[0].content).toContain('timestamp,timezone,eventClass,eventLabel,account');
    expect(writes[0].content).toContain('UTC,MARKET,Price Movement,acct-1,BTC,strategy-alpha');
    expect(writes[0].content).not.toMatch(
      /providerId|broker:live|raw_signal_code|runtimeState|privateRuntimeFlag|scorecard|predict|advice/i,
    );
  });

  it('returns honest unavailability when dispatch is not supported', async () => {
    const preparedExportRequestVM = createPreparedExportRequest({
      generatedAt: '2026-04-15T00:00:00.000Z',
      profile: 'BEGINNER',
      history: createReflectionHistory(),
      format: 'PDF_SUMMARY',
      period: 'LAST_MONTH',
      timezoneLabel: 'UTC',
      dispatchSupported: false,
    });

    await expect(
      dispatchExportRequest({
        preparedExportRequestVM,
      }),
    ).resolves.toEqual({
      status: 'UNAVAILABLE',
      reason: 'DISPATCH_NOT_SUPPORTED',
    });
  });

  it('returns an honest failure when file creation throws', async () => {
    const preparedExportRequestVM = createPreparedExportRequest({
      generatedAt: '2026-04-15T00:00:00.000Z',
      profile: 'BEGINNER',
      history: createReflectionHistory(),
      format: 'PDF_SUMMARY',
      period: 'LAST_MONTH',
      timezoneLabel: 'UTC',
    });
    const adapter: ExportDispatchAdapter = {
      dispatchSupported: true,
      canShare: false,
      async writeFile() {
        throw new Error('disk full');
      },
    };

    await expect(
      dispatchExportRequest({
        preparedExportRequestVM,
        adapter,
      }),
    ).resolves.toEqual({
      status: 'UNAVAILABLE',
      reason: 'DISPATCH_FAILED',
    });
  });
});
