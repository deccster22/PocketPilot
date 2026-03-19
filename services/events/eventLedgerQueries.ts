import type { EventLedger, EventLedgerEntry } from '@/core/types/eventLedger';
import type { EventType, MarketEvent } from '@/core/types/marketEvent';

function isMarketEvent(entry: EventLedgerEntry): entry is MarketEvent {
  return 'strategyId' in entry && 'eventType' in entry && 'signalsTriggered' in entry;
}

export type EventLedgerQueries = {
  getEventsSince(timestamp: number): EventLedgerEntry[];
  getEventsByStrategy(strategyId: string): MarketEvent[];
  getEventsByEventType(eventType: EventType): MarketEvent[];
  getEventsByAccountSince(accountId: string, timestamp: number): EventLedgerEntry[];
};

export function createEventLedgerQueries(
  ledger: Pick<EventLedger, 'getAllEvents'>,
): EventLedgerQueries {
  return {
    getEventsSince(timestamp) {
      return ledger.getAllEvents().filter((entry) => entry.timestamp > timestamp);
    },
    getEventsByStrategy(strategyId) {
      return ledger
        .getAllEvents()
        .filter(isMarketEvent)
        .filter((entry) => entry.strategyId === strategyId);
    },
    getEventsByEventType(eventType) {
      return ledger
        .getAllEvents()
        .filter(isMarketEvent)
        .filter((entry) => entry.eventType === eventType);
    },
    getEventsByAccountSince(accountId, timestamp) {
      return ledger
        .getAllEvents()
        .filter((entry) => entry.accountId === accountId && entry.timestamp > timestamp);
    },
  };
}
