import type {
  ConfirmationSession,
  ExecutionPreviewVM,
  ExecutionReadiness,
  SubmissionIntentResult,
} from '@/services/trade/types';

export function createSubmissionIntent(params: {
  confirmationSession: ConfirmationSession | null;
  executionPreview: ExecutionPreviewVM | null;
  executionReadiness: ExecutionReadiness;
}): SubmissionIntentResult {
  if (!params.executionReadiness.eligible) {
    return {
      status: 'BLOCKED',
      blockers: params.executionReadiness.blockers,
      warnings: params.executionReadiness.warnings,
    };
  }

  const session = params.confirmationSession;
  const preview = params.executionPreview;
  const adapterType =
    session?.executionCapability?.supported === true &&
    session.executionCapability.path !== 'UNAVAILABLE'
      ? session.executionCapability.path
      : null;

  if (
    !session?.planId ||
    !session.accountId ||
    !preview?.payloadPreview ||
    !adapterType
  ) {
    return {
      status: 'BLOCKED',
      blockers: params.executionReadiness.blockers,
      warnings: params.executionReadiness.warnings,
    };
  }

  return {
    status: 'READY',
    adapterType,
    placeholderOnly: true,
    planId: session.planId,
    accountId: session.accountId,
    symbol: preview.payloadPreview.symbol,
    payloadPreview: [preview.payloadPreview],
    warnings: params.executionReadiness.warnings,
  };
}
