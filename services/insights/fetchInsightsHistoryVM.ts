import {
  createSinceLastChecked,
  type SinceLastCheckedPayload,
} from '@/services/events/createSinceLastChecked';
import {
  createEventLedgerQueries,
  type EventLedgerQueries,
} from '@/services/events/eventLedgerQueries';
import {
  defaultEventLedgerService,
  type EventLedgerService,
} from '@/services/events/eventLedgerService';
import { createInsightsHistoryVM } from '@/services/insights/createInsightsHistoryVM';
import type { InsightsHistorySurface, InsightsHistoryVM } from '@/services/insights/types';
import { createOrientationContext } from '@/services/orientation/createOrientationContext';
import {
  defaultLastViewedState,
  INSIGHTS_LAST_VIEWED_SURFACE_ID,
  type LastViewedState,
} from '@/services/orientation/lastViewedState';

function isInsightsEnabledForSurface(surface: InsightsHistorySurface): boolean {
  return surface === 'INSIGHTS_SCREEN';
}

function resolveLastViewedTimestamp(params: {
  accountId?: string;
  lastViewedTimestamp?: number;
  lastViewedState: Pick<LastViewedState, 'getLastViewedTimestamp'>;
}): number | undefined {
  if (params.lastViewedTimestamp !== undefined) {
    return params.lastViewedTimestamp;
  }

  return params.lastViewedState.getLastViewedTimestamp({
    surfaceId: INSIGHTS_LAST_VIEWED_SURFACE_ID,
    accountId: params.accountId,
  });
}

function getHistoryEntries(params: {
  accountId?: string;
  eventQueries: Pick<EventLedgerQueries, 'getEventsSince' | 'getEventsByAccountSince'>;
}) {
  return params.accountId
    ? params.eventQueries.getEventsByAccountSince(params.accountId, -1)
    : params.eventQueries.getEventsSince(-1);
}

function resolveSinceLastChecked(params: {
  accountId?: string;
  eventQueries: Pick<EventLedgerQueries, 'getEventsSince' | 'getEventsByAccountSince'>;
  lastViewedTimestamp?: number;
}): SinceLastCheckedPayload | null {
  if (params.lastViewedTimestamp === undefined) {
    return null;
  }

  return createSinceLastChecked({
    sinceTimestamp: params.lastViewedTimestamp,
    accountId: params.accountId,
    eventQueries: params.eventQueries,
  });
}

export function fetchInsightsHistoryVM(params?: {
  surface?: InsightsHistorySurface;
  nowProvider?: () => number;
  accountId?: string;
  eventLedger?: EventLedgerService;
  eventLedgerQueries?: EventLedgerQueries;
  lastViewedTimestamp?: number;
  lastViewedState?: Pick<LastViewedState, 'getLastViewedTimestamp'>;
}): InsightsHistoryVM {
  const surface = params?.surface ?? 'INSIGHTS_SCREEN';
  const nowProvider = params?.nowProvider ?? Date.now;
  const eventLedger = params?.eventLedger ?? defaultEventLedgerService;
  const eventQueries = params?.eventLedgerQueries ?? createEventLedgerQueries(eventLedger);
  const lastViewedState = params?.lastViewedState ?? defaultLastViewedState;
  const lastViewedTimestamp = resolveLastViewedTimestamp({
    accountId: params?.accountId,
    lastViewedTimestamp: params?.lastViewedTimestamp,
    lastViewedState,
  });
  const generatedAt = new Date(nowProvider()).toISOString();

  if (!isInsightsEnabledForSurface(surface)) {
    return {
      generatedAt,
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NOT_ENABLED_FOR_SURFACE',
      },
    };
  }

  const sinceLastChecked = resolveSinceLastChecked({
    accountId: params?.accountId,
    eventQueries,
    lastViewedTimestamp,
  });
  const orientationContext = createOrientationContext({
    accountId: params?.accountId,
    sinceLastChecked,
  });

  return createInsightsHistoryVM({
    generatedAt,
    history: getHistoryEntries({
      accountId: params?.accountId,
      eventQueries,
    }),
    orientationContext,
  });
}
