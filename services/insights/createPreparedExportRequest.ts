import type { UserProfile } from '@/core/profile/types';
import type { EventLedgerEntry, UserActionEvent } from '@/core/types/eventLedger';
import type { MarketEvent } from '@/core/types/marketEvent';

import { createPeriodSummaryVM } from '@/services/insights/createPeriodSummaryVM';
import { createSummaryArchiveVM } from '@/services/insights/createSummaryArchiveVM';
import { createYearInReviewVM } from '@/services/insights/createYearInReviewVM';
import {
  createReflectionPeriodWindow,
  formatReflectionPeriodTitle,
  formatSummaryArchiveCoveredRangeLabel,
  resolveAnnualReviewPeriod,
} from '@/services/insights/periodSummaryShared';
import type {
  ExportFormat,
  PreparedExportRequest,
  PreparedExportRequestVM,
  ReflectionPeriod,
  SummaryArchiveEntry,
} from '@/services/insights/types';

function createUnavailableVM(
  generatedAt: string,
  reason: Extract<PreparedExportRequestVM['availability'], { status: 'UNAVAILABLE' }>['reason'],
): PreparedExportRequestVM {
  return {
    generatedAt,
    availability: {
      status: 'UNAVAILABLE',
      reason,
    },
  };
}

function resolveTimezoneLabel(timezoneLabel?: string): string {
  const normalizedLabel = timezoneLabel?.trim();

  return normalizedLabel && normalizedLabel.length > 0 ? normalizedLabel : 'UTC';
}

function isUserActionEvent(entry: EventLedgerEntry): entry is UserActionEvent {
  return 'actionType' in entry;
}

function isMarketEvent(entry: EventLedgerEntry): entry is MarketEvent {
  return 'eventType' in entry;
}

function findArchiveEntry(
  entries: ReadonlyArray<SummaryArchiveEntry>,
  period: ReflectionPeriod,
): SummaryArchiveEntry | null {
  return entries.find((entry) => entry.period === period) ?? null;
}

function createPdfSummaryPayload(params: {
  periodTitle: string;
  itemCount: number;
  limitationCount: number;
  archiveEntry: SummaryArchiveEntry | null;
  yearInReviewTitle: string | null;
}): PreparedExportRequest['payloadSummary'] {
  const limitationText =
    params.limitationCount === 0
      ? 'No additional limitation notes are needed for this prepared summary.'
      : `${params.limitationCount} limitation note${params.limitationCount === 1 ? ' remains' : 's remain'} visible in the export.`;

  return [
    {
      label: 'Contains',
      value:
        'A calm formatted cover plus the selected prepared summary, its key notes, and any honest limitation notes.',
    },
    {
      label: 'Selected period',
      value: `${params.periodTitle} with ${params.itemCount} prepared note${params.itemCount === 1 ? '' : 's'}.`,
    },
    params.archiveEntry
      ? {
          label: 'Archive source',
          value: `Matches the prepared archive entry labeled "${params.archiveEntry.title}" on the Insights shelf.`,
        }
      : null,
    params.yearInReviewTitle
      ? {
          label: 'Wider context',
          value: `Also carries a short ${params.yearInReviewTitle} appendix when you want a broader reflection frame.`,
        }
      : null,
    {
      label: 'Limitations',
      value: limitationText,
    },
    {
      label: 'Excludes',
      value:
        'Internal diagnostics, provider details, raw signal codes, and runtime metadata stay out.',
    },
  ].filter((item): item is PreparedExportRequest['payloadSummary'][number] => Boolean(item));
}

function createCsvSummaryPayload(params: {
  periodTitle: string;
  itemCount: number;
  limitationCount: number;
}): PreparedExportRequest['payloadSummary'] {
  return [
    {
      label: 'Contains',
      value: `${params.itemCount} prepared note row${params.itemCount === 1 ? '' : 's'} and ${params.limitationCount} limitation row${params.limitationCount === 1 ? '' : 's'} for ${params.periodTitle.toLowerCase()}.`,
    },
    {
      label: 'Columns',
      value: 'Section, label, value, emphasis, and row order.',
    },
    {
      label: 'Excludes',
      value:
        'Internal diagnostics, provider details, raw signal codes, and runtime metadata stay out.',
    },
  ];
}

function createEventLedgerPayload(params: {
  marketEventCount: number;
  userActionCount: number;
}): PreparedExportRequest['payloadSummary'] {
  const totalCount = params.marketEventCount + params.userActionCount;
  const countSummary =
    params.userActionCount > 0
      ? `${totalCount} ledger row${totalCount === 1 ? '' : 's'} from the selected period: ${params.marketEventCount} market and ${params.userActionCount} user action.`
      : `${totalCount} event ledger row${totalCount === 1 ? '' : 's'} from the selected period.`;

  return [
    {
      label: 'Contains',
      value: countSummary,
    },
    {
      label: 'Columns',
      value:
        'Timestamp, event class, event type or action type, account, symbol, strategy, alignment, certainty, price, and percent change when present.',
    },
    {
      label: 'Excludes',
      value:
        'Provider diagnostics, raw signal codes, confidence scores, and metadata payloads stay out of this export foundation.',
    },
  ];
}

function createRequest(params: {
  format: ExportFormat;
  title: string;
  generatedAt: string;
  period: ReflectionPeriod;
  timezoneLabel?: string;
  payloadSummary: PreparedExportRequest['payloadSummary'];
}): PreparedExportRequest {
  return {
    format: params.format,
    title: params.title,
    coveredRangeLabel: formatSummaryArchiveCoveredRangeLabel(params.period, params.generatedAt),
    timezoneLabel: resolveTimezoneLabel(params.timezoneLabel),
    payloadSummary: params.payloadSummary,
  };
}

export function createPreparedExportRequest(params: {
  generatedAt: string;
  profile: UserProfile;
  history: ReadonlyArray<EventLedgerEntry>;
  format: ExportFormat | null;
  period: ReflectionPeriod | null;
  timezoneLabel?: string;
}): PreparedExportRequestVM {
  if (!params.format) {
    return createUnavailableVM(params.generatedAt, 'NO_EXPORT_SELECTED');
  }

  if (!params.period) {
    return createUnavailableVM(params.generatedAt, 'INSUFFICIENT_CONTENT');
  }

  const periodSummaryVM = createPeriodSummaryVM({
    generatedAt: params.generatedAt,
    history: params.history,
    period: params.period,
  });
  const summaryArchiveVM = createSummaryArchiveVM({
    generatedAt: params.generatedAt,
    history: params.history,
  });
  const yearInReviewVM = createYearInReviewVM({
    generatedAt: params.generatedAt,
    history: params.history,
    period: resolveAnnualReviewPeriod(),
  });

  switch (params.format) {
    case 'PDF_SUMMARY': {
      if (periodSummaryVM.availability.status === 'UNAVAILABLE') {
        return createUnavailableVM(params.generatedAt, 'INSUFFICIENT_CONTENT');
      }

      return {
        generatedAt: params.generatedAt,
        availability: {
          status: 'AVAILABLE',
          request: createRequest({
            format: params.format,
            title: `${periodSummaryVM.availability.title} reflection summary`,
            generatedAt: params.generatedAt,
            period: params.period,
            timezoneLabel: params.timezoneLabel,
            payloadSummary: createPdfSummaryPayload({
              periodTitle: periodSummaryVM.availability.title,
              itemCount: periodSummaryVM.availability.items.length,
              limitationCount: periodSummaryVM.availability.limitations.length,
              archiveEntry:
                summaryArchiveVM.availability.status === 'AVAILABLE'
                  ? findArchiveEntry(summaryArchiveVM.availability.entries, params.period)
                  : null,
              yearInReviewTitle:
                yearInReviewVM.availability.status === 'AVAILABLE'
                  ? yearInReviewVM.availability.title
                  : null,
            }),
          }),
        },
      };
    }
    case 'CSV_SUMMARY': {
      if (params.profile === 'BEGINNER') {
        return createUnavailableVM(params.generatedAt, 'UNSUPPORTED_FORMAT');
      }

      if (periodSummaryVM.availability.status === 'UNAVAILABLE') {
        return createUnavailableVM(params.generatedAt, 'INSUFFICIENT_CONTENT');
      }

      return {
        generatedAt: params.generatedAt,
        availability: {
          status: 'AVAILABLE',
          request: createRequest({
            format: params.format,
            title: `${periodSummaryVM.availability.title} reflection summary (CSV)`,
            generatedAt: params.generatedAt,
            period: params.period,
            timezoneLabel: params.timezoneLabel,
            payloadSummary: createCsvSummaryPayload({
              periodTitle: periodSummaryVM.availability.title,
              itemCount: periodSummaryVM.availability.items.length,
              limitationCount: periodSummaryVM.availability.limitations.length,
            }),
          }),
        },
      };
    }
    case 'CSV_EVENT_LEDGER': {
      if (params.profile !== 'ADVANCED') {
        return createUnavailableVM(params.generatedAt, 'UNSUPPORTED_FORMAT');
      }

      const window = createReflectionPeriodWindow(params.period, params.generatedAt);
      const periodHistory = params.history.filter(
        (entry) => entry.timestamp >= window.startAtMs && entry.timestamp < window.endAtMs,
      );

      if (periodHistory.length === 0) {
        return createUnavailableVM(params.generatedAt, 'INSUFFICIENT_CONTENT');
      }

      return {
        generatedAt: params.generatedAt,
        availability: {
          status: 'AVAILABLE',
          request: createRequest({
            format: params.format,
            title: `${formatReflectionPeriodTitle(params.period)} event ledger (CSV)`,
            generatedAt: params.generatedAt,
            period: params.period,
            timezoneLabel: params.timezoneLabel,
            payloadSummary: createEventLedgerPayload({
              marketEventCount: periodHistory.filter(isMarketEvent).length,
              userActionCount: periodHistory.filter(isUserActionEvent).length,
            }),
          }),
        },
      };
    }
    default:
      return createUnavailableVM(params.generatedAt, 'UNSUPPORTED_FORMAT');
  }
}
