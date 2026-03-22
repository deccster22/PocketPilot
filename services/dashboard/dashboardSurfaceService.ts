import type { UserProfile } from '@/core/profile/types';
import type { MarketEvent } from '@/core/types/marketEvent';
import { createDashboardModel } from '@/services/dashboard/createDashboardModel';
import { createDashboardSurfaceModel } from '@/services/dashboard/createDashboardSurfaceModel';
import type { DashboardSurfaceModel } from '@/services/dashboard/types';
import { fetchSnapshotVM } from '@/services/snapshot/snapshotService';
import type { ForegroundScanResult } from '@/services/types/scan';

export type DashboardSurfaceVM = {
  model: DashboardSurfaceModel;
  scan: ForegroundScanResult;
};

function createDashboardEvents(events: ReadonlyArray<MarketEvent>): MarketEvent[] {
  return events.map((event) => ({
    ...event,
    signalsTriggered: [...event.signalsTriggered],
    metadata: { ...event.metadata },
  }));
}

export async function fetchDashboardSurfaceVM(params: {
  profile: UserProfile;
  baselineScan?: ForegroundScanResult;
  nowProvider?: () => number;
}): Promise<DashboardSurfaceVM> {
  const snapshot = await fetchSnapshotVM({
    profile: params.profile,
    baselineScan: params.baselineScan,
    nowProvider: params.nowProvider,
  });
  const dashboardModel = createDashboardModel({
    orientationContext: {
      profile: params.profile,
      assets: [],
    },
    events: createDashboardEvents(snapshot.marketEvents),
  });

  return {
    model: createDashboardSurfaceModel({
      model: dashboardModel,
      profile: params.profile,
    }),
    scan: snapshot.scan,
  };
}
