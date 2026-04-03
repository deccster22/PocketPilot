import {
  defaultLastViewedState,
  INSIGHTS_LAST_VIEWED_SURFACE_ID,
  type LastViewedState,
} from '@/services/orientation/lastViewedState';

import type { InsightsLastViewedBoundary } from './types';

function createBoundary(timestamp: number | undefined): InsightsLastViewedBoundary {
  return {
    viewedAt: timestamp === undefined ? null : new Date(timestamp).toISOString(),
  };
}

export function resolveInsightsLastViewedTimestamp(params?: {
  accountId?: string;
  lastViewedTimestamp?: number;
  lastViewedState?: Pick<LastViewedState, 'getLastViewedTimestamp'>;
}): number | undefined {
  if (params?.lastViewedTimestamp !== undefined) {
    return params.lastViewedTimestamp;
  }

  const lastViewedState = params?.lastViewedState ?? defaultLastViewedState;

  return lastViewedState.getLastViewedTimestamp({
    surfaceId: INSIGHTS_LAST_VIEWED_SURFACE_ID,
    accountId: params?.accountId,
  });
}

export function resolveInsightsLastViewedBoundary(params?: {
  accountId?: string;
  lastViewedTimestamp?: number;
  lastViewedState?: Pick<LastViewedState, 'getLastViewedTimestamp'>;
}): InsightsLastViewedBoundary {
  return createBoundary(resolveInsightsLastViewedTimestamp(params));
}

export function markInsightsHistoryViewed(params?: {
  accountId?: string;
  viewedAt?: string | null;
  nowProvider?: () => number;
  lastViewedState?: Pick<LastViewedState, 'setLastViewedTimestamp'>;
}): InsightsLastViewedBoundary {
  const nowProvider = params?.nowProvider ?? Date.now;
  const parsedTimestamp =
    params?.viewedAt === null || params?.viewedAt === undefined
      ? undefined
      : Date.parse(params.viewedAt);
  const timestamp =
    parsedTimestamp !== undefined && Number.isFinite(parsedTimestamp)
      ? parsedTimestamp
      : nowProvider();
  const lastViewedState = params?.lastViewedState ?? defaultLastViewedState;

  lastViewedState.setLastViewedTimestamp(
    {
      surfaceId: INSIGHTS_LAST_VIEWED_SURFACE_ID,
      accountId: params?.accountId,
    },
    timestamp,
  );

  return createBoundary(timestamp);
}
