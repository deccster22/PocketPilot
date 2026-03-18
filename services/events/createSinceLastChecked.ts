import type { EventLedgerEntry } from '@/core/types/eventLedger';
import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';

export type SinceLastCheckedPayload = {
  sinceTimestamp: number;
  accountId?: string;
  events: EventLedgerEntry[];
  summaryCount: number;
};

export function createSinceLastChecked(params: {
  sinceTimestamp: number;
  eventQueries: Pick<EventLedgerQueries, 'getEventsSince' | 'getEventsByAccountSince'>;
  accountId?: string;
}): SinceLastCheckedPayload {
  const events = params.accountId
    ? params.eventQueries.getEventsByAccountSince(params.accountId, params.sinceTimestamp)
    : params.eventQueries.getEventsSince(params.sinceTimestamp);

  return {
    sinceTimestamp: params.sinceTimestamp,
    accountId: params.accountId,
    events,
    summaryCount: events.length,
  };
}
