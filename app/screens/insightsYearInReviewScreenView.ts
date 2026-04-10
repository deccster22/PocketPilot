import type { YearInReviewVM } from '@/services/insights/types';

export type YearInReviewItemViewData = {
  emphasisText: string;
  label: string;
  value: string;
};

export type InsightsYearInReviewScreenViewData = {
  title: string;
  summary: string;
  availabilityMessage: string | null;
  reviewTitle: string | null;
  reviewSummary: string | null;
  items: YearInReviewItemViewData[];
  limitations: string[];
};

function formatAvailabilityMessage(
  reason: Extract<YearInReviewVM['availability'], { status: 'UNAVAILABLE' }>['reason'],
): string {
  switch (reason) {
    case 'NO_PERIOD_SELECTED':
      return 'A year needs to be selected before this review can be prepared.';
    case 'INSUFFICIENT_HISTORY':
      return 'There is not enough interpreted history in the last completed calendar year yet to form a calm annual debrief.';
    default:
      return 'This Year in Review path is not enabled on this surface.';
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

export function createInsightsYearInReviewScreenViewData(
  vm: YearInReviewVM | null,
): InsightsYearInReviewScreenViewData | null {
  if (!vm) {
    return null;
  }

  if (vm.availability.status === 'UNAVAILABLE') {
    return {
      title: 'Year in Review',
      summary:
        'A calm annual debrief built from the last completed calendar year. It stays descriptive, contextual, and non-judgmental.',
      availabilityMessage: formatAvailabilityMessage(vm.availability.reason),
      reviewTitle: null,
      reviewSummary: null,
      items: [],
      limitations: [],
    };
  }

  return {
    title: 'Year in Review',
    summary:
      'A calm annual debrief built from the last completed calendar year. It stays descriptive, contextual, and non-judgmental.',
    availabilityMessage: null,
    reviewTitle: vm.availability.title,
    reviewSummary: vm.availability.summary,
    items: vm.availability.items.map((item) => ({
      emphasisText: formatEmphasisText(item.emphasis),
      label: item.label,
      value: item.value,
    })),
    limitations: [...vm.availability.limitations],
  };
}
