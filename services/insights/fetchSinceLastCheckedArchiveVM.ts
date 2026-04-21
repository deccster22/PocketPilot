import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import { createSinceLastChecked } from '@/services/events/createSinceLastChecked';
import { createSinceLastCheckedArchiveVM } from '@/services/insights/createSinceLastCheckedArchiveVM';
import {
  getInsightsHistoryEntries,
  isInsightsEnabledForSurface,
  resolveInsightsHistoryInputs,
} from '@/services/insights/historyFetchHelpers';
import type {
  InsightsHistorySurface,
  SinceLastCheckedArchiveVM,
} from '@/services/insights/types';
import type { LastViewedState } from '@/services/orientation/lastViewedState';
import { resolveSinceLastCheckedViewedTimestamp } from '@/services/orientation/sinceLastCheckedViewedState';

export function fetchSinceLastCheckedArchiveVM(params?: {
  surface?: InsightsHistorySurface;
  nowProvider?: () => number;
  accountId?: string;
  eventLedger?: EventLedgerService;
  eventLedgerQueries?: EventLedgerQueries;
  lastViewedTimestamp?: number;
  snapshotLastViewedTimestamp?: number;
  lastViewedState?: Pick<LastViewedState, 'getLastViewedTimestamp'>;
}): SinceLastCheckedArchiveVM {
  const resolvedInputs = resolveInsightsHistoryInputs(params);

  if (!isInsightsEnabledForSurface(resolvedInputs.surface)) {
    return {
      generatedAt: resolvedInputs.generatedAt,
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NOT_ENABLED_FOR_SURFACE',
      },
    };
  }

  const history = getInsightsHistoryEntries({
    accountId: resolvedInputs.accountId,
    eventQueries: resolvedInputs.eventQueries,
  });
  const snapshotLastViewedTimestamp = resolveSinceLastCheckedViewedTimestamp({
    accountId: resolvedInputs.accountId,
    lastViewedTimestamp: params?.snapshotLastViewedTimestamp,
    lastViewedState: params?.lastViewedState,
  });

  return createSinceLastCheckedArchiveVM({
    generatedAt: resolvedInputs.generatedAt,
    accountId: resolvedInputs.accountId,
    history,
    snapshotSinceLastChecked:
      snapshotLastViewedTimestamp === undefined
        ? null
        : createSinceLastChecked({
            sinceTimestamp: snapshotLastViewedTimestamp,
            accountId: resolvedInputs.accountId,
            eventQueries: resolvedInputs.eventQueries,
          }),
    snapshotViewedAt:
      snapshotLastViewedTimestamp === undefined
        ? null
        : new Date(snapshotLastViewedTimestamp).toISOString(),
  });
}
