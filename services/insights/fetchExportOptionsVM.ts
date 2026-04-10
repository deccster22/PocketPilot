import type { UserProfile } from '@/core/profile/types';
import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import { createExportOptionsVM } from '@/services/insights/createExportOptionsVM';
import {
  getInsightsHistoryEntries,
  isInsightsEnabledForSurface,
  resolveInsightsHistoryInputs,
} from '@/services/insights/historyFetchHelpers';
import type { ExportOptionsVM, InsightsHistorySurface } from '@/services/insights/types';

export function fetchExportOptionsVM(params?: {
  surface?: InsightsHistorySurface;
  profile?: UserProfile;
  nowProvider?: () => number;
  accountId?: string;
  eventLedger?: EventLedgerService;
  eventLedgerQueries?: EventLedgerQueries;
}): ExportOptionsVM {
  const resolvedInputs = resolveInsightsHistoryInputs(params);

  if (!isInsightsEnabledForSurface(resolvedInputs.surface)) {
    return {
      generatedAt: resolvedInputs.generatedAt,
      profile: params?.profile ?? 'BEGINNER',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NOT_ENABLED_FOR_SURFACE',
      },
    };
  }

  return createExportOptionsVM({
    generatedAt: resolvedInputs.generatedAt,
    profile: params?.profile ?? 'BEGINNER',
    history: getInsightsHistoryEntries({
      accountId: resolvedInputs.accountId,
      eventQueries: resolvedInputs.eventQueries,
    }),
  });
}
