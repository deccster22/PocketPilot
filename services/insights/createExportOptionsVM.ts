import type { UserProfile } from '@/core/profile/types';
import type { EventLedgerEntry } from '@/core/types/eventLedger';

import { createSummaryArchiveVM } from '@/services/insights/createSummaryArchiveVM';
import { createYearInReviewVM } from '@/services/insights/createYearInReviewVM';
import { resolveAnnualReviewPeriod } from '@/services/insights/periodSummaryShared';
import type { ExportOption, ExportOptionsVM } from '@/services/insights/types';

function createPdfSummaryOption(hasPreparedSummary: boolean): ExportOption {
  return {
    format: 'PDF_SUMMARY',
    label: 'PDF summary',
    description:
      'A calm formatted export of the prepared reflection notes that are already ready under Insights.',
    isAvailable: hasPreparedSummary,
    unavailableReason: hasPreparedSummary
      ? undefined
      : 'Prepared period or annual reflection notes are not ready yet.',
  };
}

function createCsvSummaryOption(params: {
  profile: UserProfile;
  hasSummaryArchive: boolean;
}): ExportOption {
  if (params.profile === 'BEGINNER') {
    return {
      format: 'CSV_SUMMARY',
      label: 'CSV summary',
      description:
        'A row-based export of the selected period summary with timezone labeling and no internal diagnostics.',
      isAvailable: false,
      unavailableReason: 'Available on the Intermediate and Advanced profiles.',
    };
  }

  return {
    format: 'CSV_SUMMARY',
    label: 'CSV summary',
    description:
      'A row-based export of the selected period summary with timezone labeling and no internal diagnostics.',
    isAvailable: params.hasSummaryArchive,
    unavailableReason: params.hasSummaryArchive
      ? undefined
      : 'A prepared monthly or quarterly summary is not ready yet.',
  };
}

function createCsvEventLedgerOption(params: {
  profile: UserProfile;
  hasLedgerEntries: boolean;
}): ExportOption {
  if (params.profile !== 'ADVANCED') {
    return {
      format: 'CSV_EVENT_LEDGER',
      label: 'CSV event ledger',
      description:
        'An event-level export of ledger rows in the selected period for deeper review when you want it.',
      isAvailable: false,
      unavailableReason: 'Available on the Advanced profile.',
    };
  }

  return {
    format: 'CSV_EVENT_LEDGER',
    label: 'CSV event ledger',
    description:
      'An event-level export of ledger rows in the selected period for deeper review when you want it.',
    isAvailable: params.hasLedgerEntries,
    unavailableReason: params.hasLedgerEntries
      ? undefined
      : 'No event ledger entries are ready to export yet.',
  };
}

export function createExportOptionsVM(params: {
  generatedAt: string;
  profile: UserProfile;
  history: ReadonlyArray<EventLedgerEntry>;
}): ExportOptionsVM {
  const summaryArchiveVM = createSummaryArchiveVM({
    generatedAt: params.generatedAt,
    history: params.history,
  });
  const yearInReviewVM = createYearInReviewVM({
    generatedAt: params.generatedAt,
    history: params.history,
    period: resolveAnnualReviewPeriod(),
  });
  const hasPreparedSummary =
    summaryArchiveVM.availability.status === 'AVAILABLE' ||
    yearInReviewVM.availability.status === 'AVAILABLE';
  const options = [
    createPdfSummaryOption(hasPreparedSummary),
    createCsvSummaryOption({
      profile: params.profile,
      hasSummaryArchive: summaryArchiveVM.availability.status === 'AVAILABLE',
    }),
    createCsvEventLedgerOption({
      profile: params.profile,
      hasLedgerEntries: params.history.length > 0,
    }),
  ];

  if (!options.some((option) => option.isAvailable)) {
    return {
      generatedAt: params.generatedAt,
      profile: params.profile,
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NO_EXPORTABLE_CONTENT',
      },
    };
  }

  return {
    generatedAt: params.generatedAt,
    profile: params.profile,
    availability: {
      status: 'AVAILABLE',
      options,
    },
  };
}
