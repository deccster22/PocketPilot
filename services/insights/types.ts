export type EventHistoryEntry = {
  title: string;
  summary: string;
  timestamp: string | null;
  symbol: string | null;
  eventKind: 'ALIGNMENT' | 'VOLATILITY' | 'STATE_CHANGE' | 'CONTEXT' | 'OTHER';
};

export type EventHistorySection = {
  id: string;
  title: string;
  items: ReadonlyArray<EventHistoryEntry>;
};

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

export type InsightsHistoryVM = {
  generatedAt: string | null;
  availability: InsightsHistoryAvailability;
};

export type InsightsHistorySurface =
  | 'INSIGHTS_SCREEN'
  | 'SNAPSHOT'
  | 'DASHBOARD'
  | 'TRADE_HUB';
