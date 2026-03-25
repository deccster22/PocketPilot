import { fetchExecutionReadinessVM } from '@/services/trade/fetchExecutionReadinessVM';
import type { ConfirmationSession, ExecutionPreviewVM } from '@/services/trade/types';

function createSession(): ConfirmationSession {
  return {
    planId: 'plan-btc',
    accountId: 'acct-live',
    preview: {
      planId: 'plan-btc',
      headline: {
        intentType: 'ACCUMULATE',
        symbol: 'BTC',
        actionState: 'CAUTION',
      },
      rationale: {
        summary: 'Prepared summary',
        primaryEventId: 'event-1',
        supportingEventIds: ['event-1'],
        supportingEventCount: 1,
      },
      constraints: {
        requiresConfirmation: true,
      },
      readiness: {
        alignment: 'ALIGNED',
        certainty: 'LOW',
      },
      placeholders: {
        orderPreviewAvailable: false,
        executionPreviewAvailable: false,
      },
    },
    shell: {
      planId: 'plan-btc',
      headline: {
        intentType: 'ACCUMULATE',
        symbol: 'BTC',
        actionState: 'CAUTION',
      },
      readiness: {
        alignment: 'ALIGNED',
        certainty: 'LOW',
      },
      confirmation: {
        requiresConfirmation: true,
        pathType: 'GUIDED_SEQUENCE',
        stepsLabel: 'Prepared steps',
        executionAvailable: false,
      },
      constraints: {},
      placeholders: {
        orderPayloadAvailable: false,
        executionPreviewAvailable: false,
      },
    },
    flow: {
      planId: 'plan-btc',
      steps: [],
      currentStepId: 'confirm-intent',
      canProceed: true,
      allRequiredAcknowledged: true,
    },
  };
}

function createPreview(): ExecutionPreviewVM {
  return {
    planId: 'plan-btc',
    adapterCapability: {
      adapterId: 'adapter-preview-separate-orders',
      supportsBracket: false,
      supportsOCO: false,
      supportsMarketBuy: true,
      supportsLimitBuy: true,
      supportsStopLoss: true,
      supportsTakeProfit: true,
    },
    pathPreview: {
      planId: 'plan-btc',
      adapterId: 'adapter-preview-separate-orders',
      confirmationPathType: 'GUIDED_SEQUENCE',
      payloadType: 'SEPARATE_ORDERS',
      label: 'Separate-order payload placeholder',
      supported: true,
      executable: false,
    },
    payloadPreview: {
      payloadType: 'SEPARATE_ORDERS',
      symbol: 'BTC',
      orderCount: 3,
      fieldsPresent: ['symbol', 'entryPreview'],
      executable: false,
    },
  };
}

describe('fetchExecutionReadinessVM', () => {
  it('returns a prepared readiness VM from the confirmation session and execution preview', async () => {
    const result = await fetchExecutionReadinessVM({
      confirmationSession: createSession(),
      executionPreview: createPreview(),
    });

    expect(result).toEqual({
      eligible: true,
      blockers: [],
      warnings: [
        {
          code: 'LOW_CERTAINTY',
          message: 'This plan is prepared with low certainty and should be reviewed carefully.',
        },
        {
          code: 'CAUTION_STATE',
          message:
            'This plan is currently in a caution state even when submission becomes eligible.',
        },
        {
          code: 'PARTIAL_CAPABILITY',
          message:
            'The prepared path relies on separate-order scaffolding instead of a native combined order path.',
        },
      ],
      summary: {
        requiresAcknowledgement: false,
        hasUnavailablePath: false,
        hasCapabilityMismatch: false,
      },
    });
  });

  it('returns a deterministic no-plan readiness VM when there is no selected session', async () => {
    expect(
      await fetchExecutionReadinessVM({
        confirmationSession: {
          planId: null,
          accountId: null,
          preview: null,
          shell: null,
          flow: null,
        },
        executionPreview: {
          planId: null,
          adapterCapability: null,
          pathPreview: null,
          payloadPreview: null,
        },
      }),
    ).toEqual({
      eligible: false,
      blockers: [
        {
          code: 'NO_PLAN_SELECTED',
          message: 'Select a confirmation plan before submission can become eligible.',
        },
      ],
      warnings: [],
      summary: {
        requiresAcknowledgement: false,
        hasUnavailablePath: false,
        hasCapabilityMismatch: false,
      },
    });
  });
});
