import {
  enforceAccountScopedTruth,
  filterAccountScopedItems,
} from '@/services/accounts/enforceAccountScopedTruth';
import type { SelectedAccountAvailability } from '@/services/accounts/types';

import type { ProtectionPlan } from './types';

export function selectAccountScopedProtectionPlans(params: {
  selectedAccountContext?: SelectedAccountAvailability;
  protectionPlans: ReadonlyArray<ProtectionPlan>;
}): ProtectionPlan[] {
  if (params.selectedAccountContext?.status !== 'AVAILABLE') {
    return [...params.protectionPlans];
  }

  const scopedPlans = filterAccountScopedItems({
    selectedAccount: params.selectedAccountContext.account,
    items: params.protectionPlans,
  });

  return enforceAccountScopedTruth({
    label: 'Risk and execution support',
    selectedAccount: params.selectedAccountContext.account,
    accountIds: scopedPlans.map((plan) => plan.accountId),
    value: scopedPlans,
  });
}
