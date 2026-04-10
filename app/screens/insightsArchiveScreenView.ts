import type { ReflectionPeriod, SummaryArchiveVM } from '@/services/insights/types';

export type SummaryArchiveEntryViewData = {
  archiveId: string;
  period: ReflectionPeriod;
  periodLabel: string;
  title: string;
  summary: string;
  coveredRangeLabel: string;
  generatedAtLabel: string | null;
  actionLabel: string;
};

export type InsightsArchiveScreenViewData = {
  title: string;
  summary: string;
  availabilityMessage: string | null;
  entries: SummaryArchiveEntryViewData[];
};

function formatAvailabilityMessage(
  reason: Extract<SummaryArchiveVM['availability'], { status: 'UNAVAILABLE' }>['reason'],
): string {
  switch (reason) {
    case 'NO_ARCHIVED_SUMMARIES':
      return 'No archived period summaries are available to revisit yet.';
    default:
      return 'This summary archive path is not enabled on this surface.';
  }
}

function formatPeriodLabel(period: ReflectionPeriod): string {
  return period === 'LAST_MONTH' ? 'Monthly summary' : 'Quarterly summary';
}

export function createInsightsArchiveScreenViewData(
  vm: SummaryArchiveVM | null,
): InsightsArchiveScreenViewData | null {
  if (!vm) {
    return null;
  }

  if (vm.availability.status === 'UNAVAILABLE') {
    return {
      title: 'Summary archive',
      summary:
        'A quiet shelf for prepared monthly and quarterly readbacks. It stays descriptive, contextual, and optional.',
      availabilityMessage: formatAvailabilityMessage(vm.availability.reason),
      entries: [],
    };
  }

  return {
    title: 'Summary archive',
    summary:
      'A quiet shelf for prepared monthly and quarterly readbacks. It stays descriptive, contextual, and optional.',
    availabilityMessage: null,
    entries: vm.availability.entries.map((entry) => ({
      archiveId: entry.archiveId,
      period: entry.period,
      periodLabel: formatPeriodLabel(entry.period),
      title: entry.title,
      summary: entry.summary,
      coveredRangeLabel: entry.coveredRangeLabel,
      generatedAtLabel: entry.generatedAtLabel,
      actionLabel: 'Open summary',
    })),
  };
}
