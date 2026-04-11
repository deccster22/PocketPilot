import type { InsightsHistoryVM, InsightsHistoryWithContinuityVM } from '@/services/insights/types';

import { formatInsightsEventKind, formatInsightsTimestamp } from './insightsViewFormatting';

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
  continuityNote: string | null;
  availabilityMessage: string | null;
  journalActionLabel: string | null;
  journalActionSummary: string | null;
  archiveActionLabel: string | null;
  archiveActionSummary: string | null;
  reflectionActionLabel: string | null;
  reflectionActionSummary: string | null;
  summaryActionLabel: string | null;
  summaryActionSummary: string | null;
  summaryArchiveActionLabel: string | null;
  summaryArchiveActionSummary: string | null;
  yearInReviewActionLabel: string | null;
  yearInReviewActionSummary: string | null;
  exportActionLabel: string | null;
  exportActionSummary: string | null;
  sections: InsightsHistorySectionViewData[];
};

function formatAvailabilityMessage(
  reason: Extract<InsightsHistoryVM['availability'], { status: 'UNAVAILABLE' }>['reason'],
): string {
  switch (reason) {
    case 'NO_EVENT_HISTORY':
      return 'No interpreted event history is available yet.';
    case 'INSUFFICIENT_INTERPRETED_HISTORY':
      return 'Insights will appear once there is a little more interpreted history to review.';
    default:
      return 'Insights history is not enabled on this surface.';
  }
}

export function createInsightsScreenViewData(
  vm: InsightsHistoryWithContinuityVM | null,
  params?: {
    hasJournal?: boolean;
    hasArchive?: boolean;
    hasReflection?: boolean;
    hasSummaries?: boolean;
    hasSummaryArchive?: boolean;
    hasYearInReview?: boolean;
    hasExport?: boolean;
  },
): InsightsScreenViewData | null {
  if (!vm) {
    return null;
  }

  if (vm.availability.status === 'UNAVAILABLE') {
    return {
      title: 'Insights',
      summary:
        'A quiet shelf of meaningful interpreted changes. It stays selective, factual, and optional.',
      continuityNote: vm.continuity.summary,
      availabilityMessage: formatAvailabilityMessage(vm.availability.reason),
      journalActionLabel: params?.hasJournal ? 'Open journal note' : null,
      journalActionSummary: params?.hasJournal
        ? 'Keep a small optional note connected to this reflection lane when you want extra context in your own words.'
        : null,
      archiveActionLabel: null,
      archiveActionSummary: null,
      reflectionActionLabel: null,
      reflectionActionSummary: null,
      summaryActionLabel: params?.hasSummaries ? 'View period summaries' : null,
      summaryActionSummary: params?.hasSummaries
        ? 'Open a calm monthly or quarterly readback built from interpreted history.'
        : null,
      summaryArchiveActionLabel: params?.hasSummaryArchive ? 'Browse summary archive' : null,
      summaryArchiveActionSummary: params?.hasSummaryArchive
        ? 'Revisit prepared monthly and quarterly readbacks on a quiet archive shelf.'
        : null,
      yearInReviewActionLabel: params?.hasYearInReview ? 'Open Year in Review' : null,
      yearInReviewActionSummary: params?.hasYearInReview
        ? 'Open a calm annual debrief for the last completed calendar year when you want a wider reflection.'
        : null,
      exportActionLabel: params?.hasExport ? 'Prepare export' : null,
      exportActionSummary: params?.hasExport
        ? 'Review calm export options for the reflection material that is already ready under Insights.'
        : null,
      sections: [],
    };
  }

  return {
    title: 'Insights',
    summary:
      'A quiet shelf of meaningful interpreted changes. It stays selective, factual, and optional.',
    continuityNote: vm.continuity.summary,
    availabilityMessage: null,
    journalActionLabel: params?.hasJournal ? 'Open journal note' : null,
    journalActionSummary: params?.hasJournal
      ? 'Keep a small optional note connected to this reflection lane when you want extra context in your own words.'
      : null,
    archiveActionLabel: params?.hasArchive ? 'View deeper history' : null,
    archiveActionSummary: params?.hasArchive
      ? 'Open a slightly deeper interpreted archive when you want a little more context.'
      : null,
    reflectionActionLabel: params?.hasReflection ? 'Compare recent history' : null,
    reflectionActionSummary: params?.hasReflection
      ? 'Place two interpreted slices side by side when you want a brief sense of what changed.'
      : null,
    summaryActionLabel: params?.hasSummaries ? 'View period summaries' : null,
    summaryActionSummary: params?.hasSummaries
      ? 'Open a calm monthly or quarterly readback built from interpreted history.'
      : null,
    summaryArchiveActionLabel: params?.hasSummaryArchive ? 'Browse summary archive' : null,
    summaryArchiveActionSummary: params?.hasSummaryArchive
      ? 'Revisit prepared monthly and quarterly readbacks on a quiet archive shelf.'
      : null,
    yearInReviewActionLabel: params?.hasYearInReview ? 'Open Year in Review' : null,
    yearInReviewActionSummary: params?.hasYearInReview
      ? 'Open a calm annual debrief for the last completed calendar year when you want a wider reflection.'
      : null,
    exportActionLabel: params?.hasExport ? 'Prepare export' : null,
    exportActionSummary: params?.hasExport
      ? 'Review calm export options for the reflection material that is already ready under Insights.'
      : null,
    sections: vm.availability.sections.map((section) => ({
      id: section.id,
      title: section.title,
      items: section.items.map((item) => ({
        title: item.title,
        summary: item.summary,
        timestampText: formatInsightsTimestamp(item.timestamp),
        symbolText: item.symbol,
        eventKindText: formatInsightsEventKind(item.eventKind),
      })),
    })),
  };
}
