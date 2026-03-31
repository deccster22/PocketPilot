import type {
  ExecutionAdapterAttemptResult,
  ExecutionPreviewVM,
  ExecutionReadiness,
  SubmissionIntentResult,
} from '@/services/trade/types';

export function createExecutionPreviewDisplayState(preview: ExecutionPreviewVM): {
  adapterText: string;
  pathText: string;
  payloadText: string;
  fieldsText: string;
  executableText: string;
} {
  return {
    adapterText: `Prepared adapter ${preview.adapterCapability?.adapterId ?? 'unavailable'}`,
    pathText: `${preview.pathPreview?.confirmationPathType ?? 'UNAVAILABLE'} path | ${
      preview.pathPreview?.label ?? 'Execution path unavailable'
    }`,
    payloadText: `${preview.payloadPreview?.payloadType ?? 'UNAVAILABLE'} payload placeholder only | ${
      preview.payloadPreview?.orderCount ?? 0
    } order preview${preview.payloadPreview?.orderCount === 1 ? '' : 's'}`,
    fieldsText:
      preview.payloadPreview && preview.payloadPreview.fieldsPresent.length
        ? `Fields: ${preview.payloadPreview.fieldsPresent.join(', ')}`
        : 'Fields: none prepared in this phase.',
    executableText: 'Executable payload remains unavailable in this phase.',
  };
}

export function createExecutionReadinessDisplayState(readiness: ExecutionReadiness): {
  eligibilityText: string;
  blockerCountText: string;
  warningCountText: string;
  summaryText: string[];
  blockers: string[];
  warnings: string[];
} {
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
    summaryText: [
      readiness.summary.requiresAcknowledgement
        ? 'Required acknowledgement is still pending.'
        : 'Required acknowledgement is complete.',
      readiness.summary.hasUnavailablePath
        ? 'Prepared execution path is unavailable.'
        : 'Prepared execution path is available.',
      readiness.summary.hasCapabilityMismatch
        ? 'Prepared adapter capability does not match the selected path.'
        : 'Prepared adapter capability matches the selected path.',
    ],
    blockers: readiness.blockers.map((blocker) => `${blocker.code}: ${blocker.message}`),
    warnings: readiness.warnings.map((warning) => `${warning.code}: ${warning.message}`),
  };
}

export function createSubmissionIntentDisplayState(submissionIntent: SubmissionIntentResult): {
  statusText: string;
  detailText: string;
  warningCountText: string;
  blockers: string[];
  warnings: string[];
  placeholderText: string;
  payloadSummary: string[];
} {
  if (submissionIntent.status === 'BLOCKED') {
    return {
      statusText: 'Submission intent is blocked at the non-dispatch boundary.',
      detailText:
        'Blocked until readiness requirements are complete; no simulated adapter handoff is prepared.',
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
    statusText: 'Submission intent is ready for simulated adapter handoff.',
    detailText: `${submissionIntent.adapterType} path prepared for plan ${
      submissionIntent.planId
    }; dispatch remains unavailable.`,
    warningCountText: `${submissionIntent.warnings.length} warning${
      submissionIntent.warnings.length === 1 ? '' : 's'
    }`,
    blockers: [],
    warnings: submissionIntent.warnings.map((warning) => `${warning.code}: ${warning.message}`),
    placeholderText: `placeholderOnly=${submissionIntent.placeholderOnly} | Account ${
      submissionIntent.accountId
    } | Symbol ${submissionIntent.symbol ?? 'Unassigned'}`,
    payloadSummary: submissionIntent.payloadPreview.map(
      (payload) =>
        `${payload.payloadType}: ${payload.orderCount} order placeholder${
          payload.orderCount === 1 ? '' : 's'
        } | ${payload.fieldsPresent.join(', ')}`,
    ),
  };
}

export function createExecutionAdapterDisplayState(adapterAttempt: ExecutionAdapterAttemptResult): {
  statusText: string;
  detailText: string;
  warningsText: string;
  blockers: string[];
  warnings: string[];
  orderSummaryText: string;
  simulatedOrderIdsText: string;
} {
  if (adapterAttempt.status === 'BLOCKED') {
    return {
      statusText: 'Execution adapter remains blocked by submission intent.',
      detailText:
        'Blocked submission intent passes through unchanged; no simulated adapter response is prepared.',
      warningsText: `${adapterAttempt.warnings.length} warning${
        adapterAttempt.warnings.length === 1 ? '' : 's'
      }`,
      blockers: adapterAttempt.blockers.map((blocker) => `${blocker.code}: ${blocker.message}`),
      warnings: adapterAttempt.warnings.map((warning) => `${warning.code}: ${warning.message}`),
      orderSummaryText: 'No simulated adapter response is prepared while blockers remain.',
      simulatedOrderIdsText: 'None',
    };
  }

  return {
    statusText: 'Simulated adapter response prepared.',
    detailText: `${adapterAttempt.adapterType} path produced a simulated adapter record with dispatchEnabled=${adapterAttempt.dispatchEnabled}.`,
    warningsText: `${adapterAttempt.warnings.length} warning${
      adapterAttempt.warnings.length === 1 ? '' : 's'
    }`,
    blockers: [],
    warnings: adapterAttempt.warnings.map((warning) => `${warning.code}: ${warning.message}`),
    orderSummaryText: `placeholderOnly=${adapterAttempt.placeholderOnly} | Account ${
      adapterAttempt.executionSummary.accountId
    } | Symbol ${adapterAttempt.executionSummary.symbol ?? 'Unassigned'} | Orders ${
      adapterAttempt.executionSummary.orderCount
    }`,
    simulatedOrderIdsText: adapterAttempt.simulatedOrderIds.join(' | '),
  };
}
