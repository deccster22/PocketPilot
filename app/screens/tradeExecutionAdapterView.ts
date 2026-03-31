import type { ExecutionAdapterAttemptResult } from '@/services/trade/types';

export type TradeExecutionAdapterViewData = {
  statusText: string;
  detailText: string;
  warningsText: string;
  blockers: string[];
  warnings: string[];
  orderSummaryText: string;
  simulatedOrderIdsText: string;
};

export function createTradeExecutionAdapterViewData(
  adapterAttempt: ExecutionAdapterAttemptResult,
): TradeExecutionAdapterViewData {
  if (adapterAttempt.status === 'BLOCKED') {
    return {
      statusText: 'Execution adapter remains blocked at the submission-intent boundary.',
      detailText: 'A ready submission intent is required before the simulated adapter seam can respond.',
      warningsText: `${adapterAttempt.warnings.length} warning${
        adapterAttempt.warnings.length === 1 ? '' : 's'
      }`,
      blockers: adapterAttempt.blockers.map((blocker) => `${blocker.code}: ${blocker.message}`),
      warnings: adapterAttempt.warnings.map((warning) => `${warning.code}: ${warning.message}`),
      orderSummaryText: 'No simulated orders are prepared while blockers remain.',
      simulatedOrderIdsText: 'None',
    };
  }

  return {
    statusText: 'Execution adapter response is simulated only.',
    detailText: `${adapterAttempt.adapterType} path returned ${adapterAttempt.outcome} with dispatchEnabled=${adapterAttempt.dispatchEnabled}.`,
    warningsText: `${adapterAttempt.warnings.length} warning${
      adapterAttempt.warnings.length === 1 ? '' : 's'
    }`,
    blockers: [],
    warnings: adapterAttempt.warnings.map((warning) => `${warning.code}: ${warning.message}`),
    orderSummaryText: `placeholderOnly=${adapterAttempt.placeholderOnly} | Account ${adapterAttempt.executionSummary.accountId} | Symbol ${adapterAttempt.executionSummary.symbol ?? 'Unassigned'} | Orders ${adapterAttempt.executionSummary.orderCount}`,
    simulatedOrderIdsText: adapterAttempt.simulatedOrderIds.join(' | '),
  };
}
