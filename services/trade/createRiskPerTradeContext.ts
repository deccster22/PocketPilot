import type {
  ProtectionPlan,
  RiskBasis,
  RiskPerTradeContext,
} from '@/services/trade/types';

type AccountRiskContext = {
  portfolioValue: number | null;
  baseCurrency: string | null;
};

function normalisePositiveNumber(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value;
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatCurrency(value: number, currency: string | null): string {
  if (!currency) {
    return value.toFixed(2);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatReferencePath(params: {
  entryPrice: number;
  stopPrice: number;
  currency: string | null;
}): string {
  return `${formatCurrency(params.entryPrice, params.currency)} entry to ${formatCurrency(
    params.stopPrice,
    params.currency,
  )} stop`;
}

function createUnavailableContext(params: {
  basis: RiskBasis;
  headline: string;
  summary: string;
  reason: RiskPerTradeContext['reason'];
  items: RiskPerTradeContext['items'];
}): RiskPerTradeContext {
  return {
    status: 'UNAVAILABLE',
    basis: params.basis,
    headline: params.headline,
    summary: params.summary,
    items: params.items,
    reason: params.reason,
  };
}

function createPriceReferenceContext(params: {
  selectedBasis: RiskBasis;
  accountContext: AccountRiskContext | null | undefined;
  plan: ProtectionPlan;
}):
  | {
      entryPrice: number;
      stopPrice: number;
      stopDistance: number;
      maxPositionSize: number;
      accountValue: number | null;
      currency: string | null;
      positionValue: number | null;
      maxLoss: number | null;
      accountPercentLoss: number | null;
      positionPercentLoss: number | null;
    }
  | null {
  const entryPrice = normalisePositiveNumber(params.plan.preparedRiskReferences?.entryPrice);
  const stopPrice = normalisePositiveNumber(params.plan.preparedRiskReferences?.stopPrice);
  const maxPositionSize = normalisePositiveNumber(params.plan.constraints.maxPositionSize);

  if (
    entryPrice === null ||
    stopPrice === null ||
    maxPositionSize === null ||
    entryPrice === stopPrice
  ) {
    return null;
  }

  const accountValue = normalisePositiveNumber(params.accountContext?.portfolioValue);
  const stopDistance = Math.abs(entryPrice - stopPrice);
  const positionValue = accountValue === null ? null : accountValue * maxPositionSize;
  const positionUnits = positionValue === null ? null : positionValue / entryPrice;
  const maxLoss = positionUnits === null ? null : positionUnits * stopDistance;
  const accountPercentLoss =
    maxLoss === null || accountValue === null ? null : (maxLoss / accountValue) * 100;
  const positionPercentLoss =
    maxLoss === null || positionValue === null ? null : (maxLoss / positionValue) * 100;

  return {
    entryPrice,
    stopPrice,
    stopDistance,
    maxPositionSize,
    accountValue,
    currency: params.accountContext?.baseCurrency ?? null,
    positionValue,
    maxLoss,
    accountPercentLoss,
    positionPercentLoss,
  };
}

function createAccountPercentContext(params: {
  selectedBasis: RiskBasis;
  priceContext: NonNullable<ReturnType<typeof createPriceReferenceContext>> | null;
}): RiskPerTradeContext {
  if (params.priceContext === null) {
    return createUnavailableContext({
      basis: params.selectedBasis,
      headline: 'Account % risk frame unavailable',
      summary:
        'PocketPilot can frame this basis once prepared entry, stop, and position-cap context are all available.',
      reason: 'MISSING_PRICE_REFERENCES',
      items: [
        {
          label: 'Needed',
          value: 'Prepared entry, prepared stop, and a prepared position cap',
        },
      ],
    });
  }

  if (
    params.priceContext.accountValue === null ||
    params.priceContext.positionValue === null ||
    params.priceContext.maxLoss === null ||
    params.priceContext.accountPercentLoss === null
  ) {
    return createUnavailableContext({
      basis: params.selectedBasis,
      headline: 'Account % risk frame unavailable',
      summary:
        'PocketPilot can frame this basis once current account value is available alongside the prepared position cap.',
      reason: 'MISSING_ACCOUNT_VALUE',
      items: [
        {
          label: 'Needed',
          value: 'Current account value for the selected account',
        },
      ],
    });
  }

  return {
    status: 'AVAILABLE',
    basis: params.selectedBasis,
    headline: 'Account % risk frame',
    summary:
      'Shows the capped loss from this prepared plan as a share of current account value using prepared references only.',
    items: [
      {
        label: 'Risk per trade',
        value: formatPercent(params.priceContext.accountPercentLoss),
      },
      {
        label: 'Max loss at cap',
        value: formatCurrency(params.priceContext.maxLoss, params.priceContext.currency),
      },
      {
        label: 'Position cap used',
        value: formatPercent(params.priceContext.maxPositionSize * 100),
      },
      {
        label: 'Prepared price path',
        value: formatReferencePath({
          entryPrice: params.priceContext.entryPrice,
          stopPrice: params.priceContext.stopPrice,
          currency: params.priceContext.currency,
        }),
      },
    ],
  };
}

function createFixedCurrencyContext(params: {
  selectedBasis: RiskBasis;
  priceContext: NonNullable<ReturnType<typeof createPriceReferenceContext>> | null;
}): RiskPerTradeContext {
  if (params.priceContext === null) {
    return createUnavailableContext({
      basis: params.selectedBasis,
      headline: 'Fixed-currency risk frame unavailable',
      summary:
        'PocketPilot can frame this basis once prepared entry, stop, and position-cap context are all available.',
      reason: 'MISSING_PRICE_REFERENCES',
      items: [
        {
          label: 'Needed',
          value: 'Prepared entry, prepared stop, and a prepared position cap',
        },
      ],
    });
  }

  if (
    params.priceContext.accountValue === null ||
    params.priceContext.positionValue === null ||
    params.priceContext.maxLoss === null
  ) {
    return createUnavailableContext({
      basis: params.selectedBasis,
      headline: 'Fixed-currency risk frame unavailable',
      summary:
        'PocketPilot can frame this basis once current account value is available alongside the prepared position cap.',
      reason: 'MISSING_ACCOUNT_VALUE',
      items: [
        {
          label: 'Needed',
          value: 'Current account value for the selected account',
        },
      ],
    });
  }

  return {
    status: 'AVAILABLE',
    basis: params.selectedBasis,
    headline: 'Fixed-currency risk frame',
    summary:
      'Shows the capped loss from this prepared plan as a fixed currency amount using prepared references only.',
    items: [
      {
        label: 'Risk per trade',
        value: formatCurrency(params.priceContext.maxLoss, params.priceContext.currency),
      },
      {
        label: 'Position cap value',
        value: formatCurrency(params.priceContext.positionValue, params.priceContext.currency),
      },
      {
        label: 'Position cap used',
        value: formatPercent(params.priceContext.maxPositionSize * 100),
      },
      {
        label: 'Prepared price path',
        value: formatReferencePath({
          entryPrice: params.priceContext.entryPrice,
          stopPrice: params.priceContext.stopPrice,
          currency: params.priceContext.currency,
        }),
      },
    ],
  };
}

function createPositionPercentContext(params: {
  selectedBasis: RiskBasis;
  priceContext: NonNullable<ReturnType<typeof createPriceReferenceContext>> | null;
}): RiskPerTradeContext {
  if (params.priceContext === null) {
    return createUnavailableContext({
      basis: params.selectedBasis,
      headline: 'Position % risk frame unavailable',
      summary:
        'PocketPilot can frame this basis once prepared entry, stop, and position-cap context are all available.',
      reason: 'MISSING_PRICE_REFERENCES',
      items: [
        {
          label: 'Needed',
          value: 'Prepared entry, prepared stop, and a prepared position cap',
        },
      ],
    });
  }

  if (params.priceContext.positionPercentLoss === null) {
    return createUnavailableContext({
      basis: params.selectedBasis,
      headline: 'Position % risk frame unavailable',
      summary:
        'PocketPilot can frame this basis once the prepared position cap can be paired with the current account value.',
      reason: 'MISSING_ACCOUNT_VALUE',
      items: [
        {
          label: 'Needed',
          value: 'Current account value for the selected account',
        },
      ],
    });
  }

  return {
    status: 'AVAILABLE',
    basis: params.selectedBasis,
    headline: 'Position % risk frame',
    summary:
      'Shows the capped loss from this prepared plan as a share of the capped position value using prepared references only.',
    items: [
      {
        label: 'Risk per trade',
        value: formatPercent(params.priceContext.positionPercentLoss),
      },
      {
        label: 'Max loss at cap',
        value: formatCurrency(
          params.priceContext.maxLoss ?? 0,
          params.priceContext.currency,
        ),
      },
      {
        label: 'Position cap used',
        value: formatPercent(params.priceContext.maxPositionSize * 100),
      },
      {
        label: 'Prepared price path',
        value: formatReferencePath({
          entryPrice: params.priceContext.entryPrice,
          stopPrice: params.priceContext.stopPrice,
          currency: params.priceContext.currency,
        }),
      },
    ],
  };
}

export function createRiskPerTradeContext(params: {
  selectedBasis: RiskBasis;
  plan: ProtectionPlan;
  accountContext?: AccountRiskContext | null;
}): RiskPerTradeContext {
  const maxPositionSize = normalisePositiveNumber(params.plan.constraints.maxPositionSize);

  if (maxPositionSize === null) {
    return createUnavailableContext({
      basis: params.selectedBasis,
      headline: `${params.selectedBasis === 'POSITION_PERCENT' ? 'Position %' : params.selectedBasis === 'FIXED_CURRENCY' ? 'Fixed-currency' : 'Account %'} risk frame unavailable`,
      summary:
        'PocketPilot can frame this basis once the prepared plan carries an explicit position cap.',
      reason: 'MISSING_POSITION_CAP',
      items: [
        {
          label: 'Needed',
          value: 'A prepared position cap from the current plan',
        },
      ],
    });
  }

  const priceContext = createPriceReferenceContext({
    selectedBasis: params.selectedBasis,
    accountContext: params.accountContext,
    plan: params.plan,
  });

  switch (params.selectedBasis) {
    case 'FIXED_CURRENCY':
      return createFixedCurrencyContext({
        selectedBasis: params.selectedBasis,
        priceContext,
      });
    case 'POSITION_PERCENT':
      return createPositionPercentContext({
        selectedBasis: params.selectedBasis,
        priceContext,
      });
    default:
      return createAccountPercentContext({
        selectedBasis: params.selectedBasis,
        priceContext,
      });
  }
}
