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
import {
  resolveInsightsLastViewedBoundary,
  resolveInsightsLastViewedTimestamp,
} from '@/services/insights/insightsLastViewed';
import type {
  InsightsHistorySurface,
  InsightsLastViewedBoundary,
} from '@/services/insights/types';
import {
  createOrientationContext,
  type OrientationContext,
} from '@/services/orientation/createOrientationContext';
import { defaultLastViewedState, type LastViewedState } from '@/services/orientation/lastViewedState';

export type ResolvedInsightsHistoryInputs = {
  surface: InsightsHistorySurface;
  accountId?: string;
  generatedAt: string;
  eventQueries: EventLedgerQueries;
  lastViewedBoundary: InsightsLastViewedBoundary;
  orientationContext: OrientationContext;
};

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

export function isInsightsEnabledForSurface(surface: InsightsHistorySurface): boolean {
  return surface === 'INSIGHTS_SCREEN';
}

export function getInsightsHistoryEntries(params: {
  accountId?: string;
  eventQueries: Pick<EventLedgerQueries, 'getEventsSince' | 'getEventsByAccountSince'>;
}) {
  return params.accountId
    ? params.eventQueries.getEventsByAccountSince(params.accountId, -1)
    : params.eventQueries.getEventsSince(-1);
}

export function resolveInsightsHistoryInputs(params?: {
  surface?: InsightsHistorySurface;
  nowProvider?: () => number;
  accountId?: string;
  eventLedger?: EventLedgerService;
  eventLedgerQueries?: EventLedgerQueries;
  lastViewedTimestamp?: number;
  lastViewedState?: Pick<LastViewedState, 'getLastViewedTimestamp'>;
}): ResolvedInsightsHistoryInputs {
  const surface = params?.surface ?? 'INSIGHTS_SCREEN';
  const nowProvider = params?.nowProvider ?? Date.now;
  const eventLedger = params?.eventLedger ?? defaultEventLedgerService;
  const eventQueries = params?.eventLedgerQueries ?? createEventLedgerQueries(eventLedger);
  const lastViewedState = params?.lastViewedState ?? defaultLastViewedState;
  const lastViewedTimestamp = resolveInsightsLastViewedTimestamp({
    accountId: params?.accountId,
    lastViewedTimestamp: params?.lastViewedTimestamp,
    lastViewedState,
  });
  const lastViewedBoundary = resolveInsightsLastViewedBoundary({
    accountId: params?.accountId,
    lastViewedTimestamp,
  });
  const sinceLastChecked = resolveSinceLastChecked({
    accountId: params?.accountId,
    eventQueries,
    lastViewedTimestamp,
  });

  return {
    surface,
    accountId: params?.accountId,
    generatedAt: new Date(nowProvider()).toISOString(),
    eventQueries,
    lastViewedBoundary,
    orientationContext: createOrientationContext({
      accountId: params?.accountId,
      sinceLastChecked,
    }),
  };
}
