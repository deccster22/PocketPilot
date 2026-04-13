import type { ReorientationSurfaceState } from '@/services/orientation/createReorientationSurfaceState';
import { createSinceLastCheckedVM } from '@/services/orientation/createSinceLastCheckedVM';
import type { SnapshotBriefingState } from '@/services/orientation/types';
import type { SnapshotVM } from '@/services/snapshot/snapshotService';

const MAX_BRIEFING_ITEMS = 3;

function createHiddenState(
  reason: 'NO_REORIENTATION' | 'NO_SINCE_LAST_CHECKED' | 'NO_MEANINGFUL_BRIEFING',
): SnapshotBriefingState {
  return {
    status: 'HIDDEN',
    reason,
  };
}

export function createSnapshotBriefingState(params: {
  reorientation: ReorientationSurfaceState;
  snapshot: Pick<SnapshotVM, 'model' | 'orientationContext'>;
  sinceLastChecked?: ReturnType<typeof createSinceLastCheckedVM> | null;
}): SnapshotBriefingState {
  if (params.reorientation.summary?.status === 'AVAILABLE') {
    if (params.reorientation.status === 'VISIBLE') {
      return {
        status: 'VISIBLE',
        kind: 'REORIENTATION',
        title: 'Welcome back',
        subtitle: params.reorientation.summary.headline,
        items: params.reorientation.summary.summaryItems.map((item) => ({
          label: item.label,
          detail: item.detail,
        })),
        dismissible: params.reorientation.dismissible,
      };
    }

    return createHiddenState('NO_MEANINGFUL_BRIEFING');
  }

  const sinceLastChecked =
    params.sinceLastChecked ?? createSinceLastCheckedVM({ snapshot: params.snapshot });

  if (sinceLastChecked.status !== 'AVAILABLE') {
    return createHiddenState(
      params.snapshot.orientationContext.historyContext.sinceLastChecked
        ? 'NO_SINCE_LAST_CHECKED'
        : 'NO_REORIENTATION',
    );
  }

  return {
    status: 'VISIBLE',
    kind: 'SINCE_LAST_CHECKED',
    title: sinceLastChecked.title,
    subtitle: sinceLastChecked.summary,
    items: sinceLastChecked.items.slice(0, MAX_BRIEFING_ITEMS).map((item) => ({
      label: item.title,
      detail: item.summary,
    })),
    dismissible: false,
  };
}
