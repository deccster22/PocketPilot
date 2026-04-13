import type { UserProfile } from '@/core/profile/types';
import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import { fetchThirtyThousandFootVM } from '@/services/context/fetchThirtyThousandFootVM';
import type { ThirtyThousandFootVM } from '@/services/context/types';
import { createSnapshotBriefingState } from '@/services/orientation/createSnapshotBriefingState';
import { createSinceLastCheckedVM } from '@/services/orientation/createSinceLastCheckedVM';
import { fetchSinceLastCheckedVM } from '@/services/orientation/fetchSinceLastCheckedVM';
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
  sinceLastChecked?: ReturnType<typeof createSinceLastCheckedVM>;
  sinceLastCheckedDisplay?: Awaited<ReturnType<typeof fetchSinceLastCheckedVM>>;
  reorientation: ReturnType<typeof createReorientationSurfaceState>;
  briefing: ReturnType<typeof createSnapshotBriefingState>;
  thirtyThousandFoot: ThirtyThousandFootVM;
};

export async function fetchSnapshotSurfaceVM(params: {
  profile: UserProfile;
  baselineScan?: ForegroundScanResult;
  nowProvider?: () => number;
  includeDebugObservatory?: boolean;
  eventLedger?: EventLedgerService;
  eventLedgerQueries?: EventLedgerQueries;
  lastViewedTimestamp?: number;
  lastViewedState?: Pick<LastViewedState, 'getLastViewedTimestamp' | 'setLastViewedTimestamp'>;
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
  const sinceLastChecked = createSinceLastCheckedVM({
    snapshot,
  });
  const sinceLastCheckedDisplay = await fetchSinceLastCheckedVM({
    surface: 'SNAPSHOT',
    snapshot,
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
  const thirtyThousandFoot = await fetchThirtyThousandFootVM({
    snapshot,
    surface: 'SNAPSHOT',
  });

  return {
    snapshot,
    sinceLastChecked,
    reorientation,
    briefing: createSnapshotBriefingState({
      reorientation,
      snapshot,
      sinceLastChecked,
    }),
    sinceLastCheckedDisplay,
    thirtyThousandFoot,
  };
}
