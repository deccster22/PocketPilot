import type { ComparisonWindow, ComparisonWindowVM } from '@/services/insights/types';

export type ComparisonWindowOptionViewData = {
  id: ComparisonWindow;
  label: string;
  isSelected: boolean;
};

export type ComparisonItemViewData = {
  emphasisText: string;
  label: string;
  value: string;
};

export type InsightsCompareScreenViewData = {
  title: string;
  summary: string;
  availabilityMessage: string | null;
  windowOptions: ComparisonWindowOptionViewData[];
  comparisonTitle: string | null;
  comparisonSummary: string | null;
  items: ComparisonItemViewData[];
  limitations: string[];
};

const WINDOW_OPTIONS: ReadonlyArray<{
  id: ComparisonWindow;
  label: string;
}> = [
  {
    id: 'LAST_90_DAYS_VS_PREVIOUS_90_DAYS',
    label: 'Last 90 days',
  },
  {
    id: 'LAST_QUARTER_VS_PREVIOUS_QUARTER',
    label: 'Last quarter',
  },
  {
    id: 'LAST_YEAR_VS_PREVIOUS_YEAR',
    label: 'Last year',
  },
  {
    id: 'BEFORE_STRATEGY_CHANGE_VS_AFTER_STRATEGY_CHANGE',
    label: 'Strategy change',
  },
];

function formatAvailabilityMessage(
  reason: Extract<ComparisonWindowVM['availability'], { status: 'UNAVAILABLE' }>['reason'],
): string {
  switch (reason) {
    case 'NO_WINDOW_SELECTED':
      return 'Choose one bounded comparison window first.';
    case 'INSUFFICIENT_HISTORY':
      return 'There is not enough interpreted history in both sides of this window yet to form a calm comparison.';
    case 'UNSUPPORTED_WINDOW':
      return 'This window is not supported yet because the interpreted history spine does not record that boundary honestly.';
    default:
      return 'This comparison path is not enabled on this surface.';
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

function createWindowOptions(selectedWindow: ComparisonWindow): ComparisonWindowOptionViewData[] {
  return WINDOW_OPTIONS.map((option) => ({
    id: option.id,
    label: option.label,
    isSelected: option.id === selectedWindow,
  }));
}

export function createInsightsCompareScreenViewData(
  vm: ComparisonWindowVM | null,
  params: {
    selectedWindow: ComparisonWindow;
  },
): InsightsCompareScreenViewData | null {
  if (!vm) {
    return null;
  }

  if (vm.availability.status === 'UNAVAILABLE') {
    return {
      title: 'Compare windows',
      summary:
        'A calm look at one bounded window beside the prior matching window. It stays descriptive, selective, and non-judgmental.',
      availabilityMessage: formatAvailabilityMessage(vm.availability.reason),
      windowOptions: createWindowOptions(params.selectedWindow),
      comparisonTitle: null,
      comparisonSummary: null,
      items: [],
      limitations: [],
    };
  }

  return {
    title: 'Compare windows',
    summary:
      'A calm look at one bounded window beside the prior matching window. It stays descriptive, selective, and non-judgmental.',
    availabilityMessage: null,
    windowOptions: createWindowOptions(params.selectedWindow),
    comparisonTitle: vm.availability.title,
    comparisonSummary: vm.availability.summary,
    items: vm.availability.items.map((item) => ({
      emphasisText: formatEmphasisText(item.emphasis),
      label: item.label,
      value: item.value,
    })),
    limitations: [...vm.availability.limitations],
  };
}
