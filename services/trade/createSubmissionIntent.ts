import type {
  ConfirmationSession,
  ExecutionPreviewVM,
  ExecutionReadiness,
  SubmissionIntentAdapterType,
  SubmissionIntentResult,
} from '@/services/trade/types';

function resolveAdapterType(executionPreview: ExecutionPreviewVM): SubmissionIntentAdapterType | null {
  switch (executionPreview.payloadPreview?.payloadType) {
    case 'BRACKET':
      return 'BRACKET';
    case 'OCO':
      return 'OCO';
    case 'SEPARATE_ORDERS':
      return 'SEPARATE_ORDERS';
    default:
      return null;
  }
}

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
  const adapterType = preview ? resolveAdapterType(preview) : null;

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
