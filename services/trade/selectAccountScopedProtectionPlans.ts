import {
  enforceAccountScopedTruth,
  filterAccountScopedItems,
} from '@/services/accounts/enforceAccountScopedTruth';
import { createSurfaceAccountContext } from '@/services/accounts/createSurfaceAccountContext';
import type { SelectedAccountAvailability } from '@/services/accounts/types';

import type { ProtectionPlan } from './types';

export function selectAccountScopedProtectionPlans(params: {
  selectedAccountContext?: SelectedAccountAvailability;
  protectionPlans: ReadonlyArray<ProtectionPlan>;
}): ProtectionPlan[] {
  const selectedAccountContext = createSurfaceAccountContext({
    selectedAccountContext: params.selectedAccountContext,
  });

  if (!selectedAccountContext.selectedAccount) {
    return [...params.protectionPlans];
  }

  const scopedPlans = filterAccountScopedItems({
    selectedAccount: selectedAccountContext.selectedAccount,
    items: params.protectionPlans,
  });

  return enforceAccountScopedTruth({
    label: 'Risk and execution support',
    selectedAccount: selectedAccountContext.selectedAccount,
    accountIds: scopedPlans.map((plan) => plan.accountId),
    value: scopedPlans,
  });
}
