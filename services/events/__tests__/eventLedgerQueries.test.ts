import type { MarketEvent } from '@/core/types/marketEvent';
import { createSinceLastChecked } from '@/services/events/createSinceLastChecked';
import { createEventLedgerQueries } from '@/services/events/eventLedgerQueries';
import { createEventLedgerService } from '@/services/events/eventLedgerService';

const firstEvent: MarketEvent = {
  eventId: 'acct-1:strategy-a:event-1:BTC:100',
  timestamp: 100,
  accountId: 'acct-1',
  symbol: 'BTC',
  strategyId: 'strategy-a',
  eventType: 'PRICE_MOVEMENT',
  alignmentState: 'WATCHFUL',
  signalsTriggered: ['cross'],
  confidenceScore: 0.7,
  certainty: 'confirmed',
  price: 100,
  pctChange: 0.01,
  metadata: {
    nested: {
      reason: 'cross',
    },
  },
};

const secondEvent: MarketEvent = {
  eventId: 'acct-1:strategy-b:event-2:ETH:200',
  timestamp: 200,
  accountId: 'acct-1',
  symbol: 'ETH',
  strategyId: 'strategy-b',
  eventType: 'ESTIMATED_PRICE',
  alignmentState: 'NEEDS_REVIEW',
  signalsTriggered: ['estimate'],
  confidenceScore: 0.5,
  certainty: 'estimated',
  price: 200,
  pctChange: -0.02,
  metadata: {
    nested: {
      reason: 'fallback',
    },
  },
};

const thirdEvent: MarketEvent = {
  eventId: 'acct-2:strategy-a:event-3:SOL:300',
  timestamp: 300,
  accountId: 'acct-2',
  symbol: 'SOL',
  strategyId: 'strategy-a',
  eventType: 'DATA_QUALITY',
  alignmentState: 'WATCHFUL',
  signalsTriggered: ['missing_quote'],
  confidenceScore: 0.9,
  certainty: 'confirmed',
  price: 300,
  pctChange: null,
  metadata: {
    nested: {
      reason: 'missing',
    },
  },
};

describe('eventLedgerQueries', () => {
  it('returns events after a timestamp in canonical ledger order', () => {
    const ledger = createEventLedgerService([firstEvent, secondEvent, thirdEvent]);
    const queries = createEventLedgerQueries(ledger);

    expect(queries.getEventsSince(100).map((event) => event.eventId)).toEqual([
      secondEvent.eventId,
      thirdEvent.eventId,
    ]);
  });

  it('filters by strategy, event type, and account since timestamp', () => {
    const ledger = createEventLedgerService([firstEvent, secondEvent, thirdEvent]);
    const queries = createEventLedgerQueries(ledger);

    expect(queries.getEventsByStrategy('strategy-a').map((event) => event.eventId)).toEqual([
      firstEvent.eventId,
      thirdEvent.eventId,
    ]);
    expect(
      queries.getEventsByEventType('ESTIMATED_PRICE').map((event) => event.eventId),
    ).toEqual([secondEvent.eventId]);
    expect(queries.getEventsByAccountSince('acct-1', 150).map((event) => event.eventId)).toEqual([
      secondEvent.eventId,
    ]);
  });

  it('keeps stored entries immutable when query results are mutated by callers', () => {
    const ledger = createEventLedgerService([firstEvent, secondEvent]);
    const queries = createEventLedgerQueries(ledger);

    const [queriedEvent] = queries.getEventsByStrategy('strategy-a');
    queriedEvent.signalsTriggered.push('mutated');
    (queriedEvent.metadata.nested as { reason: string }).reason = 'changed';

    expect(queries.getEventsByStrategy('strategy-a')).toEqual([firstEvent]);
    expect(ledger.getAllEvents()).toEqual([firstEvent, secondEvent]);
  });

  it('builds a structured Since Last Checked payload from queried events', () => {
    const ledger = createEventLedgerService([firstEvent, secondEvent, thirdEvent]);
    const queries = createEventLedgerQueries(ledger);

    expect(
      createSinceLastChecked({
        sinceTimestamp: 150,
        accountId: 'acct-1',
        eventQueries: queries,
      }),
    ).toEqual({
      sinceTimestamp: 150,
      accountId: 'acct-1',
      events: [secondEvent],
      summaryCount: 1,
    });
  });
});
