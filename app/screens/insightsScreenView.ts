import type { EventHistoryEntry, InsightsHistoryVM } from '@/services/insights/types';

export type EventHistoryCardViewData = {
  title: string;
  summary: string;
  timestampText: string | null;
  symbolText: string | null;
  eventKindText: string;
};

export type InsightsHistorySectionViewData = {
  id: string;
  title: string;
  items: EventHistoryCardViewData[];
};

export type InsightsScreenViewData = {
  title: string;
  summary: string;
  availabilityMessage: string | null;
  sections: InsightsHistorySectionViewData[];
};

function formatAvailabilityMessage(reason: Extract<
  InsightsHistoryVM['availability'],
  { status: 'UNAVAILABLE' }
>['reason']): string {
  switch (reason) {
    case 'NO_EVENT_HISTORY':
      return 'No interpreted event history is available yet.';
    case 'INSUFFICIENT_INTERPRETED_HISTORY':
      return 'Insights will appear once there is a little more interpreted history to review.';
    default:
      return 'Insights history is not enabled on this surface.';
  }
}

function formatEventKind(eventKind: EventHistoryEntry['eventKind']): string {
  switch (eventKind) {
    case 'ALIGNMENT':
      return 'Alignment';
    case 'VOLATILITY':
      return 'Volatility';
    case 'STATE_CHANGE':
      return 'State change';
    case 'CONTEXT':
      return 'Context';
    default:
      return 'History';
  }
}

function formatTimestamp(timestamp: string | null): string | null {
  if (!timestamp || timestamp.length < 16) {
    return timestamp;
  }

  return `${timestamp.slice(0, 10)} ${timestamp.slice(11, 16)} UTC`;
}

export function createInsightsScreenViewData(
  vm: InsightsHistoryVM | null,
): InsightsScreenViewData | null {
  if (!vm) {
    return null;
  }

  if (vm.availability.status === 'UNAVAILABLE') {
    return {
      title: 'Insights',
      summary:
        'A quiet shelf of meaningful interpreted changes. It stays selective, factual, and optional.',
      availabilityMessage: formatAvailabilityMessage(vm.availability.reason),
      sections: [],
    };
  }

  return {
    title: 'Insights',
    summary:
      'A quiet shelf of meaningful interpreted changes. It stays selective, factual, and optional.',
    availabilityMessage: null,
    sections: vm.availability.sections.map((section) => ({
      id: section.id,
      title: section.title,
      items: section.items.map((item) => ({
        title: item.title,
        summary: item.summary,
        timestampText: formatTimestamp(item.timestamp),
        symbolText: item.symbol,
        eventKindText: formatEventKind(item.eventKind),
      })),
    })),
  };
}
