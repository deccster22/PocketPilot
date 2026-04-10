import {
  defaultAccountPreferenceStore,
  normaliseAccountPreferenceState,
} from '@/services/accounts/accountPreferenceStore';
import type {
  AccountPreferenceStore,
  SelectedAccountSwitchResult,
  SwitchableAccountOption,
} from '@/services/accounts/types';

function normaliseOptionalText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function switchSelectedAccount(params: {
  options: ReadonlyArray<SwitchableAccountOption>;
  accountId: string;
  accountPreferenceStore?: Pick<AccountPreferenceStore, 'load' | 'save'>;
}): Promise<SelectedAccountSwitchResult> {
  const accountId = normaliseOptionalText(params.accountId);

  if (accountId === null) {
    return {
      status: 'REJECTED',
      reason: 'INVALID_ACCOUNT',
    };
  }

  const matchedOption = params.options.find((option) => option.accountId === accountId);

  if (!matchedOption) {
    return {
      status: 'REJECTED',
      reason: 'ACCOUNT_NOT_FOUND',
    };
  }

  if (matchedOption.isSelected) {
    return {
      status: 'UNCHANGED',
      accountId: matchedOption.accountId,
    };
  }

  const accountPreferenceStore =
    params.accountPreferenceStore ?? defaultAccountPreferenceStore;
  const currentState = normaliseAccountPreferenceState(await accountPreferenceStore.load());

  await accountPreferenceStore.save({
    ...currentState,
    selectedAccountId: matchedOption.accountId,
  });

  return {
    status: 'UPDATED',
    accountId: matchedOption.accountId,
  };
}
