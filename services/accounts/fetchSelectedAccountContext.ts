import {
  applyPrimaryAccountPreference,
  defaultAccountPreferenceStore,
} from '@/services/accounts/accountPreferenceStore';
import { createAccountSwitchingAvailability } from '@/services/accounts/createAccountSwitchingAvailability';
import { resolveSelectedAccountContext } from '@/services/accounts/resolveSelectedAccountContext';
import type {
  AccountContextCandidate,
  AccountPreferenceStore,
  SelectedAccountAvailability,
} from '@/services/accounts/types';

export async function fetchSelectedAccountContext(params: {
  accounts: ReadonlyArray<AccountContextCandidate>;
  selectedAccountId?: string | null;
  accountPreferenceStore?: Pick<AccountPreferenceStore, 'load'>;
  isSwitchingEnabledForSurface?: boolean;
}): Promise<SelectedAccountAvailability> {
  const accountPreferenceStore =
    params.accountPreferenceStore ?? defaultAccountPreferenceStore;
  const preferenceState = await accountPreferenceStore.load();
  const effectiveAccounts = applyPrimaryAccountPreference({
    accounts: params.accounts,
    primaryAccountId: preferenceState.primaryAccountId,
  });
  const selectedAccountAvailability = resolveSelectedAccountContext({
    accounts: effectiveAccounts,
    selectedAccountId:
      params.selectedAccountId === undefined
        ? preferenceState.selectedAccountId
        : params.selectedAccountId,
  });

  return {
    ...selectedAccountAvailability,
    switching: createAccountSwitchingAvailability({
      accounts: effectiveAccounts,
      selectedAccountAvailability,
      isEnabledForSurface: params.isSwitchingEnabledForSurface,
    }),
  };
}
