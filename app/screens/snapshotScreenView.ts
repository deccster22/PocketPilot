import type { UserProfile } from '@/core/profile/types';
import {
  shouldClearPersistedReorientationDismissState,
  type ReorientationDismissState,
} from '@/services/orientation/reorientationPersistence';
import {
  createReorientationSummaryViewData,
  type ReorientationSummaryItemViewData,
} from '@/app/screens/reorientationSummaryView';
import {
  fetchSnapshotSurfaceVM,
  type SnapshotSurfaceVM,
} from '@/services/snapshot/fetchSnapshotSurfaceVM';

export type SnapshotRefreshSource = 'INITIAL_MOUNT' | 'FOREGROUND_RETURN';

export type SnapshotRefreshState = {
  lastRefreshSource: SnapshotRefreshSource;
  isRefreshing: boolean;
};

type SnapshotAppStateStatus = 'active' | 'background' | 'inactive' | 'unknown' | 'extension';

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

export function shouldRefreshSnapshotOnAppForegroundTransition(
  previousAppState: SnapshotAppStateStatus | null | undefined,
  nextAppState: SnapshotAppStateStatus,
): boolean {
  return (
    nextAppState === 'active' &&
    (previousAppState === 'background' || previousAppState === 'inactive')
  );
}

export async function refreshSnapshotScreenSurface(params: {
  profile: UserProfile;
  baselineScan?: SnapshotSurfaceVM['snapshot']['scan'];
  includeDebugObservatory?: boolean;
  reorientationDismissState: ReorientationDismissState;
  currentSessionDismissState: ReorientationDismissState;
  fetchSnapshotSurface?: typeof fetchSnapshotSurfaceVM;
}): Promise<{
  surface: SnapshotSurfaceVM;
  nextBaselineScan: SnapshotSurfaceVM['snapshot']['scan'];
  shouldClearPersistedDismissState: boolean;
}> {
  const fetchSnapshotSurface = params.fetchSnapshotSurface ?? fetchSnapshotSurfaceVM;
  const surface = await fetchSnapshotSurface({
    profile: params.profile,
    baselineScan: params.baselineScan,
    includeDebugObservatory: params.includeDebugObservatory,
    reorientationDismissState: params.reorientationDismissState,
    currentSessionDismissState: params.currentSessionDismissState,
  });

  return {
    surface,
    nextBaselineScan: params.baselineScan ?? surface.snapshot.scan,
    shouldClearPersistedDismissState: shouldClearPersistedReorientationDismissState({
      summary: surface.reorientation.summary,
      dismissState: params.reorientationDismissState,
    }),
  };
}

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
