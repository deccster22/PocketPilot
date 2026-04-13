import {
  defaultLastViewedState,
  SNAPSHOT_LAST_VIEWED_SURFACE_ID,
  type LastViewedState,
} from '@/services/orientation/lastViewedState';

function createBoundary(timestamp: number | undefined): { viewedAt: string | null } {
  return {
    viewedAt: timestamp === undefined ? null : new Date(timestamp).toISOString(),
  };
}

export function resolveSinceLastCheckedViewedTimestamp(params?: {
  accountId?: string;
  lastViewedTimestamp?: number;
  lastViewedState?: Pick<LastViewedState, 'getLastViewedTimestamp'>;
}): number | undefined {
  if (params?.lastViewedTimestamp !== undefined) {
    return params.lastViewedTimestamp;
  }

  const lastViewedState = params?.lastViewedState ?? defaultLastViewedState;

  return lastViewedState.getLastViewedTimestamp({
    surfaceId: SNAPSHOT_LAST_VIEWED_SURFACE_ID,
    accountId: params?.accountId,
  });
}

export function markSinceLastCheckedViewed(params?: {
  accountId?: string;
  viewedAt?: string | null;
  nowProvider?: () => number;
  lastViewedState?: Pick<LastViewedState, 'setLastViewedTimestamp'>;
}): { viewedAt: string | null } {
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
      surfaceId: SNAPSHOT_LAST_VIEWED_SURFACE_ID,
      accountId: params?.accountId,
    },
    timestamp,
  );

  return createBoundary(timestamp);
}
