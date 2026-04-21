import type {
  InsightsArchiveVM,
  InsightsDetailEntry,
} from '@/services/insights/types';

import { formatInsightsEventKind, formatInsightsTimestamp } from './insightsViewFormatting';

export type InsightsDetailCardViewData = {
  title: string;
  summary: string;
  detailNoteText: string | null;
  timestampText: string | null;
  symbolText: string | null;
  eventKindText: string;
};

export type InsightsArchiveSectionOptionViewData = {
  id: string;
  title: string;
  isSelected: boolean;
};

export type SinceLastCheckedContinuityItemViewData = {
  title: string;
  summary: string;
  emphasis: 'NEUTRAL' | 'CHANGE' | 'CONTEXT';
};

export type SinceLastCheckedContinuityEntryViewData = {
  title: string;
  summary: string;
  surfacedAtText: string | null;
  viewedAtText: string | null;
  items: SinceLastCheckedContinuityItemViewData[];
};

export type InsightsDetailScreenViewData = {
  title: string;
  summary: string;
  availabilityMessage: string | null;
  continuityTitle: string | null;
  continuitySummary: string | null;
  continuityEntries: SinceLastCheckedContinuityEntryViewData[];
  selectedSectionTitle: string | null;
  sectionOptions: InsightsArchiveSectionOptionViewData[];
  items: InsightsDetailCardViewData[];
};

function formatAvailabilityMessage(reason: Extract<
  InsightsArchiveVM['availability'],
  { status: 'UNAVAILABLE' }
>['reason']): string {
  switch (reason) {
    case 'NO_ARCHIVE_HISTORY':
      return 'There is no deeper interpreted archive to review yet.';
    case 'INSUFFICIENT_INTERPRETED_HISTORY':
      return 'There is not enough deeper interpreted history to open the archive yet.';
    default:
      return 'This deeper Insights history is not enabled on this surface.';
  }
}

function createDetailCardViewData(entry: InsightsDetailEntry): InsightsDetailCardViewData {
  return {
    title: entry.title,
    summary: entry.summary,
    detailNoteText: entry.detailNote,
    timestampText: formatInsightsTimestamp(entry.timestamp),
    symbolText: entry.symbol,
    eventKindText: formatInsightsEventKind(entry.eventKind),
  };
}

function createContinuityEntryViewData(
  entry: Extract<
    InsightsArchiveVM['sinceLastCheckedContinuity'],
    { status: 'AVAILABLE' }
  >['entries'][number],
): SinceLastCheckedContinuityEntryViewData {
  return {
    title: entry.title,
    summary: entry.summary,
    surfacedAtText: formatInsightsTimestamp(entry.surfacedAt),
    viewedAtText: formatInsightsTimestamp(entry.viewedAt),
    items: entry.items.map((item) => ({
      title: item.title,
      summary: item.summary,
      emphasis: item.emphasis,
    })),
  };
}

export function createInsightsDetailScreenViewData(
  vm: InsightsArchiveVM | null,
): InsightsDetailScreenViewData | null {
  if (!vm) {
    return null;
  }

  if (vm.availability.status === 'UNAVAILABLE') {
    return {
      title: 'Insights archive',
      summary:
        'A slightly deeper shelf for interpreted history. It remains selective, factual, and optional.',
      availabilityMessage: formatAvailabilityMessage(vm.availability.reason),
      continuityTitle: null,
      continuitySummary: null,
      continuityEntries: [],
      selectedSectionTitle: null,
      sectionOptions: [],
      items: [],
    };
  }

  const selectedSection =
    vm.availability.sections.find((section) => section.id === vm.selectedSectionId) ??
    vm.availability.sections[0] ??
    null;
  const continuityEntries =
    vm.sinceLastCheckedContinuity.status === 'AVAILABLE'
      ? vm.sinceLastCheckedContinuity.entries.map(createContinuityEntryViewData)
      : [];

  return {
    title: 'Insights archive',
    summary:
      'A slightly deeper shelf for interpreted history. It remains selective, factual, and optional.',
    availabilityMessage: null,
    continuityTitle: continuityEntries.length > 0 ? 'Since last checked continuity' : null,
    continuitySummary:
      continuityEntries.length > 0
        ? 'Snapshot clears after view, and continuity remains available here as calm interpreted context.'
        : null,
    continuityEntries,
    selectedSectionTitle: selectedSection?.title ?? null,
    sectionOptions: vm.availability.sections.map((section) => ({
      id: section.id,
      title: section.title,
      isSelected: section.id === selectedSection?.id,
    })),
    items: selectedSection ? selectedSection.items.map(createDetailCardViewData) : [],
  };
}
