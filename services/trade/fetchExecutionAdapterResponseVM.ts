import { createExecutionAdapterResponse } from '@/services/trade/createExecutionAdapterResponse';
import type { ExecutionAdapterAttemptResult, SubmissionIntentResult } from '@/services/trade/types';

export async function fetchExecutionAdapterResponseVM(params: {
  submissionIntent: SubmissionIntentResult;
}): Promise<ExecutionAdapterAttemptResult> {
  if (params.submissionIntent.status === 'BLOCKED') {
    return {
      status: 'BLOCKED',
      blockers: params.submissionIntent.blockers,
      warnings: params.submissionIntent.warnings,
    };
  }

  return createExecutionAdapterResponse(params.submissionIntent);
}
