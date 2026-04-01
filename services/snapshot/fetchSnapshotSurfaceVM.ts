import type { UserProfile } from '@/core/profile/types';
import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import { createSnapshotBriefingState } from '@/services/orientation/createSnapshotBriefingState';
import { createReorientationSummaryFromSnapshot } from '@/services/orientation/createReorientationSummaryFromSnapshot';
import { createReorientationSurfaceState } from '@/services/orientation/createReorientationSurfaceState';
import type { LastViewedState } from '@/services/orientation/lastViewedState';
import {
  createReorientationVisibilityInput,
  type ReorientationDismissState,
} from '@/services/orientation/reorientationPersistence';
import type {
  ReorientationPreference,
  ReorientationVisibilityInput,
} from '@/services/orientation/types';
import { fetchSnapshotVM, type SnapshotVM } from '@/services/snapshot/snapshotService';
import type { ForegroundScanResult } from '@/services/types/scan';

export type SnapshotSurfaceVM = {
  snapshot: SnapshotVM;
  reorientation: ReturnType<typeof createReorientationSurfaceState>;
  briefing: ReturnType<typeof createSnapshotBriefingState>;
};

export async function fetchSnapshotSurfaceVM(params: {
  profile: UserProfile;
  baselineScan?: ForegroundScanResult;
  nowProvider?: () => number;
  includeDebugObservatory?: boolean;
  eventLedger?: EventLedgerService;
  eventLedgerQueries?: EventLedgerQueries;
  lastViewedTimestamp?: number;
  lastViewedState?: Pick<LastViewedState, 'getLastViewedTimestamp'>;
  preference?: ReorientationPreference;
  reorientationDismissState?: ReorientationDismissState;
  currentSessionDismissState?: ReorientationDismissState;
  reorientationVisibility?: ReorientationVisibilityInput;
}): Promise<SnapshotSurfaceVM> {
  const nowProvider = params.nowProvider ?? Date.now;
  const snapshot = await fetchSnapshotVM({
    profile: params.profile,
    baselineScan: params.baselineScan,
    nowProvider,
    includeDebugObservatory: params.includeDebugObservatory,
    eventLedger: params.eventLedger,
    eventLedgerQueries: params.eventLedgerQueries,
    lastViewedTimestamp: params.lastViewedTimestamp,
    lastViewedState: params.lastViewedState,
  });
  const summary = createReorientationSummaryFromSnapshot({
    snapshot,
    profile: params.profile,
    now: new Date(nowProvider()).toISOString(),
    preference: params.preference,
  });
  const reorientationVisibility =
    params.reorientationVisibility ??
    createReorientationVisibilityInput({
      summary,
      dismissState: params.reorientationDismissState,
      currentSessionDismissState: params.currentSessionDismissState,
    });
  const reorientation = createReorientationSurfaceState({
    summary,
    visibility: reorientationVisibility,
  });

  return {
    snapshot,
    reorientation,
    briefing: createSnapshotBriefingState({
      reorientation,
      snapshot,
    }),
  };
}
