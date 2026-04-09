import type { UserProfile } from '@/core/profile/types';
import {
  filterAccountScopedItems,
  scopeOrientationContextToSelectedAccount,
} from '@/services/accounts/enforceAccountScopedTruth';
import { createDashboardModel } from '@/services/dashboard/createDashboardModel';
import { createDashboardSurfaceModel } from '@/services/dashboard/createDashboardSurfaceModel';
import { fetchDashboardData } from '@/services/dashboard/dashboardDataService';
import { fetchDashboardExplanationVM } from '@/services/dashboard/fetchDashboardExplanationVM';
import type { DashboardSurfaceModel } from '@/services/dashboard/types';
import type { ExplanationAvailability } from '@/services/explanation/types';
import type { ForegroundScanResult } from '@/services/types/scan';

export type DashboardSurfaceVM = {
  accountContext: Awaited<ReturnType<typeof fetchDashboardData>>['accountContext'];
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
  const scopedEvents =
    dashboardData.accountContext.status === 'AVAILABLE'
      ? filterAccountScopedItems({
          selectedAccount: dashboardData.accountContext.account,
          items: dashboardData.events,
        })
      : dashboardData.events;
  const scopedExplanationContext =
    dashboardData.accountContext.status === 'AVAILABLE'
      ? scopeOrientationContextToSelectedAccount({
          selectedAccount: dashboardData.accountContext.account,
          orientationContext: dashboardData.explanationContext,
        })
      : dashboardData.explanationContext;
  const dashboardModel = createDashboardModel({
    orientationContext: dashboardData.orientationContext,
    events: scopedEvents,
  });
  const surfaceModel = createDashboardSurfaceModel({
    model: dashboardModel,
    profile: params.profile,
  });

  return {
    accountContext: dashboardData.accountContext,
    model: surfaceModel,
    scan: dashboardData.scan,
    explanation: fetchDashboardExplanationVM({
      surfaceModel,
      events: scopedEvents,
      explanationContext: scopedExplanationContext,
    }),
  };
}
