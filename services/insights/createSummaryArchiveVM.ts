import type { EventLedgerEntry } from '@/core/types/eventLedger';

import { createPeriodSummaryVM } from '@/services/insights/createPeriodSummaryVM';
import {
  formatSummaryArchiveCoveredRangeLabel,
  formatSummaryArchiveGeneratedAtLabel,
  SUMMARY_ARCHIVE_PERIODS,
} from '@/services/insights/periodSummaryShared';
import type {
  SummaryArchiveEntry,
  SummaryArchiveVM,
} from '@/services/insights/types';

function createArchiveEntry(params: {
  generatedAt: string;
  history: ReadonlyArray<EventLedgerEntry>;
  period: (typeof SUMMARY_ARCHIVE_PERIODS)[number];
}): SummaryArchiveEntry | null {
  const summaryVM = createPeriodSummaryVM({
    generatedAt: params.generatedAt,
    history: params.history,
    period: params.period,
  });

  if (summaryVM.availability.status === 'UNAVAILABLE') {
    return null;
  }

  return {
    archiveId: `period-summary:${params.period.toLowerCase()}`,
    period: params.period,
    title: summaryVM.availability.title,
    summary: summaryVM.availability.summary,
    coveredRangeLabel: formatSummaryArchiveCoveredRangeLabel(params.period, params.generatedAt),
    generatedAtLabel: formatSummaryArchiveGeneratedAtLabel(params.generatedAt),
  };
}

export function createSummaryArchiveVM(params: {
  generatedAt: string;
  history: ReadonlyArray<EventLedgerEntry>;
}): SummaryArchiveVM {
  const entries = SUMMARY_ARCHIVE_PERIODS.map((period) =>
    createArchiveEntry({
      generatedAt: params.generatedAt,
      history: params.history,
      period,
    }),
  ).filter((entry): entry is SummaryArchiveEntry => Boolean(entry));

  if (entries.length === 0) {
    return {
      generatedAt: params.generatedAt,
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NO_ARCHIVED_SUMMARIES',
      },
    };
  }

  return {
    generatedAt: params.generatedAt,
    availability: {
      status: 'AVAILABLE',
      entries,
    },
  };
}
