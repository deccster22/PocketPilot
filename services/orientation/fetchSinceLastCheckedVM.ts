import type { UserProfile } from '@/core/profile/types';
import type { AccountContextCandidate } from '@/services/accounts/types';
import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import { createSinceLastCheckedVM } from '@/services/orientation/createSinceLastCheckedVM';
import { createSinceLastCheckedDisplayState } from '@/services/orientation/createSinceLastCheckedDisplayState';
import type { LastViewedState } from '@/services/orientation/lastViewedState';
import { markSinceLastCheckedViewed } from '@/services/orientation/sinceLastCheckedViewedState';
import type {
  SinceLastCheckedDisplayState,
  SinceLastCheckedSurface,
} from '@/services/orientation/types';
import { fetchSnapshotVM, type SnapshotVM } from '@/services/snapshot/snapshotService';
import type { ForegroundScanResult } from '@/services/types/scan';

type FetchSinceLastCheckedVMParams = {
  surface?: SinceLastCheckedSurface;
  snapshot?: Pick<SnapshotVM, 'model' | 'orientationContext'>;
  profile?: UserProfile;
  accounts?: ReadonlyArray<AccountContextCandidate>;
  selectedAccountId?: string | null;
  baselineScan?: ForegroundScanResult;
  nowProvider?: () => number;
  includeDebugObservatory?: boolean;
  eventLedger?: EventLedgerService;
  eventLedgerQueries?: EventLedgerQueries;
  lastViewedTimestamp?: number;
  lastViewedState?: Pick<LastViewedState, 'getLastViewedTimestamp' | 'setLastViewedTimestamp'>;
};

export async function fetchSinceLastCheckedVM(
  params: FetchSinceLastCheckedVMParams,
): Promise<SinceLastCheckedDisplayState> {
  if (params.snapshot) {
    const availability = createSinceLastCheckedVM({
      snapshot: params.snapshot,
      surface: params.surface ?? 'SNAPSHOT',
    });
    const displayState = createSinceLastCheckedDisplayState({
      snapshot: params.snapshot,
      surface: params.surface ?? 'SNAPSHOT',
      availability,
      lastViewedTimestamp: params.lastViewedTimestamp,
      lastViewedState: params.lastViewedState,
    });

    if (displayState.status === 'VISIBLE' && params.lastViewedState) {
      markSinceLastCheckedViewed({
        accountId: params.snapshot.orientationContext.accountId,
        nowProvider: params.nowProvider,
        lastViewedState: params.lastViewedState,
      });
    }

    return displayState;
  }

  if (!params.profile) {
    throw new Error('fetchSinceLastCheckedVM requires a snapshot or profile.');
  }

  const snapshot = await fetchSnapshotVM({
    profile: params.profile,
    accounts: params.accounts,
    selectedAccountId: params.selectedAccountId,
    baselineScan: params.baselineScan,
    nowProvider: params.nowProvider,
    includeDebugObservatory: params.includeDebugObservatory,
    eventLedger: params.eventLedger,
    eventLedgerQueries: params.eventLedgerQueries,
    lastViewedTimestamp: params.lastViewedTimestamp,
    lastViewedState: params.lastViewedState,
  });

  const availability = createSinceLastCheckedVM({
    snapshot,
    surface: params.surface ?? 'SNAPSHOT',
  });

  const displayState = createSinceLastCheckedDisplayState({
    snapshot,
    surface: params.surface ?? 'SNAPSHOT',
    availability,
    lastViewedTimestamp: params.lastViewedTimestamp,
    lastViewedState: params.lastViewedState,
  });

  if (displayState.status === 'VISIBLE' && params.lastViewedState) {
    markSinceLastCheckedViewed({
      accountId: snapshot.orientationContext.accountId,
      nowProvider: params.nowProvider,
      lastViewedState: params.lastViewedState,
    });
  }

  return displayState;
}
