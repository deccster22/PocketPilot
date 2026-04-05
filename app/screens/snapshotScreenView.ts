import type { UserProfile } from '@/core/profile/types';
import { fetchMessagePolicyVM } from '@/services/messages/fetchMessagePolicyVM';
import type {
  MessagePolicyAvailability,
  MessagePolicyKind,
  MessagePriority,
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
  message: SnapshotScreenMessageViewData;
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
  messagePolicy: MessagePolicyAvailability;
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
  const messagePolicy = await fetchMessagePolicy({
    surface: 'SNAPSHOT',
    profile: params.profile,
    snapshotSurface: surface,
  });

  return {
    surface,
    messagePolicy,
    nextBaselineScan: params.baselineScan ?? surface.snapshot.scan,
    shouldClearPersistedDismissState: shouldClearPersistedReorientationDismissState({
      summary: surface.reorientation.summary,
      dismissState: params.reorientationDismissState,
    }),
  };
}

export function createSnapshotScreenViewData(
  surface: SnapshotSurfaceVM | null,
  messagePolicy?: MessagePolicyAvailability | null,
): SnapshotScreenViewData | null {
  const model = surface?.snapshot.model;

  if (!model) {
    return null;
  }

  let message: SnapshotScreenMessageViewData = {
    visible: false,
  };

  if (messagePolicy?.status === 'AVAILABLE' && messagePolicy.messages[0]) {
    message = {
      visible: true,
      kind: messagePolicy.messages[0].kind,
      priority: messagePolicy.messages[0].priority,
      dismissible: messagePolicy.messages[0].dismissible,
      title: messagePolicy.messages[0].title,
      summary: messagePolicy.messages[0].summary,
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
    message,
  };
}
