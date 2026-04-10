import type { PeriodSummaryVM, ReflectionPeriod } from '@/services/insights/types';

export type PeriodSummaryOptionViewData = {
  id: ReflectionPeriod;
  label: string;
  isSelected: boolean;
};

export type PeriodSummaryItemViewData = {
  emphasisText: string;
  label: string;
  value: string;
};

export type InsightsSummaryScreenViewData = {
  title: string;
  summary: string;
  availabilityMessage: string | null;
  periodOptions: PeriodSummaryOptionViewData[];
  periodTitle: string | null;
  periodSummary: string | null;
  items: PeriodSummaryItemViewData[];
  limitations: string[];
};

const PERIOD_OPTIONS: ReadonlyArray<{
  id: ReflectionPeriod;
  label: string;
}> = [
  {
    id: 'LAST_MONTH',
    label: 'Last month',
  },
  {
    id: 'LAST_QUARTER',
    label: 'Last quarter',
  },
];

function formatAvailabilityMessage(
  reason: Extract<PeriodSummaryVM['availability'], { status: 'UNAVAILABLE' }>['reason'],
): string {
  switch (reason) {
    case 'NO_PERIOD_SELECTED':
      return 'Choose a period to review first.';
    case 'INSUFFICIENT_HISTORY':
      return 'There is not enough interpreted history in this period yet to form a calm summary.';
    default:
      return 'This period-summary path is not enabled on this surface.';
  }
}

function formatEmphasisText(emphasis: 'NEUTRAL' | 'SHIFT' | 'CONTEXT'): string {
  switch (emphasis) {
    case 'SHIFT':
      return 'Change';
    case 'CONTEXT':
      return 'Context';
    default:
      return 'Note';
  }
}

function createPeriodOptions(selectedPeriod: ReflectionPeriod): PeriodSummaryOptionViewData[] {
  return PERIOD_OPTIONS.map((option) => ({
    id: option.id,
    label: option.label,
    isSelected: option.id === selectedPeriod,
  }));
}

export function createInsightsSummaryScreenViewData(
  vm: PeriodSummaryVM | null,
  params: {
    selectedPeriod: ReflectionPeriod;
  },
): InsightsSummaryScreenViewData | null {
  if (!vm) {
    return null;
  }

  if (vm.availability.status === 'UNAVAILABLE') {
    return {
      title: 'Period summaries',
      summary:
        'A calm monthly or quarterly readback built from interpreted history. It stays descriptive, selective, and non-judgmental.',
      availabilityMessage: formatAvailabilityMessage(vm.availability.reason),
      periodOptions: createPeriodOptions(params.selectedPeriod),
      periodTitle: null,
      periodSummary: null,
      items: [],
      limitations: [],
    };
  }

  return {
    title: 'Period summaries',
    summary:
      'A calm monthly or quarterly readback built from interpreted history. It stays descriptive, selective, and non-judgmental.',
    availabilityMessage: null,
    periodOptions: createPeriodOptions(params.selectedPeriod),
    periodTitle: vm.availability.title,
    periodSummary: vm.availability.summary,
    items: vm.availability.items.map((item) => ({
      emphasisText: formatEmphasisText(item.emphasis),
      label: item.label,
      value: item.value,
    })),
    limitations: [...vm.availability.limitations],
  };
}
