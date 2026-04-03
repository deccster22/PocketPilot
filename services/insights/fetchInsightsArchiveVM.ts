import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import type { LastViewedState } from '@/services/orientation/lastViewedState';

import { createInsightsArchiveVM } from '@/services/insights/createInsightsArchiveVM';
import { createInsightsContinuity } from '@/services/insights/createInsightsContinuity';
import { createInsightsHistoryVM } from '@/services/insights/createInsightsHistoryVM';
import {
  getInsightsHistoryEntries,
  isInsightsEnabledForSurface,
  resolveInsightsHistoryInputs,
} from '@/services/insights/historyFetchHelpers';
import type {
  InsightsArchiveVM,
  InsightsHistorySurface,
} from '@/services/insights/types';

export function fetchInsightsArchiveVM(params?: {
  surface?: InsightsHistorySurface;
  nowProvider?: () => number;
  accountId?: string;
  eventLedger?: EventLedgerService;
  eventLedgerQueries?: EventLedgerQueries;
  lastViewedTimestamp?: number;
  lastViewedState?: Pick<LastViewedState, 'getLastViewedTimestamp'>;
  selectedSectionId?: string | null;
}): InsightsArchiveVM {
  const resolvedInputs = resolveInsightsHistoryInputs(params);

  if (!isInsightsEnabledForSurface(resolvedInputs.surface)) {
    return {
      generatedAt: resolvedInputs.generatedAt,
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NOT_ENABLED_FOR_SURFACE',
      },
      selectedSectionId: null,
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
  const continuity = createInsightsContinuity({
    historyVM,
    lastViewedBoundary: resolvedInputs.lastViewedBoundary,
  });

  return createInsightsArchiveVM({
    generatedAt: resolvedInputs.generatedAt,
    history,
    historyVM,
    continuity,
    orientationContext: resolvedInputs.orientationContext,
    selectedSectionId: params?.selectedSectionId,
  });
}
