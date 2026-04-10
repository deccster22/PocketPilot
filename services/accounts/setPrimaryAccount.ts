import {
  defaultAccountPreferenceStore,
  normaliseAccountPreferenceState,
} from '@/services/accounts/accountPreferenceStore';
import type {
  AccountPreferenceStore,
  PrimaryAccountUpdateResult,
  SwitchableAccountOption,
} from '@/services/accounts/types';

function normaliseOptionalText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function setPrimaryAccount(params: {
  options: ReadonlyArray<SwitchableAccountOption>;
  accountId: string;
  accountPreferenceStore?: Pick<AccountPreferenceStore, 'load' | 'save'>;
}): Promise<PrimaryAccountUpdateResult> {
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

  if (matchedOption.isPrimary) {
    return {
      status: 'UNCHANGED',
    };
  }

  const accountPreferenceStore =
    params.accountPreferenceStore ?? defaultAccountPreferenceStore;
  const currentState = normaliseAccountPreferenceState(await accountPreferenceStore.load());

  await accountPreferenceStore.save({
    ...currentState,
    primaryAccountId: matchedOption.accountId,
  });

  return {
    status: 'UPDATED',
    accountId: matchedOption.accountId,
  };
}
