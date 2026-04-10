import type {
  AccountContextCandidate,
  AccountPortfolioPositionCandidate,
  AggregatePortfolioAsset,
  AggregatePortfolioAvailability,
} from '@/services/accounts/types';

type NormalisedPortfolioPosition = {
  symbol: string;
  amount: number | null;
  value: number | null;
};

type NormalisedAccountPortfolio = {
  totalValue: number | null;
  currency: string | null;
  positions: ReadonlyArray<NormalisedPortfolioPosition>;
};

function normaliseOptionalText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normaliseFiniteNumber(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }

  return value;
}

function normaliseSymbol(symbol: string | null | undefined): string | null {
  const normalised = normaliseOptionalText(symbol);
  return normalised === null ? null : normalised.toUpperCase();
}

function roundAggregateNumber(value: number): number {
  return Number(value.toFixed(12));
}

function normalisePortfolioPosition(
  position: AccountPortfolioPositionCandidate,
): NormalisedPortfolioPosition | null {
  const symbol = normaliseSymbol(position.symbol);

  if (symbol === null) {
    return null;
  }

  const amount = normaliseFiniteNumber(position.amount);
  const value = normaliseFiniteNumber(position.value);

  if (amount === null && value === null) {
    return null;
  }

  return {
    symbol,
    amount,
    value,
  };
}

function normaliseAccountPortfolio(
  account: AccountContextCandidate,
): NormalisedAccountPortfolio | null {
  if (normaliseOptionalText(account.id) === null) {
    return null;
  }

  const totalValue = normaliseFiniteNumber(account.portfolio?.totalValue ?? account.portfolioValue);
  const positions = (account.portfolio?.positions ?? [])
    .map(normalisePortfolioPosition)
    .filter((position): position is NormalisedPortfolioPosition => position !== null);

  if (totalValue === null && positions.length === 0) {
    return null;
  }

  return {
    totalValue,
    currency: normaliseOptionalText(account.portfolio?.currency ?? account.baseCurrency),
    positions,
  };
}

function resolveAggregateCurrency(
  accounts: ReadonlyArray<NormalisedAccountPortfolio>,
): string | null {
  const valueCurrencies = accounts.reduce((currencies, account) => {
    const hasValuedData =
      account.totalValue !== null || account.positions.some((position) => position.value !== null);

    if (!hasValuedData) {
      return currencies;
    }

    currencies.add(account.currency ?? '');
    return currencies;
  }, new Set<string>());

  if (valueCurrencies.size !== 1) {
    return null;
  }

  const [currency] = [...valueCurrencies];
  return currency.length > 0 ? currency : null;
}

function compareAggregateAssets(
  left: AggregatePortfolioAsset,
  right: AggregatePortfolioAsset,
): number {
  const leftValue = left.value ?? Number.NEGATIVE_INFINITY;
  const rightValue = right.value ?? Number.NEGATIVE_INFINITY;

  if (leftValue !== rightValue) {
    return rightValue - leftValue;
  }

  const leftAmount = left.amount ?? Number.NEGATIVE_INFINITY;
  const rightAmount = right.amount ?? Number.NEGATIVE_INFINITY;

  if (leftAmount !== rightAmount) {
    return rightAmount - leftAmount;
  }

  return left.symbol.localeCompare(right.symbol);
}

function createAggregateAssets(params: {
  accounts: ReadonlyArray<NormalisedAccountPortfolio>;
  totalValue: number | null;
  canAggregateValues: boolean;
}): AggregatePortfolioAsset[] {
  const assetMap = new Map<
    string,
    {
      amount: number;
      value: number;
      hasAmount: boolean;
      hasValue: boolean;
    }
  >();

  for (const account of params.accounts) {
    for (const position of account.positions) {
      const current = assetMap.get(position.symbol) ?? {
        amount: 0,
        value: 0,
        hasAmount: false,
        hasValue: false,
      };

      if (position.amount !== null) {
        current.amount += position.amount;
        current.hasAmount = true;
      }

      if (params.canAggregateValues && position.value !== null) {
        current.value += position.value;
        current.hasValue = true;
      }

      assetMap.set(position.symbol, current);
    }
  }

  return [...assetMap.entries()]
    .map(([symbol, value]) => {
      const assetValue = value.hasValue ? roundAggregateNumber(value.value) : null;

      return {
        symbol,
        amount: value.hasAmount ? roundAggregateNumber(value.amount) : null,
        value: assetValue,
        weightPct:
          assetValue !== null && params.totalValue !== null && params.totalValue > 0
            ? (assetValue / params.totalValue) * 100
            : null,
      };
    })
    .sort(compareAggregateAssets);
}

export function createAggregatePortfolioContext(params: {
  accounts: ReadonlyArray<AccountContextCandidate>;
}): AggregatePortfolioAvailability {
  if (params.accounts.length === 0) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_ACCOUNTS_AVAILABLE',
    };
  }

  const aggregateAccounts = params.accounts
    .map(normaliseAccountPortfolio)
    .filter((account): account is NormalisedAccountPortfolio => account !== null);

  if (aggregateAccounts.length === 0) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_AGGREGATABLE_PORTFOLIO_DATA',
    };
  }

  const currency = resolveAggregateCurrency(aggregateAccounts);
  const canAggregateValues = currency !== null;
  const totalValue =
    canAggregateValues && aggregateAccounts.some((account) => account.totalValue !== null)
      ? roundAggregateNumber(
          aggregateAccounts.reduce((sum, account) => sum + (account.totalValue ?? 0), 0),
        )
      : null;
  const assets = createAggregateAssets({
    accounts: aggregateAccounts,
    totalValue,
    canAggregateValues,
  });

  if (totalValue === null && assets.length === 0) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_AGGREGATABLE_PORTFOLIO_DATA',
    };
  }

  return {
    status: 'AVAILABLE',
    portfolio: {
      totalValue,
      currency,
      accountCount: aggregateAccounts.length,
      assets,
    },
  };
}
