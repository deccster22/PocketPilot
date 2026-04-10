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
