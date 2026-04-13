import type { UserProfile } from '@/core/profile/types';
import type { AccountContextCandidate } from '@/services/accounts/types';
import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import { createSinceLastCheckedVM } from '@/services/orientation/createSinceLastCheckedVM';
import type { LastViewedState } from '@/services/orientation/lastViewedState';
import type { SinceLastCheckedAvailability } from '@/services/orientation/types';
import { fetchSnapshotVM, type SnapshotVM } from '@/services/snapshot/snapshotService';
import type { ForegroundScanResult } from '@/services/types/scan';

type FetchSinceLastCheckedVMParams = {
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
  lastViewedState?: Pick<LastViewedState, 'getLastViewedTimestamp'>;
};

export async function fetchSinceLastCheckedVM(
  params: FetchSinceLastCheckedVMParams,
): Promise<SinceLastCheckedAvailability> {
  if (params.snapshot) {
    return createSinceLastCheckedVM({
      snapshot: params.snapshot,
    });
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

  return createSinceLastCheckedVM({
    snapshot,
  });
}
