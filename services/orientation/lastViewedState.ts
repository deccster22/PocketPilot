export const SNAPSHOT_LAST_VIEWED_SURFACE_ID = 'snapshot';
export const INSIGHTS_LAST_VIEWED_SURFACE_ID = 'insights';

export type LastViewedStateScope = {
  surfaceId: string;
  accountId?: string;
};

export type LastViewedState = {
  getLastViewedTimestamp(scope: LastViewedStateScope): number | undefined;
  setLastViewedTimestamp(scope: LastViewedStateScope, timestamp: number): void;
};

function createScopeKey(scope: LastViewedStateScope): string {
  return `${scope.surfaceId}:${scope.accountId ?? 'all'}`;
}

export function createInMemoryLastViewedState(
  initialEntries: Array<LastViewedStateScope & { timestamp: number }> = [],
): LastViewedState & { reset(): void } {
  const timestamps = new Map<string, number>(
    initialEntries.map((entry) => [createScopeKey(entry), entry.timestamp]),
  );

  return {
    getLastViewedTimestamp(scope) {
      return timestamps.get(createScopeKey(scope));
    },
    setLastViewedTimestamp(scope, timestamp) {
      timestamps.set(createScopeKey(scope), timestamp);
    },
    reset() {
      timestamps.clear();
    },
  };
}

export const defaultLastViewedState = createInMemoryLastViewedState();
