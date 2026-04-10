import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import { createPeriodSummaryVM } from '@/services/insights/createPeriodSummaryVM';
import {
  getInsightsHistoryEntries,
  isInsightsEnabledForSurface,
  resolveInsightsHistoryInputs,
} from '@/services/insights/historyFetchHelpers';
import type {
  InsightsHistorySurface,
  PeriodSummaryVM,
  ReflectionPeriod,
} from '@/services/insights/types';

export function fetchPeriodSummaryVM(params?: {
  surface?: InsightsHistorySurface;
  period?: ReflectionPeriod | null;
  nowProvider?: () => number;
  accountId?: string;
  eventLedger?: EventLedgerService;
  eventLedgerQueries?: EventLedgerQueries;
}): PeriodSummaryVM {
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

  return createPeriodSummaryVM({
    generatedAt: resolvedInputs.generatedAt,
    history: getInsightsHistoryEntries({
      accountId: resolvedInputs.accountId,
      eventQueries: resolvedInputs.eventQueries,
    }),
    period: params?.period ?? null,
  });
}
