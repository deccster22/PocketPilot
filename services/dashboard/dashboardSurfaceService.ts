import { createDashboardModel } from '@/services/dashboard/createDashboardModel';
import { createDashboardSurfaceModel } from '@/services/dashboard/createDashboardSurfaceModel';
import { fetchDashboardData } from '@/services/dashboard/dashboardDataService';
import type { DashboardSurfaceModel } from '@/services/dashboard/types';
import type { UserProfile } from '@/core/profile/types';
import type { ForegroundScanResult } from '@/services/types/scan';

export type DashboardSurfaceVM = {
  model: DashboardSurfaceModel;
  scan: ForegroundScanResult;
};

export async function fetchDashboardSurfaceVM(params: {
  profile: UserProfile;
  baselineScan?: ForegroundScanResult;
  nowProvider?: () => number;
}): Promise<DashboardSurfaceVM> {
  const dashboardData = await fetchDashboardData(params);
  const dashboardModel = createDashboardModel({
    orientationContext: dashboardData.orientationContext,
    events: dashboardData.events,
  });

  return {
    model: createDashboardSurfaceModel({
      model: dashboardModel,
      profile: params.profile,
    }),
    scan: dashboardData.scan,
  };
}
