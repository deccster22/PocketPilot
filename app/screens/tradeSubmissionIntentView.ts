import { createSubmissionIntentDisplayState } from '@/services/trade/createExecutionBoundaryDisplayState';
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
  return createSubmissionIntentDisplayState(submissionIntent);
}
