import type {
  ReorientationEligibility,
  ReorientationVisibilityInput,
} from '@/services/orientation/types';

export type ReorientationSurfaceState = {
  status: 'HIDDEN' | 'VISIBLE';
  reason: 'NOT_NEEDED' | 'DISMISSED' | 'AVAILABLE';
  summary: ReorientationEligibility | null;
  dismissible: boolean;
};

function isDismissed(visibility?: ReorientationVisibilityInput): boolean {
  return Boolean(visibility?.currentSessionDismissedAt || visibility?.dismissedAt);
}

export function createReorientationSurfaceState(params: {
  summary: ReorientationEligibility;
  visibility?: ReorientationVisibilityInput;
}): ReorientationSurfaceState {
  if (params.summary.status !== 'AVAILABLE') {
    return {
      status: 'HIDDEN',
      reason: 'NOT_NEEDED',
      summary: null,
      dismissible: false,
    };
  }

  if (isDismissed(params.visibility)) {
    return {
      status: 'HIDDEN',
      reason: 'DISMISSED',
      summary: params.summary,
      dismissible: true,
    };
  }

  return {
    status: 'VISIBLE',
    reason: 'AVAILABLE',
    summary: params.summary,
    dismissible: true,
  };
}
