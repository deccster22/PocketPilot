import type { UserProfile } from '@/core/profile/types';
import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import type { LastViewedState } from '@/services/orientation/lastViewedState';
import { fetchSnapshotVM, type SnapshotVM } from '@/services/snapshot/snapshotService';
import type { ForegroundScanResult } from '@/services/types/scan';

import { createPreparedContextInputs } from './createPreparedContextInputs';
import { createStrategyFitSummary } from './createStrategyFitSummary';
import { createThirtyThousandFootVM } from './createThirtyThousandFootVM';
import type { ThirtyThousandFootVM } from './types';

export type ThirtyThousandFootSurface =
  | 'SNAPSHOT'
  | 'THIRTY_THOUSAND_FOOT'
  | 'DASHBOARD'
  | 'TRADE_HUB';

function createGeneratedAt(timestamp: number | null | undefined): string | null {
  if (timestamp === null || timestamp === undefined || Number.isNaN(timestamp)) {
    return null;
  }

  return new Date(timestamp).toISOString();
}

export async function fetchThirtyThousandFootVM(params: {
  surface?: ThirtyThousandFootSurface;
  snapshot?: SnapshotVM;
  profile?: UserProfile;
  baselineScan?: ForegroundScanResult;
  nowProvider?: () => number;
  includeDebugObservatory?: boolean;
  eventLedger?: EventLedgerService;
  eventLedgerQueries?: EventLedgerQueries;
  lastViewedTimestamp?: number;
  lastViewedState?: Pick<LastViewedState, 'getLastViewedTimestamp'>;
  fetchSnapshot?: typeof fetchSnapshotVM;
}): Promise<ThirtyThousandFootVM> {
  const fetchSnapshot = params.fetchSnapshot ?? fetchSnapshotVM;

  if (!params.snapshot && !params.profile) {
    throw new Error(
      'fetchThirtyThousandFootVM requires a profile when no prepared snapshot is supplied.',
    );
  }

  const snapshot =
    params.snapshot ??
    (await fetchSnapshot({
      profile: params.profile!,
      baselineScan: params.baselineScan,
      nowProvider: params.nowProvider,
      includeDebugObservatory: params.includeDebugObservatory,
      eventLedger: params.eventLedger,
      eventLedgerQueries: params.eventLedgerQueries,
      lastViewedTimestamp: params.lastViewedTimestamp,
      lastViewedState: params.lastViewedState,
    }));
  const contextInputs = createPreparedContextInputs({
    strategyAlignment:
      snapshot.orientationContext.currentState.strategyAlignment ?? snapshot.strategyAlignment,
    change24h: snapshot.model.core.change24h.value,
    currentState: snapshot.model.core.currentState.trendDirection,
    currentEvents: snapshot.eventStream.events,
    orientationContext: snapshot.orientationContext,
  });
  const fit = createStrategyFitSummary({
    contextInputs,
  });

  return createThirtyThousandFootVM({
    generatedAt: createGeneratedAt(snapshot.eventStream.timestamp),
    fit,
    contextInputs,
    surface: params.surface,
  });
}
