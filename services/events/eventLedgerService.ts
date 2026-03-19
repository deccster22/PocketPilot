import type { EventLedger } from '@/core/types/eventLedger';
import type { MarketEvent, MarketEventMetadataValue } from '@/core/types/marketEvent';

export type EventLedgerService = EventLedger;

function cloneMetadataValue<T extends MarketEventMetadataValue>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneMetadataValue(entry)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce<Record<string, MarketEventMetadataValue>>((acc, entry) => {
      const [key, nestedValue] = entry;
      acc[key] = cloneMetadataValue(nestedValue);
      return acc;
    }, {}) as T;
  }

  return value;
}

function cloneMarketEvent(event: MarketEvent): MarketEvent {
  return {
    ...event,
    signalsTriggered: [...event.signalsTriggered],
    metadata: cloneMetadataValue(event.metadata),
  };
}

function freezeMetadataValue(value: MarketEventMetadataValue): void {
  if (Array.isArray(value)) {
    value.forEach((entry) => freezeMetadataValue(entry));
    Object.freeze(value);
    return;
  }

  if (value && typeof value === 'object') {
    Object.values(value).forEach((entry) => freezeMetadataValue(entry));
    Object.freeze(value);
  }
}

function freezeMarketEvent(event: MarketEvent): MarketEvent {
  Object.freeze(event.signalsTriggered);
  freezeMetadataValue(event.metadata);

  return Object.freeze(event);
}

export function createEventLedgerService(
  initialEvents: MarketEvent[] = [],
): EventLedgerService & { reset(): void } {
  let events = initialEvents.map((event) => freezeMarketEvent(cloneMarketEvent(event)));

  return {
    appendEvent(event) {
      events = [...events, freezeMarketEvent(cloneMarketEvent(event))];
    },
    appendEvents(nextEvents) {
      if (nextEvents.length === 0) {
        return;
      }

      events = [
        ...events,
        ...nextEvents.map((event) => freezeMarketEvent(cloneMarketEvent(event))),
      ];
    },
    getAllEvents() {
      return events.map((event) => cloneMarketEvent(event));
    },
    getEventsByAccount(accountId) {
      return events
        .filter((event) => event.accountId === accountId)
        .map((event) => cloneMarketEvent(event));
    },
    getEventsBySymbol(symbol) {
      return events
        .filter((event) => event.symbol === symbol)
        .map((event) => cloneMarketEvent(event));
    },
    getRecentEvents(limit) {
      return events.slice(-Math.max(0, limit)).map((event) => cloneMarketEvent(event));
    },
    reset() {
      events = [];
    },
  };
}

export const defaultEventLedgerService = createEventLedgerService();
