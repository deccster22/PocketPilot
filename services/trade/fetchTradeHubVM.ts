import type { UserProfile } from '@/core/profile/types';
import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import type { LastViewedState } from '@/services/orientation/lastViewedState';
import { createProtectionPlans } from '@/services/trade/createProtectionPlans';
import { createTradeHubSurfaceModel } from '@/services/trade/createTradeHubSurfaceModel';
import type { TradeHubSurfaceModel } from '@/services/trade/types';
import type { ForegroundScanResult } from '@/services/types/scan';
import { fetchSurfaceContext } from '@/services/upstream/fetchSurfaceContext';

export type TradeHubVM = {
  model: TradeHubSurfaceModel;
  scan: ForegroundScanResult;
};

export async function fetchTradeHubVM(params: {
  profile: UserProfile;
  baselineScan?: ForegroundScanResult;
  nowProvider?: () => number;
  eventLedger?: EventLedgerService;
  eventLedgerQueries?: EventLedgerQueries;
  lastViewedTimestamp?: number;
  lastViewedState?: Pick<LastViewedState, 'getLastViewedTimestamp'>;
}): Promise<TradeHubVM> {
  const upstream = await fetchSurfaceContext({
    profile: params.profile,
    baselineScan: params.baselineScan,
    nowProvider: params.nowProvider,
    eventLedger: params.eventLedger,
    eventLedgerQueries: params.eventLedgerQueries,
    lastViewedTimestamp: params.lastViewedTimestamp,
    lastViewedState: params.lastViewedState,
  });
  const protectionPlans = createProtectionPlans({
    orientationContext: upstream.orientationContext,
    marketEvents: upstream.marketEvents,
  });

  return {
    model: createTradeHubSurfaceModel({
      profile: params.profile,
      protectionPlans,
    }),
    scan: upstream.scan,
  };
}
