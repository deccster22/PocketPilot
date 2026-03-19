import type { EventLedgerEntry } from '@/core/types/eventLedger';
import type { MarketEvent } from '@/core/types/marketEvent';
import { selectLatestRelevantEvent } from '@/services/orientation/selectLatestRelevantEvent';

const firstEvent: MarketEvent = {
  eventId: 'acct-1:strategy-a:first:BTC:100',
  timestamp: 100,
  accountId: 'acct-1',
  symbol: 'BTC',
  strategyId: 'strategy-a',
  eventType: 'PRICE_MOVEMENT',
  alignmentState: 'WATCHFUL',
  signalsTriggered: ['first'],
  confidenceScore: 0.7,
  certainty: 'confirmed',
  price: 100,
  pctChange: 0.01,
  metadata: {},
};

const tiedLaterEvent: MarketEvent = {
  eventId: 'acct-1:strategy-b:second:ETH:100',
  timestamp: 100,
  accountId: 'acct-1',
  symbol: 'ETH',
  strategyId: 'strategy-b',
  eventType: 'DATA_QUALITY',
  alignmentState: 'NEEDS_REVIEW',
  signalsTriggered: ['second'],
  confidenceScore: 0.9,
  certainty: 'estimated',
  price: 200,
  pctChange: -0.03,
  metadata: {},
};

describe('selectLatestRelevantEvent', () => {
  it('selects the latest market event deterministically', () => {
    expect(selectLatestRelevantEvent([firstEvent, tiedLaterEvent])).toEqual(tiedLaterEvent);
  });

  it('ignores non-market ledger entries when scanning canonical history', () => {
    const entries: EventLedgerEntry[] = [
      {
        eventId: 'acct-1:user:open:1000',
        timestamp: 1_000,
        accountId: 'acct-1',
        actionType: 'OPENED_SNAPSHOT',
        metadata: {},
      },
      firstEvent,
    ];

    expect(selectLatestRelevantEvent(entries)).toEqual(firstEvent);
  });

  it('returns null when no market event is available', () => {
    const entries: EventLedgerEntry[] = [
      {
        eventId: 'acct-1:user:open:1000',
        timestamp: 1_000,
        accountId: 'acct-1',
        actionType: 'OPENED_SNAPSHOT',
        metadata: {},
      },
    ];

    expect(selectLatestRelevantEvent(entries)).toBeNull();
  });
});
