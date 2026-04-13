import type {
  SelectedAccountAvailability,
  SelectedAccountContext,
} from '@/services/accounts/types';

export type SurfaceAccountContext = {
  selectedAccountContext: SelectedAccountAvailability;
  selectedAccount: SelectedAccountContext | null;
  selectedAccountId: string | null;
  selectedAccountPortfolioValue: number | null;
  selectedAccountBaseCurrency: string | null;
  riskContext:
    | {
        portfolioValue: number | null;
        baseCurrency: string | null;
      }
    | null;
};

function normalisePortfolioValue(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value;
}

export function createSurfaceAccountContext(params: {
  selectedAccountContext?: SelectedAccountAvailability | null;
  selectedAccountPortfolioValue?: number | null;
}): SurfaceAccountContext {
  if (params.selectedAccountContext?.status !== 'AVAILABLE') {
    return {
      selectedAccountContext:
        params.selectedAccountContext ?? {
          status: 'UNAVAILABLE',
          reason: 'NO_VALID_ACCOUNT_CONTEXT',
        },
      selectedAccount: null,
      selectedAccountId: null,
      selectedAccountPortfolioValue: null,
      selectedAccountBaseCurrency: null,
      riskContext: null,
    };
  }

  const selectedAccount = params.selectedAccountContext.account;
  const selectedAccountPortfolioValue = normalisePortfolioValue(
    params.selectedAccountPortfolioValue,
  );

  return {
    selectedAccountContext: params.selectedAccountContext,
    selectedAccount,
    selectedAccountId: selectedAccount.accountId,
    selectedAccountPortfolioValue,
    selectedAccountBaseCurrency: selectedAccount.baseCurrency,
    riskContext: {
      portfolioValue: selectedAccountPortfolioValue,
      baseCurrency: selectedAccount.baseCurrency,
    },
  };
}
