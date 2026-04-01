import type { ReorientationEligibility } from '@/services/orientation/types';

export type ReorientationSummaryItemViewData = {
  label: string;
  detail: string;
};

export type ReorientationSummaryViewData =
  | {
      visible: false;
    }
  | {
      visible: true;
      headline: string;
      inactiveDaysText: string;
      summaryItems: ReorientationSummaryItemViewData[];
    };

export function createReorientationSummaryViewData(
  summary: ReorientationEligibility,
): ReorientationSummaryViewData {
  if (summary.status !== 'AVAILABLE') {
    return {
      visible: false,
    };
  }

  return {
    visible: true,
    headline: summary.headline,
    inactiveDaysText: `${summary.inactiveDays} days since your last active session`,
    summaryItems: summary.summaryItems.map((item) => ({
      label: item.label,
      detail: item.detail,
    })),
  };
}
