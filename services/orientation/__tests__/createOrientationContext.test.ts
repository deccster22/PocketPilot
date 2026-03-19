import type { MarketEvent } from '@/core/types/marketEvent';
import { createSinceLastChecked } from '@/services/events/createSinceLastChecked';
import { createEventLedgerQueries } from '@/services/events/eventLedgerQueries';
import { createEventLedgerService } from '@/services/events/eventLedgerService';
import { createOrientationContext } from '@/services/orientation/createOrientationContext';

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

const secondEvent: MarketEvent = {
  eventId: 'acct-1:strategy-b:second:ETH:200',
  timestamp: 200,
  accountId: 'acct-1',
  symbol: 'ETH',
  strategyId: 'strategy-b',
  eventType: 'ESTIMATED_PRICE',
  alignmentState: 'NEEDS_REVIEW',
  signalsTriggered: ['second'],
  confidenceScore: 0.9,
  certainty: 'estimated',
  price: 200,
  pctChange: -0.03,
  metadata: {},
};

describe('createOrientationContext', () => {
  it('assembles structured current-state and history context', () => {
    const ledger = createEventLedgerService([firstEvent, secondEvent]);
    const queries = createEventLedgerQueries(ledger);
    const sinceLastChecked = createSinceLastChecked({
      sinceTimestamp: 150,
      accountId: 'acct-1',
      eventQueries: queries,
    });

    const result = createOrientationContext({
      accountId: 'acct-1',
      currentEvents: [firstEvent, secondEvent],
      strategyAlignment: 'Needs review',
      sinceLastChecked,
    });

    expect(result).toEqual({
      accountId: 'acct-1',
      symbol: 'ETH',
      strategyId: 'strategy-b',
      currentState: {
        latestRelevantEvent: secondEvent,
        strategyAlignment: 'Needs review',
        certainty: 'estimated',
      },
      historyContext: {
        eventsSinceLastViewed: [secondEvent],
        sinceLastChecked: {
          sinceTimestamp: 150,
          accountId: 'acct-1',
          events: [secondEvent],
          summaryCount: 1,
        },
      },
    });
  });

  it('returns empty history and null current fields when no last-viewed timestamp is available', () => {
    const result = createOrientationContext({
      accountId: 'acct-1',
      currentEvents: [],
      strategyAlignment: 'Aligned',
    });

    expect(result).toEqual({
      accountId: 'acct-1',
      symbol: undefined,
      strategyId: undefined,
      currentState: {
        latestRelevantEvent: null,
        strategyAlignment: 'Aligned',
        certainty: null,
      },
      historyContext: {
        eventsSinceLastViewed: [],
        sinceLastChecked: null,
      },
    });
  });

  it('does not mutate or reuse the ledger-backed result arrays it receives', () => {
    const ledger = createEventLedgerService([firstEvent, secondEvent]);
    const queries = createEventLedgerQueries(ledger);
    const sinceLastChecked = createSinceLastChecked({
      sinceTimestamp: 50,
      accountId: 'acct-1',
      eventQueries: queries,
    });

    const result = createOrientationContext({
      accountId: 'acct-1',
      currentEvents: [firstEvent, secondEvent],
      strategyAlignment: 'Needs review',
      sinceLastChecked,
    });

    expect(result.historyContext.eventsSinceLastViewed).not.toBe(sinceLastChecked.events);
    expect(result.historyContext.sinceLastChecked?.events).not.toBe(sinceLastChecked.events);
    expect(sinceLastChecked.events.map((event) => event.eventId)).toEqual([
      firstEvent.eventId,
      secondEvent.eventId,
    ]);
  });
});
