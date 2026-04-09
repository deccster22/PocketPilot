export type AccountSelectionMode =
  | 'EXPLICIT'
  | 'PRIMARY_FALLBACK'
  | 'HIGHEST_VALUE_FALLBACK';

export type AccountContextCandidate = {
  id: string;
  displayName?: string | null;
  portfolioValue?: number | null;
  isPrimary?: boolean;
  baseCurrency?: string | null;
  strategyId?: string | null;
};

export type SelectedAccountContext = {
  accountId: string;
  displayName: string;
  selectionMode: AccountSelectionMode;
  baseCurrency: string | null;
  strategyId: string | null;
};

export type SelectedAccountAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_ACCOUNTS_AVAILABLE' | 'NO_VALID_ACCOUNT_CONTEXT';
    }
  | {
      status: 'AVAILABLE';
      account: SelectedAccountContext;
    };

