import { createExecutionAdapterDisplayState } from '@/services/trade/createExecutionBoundaryDisplayState';
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
  return createExecutionAdapterDisplayState(adapterAttempt);
}
