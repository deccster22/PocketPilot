import type { UserProfile } from '@/core/profile/types';
import type { MarketEvent } from '@/core/types/marketEvent';
import { fetchSurfaceContext } from '@/services/upstream/fetchSurfaceContext';
import type { ForegroundScanResult } from '@/services/types/scan';

import type { OrientationContext } from './types';

export type DashboardData = {
  scan: ForegroundScanResult;
  events: MarketEvent[];
  orientationContext: OrientationContext;
};

function cloneDashboardEvents(events: ReadonlyArray<MarketEvent>): MarketEvent[] {
  return events.map((event) => ({
    ...event,
    signalsTriggered: [...event.signalsTriggered],
    metadata: { ...event.metadata },
  }));
}

export async function fetchDashboardData(params: {
  profile: UserProfile;
  baselineScan?: ForegroundScanResult;
  nowProvider?: () => number;
}): Promise<DashboardData> {
  const upstream = await fetchSurfaceContext(params);

  return {
    scan: upstream.scan,
    events: cloneDashboardEvents(upstream.marketEvents),
    orientationContext: {
      profile: params.profile,
      assets: [],
    },
  };
}
