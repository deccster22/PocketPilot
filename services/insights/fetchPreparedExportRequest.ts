import type { UserProfile } from '@/core/profile/types';
import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import { createPreparedExportRequest } from '@/services/insights/createPreparedExportRequest';
import {
  getInsightsHistoryEntries,
  isInsightsEnabledForSurface,
  resolveInsightsHistoryInputs,
} from '@/services/insights/historyFetchHelpers';
import type {
  ExportFormat,
  InsightsHistorySurface,
  PreparedExportRequestVM,
  ReflectionPeriod,
} from '@/services/insights/types';

export function fetchPreparedExportRequest(params?: {
  surface?: InsightsHistorySurface;
  profile?: UserProfile;
  format?: ExportFormat | null;
  period?: ReflectionPeriod | null;
  timezoneLabel?: string;
  nowProvider?: () => number;
  accountId?: string;
  eventLedger?: EventLedgerService;
  eventLedgerQueries?: EventLedgerQueries;
}): PreparedExportRequestVM {
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

  return createPreparedExportRequest({
    generatedAt: resolvedInputs.generatedAt,
    profile: params?.profile ?? 'BEGINNER',
    history: getInsightsHistoryEntries({
      accountId: resolvedInputs.accountId,
      eventQueries: resolvedInputs.eventQueries,
    }),
    format: params?.format ?? null,
    period: params?.period ?? null,
    timezoneLabel: params?.timezoneLabel,
  });
}
