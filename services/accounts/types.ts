export type AccountSelectionMode =
  | 'EXPLICIT'
  | 'PRIMARY_FALLBACK'
  | 'HIGHEST_VALUE_FALLBACK';

export type AccountPortfolioPositionCandidate = {
  symbol: string;
  amount?: number | null;
  value?: number | null;
};

export type AccountPortfolioSnapshotCandidate = {
  totalValue?: number | null;
  currency?: string | null;
  positions?: ReadonlyArray<AccountPortfolioPositionCandidate> | null;
};

export type AccountContextCandidate = {
  id: string;
  displayName?: string | null;
  portfolioValue?: number | null;
  isPrimary?: boolean;
  baseCurrency?: string | null;
  strategyId?: string | null;
  portfolio?: AccountPortfolioSnapshotCandidate | null;
};

export type SelectedAccountContext = {
  accountId: string;
  displayName: string;
  selectionMode: AccountSelectionMode;
  baseCurrency: string | null;
  strategyId: string | null;
};

export type SwitchableAccountOption = {
  accountId: string;
  displayName: string;
  strategyId: string | null;
  isPrimary: boolean;
  isSelected: boolean;
};

export type AccountSwitchingAvailability =
  | {
      status: 'UNAVAILABLE';
      reason:
        | 'SINGLE_ACCOUNT_ONLY'
        | 'NO_SWITCHABLE_ACCOUNTS'
        | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      selectedAccountId: string;
      options: ReadonlyArray<SwitchableAccountOption>;
    };

export type SelectedAccountSwitchResult =
  | { status: 'UNCHANGED'; accountId: string }
  | { status: 'UPDATED'; accountId: string }
  | { status: 'REJECTED'; reason: 'ACCOUNT_NOT_FOUND' | 'INVALID_ACCOUNT' };

export type PrimaryAccountUpdateResult =
  | { status: 'UNCHANGED' }
  | { status: 'UPDATED'; accountId: string }
  | { status: 'REJECTED'; reason: 'ACCOUNT_NOT_FOUND' | 'INVALID_ACCOUNT' };

export type AccountPreferenceState = {
  selectedAccountId: string | null;
  primaryAccountId: string | null;
};

export type AccountPreferenceStore = {
  load(): Promise<AccountPreferenceState>;
  save(state: AccountPreferenceState): Promise<void>;
};

export type SelectedAccountAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_ACCOUNTS_AVAILABLE' | 'NO_VALID_ACCOUNT_CONTEXT';
      switching?: AccountSwitchingAvailability;
    }
  | {
      status: 'AVAILABLE';
      account: SelectedAccountContext;
      switching?: AccountSwitchingAvailability;
    };

export type AggregatePortfolioAsset = {
  symbol: string;
  amount: number | null;
  value: number | null;
  weightPct: number | null;
};

export type AggregatePortfolioContext = {
  totalValue: number | null;
  currency: string | null;
  accountCount: number;
  assets: ReadonlyArray<AggregatePortfolioAsset>;
};

export type AggregatePortfolioAvailability =
  | {
      status: 'UNAVAILABLE';
      reason:
        | 'NO_ACCOUNTS_AVAILABLE'
        | 'NO_AGGREGATABLE_PORTFOLIO_DATA'
        | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      portfolio: AggregatePortfolioContext;
    };
