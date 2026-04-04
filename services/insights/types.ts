export type InsightsEventKind =
  | 'ALIGNMENT'
  | 'VOLATILITY'
  | 'STATE_CHANGE'
  | 'CONTEXT'
  | 'OTHER';

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
      reason:
        | 'NO_EVENT_HISTORY'
        | 'NOT_ENABLED_FOR_SURFACE'
        | 'INSUFFICIENT_INTERPRETED_HISTORY';
    }
  | {
      status: 'AVAILABLE';
      sections: ReadonlyArray<EventHistorySection>;
    };

export type InsightsArchiveAvailability =
  | {
      status: 'UNAVAILABLE';
      reason:
        | 'NO_ARCHIVE_HISTORY'
        | 'NOT_ENABLED_FOR_SURFACE'
        | 'INSUFFICIENT_INTERPRETED_HISTORY';
    }
  | {
      status: 'AVAILABLE';
      sections: ReadonlyArray<InsightsArchiveSection>;
    };

export type InsightsContinuityState =
  | 'NO_HISTORY'
  | 'NO_NEW_HISTORY'
  | 'NEW_HISTORY_AVAILABLE';

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

export type InsightsHistorySurface =
  | 'INSIGHTS_SCREEN'
  | 'SNAPSHOT'
  | 'DASHBOARD'
  | 'TRADE_HUB';
