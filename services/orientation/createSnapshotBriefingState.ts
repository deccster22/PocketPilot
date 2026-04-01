import type { ReorientationSurfaceState } from '@/services/orientation/createReorientationSurfaceState';
import { createOrientationBriefingItems } from '@/services/orientation/createOrientationBriefingItems';
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

  const sinceLastChecked = params.snapshot.orientationContext.historyContext.sinceLastChecked;

  if (!sinceLastChecked || sinceLastChecked.summaryCount === 0) {
    return createHiddenState(!sinceLastChecked ? 'NO_REORIENTATION' : 'NO_SINCE_LAST_CHECKED');
  }

  const items = createOrientationBriefingItems({
    eventsSinceLastViewed: params.snapshot.orientationContext.historyContext.eventsSinceLastViewed,
    snapshotState: {
      currentState: params.snapshot.model.core.currentState.value,
      strategyStatus: params.snapshot.model.core.strategyStatus.value,
    },
  })
    .slice(0, MAX_BRIEFING_ITEMS)
    .map((item) => ({
      label: item.label,
      detail: item.detail,
    }));

  if (items.length === 0) {
    return createHiddenState('NO_MEANINGFUL_BRIEFING');
  }

  return {
    status: 'VISIBLE',
    kind: 'SINCE_LAST_CHECKED',
    title: 'Since last checked',
    subtitle: 'A calm read on the most meaningful interpreted changes since your last visit.',
    items,
    dismissible: false,
  };
}
