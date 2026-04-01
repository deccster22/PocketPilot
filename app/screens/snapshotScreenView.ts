import {
  createReorientationSummaryViewData,
  type ReorientationSummaryItemViewData,
} from '@/app/screens/reorientationSummaryView';
import type { SnapshotSurfaceVM } from '@/services/snapshot/fetchSnapshotSurfaceVM';

export type SnapshotScreenReorientationViewData =
  | {
      visible: false;
    }
  | {
      visible: true;
      dismissible: boolean;
      headline: string;
      inactiveDaysText: string;
      summaryItems: ReorientationSummaryItemViewData[];
    };

export type SnapshotScreenViewData = {
  currentStateLabel: string;
  currentStateValue: string;
  change24hLabel: string;
  change24hValue: string;
  strategyStatusLabel: string;
  strategyStatusValue: string;
  bundleName?: string;
  portfolioValueText?: string;
  reorientation: SnapshotScreenReorientationViewData;
};

export function createSnapshotScreenViewData(
  surface: SnapshotSurfaceVM | null,
): SnapshotScreenViewData | null {
  const model = surface?.snapshot.model;

  if (!model) {
    return null;
  }

  let reorientation: SnapshotScreenReorientationViewData = {
    visible: false,
  };

  if (
    surface.reorientation.status === 'VISIBLE' &&
    surface.reorientation.summary?.status === 'AVAILABLE'
  ) {
    const summaryView = createReorientationSummaryViewData(surface.reorientation.summary);

    if (summaryView.visible) {
      reorientation = {
        visible: true,
        dismissible: surface.reorientation.dismissible,
        headline: summaryView.headline,
        inactiveDaysText: summaryView.inactiveDaysText,
        summaryItems: summaryView.summaryItems,
      };
    }
  }

  return {
    currentStateLabel: model.core.currentState.label,
    currentStateValue: model.core.currentState.value,
    change24hLabel: model.core.change24h.label,
    change24hValue: `${(model.core.change24h.value * 100).toFixed(2)}%`,
    strategyStatusLabel: model.core.strategyStatus.label,
    strategyStatusValue: model.core.strategyStatus.value,
    bundleName: model.secondary?.bundleName,
    portfolioValueText:
      model.secondary?.portfolioValue === undefined
        ? undefined
        : model.secondary.portfolioValue.toFixed(2),
    reorientation,
  };
}
