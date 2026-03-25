import type { SubmissionIntentResult } from '@/services/trade/types';

export type TradeSubmissionIntentViewData = {
  statusText: string;
  detailText: string;
  warningCountText: string;
  blockers: string[];
  warnings: string[];
  placeholderText: string;
  payloadSummary: string[];
};

export function createTradeSubmissionIntentViewData(
  submissionIntent: SubmissionIntentResult,
): TradeSubmissionIntentViewData {
  if (submissionIntent.status === 'BLOCKED') {
    return {
      statusText: 'Submission intent is blocked in the prepared non-dispatch seam.',
      detailText: 'Prepared blockers must clear before a placeholder submission contract can exist.',
      warningCountText: `${submissionIntent.warnings.length} warning${
        submissionIntent.warnings.length === 1 ? '' : 's'
      }`,
      blockers: submissionIntent.blockers.map(
        (blocker) => `${blocker.code}: ${blocker.message}`,
      ),
      warnings: submissionIntent.warnings.map(
        (warning) => `${warning.code}: ${warning.message}`,
      ),
      placeholderText: 'No placeholder submission contract is prepared while blockers remain.',
      payloadSummary: [],
    };
  }

  return {
    statusText: 'Submission intent is ready as a placeholder-only contract.',
    detailText: `${submissionIntent.adapterType} adapter path prepared for plan ${submissionIntent.planId}.`,
    warningCountText: `${submissionIntent.warnings.length} warning${
      submissionIntent.warnings.length === 1 ? '' : 's'
    }`,
    blockers: [],
    warnings: submissionIntent.warnings.map((warning) => `${warning.code}: ${warning.message}`),
    placeholderText: `placeholderOnly=${submissionIntent.placeholderOnly} | Account ${submissionIntent.accountId} | Symbol ${submissionIntent.symbol ?? 'Unassigned'}`,
    payloadSummary: submissionIntent.payloadPreview.map(
      (payload) =>
        `${payload.payloadType}: ${payload.orderCount} order placeholder${
          payload.orderCount === 1 ? '' : 's'
        } | ${payload.fieldsPresent.join(', ')}`,
    ),
  };
}
