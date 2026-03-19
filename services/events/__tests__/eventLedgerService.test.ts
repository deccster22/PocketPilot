import type { MarketEvent } from '@/core/types/marketEvent';
import { createEventStream } from '@/services/events/eventStream';
import { createEventLedgerService } from '@/services/events/eventLedgerService';

const firstEvent: MarketEvent = {
  eventId: 'acct-1:strategy-a:event-1:BTC:1',
  timestamp: 1,
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
  eventId: 'acct-2:strategy-b:event-2:ETH:2',
  timestamp: 2,
  accountId: 'acct-2',
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

describe('eventLedgerService', () => {
  it('persists appended events and returns recent entries deterministically', () => {
    const ledger = createEventLedgerService();

    ledger.appendEvent(firstEvent);
    ledger.appendEvent(secondEvent);

    expect(ledger.getRecentEvents(5)).toEqual([firstEvent, secondEvent]);
    expect(ledger.getRecentEvents(1)).toEqual([secondEvent]);
  });

  it('appends batches in input order', () => {
    const ledger = createEventLedgerService();

    ledger.appendEvents([firstEvent, secondEvent]);

    expect(ledger.getRecentEvents(2).map((event) => event.eventId)).toEqual([
      firstEvent.eventId,
      secondEvent.eventId,
    ]);
  });

  it('filters by account and symbol', () => {
    const ledger = createEventLedgerService([firstEvent, secondEvent]);

    expect(ledger.getEventsByAccount('acct-1')).toEqual([firstEvent]);
    expect(ledger.getEventsBySymbol('ETH')).toEqual([secondEvent]);
  });

  it('protects stored events from caller mutation on append and read', () => {
    const ledger = createEventLedgerService();
    const mutableEvent: MarketEvent = {
      ...firstEvent,
      signalsTriggered: [...firstEvent.signalsTriggered],
      metadata: {
        nested: {
          reason: 'initial',
        },
      },
    };

    ledger.appendEvent(mutableEvent);
    mutableEvent.signalsTriggered.push('mutated');
    (mutableEvent.metadata.nested as { reason: string }).reason = 'changed';

    const [storedEvent] = ledger.getRecentEvents(1);
    storedEvent.signalsTriggered.push('read-mutation');
    (storedEvent.metadata.nested as { reason: string }).reason = 'read-changed';

    expect(ledger.getRecentEvents(1)).toEqual([
      {
        ...firstEvent,
        metadata: {
          nested: {
            reason: 'initial',
          },
        },
      },
    ]);
  });

  it('can mirror EventStream ordering when appended from the stream output', () => {
    const ledger = createEventLedgerService();
    const stream = createEventStream({
      accountId: 'acct-1',
      timestamp: 3,
      events: [
        { ...secondEvent, accountId: 'acct-1', symbol: 'ETH' },
        { ...firstEvent },
        {
          ...firstEvent,
          eventId: 'acct-1:strategy-a:event-0:SOL:0',
          timestamp: 0,
          symbol: 'SOL',
        },
      ],
    });

    ledger.appendEvents(stream.events);

    expect(ledger.getEventsByAccount('acct-1').map((event) => event.eventId)).toEqual(
      stream.events.map((event) => event.eventId),
    );
  });
});
