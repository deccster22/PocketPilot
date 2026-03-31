import { createExecutionReadinessDisplayState } from '@/services/trade/createExecutionBoundaryDisplayState';
import type { ExecutionReadiness } from '@/services/trade/types';

export type TradeExecutionReadinessViewData = {
  eligibilityText: string;
  blockerCountText: string;
  warningCountText: string;
  summaryText: string[];
  blockers: string[];
  warnings: string[];
};

export function createTradeExecutionReadinessViewData(
  readiness: ExecutionReadiness,
): TradeExecutionReadinessViewData {
  return createExecutionReadinessDisplayState(readiness);
}
