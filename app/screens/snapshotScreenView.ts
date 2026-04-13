import type { UserProfile } from '@/core/profile/types';
import { fetchMessagePolicyVM } from '@/services/messages/fetchMessagePolicyVM';
import type {
  MessagePolicyLane,
  MessagePolicyKind,
  MessagePriority,
  MessageRationaleAvailability,
} from '@/services/messages/types';
import {
  shouldClearPersistedReorientationDismissState,
  type ReorientationDismissState,
} from '@/services/orientation/reorientationPersistence';
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

export type SnapshotScreenSinceLastCheckedItemViewData = {
  title: string;
  summary: string;
  emphasis: 'NEUTRAL' | 'CHANGE' | 'CONTEXT';
};

export type SnapshotScreenSinceLastCheckedViewData =
  | {
      visible: false;
    }
  | {
      visible: true;
      title: string;
      summary: string;
      items: ReadonlyArray<SnapshotScreenSinceLastCheckedItemViewData>;
    };

export type SnapshotScreenMessageViewData =
  | {
      visible: false;
    }
  | {
      visible: true;
      kind: MessagePolicyKind;
      priority: MessagePriority;
      dismissible: boolean;
      title: string;
      summary: string;
      rationale: MessageRationaleAvailability;
    };

export type SnapshotScreenThirtyThousandFootViewData =
  | {
      visible: false;
    }
  | {
      visible: true;
      title: string;
      summary: string;
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
  sinceLastChecked: SnapshotScreenSinceLastCheckedViewData;
  message: SnapshotScreenMessageViewData;
  thirtyThousandFoot: SnapshotScreenThirtyThousandFootViewData;
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
  fetchMessagePolicy?: typeof fetchMessagePolicyVM;
}): Promise<{
  surface: SnapshotSurfaceVM;
  messagePolicyLane: MessagePolicyLane;
  nextBaselineScan: SnapshotSurfaceVM['snapshot']['scan'];
  shouldClearPersistedDismissState: boolean;
}> {
  const fetchSnapshotSurface = params.fetchSnapshotSurface ?? fetchSnapshotSurfaceVM;
  const fetchMessagePolicy = params.fetchMessagePolicy ?? fetchMessagePolicyVM;
  const surface = await fetchSnapshotSurface({
    profile: params.profile,
    baselineScan: params.baselineScan,
    includeDebugObservatory: params.includeDebugObservatory,
    reorientationDismissState: params.reorientationDismissState,
    currentSessionDismissState: params.currentSessionDismissState,
  });
  const messagePolicyLane = await fetchMessagePolicy({
    surface: 'SNAPSHOT',
    profile: params.profile,
    snapshotSurface: surface,
  });

  return {
    surface,
    messagePolicyLane,
    nextBaselineScan: params.baselineScan ?? surface.snapshot.scan,
    shouldClearPersistedDismissState: shouldClearPersistedReorientationDismissState({
      summary: surface.reorientation.summary,
      dismissState: params.reorientationDismissState,
    }),
  };
}

export function createSnapshotScreenViewData(
  surface: SnapshotSurfaceVM | null,
  messagePolicyLane?: MessagePolicyLane | null,
): SnapshotScreenViewData | null {
  const model = surface?.snapshot.model;

  if (!model) {
    return null;
  }

  let message: SnapshotScreenMessageViewData = {
    visible: false,
  };

  const policyAvailability = messagePolicyLane?.policyAvailability;

  if (policyAvailability?.status === 'AVAILABLE' && policyAvailability.messages[0]) {
    const visibleMessage = policyAvailability.messages[0];

    message = {
      visible: true,
      kind: visibleMessage.kind,
      priority: visibleMessage.priority,
      dismissible: visibleMessage.dismissible,
      title: visibleMessage.title,
      summary: visibleMessage.summary,
      rationale: messagePolicyLane?.rationaleAvailability ?? policyAvailability.rationale,
    };
  }

  const thirtyThousandFoot =
    surface?.thirtyThousandFoot.availability.status === 'AVAILABLE'
      ? {
          visible: true as const,
          title: surface.thirtyThousandFoot.availability.title,
          summary: surface.thirtyThousandFoot.availability.summary,
        }
      : {
          visible: false as const,
        };

  const sinceLastChecked =
    surface?.sinceLastChecked?.status === 'AVAILABLE'
      ? {
          visible: true as const,
          title: surface.sinceLastChecked.title,
          summary: surface.sinceLastChecked.summary,
          items: surface.sinceLastChecked.items.map((item) => ({
            title: item.title,
            summary: item.summary,
            emphasis: item.emphasis,
          })),
        }
      : {
          visible: false as const,
        };

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
    sinceLastChecked,
    message,
    thirtyThousandFoot,
  };
}
