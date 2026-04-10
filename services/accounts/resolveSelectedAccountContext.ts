import type {
  AccountContextCandidate,
  AccountSelectionMode,
  SelectedAccountAvailability,
  SelectedAccountContext,
} from '@/services/accounts/types';

type NormalisedAccountCandidate = {
  accountId: string;
  displayName: string;
  portfolioValue: number;
  isPrimary: boolean;
  baseCurrency: string | null;
  strategyId: string | null;
};

function normaliseOptionalText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalisePortfolioValue(value: number | null | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }

  return value;
}

function normaliseAccountCandidate(
  account: AccountContextCandidate,
): NormalisedAccountCandidate | null {
  const accountId = normaliseOptionalText(account.id);

  if (accountId === null) {
    return null;
  }

  return {
    accountId,
    displayName: normaliseOptionalText(account.displayName) ?? accountId,
    portfolioValue: normalisePortfolioValue(
      account.portfolioValue ?? account.portfolio?.totalValue,
    ),
    isPrimary: account.isPrimary === true,
    baseCurrency: normaliseOptionalText(account.baseCurrency),
    strategyId: normaliseOptionalText(account.strategyId),
  };
}

function compareHighestValueAccount(
  left: NormalisedAccountCandidate,
  right: NormalisedAccountCandidate,
): number {
  const portfolioDiff = right.portfolioValue - left.portfolioValue;

  if (portfolioDiff !== 0) {
    return portfolioDiff;
  }

  return left.accountId.localeCompare(right.accountId);
}

function selectHighestValueAccount(
  accounts: ReadonlyArray<NormalisedAccountCandidate>,
): NormalisedAccountCandidate | null {
  return [...accounts].sort(compareHighestValueAccount)[0] ?? null;
}

function toSelectedAccountContext(
  account: NormalisedAccountCandidate,
  selectionMode: AccountSelectionMode,
): SelectedAccountContext {
  return {
    accountId: account.accountId,
    displayName: account.displayName,
    selectionMode,
    baseCurrency: account.baseCurrency,
    strategyId: account.strategyId,
  };
}

export function resolveSelectedAccountContext(params: {
  accounts: ReadonlyArray<AccountContextCandidate>;
  selectedAccountId?: string | null;
}): SelectedAccountAvailability {
  if (params.accounts.length === 0) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_ACCOUNTS_AVAILABLE',
    };
  }

  const availableAccounts = params.accounts
    .map(normaliseAccountCandidate)
    .filter((account): account is NormalisedAccountCandidate => account !== null);

  if (availableAccounts.length === 0) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_VALID_ACCOUNT_CONTEXT',
    };
  }

  const explicitSelectedAccountId = normaliseOptionalText(params.selectedAccountId);

  if (explicitSelectedAccountId !== null) {
    const explicitAccount = availableAccounts.find(
      (account) => account.accountId === explicitSelectedAccountId,
    );

    if (explicitAccount) {
      return {
        status: 'AVAILABLE',
        account: toSelectedAccountContext(explicitAccount, 'EXPLICIT'),
      };
    }
  }

  const primaryAccounts = availableAccounts.filter((account) => account.isPrimary);

  if (primaryAccounts.length === 1) {
    return {
      status: 'AVAILABLE',
      account: toSelectedAccountContext(primaryAccounts[0], 'PRIMARY_FALLBACK'),
    };
  }

  const fallbackAccount = selectHighestValueAccount(availableAccounts);

  if (!fallbackAccount) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_VALID_ACCOUNT_CONTEXT',
    };
  }

  return {
    status: 'AVAILABLE',
    account: toSelectedAccountContext(fallbackAccount, 'HIGHEST_VALUE_FALLBACK'),
  };
}
