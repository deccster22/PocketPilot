import { createSubmissionIntent } from '@/services/trade/createSubmissionIntent';
import { fetchExecutionPreviewVM } from '@/services/trade/fetchExecutionPreviewVM';
import { fetchExecutionReadinessVM } from '@/services/trade/fetchExecutionReadinessVM';
import type { ConfirmationSession, SubmissionIntentResult } from '@/services/trade/types';

export async function fetchSubmissionIntentVM(params: {
  confirmationSession: ConfirmationSession | null;
}): Promise<SubmissionIntentResult> {
  const executionPreview = await fetchExecutionPreviewVM({
    confirmationSession: params.confirmationSession,
  });
  const executionReadiness = await fetchExecutionReadinessVM({
    confirmationSession: params.confirmationSession,
    executionPreview,
  });

  return createSubmissionIntent({
    confirmationSession: params.confirmationSession,
    executionPreview,
    executionReadiness,
  });
}
