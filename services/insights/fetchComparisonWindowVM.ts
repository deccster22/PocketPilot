import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import { createComparisonWindowVM } from '@/services/insights/createComparisonWindowVM';
import {
  getInsightsHistoryEntries,
  isInsightsEnabledForSurface,
  resolveInsightsHistoryInputs,
} from '@/services/insights/historyFetchHelpers';
import type {
  ComparisonWindow,
  ComparisonWindowVM,
  InsightsHistorySurface,
} from '@/services/insights/types';

export function fetchComparisonWindowVM(params?: {
  surface?: InsightsHistorySurface;
  window?: ComparisonWindow | null;
  nowProvider?: () => number;
  accountId?: string;
  eventLedger?: EventLedgerService;
  eventLedgerQueries?: EventLedgerQueries;
}): ComparisonWindowVM {
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

  return createComparisonWindowVM({
    generatedAt: resolvedInputs.generatedAt,
    history: getInsightsHistoryEntries({
      accountId: resolvedInputs.accountId,
      eventQueries: resolvedInputs.eventQueries,
    }),
    window: params?.window ?? null,
  });
}
