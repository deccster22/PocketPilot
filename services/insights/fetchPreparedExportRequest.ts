import type { UserProfile } from '@/core/profile/types';
import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import { createPreparedExportRequest } from '@/services/insights/createPreparedExportRequest';
import {
  createJournalEntry,
  createJournalEntryStoreKey,
  resolveJournalContext,
} from '@/services/insights/journalShared';
import {
  defaultJournalEntryStore,
  type JournalEntryStore,
} from '@/services/insights/journalEntryStore';
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

function resolveLinkedJournalEntry(params: {
  accountId?: string;
  generatedAt: string;
  period: ReflectionPeriod | null | undefined;
  journalEntryStore: Pick<JournalEntryStore, 'load'>;
}) {
  if (!params.period) {
    return null;
  }

  const context = resolveJournalContext(
    {
      contextType: 'PERIOD_SUMMARY',
      period: params.period,
    },
    params.generatedAt,
  );

  if (!context) {
    return null;
  }

  const storedEntry = params.journalEntryStore.load(
    createJournalEntryStoreKey({
      accountId: params.accountId,
      context,
    }),
  );

  if (!storedEntry) {
    return null;
  }

  return createJournalEntry({
    context,
    storedEntry,
  });
}

export function fetchPreparedExportRequest(params?: {
  surface?: InsightsHistorySurface;
  profile?: UserProfile;
  format?: ExportFormat | null;
  period?: ReflectionPeriod | null;
  timezoneLabel?: string;
  includeJournalReference?: boolean;
  dispatchSupported?: boolean;
  canShare?: boolean;
  nowProvider?: () => number;
  accountId?: string;
  eventLedger?: EventLedgerService;
  eventLedgerQueries?: EventLedgerQueries;
  journalEntryStore?: Pick<JournalEntryStore, 'load'>;
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

  const journalEntryStore = params?.journalEntryStore ?? defaultJournalEntryStore;

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
    linkedJournalEntry: resolveLinkedJournalEntry({
      accountId: resolvedInputs.accountId,
      generatedAt: resolvedInputs.generatedAt,
      period: params?.period,
      journalEntryStore,
    }),
    includeJournalReference: params?.includeJournalReference ?? false,
    dispatchSupported: params?.dispatchSupported ?? true,
    canShare: params?.canShare ?? false,
  });
}
