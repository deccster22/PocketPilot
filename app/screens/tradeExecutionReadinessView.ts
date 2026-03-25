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
  const summaryText = [
    readiness.summary.requiresAcknowledgement
      ? 'Required acknowledgement is still pending.'
      : 'Required acknowledgement is complete.',
    readiness.summary.hasUnavailablePath
      ? 'Prepared execution path is unavailable.'
      : 'Prepared execution path is available.',
    readiness.summary.hasCapabilityMismatch
      ? 'Prepared adapter capability does not match the selected path.'
      : 'Prepared adapter capability matches the selected path.',
  ];

  return {
    eligibilityText: readiness.eligible
      ? 'Submission is eligible in the prepared readiness gate.'
      : 'Submission is not eligible in the prepared readiness gate.',
    blockerCountText: `${readiness.blockers.length} blocker${
      readiness.blockers.length === 1 ? '' : 's'
    }`,
    warningCountText: `${readiness.warnings.length} warning${
      readiness.warnings.length === 1 ? '' : 's'
    }`,
    summaryText,
    blockers: readiness.blockers.map((blocker) => `${blocker.code}: ${blocker.message}`),
    warnings: readiness.warnings.map((warning) => `${warning.code}: ${warning.message}`),
  };
}
