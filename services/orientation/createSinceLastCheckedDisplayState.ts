import type { LastViewedState } from '@/services/orientation/lastViewedState';
import { createSinceLastCheckedVM } from '@/services/orientation/createSinceLastCheckedVM';
import { resolveSinceLastCheckedViewedTimestamp } from '@/services/orientation/sinceLastCheckedViewedState';
import type {
  SinceLastCheckedAvailability,
  SinceLastCheckedDisplayState,
  SinceLastCheckedDisplayHiddenReason,
  SinceLastCheckedSurface,
} from '@/services/orientation/types';
import type { SnapshotVM } from '@/services/snapshot/snapshotService';

function createHiddenState(reason: SinceLastCheckedDisplayHiddenReason): SinceLastCheckedDisplayState {
  return {
    status: 'HIDDEN',
    reason,
  };
}

export function createSinceLastCheckedDisplayState(params: {
  snapshot: Pick<SnapshotVM, 'model' | 'orientationContext'>;
  surface?: SinceLastCheckedSurface;
  availability?: SinceLastCheckedAvailability;
  lastViewedTimestamp?: number;
  lastViewedState?: Pick<LastViewedState, 'getLastViewedTimestamp'>;
}): SinceLastCheckedDisplayState {
  const surface = params.surface ?? 'SNAPSHOT';
  const availability =
    params.availability ??
    createSinceLastCheckedVM({
      snapshot: params.snapshot,
      surface,
    });

  if (availability.status === 'AVAILABLE') {
    return {
      status: 'VISIBLE',
      title: availability.title,
      summary: availability.summary,
      items: availability.items,
    };
  }

  if (availability.reason === 'NO_MEANINGFUL_CHANGES') {
    const viewedTimestamp = resolveSinceLastCheckedViewedTimestamp({
      accountId: params.snapshot.orientationContext.accountId,
      lastViewedTimestamp: params.lastViewedTimestamp,
      lastViewedState: params.lastViewedState,
    });

    if (viewedTimestamp !== undefined) {
      return createHiddenState('ALREADY_VIEWED');
    }
  }

  return createHiddenState(availability.reason);
}
