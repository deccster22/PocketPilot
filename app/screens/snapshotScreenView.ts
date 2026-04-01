import type { UserProfile } from '@/core/profile/types';
import {
  shouldClearPersistedReorientationDismissState,
  type ReorientationDismissState,
} from '@/services/orientation/reorientationPersistence';
import type { SnapshotBriefingKind } from '@/services/orientation/types';
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

export type SnapshotScreenBriefingItemViewData = {
  label: string;
  detail: string;
};

export type SnapshotScreenBriefingViewData =
  | {
      visible: false;
    }
  | {
      visible: true;
      kind: SnapshotBriefingKind;
      dismissible: boolean;
      title: string;
      subtitle?: string | null;
      items: SnapshotScreenBriefingItemViewData[];
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
  briefing: SnapshotScreenBriefingViewData;
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

  let briefing: SnapshotScreenBriefingViewData = {
    visible: false,
  };

  if (surface.briefing.status === 'VISIBLE') {
    briefing = {
      visible: true,
      kind: surface.briefing.kind,
      dismissible: surface.briefing.dismissible,
      title: surface.briefing.title,
      subtitle: surface.briefing.subtitle,
      items: surface.briefing.items.map((item) => ({
        label: item.label,
        detail: item.detail,
      })),
    };
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
    briefing,
  };
}
