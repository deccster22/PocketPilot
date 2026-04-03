import type { UserProfile } from '@/core/profile/types';
import { createDashboardModel } from '@/services/dashboard/createDashboardModel';
import { createDashboardSurfaceModel } from '@/services/dashboard/createDashboardSurfaceModel';
import { fetchDashboardData } from '@/services/dashboard/dashboardDataService';
import { fetchDashboardExplanationVM } from '@/services/dashboard/fetchDashboardExplanationVM';
import type { DashboardSurfaceModel } from '@/services/dashboard/types';
import type { ExplanationAvailability } from '@/services/explanation/types';
import type { ForegroundScanResult } from '@/services/types/scan';

export type DashboardSurfaceVM = {
  model: DashboardSurfaceModel;
  scan: ForegroundScanResult;
  explanation: ExplanationAvailability;
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
  const surfaceModel = createDashboardSurfaceModel({
    model: dashboardModel,
    profile: params.profile,
  });

  return {
    model: surfaceModel,
    scan: dashboardData.scan,
    explanation: fetchDashboardExplanationVM({
      surfaceModel,
      events: dashboardData.events,
      explanationContext: dashboardData.explanationContext,
    }),
  };
}
