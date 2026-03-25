import { createExecutionReadiness } from '@/services/trade/createExecutionReadiness';
import type {
  ConfirmationSession,
  ExecutionPreviewVM,
  ExecutionReadiness,
} from '@/services/trade/types';

export async function fetchExecutionReadinessVM(params: {
  confirmationSession: ConfirmationSession | null;
  executionPreview: ExecutionPreviewVM | null;
}): Promise<ExecutionReadiness> {
  return createExecutionReadiness({
    confirmationSession: params.confirmationSession,
    executionPreview: params.executionPreview,
  });
}
