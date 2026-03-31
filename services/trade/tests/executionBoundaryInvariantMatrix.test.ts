import { createExecutionReadiness } from '@/services/trade/createExecutionReadiness';
import { createSubmissionIntent } from '@/services/trade/createSubmissionIntent';
import { createTradePlanConfirmationShell } from '@/services/trade/createTradePlanConfirmationShell';
import { createExecutionAdapterResponse } from '@/services/trade/createExecutionAdapterResponse';
import { fetchExecutionAdapterResponseVM } from '@/services/trade/fetchExecutionAdapterResponseVM';
import { fetchExecutionPreviewVM } from '@/services/trade/fetchExecutionPreviewVM';
import type {
  ConfirmationSession,
  ExecutionCapabilityPath,
  ExecutionCapabilityResolution,
  ExecutionPreviewVM,
  ExecutionReadiness,
  ProtectionPlan,
  ReadySubmissionIntent,
  SubmissionIntentResult,
} from '@/services/trade/types';

function createCapability(path: ExecutionCapabilityPath): ExecutionCapabilityResolution {
  switch (path) {
    case 'BRACKET':
      return {
        accountId: 'acct-live',
        path: 'BRACKET',
        confirmationPath: 'BRACKET',
        supported: true,
        unavailableReason: null,
      };
    case 'OCO':
      return {
        accountId: 'acct-live',
        path: 'OCO',
        confirmationPath: 'OCO',
        supported: true,
        unavailableReason: null,
      };
    case 'SEPARATE_ORDERS':
      return {
        accountId: 'acct-live',
        path: 'SEPARATE_ORDERS',
        confirmationPath: 'GUIDED_SEQUENCE',
        supported: true,
        unavailableReason: null,
      };
    default:
      return {
        accountId: 'acct-live',
        path: 'UNAVAILABLE',
        confirmationPath: 'UNAVAILABLE',
        supported: false,
        unavailableReason:
          'Account capabilities do not support a protected execution path for this plan.',
      };
  }
}

function createPlan(path: ExecutionCapabilityPath): ProtectionPlan {
  const plan: ProtectionPlan = {
    planId: `plan-${path.toLowerCase()}`,
    accountId: 'acct-live',
    strategyId: 'protected_strategy',
    symbol: 'BTC',
    intentType: 'ACCUMULATE',
    rationale: {
      primaryEventId: 'event-1',
      supportingEventIds: ['event-1'],
      summary: 'Prepared summary',
    },
    riskProfile: {
      alignment: path === 'UNAVAILABLE' ? 'NEUTRAL' : 'ALIGNED',
      certainty: path === 'SEPARATE_ORDERS' ? 'LOW' : 'HIGH',
    },
    constraints: {},
    createdAt: 100,
  };

  Object.assign(plan.rationale as object, {
    signalsTriggered: ['hidden-signal'],
    rawSignalScore: 97,
  });

  return plan;
}

function createSession(params: {
  path: ExecutionCapabilityPath;
  allRequiredAcknowledged: boolean;
}): ConfirmationSession {
  const plan = createPlan(params.path);
  const executionCapability = createCapability(params.path);

  return {
    planId: plan.planId,
    accountId: plan.accountId,
    executionCapability,
    preview: {
      planId: plan.planId,
      headline: {
        intentType: plan.intentType,
        symbol: plan.symbol,
        actionState: params.path === 'SEPARATE_ORDERS' ? 'CAUTION' : 'READY',
      },
        rationale: {
          ...plan.rationale,
          supportingEventCount: plan.rationale.supportingEventIds.length,
        },
      constraints: {
        requiresConfirmation: true,
      },
      readiness: {
        alignment: plan.riskProfile.alignment,
        certainty: plan.riskProfile.certainty,
      },
      placeholders: {
        orderPreviewAvailable: false,
        executionPreviewAvailable: false,
      },
    },
    shell: createTradePlanConfirmationShell({
      plan,
      capabilityResolution: executionCapability,
    }),
    flow: {
      planId: plan.planId,
      steps: [],
      currentStepId: 'confirm-intent',
      canProceed: params.allRequiredAcknowledged,
      allRequiredAcknowledged: params.allRequiredAcknowledged,
      blockedReason: params.allRequiredAcknowledged
        ? undefined
        : 'Complete all required confirmation steps before proceeding.',
    },
  };
}

async function runBoundaryChain(
  confirmationSession: ConfirmationSession,
): Promise<{
  executionPreview: ExecutionPreviewVM;
  executionReadiness: ExecutionReadiness;
  submissionIntent: SubmissionIntentResult;
  adapterAttempt: Awaited<ReturnType<typeof fetchExecutionAdapterResponseVM>>;
}> {
  const executionPreview = await fetchExecutionPreviewVM({ confirmationSession });
  const executionReadiness = createExecutionReadiness({
    confirmationSession,
    executionPreview,
  });
  const submissionIntent = createSubmissionIntent({
    confirmationSession,
    executionPreview,
    executionReadiness,
  });
  const adapterAttempt = await fetchExecutionAdapterResponseVM({
    submissionIntent,
  });

  return {
    executionPreview,
    executionReadiness,
    submissionIntent,
    adapterAttempt,
  };
}

describe('execution boundary invariant matrix', () => {
  it('keeps unavailable capability paths blocked across readiness, submission intent, and adapter seams', async () => {
    const chain = await runBoundaryChain(
      createSession({
        path: 'UNAVAILABLE',
        allRequiredAcknowledged: true,
      }),
    );

    expect(chain.executionReadiness.eligible).toBe(false);
    expect(chain.executionReadiness.summary.hasUnavailablePath).toBe(true);
    expect(chain.submissionIntent.status).toBe('BLOCKED');
    expect(chain.adapterAttempt.status).toBe('BLOCKED');
    expect(JSON.stringify(chain.adapterAttempt)).not.toContain('"status":"SIMULATED"');
  });

  it('passes blocked readiness through submission intent and adapter seams without divergence', async () => {
    const chain = await runBoundaryChain(
      createSession({
        path: 'BRACKET',
        allRequiredAcknowledged: false,
      }),
    );

    expect(chain.executionReadiness.eligible).toBe(false);
    expect(chain.executionReadiness.blockers).toEqual([
      {
        code: 'NOT_ACKNOWLEDGED',
        message: 'Complete every required acknowledgement before submission can become eligible.',
      },
    ]);
    expect(chain.submissionIntent).toEqual({
      status: 'BLOCKED',
      blockers: chain.executionReadiness.blockers,
      warnings: chain.executionReadiness.warnings,
    });
    expect(chain.adapterAttempt).toEqual({
      status: 'BLOCKED',
      blockers: chain.executionReadiness.blockers,
      warnings: chain.executionReadiness.warnings,
    });
  });

  it.each([
    ['BRACKET', 'BRACKET'],
    ['OCO', 'OCO'],
    ['SEPARATE_ORDERS', 'GUIDED_SEQUENCE'],
  ] as const)(
    'keeps %s capability truth aligned through shell, preview, readiness, submission intent, and adapter response',
    async (path, confirmationPath) => {
      const confirmationSession = createSession({
        path,
        allRequiredAcknowledged: true,
      });
      const chain = await runBoundaryChain(confirmationSession);

      expect(confirmationSession.shell?.confirmation.pathType).toBe(confirmationPath);
      expect(chain.executionPreview.capabilityResolution).toEqual(
        confirmationSession.executionCapability,
      );
      expect(chain.executionPreview.pathPreview).toMatchObject({
        confirmationPathType: confirmationPath,
        payloadType: path,
        supported: true,
      });
      expect(chain.executionPreview.payloadPreview).toMatchObject({
        payloadType: path,
      });
      expect(chain.executionReadiness).toMatchObject({
        eligible: true,
        summary: {
          requiresAcknowledgement: false,
          hasUnavailablePath: false,
          hasCapabilityMismatch: false,
        },
      });
      expect(chain.submissionIntent).toMatchObject({
        status: 'READY',
        adapterType: path,
        placeholderOnly: true,
      });
      expect(chain.adapterAttempt).toMatchObject({
        status: 'SIMULATED',
        adapterType: path,
        dispatchEnabled: false,
        placeholderOnly: true,
        executionSummary: {
          path,
        },
      });
    },
  );

  it('produces identical outputs for identical inputs across the full chain and keeps raw signals out of boundary outputs', async () => {
    const confirmationSession = createSession({
      path: 'SEPARATE_ORDERS',
      allRequiredAcknowledged: true,
    });

    const first = await runBoundaryChain(confirmationSession);
    const second = await runBoundaryChain(confirmationSession);

    expect(first).toEqual(second);
    expect(JSON.stringify(first)).not.toContain('signalsTriggered');
    expect(JSON.stringify(first)).not.toContain('rawSignalScore');
    expect(JSON.stringify(first)).not.toContain('hidden-signal');
  });

  it('keeps canonical capability truth ahead of payload shape in submission intent and adapter seams', async () => {
    const confirmationSession = createSession({
      path: 'SEPARATE_ORDERS',
      allRequiredAcknowledged: true,
    });
    const executionPreview = await fetchExecutionPreviewVM({ confirmationSession });
    const executionReadiness = createExecutionReadiness({
      confirmationSession,
      executionPreview,
    });

    const mismatchedPreview: ExecutionPreviewVM = {
      ...executionPreview,
      pathPreview: executionPreview.pathPreview
        ? {
            ...executionPreview.pathPreview,
            payloadType: 'BRACKET',
          }
        : null,
      payloadPreview: executionPreview.payloadPreview
        ? {
            ...executionPreview.payloadPreview,
            payloadType: 'BRACKET',
          }
        : null,
    };

    const submissionIntent = createSubmissionIntent({
      confirmationSession,
      executionPreview: mismatchedPreview,
      executionReadiness,
    });

    expect(submissionIntent).toMatchObject({
      status: 'READY',
      adapterType: 'SEPARATE_ORDERS',
    });

    const adapterAttempt = await fetchExecutionAdapterResponseVM({
      submissionIntent,
    });

    expect(adapterAttempt).toMatchObject({
      status: 'SIMULATED',
      adapterType: 'SEPARATE_ORDERS',
      executionSummary: {
        path: 'SEPARATE_ORDERS',
      },
    });
  });

  it('keeps ready submission intents simulated-only at the adapter seam', () => {
    const submissionIntent: ReadySubmissionIntent = {
      status: 'READY',
      adapterType: 'OCO',
      placeholderOnly: true,
      planId: 'plan-oco',
      accountId: 'acct-live',
      symbol: 'BTC',
      payloadPreview: [
        {
          payloadType: 'OCO',
          symbol: 'BTC',
          orderCount: 2,
          fieldsPresent: ['symbol', 'entryOrderType', 'ocoGroup'],
          executable: false,
        },
      ],
      warnings: [],
    };

    expect(createExecutionAdapterResponse(submissionIntent)).toEqual({
      status: 'SIMULATED',
      dispatchEnabled: false,
      placeholderOnly: true,
      adapterType: 'OCO',
      outcome: 'SIMULATED_ACCEPTABLE',
      simulatedOrderIds: ['mock-plan-oco-1', 'mock-plan-oco-2'],
      executionSummary: {
        planId: 'plan-oco',
        accountId: 'acct-live',
        symbol: 'BTC',
        orderCount: 2,
        path: 'OCO',
      },
      warnings: [],
    });
  });
});
