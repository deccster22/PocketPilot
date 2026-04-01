import type { UserProfile } from '@/core/profile/types';
import type { EventLedgerEntry } from '@/core/types/eventLedger';
import type { AlignmentState, MarketEvent } from '@/core/types/marketEvent';
import {
  buildDebugObservatoryPayload,
  type DebugObservatoryPayload,
} from '@/services/debug/debugObservatoryService';
import type { SinceLastCheckedPayload } from '@/services/events/createSinceLastChecked';
import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import type { EventStream } from '@/services/events/eventStream';
import type { OrientationContext } from '@/services/orientation/createOrientationContext';
import type { LastViewedState } from '@/services/orientation/lastViewedState';
import { createProfileAwareSnapshotModel } from '@/services/snapshot/createProfileAwareSnapshotModel';
import { createSnapshotModel } from '@/services/snapshot/createSnapshotModel';
import type { SnapshotModel } from '@/services/snapshot/types';
import type { ForegroundScanResult } from '@/services/types/scan';
import { fetchSurfaceContext, type SurfaceContext } from '@/services/upstream/fetchSurfaceContext';

export type SnapshotVM = {
  model: SnapshotModel;
  // Legacy bridge fields remain aligned during the SnapshotModel transition.
  portfolioValue: number;
  change24h: number;
  strategyAlignment: string;
  bundleName: string;
  scan: ForegroundScanResult;
  signals: SurfaceContext['signals'];
  marketEvents: MarketEvent[];
  eventStream: EventStream;
  orientationContext: OrientationContext;
  eventsSinceLastViewed?: EventLedgerEntry[];
  sinceLastChecked?: SinceLastCheckedPayload;
  debugObservatory?: DebugObservatoryPayload;
};

export function formatAlignmentState(alignmentState: AlignmentState): string {
  switch (alignmentState) {
    case 'NEEDS_REVIEW':
      return 'Needs review';
    case 'WATCHFUL':
      return 'Watchful';
    default:
      return 'Aligned';
  }
}

export async function fetchSnapshotVM(params: {
  profile: UserProfile;
  baselineScan?: ForegroundScanResult;
  nowProvider?: () => number;
  includeDebugObservatory?: boolean;
  eventLedger?: EventLedgerService;
  eventLedgerQueries?: EventLedgerQueries;
  lastViewedTimestamp?: number;
  lastViewedState?: Pick<LastViewedState, 'getLastViewedTimestamp'>;
}): Promise<SnapshotVM> {
  const nowProvider = params.nowProvider ?? Date.now;
  const upstream = await fetchSurfaceContext({
    profile: params.profile,
    baselineScan: params.baselineScan,
    nowProvider,
    eventLedger: params.eventLedger,
    eventLedgerQueries: params.eventLedgerQueries,
    lastViewedTimestamp: params.lastViewedTimestamp,
    lastViewedState: params.lastViewedState,
  });
  const baseSnapshotModel = createSnapshotModel({
    profile: params.profile,
    scan: upstream.scan,
    bundleName: upstream.bundleName,
    portfolioValue: upstream.portfolioValue,
    change24h: upstream.change24h,
    strategyAlignment: upstream.strategyAlignment,
    sinceLastChecked: upstream.sinceLastChecked,
  });
  const debugObservatory = params.includeDebugObservatory
    ? buildDebugObservatoryPayload({
        timestampMs: upstream.scan.quoteMeta.timestampMs,
        symbols: upstream.scan.symbols,
        quotes: upstream.scan.quotes,
        quoteMeta: upstream.scan.quoteMeta,
        deltas: upstream.scan.pctChangeBySymbol,
        strategySignals: upstream.signals,
        marketEvents: upstream.eventStream.events,
        eventLedger: upstream.eventLedger,
        accountId: upstream.scan.accountId,
        snapshot: {
          portfolioValue: upstream.portfolioValue,
          change24h: upstream.change24h,
          strategyAlignment: upstream.strategyAlignment,
          bundleName: upstream.bundleName,
          accountId: upstream.scan.accountId,
        },
      })
    : undefined;

  const snapshotModel = createProfileAwareSnapshotModel({
    profile: params.profile,
    model: baseSnapshotModel,
  });

  return {
    model: snapshotModel,
    portfolioValue: upstream.portfolioValue,
    change24h: upstream.change24h,
    strategyAlignment: upstream.strategyAlignment,
    bundleName: upstream.bundleName,
    scan: upstream.scan,
    signals: upstream.signals,
    marketEvents: upstream.marketEvents,
    eventStream: upstream.eventStream,
    orientationContext: upstream.orientationContext,
    eventsSinceLastViewed: upstream.eventsSinceLastViewed,
    sinceLastChecked: upstream.sinceLastChecked,
    debugObservatory,
  };
}
