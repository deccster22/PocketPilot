import { createExecutionReadiness } from '@/services/trade/createExecutionReadiness';
import { createSubmissionIntent } from '@/services/trade/createSubmissionIntent';
import { createTradePlanConfirmationShell } from '@/services/trade/createTradePlanConfirmationShell';
import { fetchExecutionPreviewVM } from '@/services/trade/fetchExecutionPreviewVM';
import type {
  ConfirmationSession,
  ExecutionCapabilityResolution,
  ProtectionPlan,
} from '@/services/trade/types';

const guidedSequenceCapability: ExecutionCapabilityResolution = {
  accountId: 'acct-basic',
  path: 'SEPARATE_ORDERS',
  confirmationPath: 'GUIDED_SEQUENCE',
  supported: true,
  unavailableReason: null,
};

function createPlan(): ProtectionPlan {
  return {
    planId: 'plan-eth',
    accountId: 'acct-basic',
    strategyId: 'momentum_basics',
    symbol: 'ETH',
    intentType: 'HOLD',
    rationale: {
      primaryEventId: 'event-eth',
      supportingEventIds: ['event-eth'],
      summary: 'Hold setup remains active.',
    },
    riskProfile: {
      certainty: 'LOW',
      alignment: 'NEUTRAL',
    },
    constraints: {},
    preparedRiskReferences: null,
    createdAt: 100,
  };
}

function createSession(): ConfirmationSession {
  const shell = createTradePlanConfirmationShell({
    plan: createPlan(),
    capabilityResolution: guidedSequenceCapability,
  });

  return {
    planId: 'plan-eth',
    accountId: 'acct-basic',
    executionCapability: guidedSequenceCapability,
    preparedRiskReferences: null,
    preview: {
      planId: 'plan-eth',
      headline: {
        intentType: 'HOLD',
        symbol: 'ETH',
        actionState: 'WAIT',
      },
      rationale: {
        summary: 'Prepared summary',
        primaryEventId: 'event-eth',
        supportingEventIds: ['event-eth'],
        supportingEventCount: 1,
      },
      constraints: {
        requiresConfirmation: true,
      },
      readiness: {
        alignment: 'NEUTRAL',
        certainty: 'LOW',
      },
      placeholders: {
        orderPreviewAvailable: false,
        executionPreviewAvailable: false,
      },
    },
    shell,
    flow: {
      planId: 'plan-eth',
      steps: [],
      currentStepId: 'confirm-intent',
      canProceed: true,
      allRequiredAcknowledged: true,
    },
  };
}

describe('execution capability consistency', () => {
  it('keeps shell, preview, readiness, and submission intent aligned to one canonical capability result', async () => {
    const confirmationSession = createSession();
    const executionPreview = await fetchExecutionPreviewVM({
      confirmationSession,
    });
    const executionReadiness = createExecutionReadiness({
      confirmationSession,
      executionPreview,
    });
    const submissionIntent = createSubmissionIntent({
      confirmationSession,
      executionPreview,
      executionReadiness,
    });

    expect(confirmationSession.shell?.confirmation.pathType).toBe('GUIDED_SEQUENCE');
    expect(executionPreview.capabilityResolution).toEqual(guidedSequenceCapability);
    expect(executionPreview.pathPreview?.confirmationPathType).toBe('GUIDED_SEQUENCE');
    expect(executionPreview.payloadPreview?.payloadType).toBe('SEPARATE_ORDERS');
    expect(executionReadiness.eligible).toBe(true);
    expect(executionReadiness.summary.hasUnavailablePath).toBe(false);
    expect(submissionIntent).toMatchObject({
      status: 'READY',
      adapterType: 'SEPARATE_ORDERS',
      placeholderOnly: true,
    });
    expect(JSON.stringify({ executionPreview, executionReadiness, submissionIntent })).not.toContain(
      'signalsTriggered',
    );
    expect(JSON.stringify(submissionIntent)).not.toContain('dispatchEnabled');
  });
});
