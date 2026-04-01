import type {
  ReorientationEligibility,
  ReorientationVisibilityInput,
} from '@/services/orientation/types';

export type ReorientationDismissState = {
  dismissedAt: string | null;
};

export type ReorientationDismissStore = {
  load(): Promise<ReorientationDismissState>;
  save(state: ReorientationDismissState): Promise<void>;
  clear(): Promise<void>;
};

export const EMPTY_REORIENTATION_DISMISS_STATE: ReorientationDismissState = {
  dismissedAt: null,
};

export function createReorientationDismissState(
  summary: ReorientationEligibility | null | undefined,
): ReorientationDismissState {
  if (summary?.status !== 'AVAILABLE') {
    return EMPTY_REORIENTATION_DISMISS_STATE;
  }

  return {
    dismissedAt: summary.generatedFrom.now,
  };
}

export function shouldHonorPersistedReorientationDismissal(params: {
  summary: ReorientationEligibility | null | undefined;
  dismissState?: ReorientationDismissState | null;
}): boolean {
  if (params.summary?.status !== 'AVAILABLE') {
    return false;
  }

  const dismissedAt = params.dismissState?.dismissedAt;

  if (!dismissedAt) {
    return false;
  }

  return dismissedAt >= params.summary.generatedFrom.lastActiveAt;
}

export function shouldClearPersistedReorientationDismissState(params: {
  summary: ReorientationEligibility | null | undefined;
  dismissState?: ReorientationDismissState | null;
}): boolean {
  if (params.summary?.status !== 'AVAILABLE') {
    return false;
  }

  const dismissedAt = params.dismissState?.dismissedAt;

  if (!dismissedAt) {
    return false;
  }

  return dismissedAt < params.summary.generatedFrom.lastActiveAt;
}

export function createReorientationVisibilityInput(params: {
  summary: ReorientationEligibility;
  dismissState?: ReorientationDismissState | null;
  currentSessionDismissState?: ReorientationDismissState | null;
}): ReorientationVisibilityInput | undefined {
  const dismissedAt = shouldHonorPersistedReorientationDismissal({
    summary: params.summary,
    dismissState: params.dismissState,
  })
    ? params.dismissState?.dismissedAt ?? null
    : null;
  const currentSessionDismissedAt = shouldHonorPersistedReorientationDismissal({
    summary: params.summary,
    dismissState: params.currentSessionDismissState,
  })
    ? params.currentSessionDismissState?.dismissedAt ?? null
    : null;

  if (!currentSessionDismissedAt && !dismissedAt) {
    return undefined;
  }

  return {
    currentSessionDismissedAt,
    dismissedAt,
  };
}
