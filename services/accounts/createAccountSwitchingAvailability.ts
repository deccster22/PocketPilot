import type {
  AccountContextCandidate,
  AccountSwitchingAvailability,
  SelectedAccountAvailability,
  SwitchableAccountOption,
} from '@/services/accounts/types';

function normaliseOptionalText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function createSwitchableAccountOption(params: {
  account: AccountContextCandidate;
  selectedAccountId: string;
}): SwitchableAccountOption | null {
  const accountId = normaliseOptionalText(params.account.id);

  if (accountId === null) {
    return null;
  }

  return {
    accountId,
    displayName: normaliseOptionalText(params.account.displayName) ?? accountId,
    strategyId: normaliseOptionalText(params.account.strategyId),
    isPrimary: params.account.isPrimary === true,
    isSelected: accountId === params.selectedAccountId,
  };
}

function compareSwitchableAccountOption(
  left: SwitchableAccountOption,
  right: SwitchableAccountOption,
): number {
  if (left.isSelected !== right.isSelected) {
    return left.isSelected ? -1 : 1;
  }

  if (left.isPrimary !== right.isPrimary) {
    return left.isPrimary ? -1 : 1;
  }

  const displayNameDiff = left.displayName.localeCompare(right.displayName);

  if (displayNameDiff !== 0) {
    return displayNameDiff;
  }

  return left.accountId.localeCompare(right.accountId);
}

export function createAccountSwitchingAvailability(params: {
  accounts: ReadonlyArray<AccountContextCandidate>;
  selectedAccountAvailability: SelectedAccountAvailability;
  isEnabledForSurface?: boolean;
}): AccountSwitchingAvailability {
  if (params.isEnabledForSurface !== true) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    };
  }

  if (params.selectedAccountAvailability.status !== 'AVAILABLE') {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_SWITCHABLE_ACCOUNTS',
    };
  }

  const selectedAccountId = params.selectedAccountAvailability.account.accountId;
  const options = params.accounts
    .map((account) =>
      createSwitchableAccountOption({
        account,
        selectedAccountId,
      }),
    )
    .filter((option): option is SwitchableAccountOption => option !== null)
    .sort(compareSwitchableAccountOption);

  if (options.length <= 1) {
    return {
      status: 'UNAVAILABLE',
      reason: 'SINGLE_ACCOUNT_ONLY',
    };
  }

  const hasSelectedOption = options.some((option) => option.isSelected);

  if (!hasSelectedOption) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_SWITCHABLE_ACCOUNTS',
    };
  }

  return {
    status: 'AVAILABLE',
    selectedAccountId,
    options,
  };
}
