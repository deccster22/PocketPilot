import type { ReflectionComparisonVM } from '@/services/insights/types';

import { formatInsightsTimestamp } from './insightsViewFormatting';

export type ReflectionComparisonWindowViewData = {
  id: string;
  label: string;
  title: string;
  rangeText: string | null;
};

export type ReflectionSummaryCardViewData = {
  emphasisText: string;
  title: string;
  summary: string;
};

export type InsightsReflectionScreenViewData = {
  title: string;
  summary: string;
  availabilityMessage: string | null;
  windows: ReflectionComparisonWindowViewData[];
  items: ReflectionSummaryCardViewData[];
  limitations: string[];
};

function formatAvailabilityMessage(reason: Extract<
  ReflectionComparisonVM['availability'],
  { status: 'UNAVAILABLE' }
>['reason']): string {
  switch (reason) {
    case 'NO_COMPARABLE_HISTORY':
      return 'There are not yet two comparable interpreted slices to place side by side.';
    case 'INSUFFICIENT_INTERPRETED_HISTORY':
      return 'There is not enough interpreted history yet to form a calm comparison.';
    default:
      return 'This comparison path is not enabled on this surface.';
  }
}

function formatComparisonRange(startAt: string | null, endAt: string | null): string | null {
  const startText = formatInsightsTimestamp(startAt);
  const endText = formatInsightsTimestamp(endAt);

  if (!startText && !endText) {
    return null;
  }

  if (startText && endText && startText !== endText) {
    return `${startText} to ${endText}`;
  }

  return endText ?? startText;
}

function formatEmphasisText(emphasis: 'SHIFT' | 'STABLE' | 'CONTEXT'): string {
  switch (emphasis) {
    case 'SHIFT':
      return 'Shift';
    case 'STABLE':
      return 'Stable';
    default:
      return 'Context';
  }
}

export function createInsightsReflectionScreenViewData(
  vm: ReflectionComparisonVM | null,
): InsightsReflectionScreenViewData | null {
  if (!vm) {
    return null;
  }

  if (vm.availability.status === 'UNAVAILABLE') {
    return {
      title: 'Recent comparison',
      summary:
        'A brief comparison between two interpreted slices. It stays factual, selective, and non-judgmental.',
      availabilityMessage: formatAvailabilityMessage(vm.availability.reason),
      windows: [],
      items: [],
      limitations: [],
    };
  }

  return {
    title: 'Recent comparison',
    summary:
      'A brief comparison between two interpreted slices. It stays factual, selective, and non-judgmental.',
    availabilityMessage: null,
    windows: [
      {
        id: vm.availability.leftWindow.id,
        label: 'Newer window',
        title: vm.availability.leftWindow.title,
        rangeText: formatComparisonRange(
          vm.availability.leftWindow.startAt,
          vm.availability.leftWindow.endAt,
        ),
      },
      {
        id: vm.availability.rightWindow.id,
        label: 'Earlier window',
        title: vm.availability.rightWindow.title,
        rangeText: formatComparisonRange(
          vm.availability.rightWindow.startAt,
          vm.availability.rightWindow.endAt,
        ),
      },
    ],
    items: vm.availability.items.map((item) => ({
      emphasisText: formatEmphasisText(item.emphasis),
      title: item.title,
      summary: item.summary,
    })),
    limitations: [...vm.availability.limitations],
  };
}
