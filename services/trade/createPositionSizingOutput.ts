import type { PreparedSizingAccountContext } from '@/services/trade/resolvePreparedSizingSnapshot';
import { resolvePreparedSizingSnapshot } from '@/services/trade/resolvePreparedSizingSnapshot';
import type {
  PositionSizingAvailability,
  PositionSizingOutput,
  PositionSizingUnavailableReason,
  PreparedTradeRiskLane,
  ProtectionPlan,
} from '@/services/trade/types';

function formatNumber(value: number): string {
  return value.toFixed(4).replace(/\.?0+$/, '');
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

function createUnavailable(reason: PositionSizingUnavailableReason): PositionSizingAvailability {
  return {
    status: 'UNAVAILABLE',
    reason,
  };
}

function createOutput(params: {
  risk: Pick<PreparedTradeRiskLane, 'activeBasisLabel'>;
  sizing: Extract<ReturnType<typeof resolvePreparedSizingSnapshot>, { status: 'AVAILABLE' }>;
}): PositionSizingOutput {
  return {
    sizeLabel: `Position size (${params.risk.activeBasisLabel ?? 'Selected basis'})`,
    sizeValue: `${formatNumber(params.sizing.positionUnits)} units at ${formatCurrency(
      params.sizing.positionValue,
      params.sizing.currency,
    )} cap`,
    maxLossLabel: 'Max loss at stop',
    maxLossValue: formatCurrency(params.sizing.maxLoss, params.sizing.currency),
    notes: [
      `Prepared entry ${formatCurrency(params.sizing.entryPrice, params.sizing.currency)} to stop ${formatCurrency(
        params.sizing.stopPrice,
        params.sizing.currency,
      )}.`,
      'Support-only readout; no order path is opened here.',
    ],
  };
}

export function createPositionSizingOutput(params: {
  plan: ProtectionPlan | null;
  risk: Pick<PreparedTradeRiskLane, 'activeBasis' | 'activeBasisLabel' | 'basisAvailability'>;
  accountContext?: PreparedSizingAccountContext | null;
  isEnabledForSurface?: boolean;
}): PositionSizingAvailability {
  if (params.isEnabledForSurface === false) {
    return createUnavailable('NOT_ENABLED_FOR_SURFACE');
  }

  if (
    params.risk.basisAvailability.status !== 'AVAILABLE' ||
    params.risk.activeBasis === null ||
    params.risk.activeBasisLabel === null
  ) {
    return createUnavailable('NOT_ENABLED_FOR_SURFACE');
  }

  if (!params.plan) {
    return createUnavailable('INSUFFICIENT_INPUTS');
  }

  const sizing = resolvePreparedSizingSnapshot({
    selectedBasis: params.risk.activeBasis,
    plan: params.plan,
    accountContext: params.accountContext ?? null,
  });

  if (sizing.status === 'UNAVAILABLE') {
    return createUnavailable('INSUFFICIENT_INPUTS');
  }

  return {
    status: 'AVAILABLE',
    output: createOutput({
      risk: params.risk,
      sizing,
    }),
  };
}
