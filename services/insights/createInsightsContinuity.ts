import type {
  InsightsContinuitySummary,
  InsightsHistoryVM,
  InsightsLastViewedBoundary,
} from '@/services/insights/types';
import { INSIGHTS_LAST_VIEWED_SECTION_ID } from '@/services/insights/types';

function parseTimestamp(timestamp: string | null): number | null {
  if (!timestamp) {
    return null;
  }

  const parsed = Date.parse(timestamp);

  return Number.isFinite(parsed) ? parsed : null;
}

function getNewestEventAt(historyVM: InsightsHistoryVM): string | null {
  if (historyVM.availability.status !== 'AVAILABLE') {
    return null;
  }

  let newestTimestampMs: number | null = null;
  let newestTimestamp: string | null = null;

  historyVM.availability.sections.forEach((section) => {
    section.items.forEach((item) => {
      const timestampMs = parseTimestamp(item.timestamp);

      if (timestampMs === null) {
        return;
      }

      if (newestTimestampMs === null || timestampMs > newestTimestampMs) {
        newestTimestampMs = timestampMs;
        newestTimestamp = item.timestamp;
      }
    });
  });

  return newestTimestamp;
}

function getNewHistoryCount(historyVM: InsightsHistoryVM): number {
  if (historyVM.availability.status !== 'AVAILABLE') {
    return 0;
  }

  return (
    historyVM.availability.sections.find((section) => section.id === INSIGHTS_LAST_VIEWED_SECTION_ID)
      ?.items.length ?? 0
  );
}

function createNewHistorySummary(newItemCount: number): string {
  const itemLabel = newItemCount === 1 ? 'note is' : 'notes are';

  return `Since you last viewed Insights, ${newItemCount} newer interpreted history ${itemLabel} available.`;
}

function createNoNewHistorySummary(viewedAt: string | null): string | null {
  if (!viewedAt) {
    return null;
  }

  return 'Since you last viewed Insights, no newer interpreted history is available.';
}

export function createInsightsContinuity(params: {
  historyVM: InsightsHistoryVM;
  lastViewedBoundary: InsightsLastViewedBoundary;
}): InsightsContinuitySummary {
  const newestEventAt = getNewestEventAt(params.historyVM);

  if (params.historyVM.availability.status !== 'AVAILABLE') {
    return {
      state: 'NO_HISTORY',
      viewedAt: params.lastViewedBoundary.viewedAt,
      newestEventAt,
      newItemCount: 0,
      summary: null,
    };
  }

  const newItemCount = getNewHistoryCount(params.historyVM);

  if (newItemCount > 0) {
    return {
      state: 'NEW_HISTORY_AVAILABLE',
      viewedAt: params.lastViewedBoundary.viewedAt,
      newestEventAt,
      newItemCount,
      summary: createNewHistorySummary(newItemCount),
    };
  }

  return {
    state: 'NO_NEW_HISTORY',
    viewedAt: params.lastViewedBoundary.viewedAt,
    newestEventAt,
    newItemCount: 0,
    summary: createNoNewHistorySummary(params.lastViewedBoundary.viewedAt),
  };
}
