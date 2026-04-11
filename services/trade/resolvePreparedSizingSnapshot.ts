import type { ProtectionPlan, RiskBasis } from '@/services/trade/types';

export type PreparedSizingAccountContext = {
  portfolioValue: number | null;
  baseCurrency: string | null;
};

export type PreparedSizingUnavailableReason =
  | 'MISSING_POSITION_CAP'
  | 'MISSING_PRICE_REFERENCES'
  | 'MISSING_ACCOUNT_VALUE';

export type PreparedSizingSnapshot =
  | {
      status: 'UNAVAILABLE';
      reason: PreparedSizingUnavailableReason;
      selectedBasis: RiskBasis;
      entryPrice: null;
      stopPrice: null;
      stopDistance: null;
      maxPositionSize: null;
      accountValue: null;
      currency: null;
      positionValue: null;
      positionUnits: null;
      maxLoss: null;
      accountPercentLoss: null;
      positionPercentLoss: null;
    }
  | {
      status: 'AVAILABLE';
      selectedBasis: RiskBasis;
      entryPrice: number;
      stopPrice: number;
      stopDistance: number;
      maxPositionSize: number;
      accountValue: number;
      currency: string | null;
      positionValue: number;
      positionUnits: number;
      maxLoss: number;
      accountPercentLoss: number;
      positionPercentLoss: number;
    };

function normalisePositiveNumber(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value;
}

function createUnavailableSnapshot(params: {
  selectedBasis: RiskBasis;
  reason: PreparedSizingUnavailableReason;
}): PreparedSizingSnapshot {
  return {
    status: 'UNAVAILABLE',
    selectedBasis: params.selectedBasis,
    reason: params.reason,
    entryPrice: null,
    stopPrice: null,
    stopDistance: null,
    maxPositionSize: null,
    accountValue: null,
    currency: null,
    positionValue: null,
    positionUnits: null,
    maxLoss: null,
    accountPercentLoss: null,
    positionPercentLoss: null,
  };
}

export function resolvePreparedSizingSnapshot(params: {
  selectedBasis: RiskBasis;
  plan: ProtectionPlan;
  accountContext?: PreparedSizingAccountContext | null;
}): PreparedSizingSnapshot {
  const maxPositionSize = normalisePositiveNumber(params.plan.constraints.maxPositionSize);

  if (maxPositionSize === null) {
    return createUnavailableSnapshot({
      selectedBasis: params.selectedBasis,
      reason: 'MISSING_POSITION_CAP',
    });
  }

  const entryPrice = normalisePositiveNumber(params.plan.preparedRiskReferences?.entryPrice);
  const stopPrice = normalisePositiveNumber(params.plan.preparedRiskReferences?.stopPrice);

  if (entryPrice === null || stopPrice === null || entryPrice === stopPrice) {
    return createUnavailableSnapshot({
      selectedBasis: params.selectedBasis,
      reason: 'MISSING_PRICE_REFERENCES',
    });
  }

  const accountValue = normalisePositiveNumber(params.accountContext?.portfolioValue);

  if (accountValue === null) {
    return createUnavailableSnapshot({
      selectedBasis: params.selectedBasis,
      reason: 'MISSING_ACCOUNT_VALUE',
    });
  }

  const stopDistance = Math.abs(entryPrice - stopPrice);
  const positionValue = accountValue * maxPositionSize;
  const positionUnits = positionValue / entryPrice;
  const maxLoss = positionUnits * stopDistance;

  return {
    status: 'AVAILABLE',
    selectedBasis: params.selectedBasis,
    entryPrice,
    stopPrice,
    stopDistance,
    maxPositionSize,
    accountValue,
    currency: params.accountContext?.baseCurrency ?? null,
    positionValue,
    positionUnits,
    maxLoss,
    accountPercentLoss: (maxLoss / accountValue) * 100,
    positionPercentLoss: (maxLoss / positionValue) * 100,
  };
}
