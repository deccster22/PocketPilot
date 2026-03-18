import type { MarketEvent, MarketEventMetadata } from '@/core/types/marketEvent';

export type UserActionEvent = {
  eventId: string;
  timestamp: number;
  accountId: string;
  actionType: string;
  metadata: MarketEventMetadata;
};

export type EventLedgerEntry = MarketEvent | UserActionEvent;

export type EventLedger = {
  appendEvent(event: MarketEvent): void;
  appendEvents(events: MarketEvent[]): void;
  getAllEvents(): EventLedgerEntry[];
  getEventsByAccount(accountId: string): MarketEvent[];
  getEventsBySymbol(symbol: string): MarketEvent[];
  getRecentEvents(limit: number): MarketEvent[];
};
