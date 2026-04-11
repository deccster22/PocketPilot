import type { JournalEntryVM } from '@/services/insights/types';

export type InsightsJournalScreenViewData = {
  title: string;
  summary: string;
  availabilityMessage: string | null;
  noteTitle: string | null;
  linkageLabel: string | null;
  updatedAtLabel: string | null;
  body: string | null;
  emptyStateTitle: string | null;
  emptyStateSummary: string | null;
  primaryActionLabel: string | null;
  editorTitle: string | null;
  editorPlaceholder: string | null;
  submitActionLabel: string | null;
};

function formatAvailabilityMessage(
  reason: Extract<JournalEntryVM['availability'], { status: 'UNAVAILABLE' }>['reason'],
): string {
  switch (reason) {
    case 'NO_JOURNAL_CONTEXT':
      return 'A journal note is not attached to this reflection context yet.';
    default:
      return 'This journal note path is not enabled on this surface.';
  }
}

export function createInsightsJournalScreenViewData(
  vm: JournalEntryVM | null,
): InsightsJournalScreenViewData | null {
  if (!vm) {
    return null;
  }

  if (vm.availability.status === 'UNAVAILABLE') {
    return {
      title: 'Journal',
      summary:
        'A small optional note lane for reflection context. It stays text-only, private, and under your control.',
      availabilityMessage: formatAvailabilityMessage(vm.availability.reason),
      noteTitle: vm.title,
      linkageLabel: vm.linkageLabel,
      updatedAtLabel: null,
      body: null,
      emptyStateTitle: null,
      emptyStateSummary: null,
      primaryActionLabel: null,
      editorTitle: null,
      editorPlaceholder: null,
      submitActionLabel: null,
    };
  }

  const entry = vm.availability.entry;

  return {
    title: 'Journal',
    summary:
      'A small optional note lane for reflection context. It stays text-only, private, and under your control.',
    availabilityMessage: null,
    noteTitle: entry?.title ?? vm.title,
    linkageLabel: entry?.linkageLabel ?? vm.linkageLabel,
    updatedAtLabel: entry?.updatedAtLabel ?? null,
    body: entry?.body ?? null,
    emptyStateTitle: entry ? null : 'No note saved yet',
    emptyStateSummary: entry
      ? null
      : 'Add a few lines if you want a small reflection note attached to this context. Leaving it blank is fine.',
    primaryActionLabel: entry ? 'Edit note' : 'Write note',
    editorTitle: entry ? 'Edit note' : 'Write note',
    editorPlaceholder: 'Add a small note in your own words. PocketPilot will not rewrite it.',
    submitActionLabel: entry ? 'Update note' : 'Save note',
  };
}
