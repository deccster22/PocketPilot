import type { UserProfile } from '@/core/profile/types';
import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import type { LastViewedState } from '@/services/orientation/lastViewedState';
import { createConfirmationFlow } from '@/services/trade/createConfirmationFlow';
import { createConfirmationFlowActions } from '@/services/trade/createConfirmationFlowActions';
import { fetchTradePlanConfirmationVM } from '@/services/trade/fetchTradePlanConfirmationVM';
import type { ConfirmationFlow, ConfirmationFlowActions } from '@/services/trade/types';
import type { ForegroundScanResult } from '@/services/types/scan';

export type ConfirmationFlowVM = {
  confirmationFlow: ConfirmationFlow | null;
  actions: ConfirmationFlowActions | null;
  selectedPlanId: string | null;
  scan: ForegroundScanResult;
};

export async function fetchConfirmationFlowVM(params: {
  profile: UserProfile;
  selectedPlanId?: string;
  baselineScan?: ForegroundScanResult;
  nowProvider?: () => number;
  eventLedger?: EventLedgerService;
  eventLedgerQueries?: EventLedgerQueries;
  lastViewedTimestamp?: number;
  lastViewedState?: Pick<LastViewedState, 'getLastViewedTimestamp'>;
}): Promise<ConfirmationFlowVM> {
  const confirmationVm = await fetchTradePlanConfirmationVM(params);

  return {
    confirmationFlow: confirmationVm.confirmationShell
      ? createConfirmationFlow({ shell: confirmationVm.confirmationShell })
      : null,
    actions: confirmationVm.confirmationShell
      ? createConfirmationFlowActions({ shell: confirmationVm.confirmationShell })
      : null,
    selectedPlanId: confirmationVm.selectedPlanId,
    scan: confirmationVm.scan,
  };
}
