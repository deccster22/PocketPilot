import { resolvePreparedSizingSnapshot } from '@/services/trade/resolvePreparedSizingSnapshot';
import type {
  PreparedSizingSnapshot,
  PreparedSizingUnavailableReason,
} from '@/services/trade/resolvePreparedSizingSnapshot';
import type {
  ProtectionPlan,
  RiskBasis,
  RiskPerTradeContext,
} from '@/services/trade/types';

type AccountRiskContext = {
  portfolioValue: number | null;
  baseCurrency: string | null;
};

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

function formatBasisPrefix(basis: RiskBasis): string {
  switch (basis) {
    case 'FIXED_CURRENCY':
      return 'Fixed-currency';
    case 'POSITION_PERCENT':
      return 'Position %';
    default:
      return 'Account %';
  }
}

function createUnavailableSizingContext(params: {
  selectedBasis: RiskBasis;
  reason: PreparedSizingUnavailableReason;
}): RiskPerTradeContext {
  const headline = `${formatBasisPrefix(params.selectedBasis)} risk frame unavailable`;

  switch (params.reason) {
    case 'MISSING_POSITION_CAP':
      return createUnavailableContext({
        basis: params.selectedBasis,
        headline,
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
    case 'MISSING_ACCOUNT_VALUE':
      return createUnavailableContext({
        basis: params.selectedBasis,
        headline,
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
    default:
      return createUnavailableContext({
        basis: params.selectedBasis,
        headline,
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
}

function createAccountPercentContext(params: {
  selectedBasis: RiskBasis;
  sizing: Extract<PreparedSizingSnapshot, { status: 'AVAILABLE' }>;
}): RiskPerTradeContext {
  return {
    status: 'AVAILABLE',
    basis: params.selectedBasis,
    headline: 'Account % risk frame',
    summary:
      'Shows the capped loss from this prepared plan as a share of current account value using prepared references only.',
    items: [
      {
        label: 'Risk per trade',
        value: formatPercent(params.sizing.accountPercentLoss),
      },
      {
        label: 'Max loss at cap',
        value: formatCurrency(params.sizing.maxLoss, params.sizing.currency),
      },
      {
        label: 'Position cap used',
        value: formatPercent(params.sizing.maxPositionSize * 100),
      },
      {
        label: 'Prepared price path',
        value: formatReferencePath({
          entryPrice: params.sizing.entryPrice,
          stopPrice: params.sizing.stopPrice,
          currency: params.sizing.currency,
        }),
      },
    ],
  };
}

function createFixedCurrencyContext(params: {
  selectedBasis: RiskBasis;
  sizing: Extract<PreparedSizingSnapshot, { status: 'AVAILABLE' }>;
}): RiskPerTradeContext {
  return {
    status: 'AVAILABLE',
    basis: params.selectedBasis,
    headline: 'Fixed-currency risk frame',
    summary:
      'Shows the capped loss from this prepared plan as a fixed currency amount using prepared references only.',
    items: [
      {
        label: 'Risk per trade',
        value: formatCurrency(params.sizing.maxLoss, params.sizing.currency),
      },
      {
        label: 'Position cap value',
        value: formatCurrency(params.sizing.positionValue, params.sizing.currency),
      },
      {
        label: 'Position cap used',
        value: formatPercent(params.sizing.maxPositionSize * 100),
      },
      {
        label: 'Prepared price path',
        value: formatReferencePath({
          entryPrice: params.sizing.entryPrice,
          stopPrice: params.sizing.stopPrice,
          currency: params.sizing.currency,
        }),
      },
    ],
  };
}

function createPositionPercentContext(params: {
  selectedBasis: RiskBasis;
  sizing: Extract<PreparedSizingSnapshot, { status: 'AVAILABLE' }>;
}): RiskPerTradeContext {
  return {
    status: 'AVAILABLE',
    basis: params.selectedBasis,
    headline: 'Position % risk frame',
    summary:
      'Shows the capped loss from this prepared plan as a share of the capped position value using prepared references only.',
    items: [
      {
        label: 'Risk per trade',
        value: formatPercent(params.sizing.positionPercentLoss),
      },
      {
        label: 'Max loss at cap',
        value: formatCurrency(params.sizing.maxLoss, params.sizing.currency),
      },
      {
        label: 'Position cap used',
        value: formatPercent(params.sizing.maxPositionSize * 100),
      },
      {
        label: 'Prepared price path',
        value: formatReferencePath({
          entryPrice: params.sizing.entryPrice,
          stopPrice: params.sizing.stopPrice,
          currency: params.sizing.currency,
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
  const sizing = resolvePreparedSizingSnapshot({
    selectedBasis: params.selectedBasis,
    plan: params.plan,
    accountContext: params.accountContext,
  });

  if (sizing.status === 'UNAVAILABLE') {
    return createUnavailableSizingContext({
      selectedBasis: params.selectedBasis,
      reason: sizing.reason,
    });
  }

  switch (params.selectedBasis) {
    case 'FIXED_CURRENCY':
      return createFixedCurrencyContext({
        selectedBasis: params.selectedBasis,
        sizing,
      });
    case 'POSITION_PERCENT':
      return createPositionPercentContext({
        selectedBasis: params.selectedBasis,
        sizing,
      });
    default:
      return createAccountPercentContext({
        selectedBasis: params.selectedBasis,
        sizing,
      });
  }
}
