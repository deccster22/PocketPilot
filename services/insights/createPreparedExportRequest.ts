import type { UserProfile } from '@/core/profile/types';
import type { EventLedgerEntry, UserActionEvent } from '@/core/types/eventLedger';
import type { Certainty, MarketEvent } from '@/core/types/marketEvent';

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
  ExportDispatchAvailability,
  ExportFormat,
  JournalEntry,
  PreparedExportDocument,
  PreparedExportDocumentRow,
  PreparedExportLedgerRow,
  PreparedExportRequest,
  PreparedExportRequestVM,
  ReflectionPeriod,
  SummaryArchiveEntry,
} from '@/services/insights/types';

type SummaryExportDocument = Extract<PreparedExportDocument, { kind: 'SUMMARY' }>;

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

function resolveSafeTimezoneLabel(timezoneLabel: string): string {
  try {
    new Intl.DateTimeFormat('en-CA', {
      timeZone: timezoneLabel,
    }).format(new Date(0));

    return timezoneLabel;
  } catch {
    return 'UTC';
  }
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

function createExportFileLabel(params: {
  format: ExportFormat;
  generatedAt: string;
  period: ReflectionPeriod;
}): string {
  const preparedOnLabel = params.generatedAt.slice(0, 10);
  const periodSlug = params.period === 'LAST_MONTH' ? 'last-month' : 'last-quarter';

  switch (params.format) {
    case 'PDF_SUMMARY':
      return `${periodSlug}-reflection-summary-${preparedOnLabel}.pdf`;
    case 'CSV_SUMMARY':
      return `${periodSlug}-reflection-summary-${preparedOnLabel}.csv`;
    default:
      return `${periodSlug}-event-ledger-${preparedOnLabel}.csv`;
  }
}

function createDispatchAvailability(params: {
  dispatchSupported: boolean;
  canShare: boolean;
  format: ExportFormat;
  generatedAt: string;
  period: ReflectionPeriod;
  journalFollowThroughLabel: string | null;
}): ExportDispatchAvailability {
  if (!params.dispatchSupported) {
    return {
      status: 'UNAVAILABLE',
      reason: 'DISPATCH_NOT_SUPPORTED',
    };
  }

  return {
    status: 'AVAILABLE',
    format: params.format,
    fileLabel: createExportFileLabel({
      format: params.format,
      generatedAt: params.generatedAt,
      period: params.period,
    }),
    canShare: params.canShare,
    journalFollowThroughLabel: params.journalFollowThroughLabel,
  };
}

function toSentenceCase(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function formatTimestampLabel(timestampMs: number, timezoneLabel: string): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: resolveSafeTimezoneLabel(timezoneLabel),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date(timestampMs));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const hourValue = values.hour === '24' ? '00' : values.hour;

  return `${values.year}-${values.month}-${values.day} ${hourValue}:${values.minute}`;
}

function formatPriceLabel(price: number | null): string | null {
  return price === null ? null : price.toFixed(2);
}

function formatPercentChangeLabel(pctChange: number | null): string | null {
  return pctChange === null ? null : `${(pctChange * 100).toFixed(2)}%`;
}

function formatCertaintyLabel(certainty: Certainty): string {
  return certainty === 'estimated' ? 'Estimated' : 'Confirmed';
}

function createSummaryRows(
  items: ReadonlyArray<{
    label: string;
    value: string;
    emphasis: 'NEUTRAL' | 'SHIFT' | 'CONTEXT';
  }>,
): PreparedExportDocumentRow[] {
  return items.map((item) => ({
    label: item.label,
    value: item.value,
    emphasis: item.emphasis,
  }));
}

function createSummaryDocument(params: {
  periodSummaryTitle: string;
  periodSummary: string;
  periodSummaryItems: ReadonlyArray<{
    label: string;
    value: string;
    emphasis: 'NEUTRAL' | 'SHIFT' | 'CONTEXT';
  }>;
  periodSummaryLimitations: ReadonlyArray<string>;
  yearInReviewTitle: string | null;
  yearInReviewSummary: string | null;
  yearInReviewItems: ReadonlyArray<{
    label: string;
    value: string;
    emphasis: 'NEUTRAL' | 'SHIFT' | 'CONTEXT';
  }>;
  yearInReviewLimitations: ReadonlyArray<string>;
  journalReference: SummaryExportDocument['journalReference'];
}): SummaryExportDocument {
  const sections: SummaryExportDocument['sections'][number][] = [
    {
      title: params.periodSummaryTitle,
      summary: params.periodSummary,
      rows: createSummaryRows(params.periodSummaryItems),
    },
  ];

  if (params.yearInReviewTitle && params.yearInReviewSummary) {
    sections.push({
      title: params.yearInReviewTitle,
      summary: params.yearInReviewSummary,
      rows: createSummaryRows(params.yearInReviewItems),
    });
  }
  const limitationNotes = [
    ...params.periodSummaryLimitations,
    ...params.yearInReviewLimitations.map((note) => `Wider context appendix: ${note}`),
  ];

  return {
    kind: 'SUMMARY',
    sections,
    limitationNotes,
    journalReference: params.journalReference,
  };
}

function sortPeriodHistory(history: ReadonlyArray<EventLedgerEntry>): EventLedgerEntry[] {
  return [...history].sort((left, right) => {
    const timestampDiff = left.timestamp - right.timestamp;

    if (timestampDiff !== 0) {
      return timestampDiff;
    }

    return left.eventId.localeCompare(right.eventId);
  });
}

function createPreparedLedgerRow(
  entry: EventLedgerEntry,
  timezoneLabel: string,
): PreparedExportLedgerRow {
  if (isMarketEvent(entry)) {
    return {
      timestampLabel: formatTimestampLabel(entry.timestamp, timezoneLabel),
      timezoneLabel,
      eventClass: 'MARKET',
      eventLabel: toSentenceCase(entry.eventType),
      accountLabel: entry.accountId,
      symbol: entry.symbol,
      strategyLabel: entry.strategyId,
      alignmentLabel: toSentenceCase(entry.alignmentState),
      certaintyLabel: formatCertaintyLabel(entry.certainty),
      priceLabel: formatPriceLabel(entry.price),
      percentChangeLabel: formatPercentChangeLabel(entry.pctChange),
    };
  }

  return {
    timestampLabel: formatTimestampLabel(entry.timestamp, timezoneLabel),
    timezoneLabel,
    eventClass: 'USER_ACTION',
    eventLabel: toSentenceCase(entry.actionType),
    accountLabel: entry.accountId,
    symbol: null,
    strategyLabel: null,
    alignmentLabel: null,
    certaintyLabel: null,
    priceLabel: null,
    percentChangeLabel: null,
  };
}

function createEventLedgerDocument(params: {
  history: ReadonlyArray<EventLedgerEntry>;
  timezoneLabel: string;
}): PreparedExportDocument {
  return {
    kind: 'EVENT_LEDGER',
    rows: sortPeriodHistory(params.history).map((entry) =>
      createPreparedLedgerRow(entry, params.timezoneLabel),
    ),
    journalReference: null,
  };
}

function createPdfSummaryPayload(params: {
  periodTitle: string;
  itemCount: number;
  limitationCount: number;
  archiveEntry: SummaryArchiveEntry | null;
  yearInReviewTitle: string | null;
  hasLinkedJournalEntry: boolean;
  journalReferenceIncluded: boolean;
}): PreparedExportRequest['payloadSummary'] {
  const limitationText =
    params.limitationCount === 0
      ? 'No additional limitation notes are needed for this prepared summary.'
      : params.limitationCount === 1
        ? '1 limitation note remains visible in the export.'
        : `${params.limitationCount} limitation notes remain visible in the export.`;

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
    params.hasLinkedJournalEntry
      ? {
          label: 'Journal note',
          value: params.journalReferenceIncluded
            ? 'Includes the linked summary note as a final PDF section.'
            : 'Keeps the linked summary note out unless you choose to include it.',
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
  timezoneLabel: string;
}): PreparedExportRequest['payloadSummary'] {
  return [
    {
      label: 'Contains',
      value: `${params.itemCount} prepared note row${params.itemCount === 1 ? '' : 's'} and ${params.limitationCount} limitation row${params.limitationCount === 1 ? '' : 's'} for ${params.periodTitle.toLowerCase()}.`,
    },
    {
      label: 'Columns',
      value: 'Section, label, value, emphasis, row order, and timezone where it applies.',
    },
    {
      label: 'Timezone',
      value: `Rows keep ${params.timezoneLabel} visible as the export timezone label.`,
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
  timezoneLabel: string;
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
        'Timestamp, timezone, event class, event label, account, symbol, strategy, alignment, certainty, price, and percent change when present.',
    },
    {
      label: 'Timezone',
      value: `Each row keeps ${params.timezoneLabel} visible alongside the exported timestamp.`,
    },
    {
      label: 'Excludes',
      value:
        'Provider diagnostics, raw signal codes, confidence scores, and metadata payloads stay out of this export path.',
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
  dispatchSupported: boolean;
  canShare: boolean;
  journalFollowThroughLabel: string | null;
  journalReferenceIncluded: boolean;
  document: PreparedExportDocument;
}): PreparedExportRequest {
  const resolvedTimezoneLabel = resolveTimezoneLabel(params.timezoneLabel);

  return {
    format: params.format,
    title: params.title,
    coveredRangeLabel: formatSummaryArchiveCoveredRangeLabel(params.period, params.generatedAt),
    timezoneLabel: resolvedTimezoneLabel,
    payloadSummary: params.payloadSummary,
    dispatchAvailability: createDispatchAvailability({
      dispatchSupported: params.dispatchSupported,
      canShare: params.canShare,
      format: params.format,
      generatedAt: params.generatedAt,
      period: params.period,
      journalFollowThroughLabel: params.journalFollowThroughLabel,
    }),
    journalReferenceIncluded: params.journalReferenceIncluded,
    document: params.document,
  };
}

export function createPreparedExportRequest(params: {
  generatedAt: string;
  profile: UserProfile;
  history: ReadonlyArray<EventLedgerEntry>;
  format: ExportFormat | null;
  period: ReflectionPeriod | null;
  timezoneLabel?: string;
  linkedJournalEntry?: JournalEntry | null;
  includeJournalReference?: boolean;
  dispatchSupported?: boolean;
  canShare?: boolean;
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
  const resolvedTimezoneLabel = resolveTimezoneLabel(params.timezoneLabel);
  const journalFollowThroughLabel =
    params.format === 'PDF_SUMMARY' && params.linkedJournalEntry
      ? 'Include linked summary note'
      : null;
  const journalReferenceIncluded = Boolean(
    params.includeJournalReference &&
      journalFollowThroughLabel &&
      params.linkedJournalEntry?.body.trim().length,
  );

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
            timezoneLabel: resolvedTimezoneLabel,
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
              hasLinkedJournalEntry: Boolean(params.linkedJournalEntry),
              journalReferenceIncluded,
            }),
            dispatchSupported: params.dispatchSupported ?? true,
            canShare: params.canShare ?? false,
            journalFollowThroughLabel,
            journalReferenceIncluded,
            document: createSummaryDocument({
              periodSummaryTitle: periodSummaryVM.availability.title,
              periodSummary: periodSummaryVM.availability.summary,
              periodSummaryItems: periodSummaryVM.availability.items,
              periodSummaryLimitations: periodSummaryVM.availability.limitations,
              yearInReviewTitle:
                yearInReviewVM.availability.status === 'AVAILABLE'
                  ? yearInReviewVM.availability.title
                  : null,
              yearInReviewSummary:
                yearInReviewVM.availability.status === 'AVAILABLE'
                  ? yearInReviewVM.availability.summary
                  : null,
              yearInReviewItems:
                yearInReviewVM.availability.status === 'AVAILABLE'
                  ? yearInReviewVM.availability.items
                  : [],
              yearInReviewLimitations:
                yearInReviewVM.availability.status === 'AVAILABLE'
                  ? yearInReviewVM.availability.limitations
                  : [],
              journalReference:
                journalReferenceIncluded && params.linkedJournalEntry
                  ? {
                      title: params.linkedJournalEntry.title,
                      linkageLabel: params.linkedJournalEntry.linkageLabel,
                      updatedAtLabel: params.linkedJournalEntry.updatedAtLabel,
                      body: params.linkedJournalEntry.body,
                    }
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
            timezoneLabel: resolvedTimezoneLabel,
            payloadSummary: createCsvSummaryPayload({
              periodTitle: periodSummaryVM.availability.title,
              itemCount: periodSummaryVM.availability.items.length,
              limitationCount: periodSummaryVM.availability.limitations.length,
              timezoneLabel: resolvedTimezoneLabel,
            }),
            dispatchSupported: params.dispatchSupported ?? true,
            canShare: params.canShare ?? false,
            journalFollowThroughLabel: null,
            journalReferenceIncluded: false,
            document: createSummaryDocument({
              periodSummaryTitle: periodSummaryVM.availability.title,
              periodSummary: periodSummaryVM.availability.summary,
              periodSummaryItems: periodSummaryVM.availability.items,
              periodSummaryLimitations: periodSummaryVM.availability.limitations,
              yearInReviewTitle: null,
              yearInReviewSummary: null,
              yearInReviewItems: [],
              yearInReviewLimitations: [],
              journalReference: null,
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
            timezoneLabel: resolvedTimezoneLabel,
            payloadSummary: createEventLedgerPayload({
              marketEventCount: periodHistory.filter(isMarketEvent).length,
              userActionCount: periodHistory.filter(isUserActionEvent).length,
              timezoneLabel: resolvedTimezoneLabel,
            }),
            dispatchSupported: params.dispatchSupported ?? true,
            canShare: params.canShare ?? false,
            journalFollowThroughLabel: null,
            journalReferenceIncluded: false,
            document: createEventLedgerDocument({
              history: periodHistory,
              timezoneLabel: resolvedTimezoneLabel,
            }),
          }),
        },
      };
    }
    default:
      return createUnavailableVM(params.generatedAt, 'UNSUPPORTED_FORMAT');
  }
}
