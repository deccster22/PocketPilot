import type { UserProfile } from '@/core/profile/types';

export type InsightsEventKind = 'ALIGNMENT' | 'VOLATILITY' | 'STATE_CHANGE' | 'CONTEXT' | 'OTHER';

export type EventHistoryEntry = {
  title: string;
  summary: string;
  timestamp: string | null;
  symbol: string | null;
  eventKind: InsightsEventKind;
};

export type EventHistorySection = {
  id: string;
  title: string;
  items: ReadonlyArray<EventHistoryEntry>;
};

export type InsightsDetailEntry = {
  title: string;
  summary: string;
  timestamp: string | null;
  symbol: string | null;
  eventKind: InsightsEventKind;
  detailNote: string | null;
};

export type InsightsArchiveSection = {
  id: string;
  title: string;
  items: ReadonlyArray<InsightsDetailEntry>;
};

export const INSIGHTS_LAST_VIEWED_SECTION_ID = 'since-last-viewed';

export type InsightsHistoryAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_EVENT_HISTORY' | 'NOT_ENABLED_FOR_SURFACE' | 'INSUFFICIENT_INTERPRETED_HISTORY';
    }
  | {
      status: 'AVAILABLE';
      sections: ReadonlyArray<EventHistorySection>;
    };

export type InsightsArchiveAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_ARCHIVE_HISTORY' | 'NOT_ENABLED_FOR_SURFACE' | 'INSUFFICIENT_INTERPRETED_HISTORY';
    }
  | {
      status: 'AVAILABLE';
      sections: ReadonlyArray<InsightsArchiveSection>;
    };

export type InsightsContinuityState = 'NO_HISTORY' | 'NO_NEW_HISTORY' | 'NEW_HISTORY_AVAILABLE';

export type InsightsLastViewedBoundary = {
  viewedAt: string | null;
};

export type InsightsContinuitySummary = {
  state: InsightsContinuityState;
  viewedAt: string | null;
  newestEventAt: string | null;
  newItemCount: number;
  summary: string | null;
};

export type InsightsHistoryVM = {
  generatedAt: string | null;
  availability: InsightsHistoryAvailability;
};

export type InsightsHistoryWithContinuityVM = InsightsHistoryVM & {
  continuity: InsightsContinuitySummary;
};

export type InsightsArchiveVM = {
  generatedAt: string | null;
  availability: InsightsArchiveAvailability;
  selectedSectionId: string | null;
};

export type ReflectionComparisonWindow = {
  id: string;
  title: string;
  startAt: string | null;
  endAt: string | null;
};

export type ReflectionSummaryItem = {
  title: string;
  summary: string;
  emphasis: 'SHIFT' | 'STABLE' | 'CONTEXT';
};

export type ReflectionComparisonAvailability =
  | {
      status: 'UNAVAILABLE';
      reason:
        | 'NO_COMPARABLE_HISTORY'
        | 'INSUFFICIENT_INTERPRETED_HISTORY'
        | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      leftWindow: ReflectionComparisonWindow;
      rightWindow: ReflectionComparisonWindow;
      items: ReadonlyArray<ReflectionSummaryItem>;
      limitations: ReadonlyArray<string>;
    };

export type ReflectionComparisonVM = {
  generatedAt: string | null;
  availability: ReflectionComparisonAvailability;
};

export type ReflectionPeriod = 'LAST_MONTH' | 'LAST_QUARTER';

export type PeriodSummaryItem = {
  label: string;
  value: string;
  emphasis: 'NEUTRAL' | 'SHIFT' | 'CONTEXT';
};

export type PeriodSummaryAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_PERIOD_SELECTED' | 'INSUFFICIENT_HISTORY' | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      period: ReflectionPeriod;
      title: string;
      summary: string;
      items: ReadonlyArray<PeriodSummaryItem>;
      limitations: ReadonlyArray<string>;
    };

export type PeriodSummaryVM = {
  generatedAt: string | null;
  availability: PeriodSummaryAvailability;
};

export type AnnualReviewPeriod = 'LAST_YEAR';

export type YearInReviewItem = {
  label: string;
  value: string;
  emphasis: 'NEUTRAL' | 'SHIFT' | 'CONTEXT';
};

export type YearInReviewAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_PERIOD_SELECTED' | 'INSUFFICIENT_HISTORY' | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      period: AnnualReviewPeriod;
      title: string;
      summary: string;
      items: ReadonlyArray<YearInReviewItem>;
      limitations: ReadonlyArray<string>;
    };

export type YearInReviewVM = {
  generatedAt: string | null;
  availability: YearInReviewAvailability;
};

export type JournalContextType = 'PERIOD_SUMMARY' | 'YEAR_IN_REVIEW' | 'GENERAL_REFLECTION';

export type JournalEntryContext =
  | {
      contextType: 'GENERAL_REFLECTION';
    }
  | {
      contextType: 'PERIOD_SUMMARY';
      period: ReflectionPeriod | null;
    }
  | {
      contextType: 'YEAR_IN_REVIEW';
      period?: AnnualReviewPeriod | null;
    };

export type JournalEntry = {
  entryId: string;
  contextType: JournalContextType;
  contextId: string | null;
  title: string;
  linkageLabel: string | null;
  body: string;
  updatedAtLabel: string | null;
};

export type JournalEntryAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NOT_ENABLED_FOR_SURFACE' | 'NO_JOURNAL_CONTEXT';
    }
  | {
      status: 'AVAILABLE';
      entry: JournalEntry | null;
    };

export type JournalEntryVM = {
  generatedAt: string | null;
  title: string | null;
  linkageLabel: string | null;
  availability: JournalEntryAvailability;
};

export type JournalEntrySaveResult =
  | {
      status: 'SAVED';
      entry: JournalEntry;
    }
  | {
      status: 'REJECTED';
      reason:
        | 'EMPTY_BODY'
        | 'ENTRY_ALREADY_EXISTS'
        | 'NOT_ENABLED_FOR_SURFACE'
        | 'NO_JOURNAL_CONTEXT';
    };

export type JournalEntryUpdateResult =
  | {
      status: 'UPDATED';
      entry: JournalEntry;
    }
  | {
      status: 'REJECTED';
      reason:
        | 'EMPTY_BODY'
        | 'ENTRY_NOT_FOUND'
        | 'NOT_ENABLED_FOR_SURFACE'
        | 'NO_JOURNAL_CONTEXT';
    };

export type ExportFormat = 'PDF_SUMMARY' | 'CSV_SUMMARY' | 'CSV_EVENT_LEDGER';

export type ExportOption = {
  format: ExportFormat;
  label: string;
  description: string;
  isAvailable: boolean;
  unavailableReason?: string;
};

export type ExportOptionsAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_EXPORTABLE_CONTENT' | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      options: ReadonlyArray<ExportOption>;
    };

export type ExportOptionsVM = {
  generatedAt: string | null;
  profile: UserProfile;
  availability: ExportOptionsAvailability;
};

export type PreparedExportSummaryItem = {
  label: string;
  value: string;
};

export type ExportDispatchAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'DISPATCH_NOT_SUPPORTED' | 'INSUFFICIENT_CONTENT' | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      format: ExportFormat;
      fileLabel: string;
      canShare: boolean;
      journalFollowThroughLabel: string | null;
    };

export type PreparedExportDocumentRow = {
  label: string;
  value: string;
  emphasis: 'NEUTRAL' | 'SHIFT' | 'CONTEXT';
};

export type PreparedExportDocumentSection = {
  title: string;
  summary: string | null;
  rows: ReadonlyArray<PreparedExportDocumentRow>;
};

export type PreparedExportJournalReference = {
  title: string;
  linkageLabel: string | null;
  updatedAtLabel: string | null;
  body: string;
};

export type PreparedExportLedgerRow = {
  timestampLabel: string;
  timezoneLabel: string;
  eventClass: 'MARKET' | 'USER_ACTION';
  eventLabel: string;
  accountLabel: string;
  symbol: string | null;
  strategyLabel: string | null;
  alignmentLabel: string | null;
  certaintyLabel: string | null;
  priceLabel: string | null;
  percentChangeLabel: string | null;
};

export type PreparedExportDocument =
  | {
      kind: 'SUMMARY';
      sections: ReadonlyArray<PreparedExportDocumentSection>;
      limitationNotes: ReadonlyArray<string>;
      journalReference: PreparedExportJournalReference | null;
    }
  | {
      kind: 'EVENT_LEDGER';
      rows: ReadonlyArray<PreparedExportLedgerRow>;
      journalReference: null;
    };

export type PreparedExportRequest = {
  format: ExportFormat;
  title: string;
  coveredRangeLabel: string | null;
  timezoneLabel: string;
  payloadSummary: ReadonlyArray<PreparedExportSummaryItem>;
  dispatchAvailability: ExportDispatchAvailability;
  journalReferenceIncluded: boolean;
  document: PreparedExportDocument;
};

export type ExportRequestAvailability =
  | {
      status: 'UNAVAILABLE';
      reason:
        | 'NO_EXPORT_SELECTED'
        | 'UNSUPPORTED_FORMAT'
        | 'INSUFFICIENT_CONTENT'
        | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      request: PreparedExportRequest;
    };

export type PreparedExportRequestVM = {
  generatedAt: string | null;
  availability: ExportRequestAvailability;
};

export type PreparedExportDispatchResult =
  | {
      status: 'UNAVAILABLE';
      reason:
        | 'NO_EXPORT_SELECTED'
        | 'UNSUPPORTED_FORMAT'
        | 'DISPATCH_NOT_SUPPORTED'
        | 'DISPATCH_FAILED'
        | 'INSUFFICIENT_CONTENT';
    }
  | {
      status: 'AVAILABLE';
      fileLabel: string;
      mimeType: string;
      timezoneLabel: string;
      journalReferenceIncluded: boolean;
    };

export type SummaryArchiveEntry = {
  archiveId: string;
  period: ReflectionPeriod;
  title: string;
  summary: string;
  coveredRangeLabel: string;
  generatedAtLabel: string | null;
};

export type SummaryArchiveAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_ARCHIVED_SUMMARIES' | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      entries: ReadonlyArray<SummaryArchiveEntry>;
    };

export type SummaryArchiveVM = {
  generatedAt: string | null;
  availability: SummaryArchiveAvailability;
};

export type InsightsHistorySurface = 'INSIGHTS_SCREEN' | 'SNAPSHOT' | 'DASHBOARD' | 'TRADE_HUB';
