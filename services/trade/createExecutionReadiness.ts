import type {
  ConfirmationSession,
  ExecutionCapabilityResolution,
  ExecutionPreviewVM,
  ExecutionReadiness,
  ReadinessBlocker,
  ReadinessWarning,
} from '@/services/trade/types';

function isPreviewConsistentWithCapability(
  capabilityResolution: ExecutionCapabilityResolution,
  executionPreview: ExecutionPreviewVM | null,
): boolean {
  if (
    !executionPreview?.pathPreview ||
    !executionPreview.payloadPreview ||
    !executionPreview.adapterCapability
  ) {
    return false;
  }

  return (
    executionPreview.pathPreview.confirmationPathType === capabilityResolution.confirmationPath &&
    executionPreview.pathPreview.payloadType === capabilityResolution.path &&
    executionPreview.pathPreview.supported === capabilityResolution.supported &&
    executionPreview.payloadPreview.payloadType === capabilityResolution.path
  );
}

function createBlockers(params: {
  hasPlan: boolean;
  allRequiredAcknowledged: boolean;
  hasUnavailablePath: boolean;
  hasCapabilityMismatch: boolean;
}): ReadinessBlocker[] {
  if (!params.hasPlan) {
    return [
      {
        code: 'NO_PLAN_SELECTED',
        message: 'Select a confirmation plan before submission can become eligible.',
      },
    ];
  }

  const blockers: ReadinessBlocker[] = [];

  if (!params.allRequiredAcknowledged) {
    blockers.push({
      code: 'NOT_ACKNOWLEDGED',
      message: 'Complete every required acknowledgement before submission can become eligible.',
    });
  }

  if (params.hasUnavailablePath) {
    blockers.push({
      code: 'UNAVAILABLE_PATH',
      message: 'The current confirmation session has no available execution path.',
    });
  }

  if (params.hasCapabilityMismatch) {
    blockers.push({
      code: 'CAPABILITY_MISSING',
      message: 'The prepared adapter capability does not support the selected confirmation path.',
    });
  }

  return blockers;
}

function createWarnings(params: {
  confirmationSession: ConfirmationSession | null;
  executionPreview: ExecutionPreviewVM | null;
}): ReadinessWarning[] {
  const warnings: ReadinessWarning[] = [];
  const shell = params.confirmationSession?.shell ?? null;

  if (!shell) {
    return warnings;
  }

  if (shell.readiness.certainty === 'LOW') {
    warnings.push({
      code: 'LOW_CERTAINTY',
      message: 'This plan is prepared with low certainty and should be reviewed carefully.',
    });
  }

  if (shell.headline.actionState === 'CAUTION') {
    warnings.push({
      code: 'CAUTION_STATE',
      message: 'This plan is currently in a caution state even when submission becomes eligible.',
    });
  }

  if (params.executionPreview?.pathPreview?.payloadType === 'SEPARATE_ORDERS') {
    warnings.push({
      code: 'PARTIAL_CAPABILITY',
      message:
        'The prepared path relies on separate-order scaffolding instead of a native combined order path.',
    });
  }

  return warnings;
}

export function createExecutionReadiness(params: {
  confirmationSession: ConfirmationSession | null;
  executionPreview: ExecutionPreviewVM | null;
}): ExecutionReadiness {
  const session = params.confirmationSession;
  const hasPlan = session?.planId !== null && session?.planId !== undefined;
  const allRequiredAcknowledged = session?.flow?.allRequiredAcknowledged ?? false;
  const capabilityResolution =
    session?.executionCapability ?? params.executionPreview?.capabilityResolution ?? null;
  const hasUnavailablePath = hasPlan && capabilityResolution?.supported !== true;
  const hasCapabilityMismatch =
    hasPlan &&
    !hasUnavailablePath &&
    !!capabilityResolution &&
    !isPreviewConsistentWithCapability(capabilityResolution, params.executionPreview);
  const blockers = createBlockers({
    hasPlan,
    allRequiredAcknowledged,
    hasUnavailablePath,
    hasCapabilityMismatch,
  });
  const warnings = createWarnings(params);

  return {
    eligible: hasPlan && allRequiredAcknowledged && !hasUnavailablePath && !hasCapabilityMismatch,
    blockers,
    warnings,
    summary: {
      requiresAcknowledgement: hasPlan && !allRequiredAcknowledged,
      hasUnavailablePath,
      hasCapabilityMismatch,
    },
  };
}
