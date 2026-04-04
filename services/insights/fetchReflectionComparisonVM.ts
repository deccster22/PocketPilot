import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import { createInsightsHistoryVM } from '@/services/insights/createInsightsHistoryVM';
import { createReflectionComparisonVM } from '@/services/insights/createReflectionComparisonVM';
import {
  getInsightsHistoryEntries,
  isInsightsEnabledForSurface,
  resolveInsightsHistoryInputs,
} from '@/services/insights/historyFetchHelpers';
import type {
  InsightsHistorySurface,
  ReflectionComparisonVM,
} from '@/services/insights/types';
import type { LastViewedState } from '@/services/orientation/lastViewedState';

export function fetchReflectionComparisonVM(params?: {
  surface?: InsightsHistorySurface;
  nowProvider?: () => number;
  accountId?: string;
  eventLedger?: EventLedgerService;
  eventLedgerQueries?: EventLedgerQueries;
  lastViewedTimestamp?: number;
  lastViewedState?: Pick<LastViewedState, 'getLastViewedTimestamp'>;
}): ReflectionComparisonVM {
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
  const historyVM = createInsightsHistoryVM({
    generatedAt: resolvedInputs.generatedAt,
    history,
    orientationContext: resolvedInputs.orientationContext,
  });

  return createReflectionComparisonVM({
    generatedAt: resolvedInputs.generatedAt,
    history,
    historyVM,
    orientationContext: resolvedInputs.orientationContext,
  });
}
