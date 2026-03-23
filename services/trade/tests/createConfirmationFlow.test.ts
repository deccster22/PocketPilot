import {
  createConfirmationFlow,
  markConfirmationFlowStepComplete,
} from '@/services/trade/createConfirmationFlow';
import type { TradePlanConfirmationShell } from '@/services/trade/types';

function createShell(
  overrides: Partial<TradePlanConfirmationShell> = {},
): TradePlanConfirmationShell {
  return {
    planId: 'plan-btc',
    headline: {
      intentType: 'ACCUMULATE',
      symbol: 'BTC',
      actionState: 'READY',
    },
    readiness: {
      alignment: 'ALIGNED',
      certainty: 'HIGH',
    },
    confirmation: {
      requiresConfirmation: true,
      pathType: 'BRACKET',
      stepsLabel: 'Single confirmation flow',
      executionAvailable: true,
    },
    constraints: {},
    placeholders: {
      orderPayloadAvailable: false,
      executionPreviewAvailable: false,
    },
    ...overrides,
  };
}

describe('createConfirmationFlow', () => {
  it('creates deterministic linear steps from the prepared confirmation shell', () => {
    const shell = createShell({
      constraints: {
        cooldownActive: true,
        maxPositionSize: 0.1,
      },
      confirmation: {
        requiresConfirmation: true,
        pathType: 'GUIDED_SEQUENCE',
        stepsLabel: 'Review separate order steps',
        executionAvailable: true,
      },
    });

    const first = createConfirmationFlow({ shell });
    const second = createConfirmationFlow({ shell });

    expect(first).toEqual(second);
    expect(first).toEqual({
      planId: 'plan-btc',
      steps: [
        {
          stepId: 'review',
          type: 'REVIEW',
          label: 'Review separate order steps',
          completed: false,
          required: true,
        },
        {
          stepId: 'constraint-check',
          type: 'CONSTRAINT_CHECK',
          label: 'Review constraints: cooldown active | max position size 0.1',
          completed: false,
          required: true,
        },
        {
          stepId: 'confirm-intent',
          type: 'CONFIRM_INTENT',
          label: 'Confirm user intent before any later execution step',
          completed: false,
          required: true,
        },
      ],
      currentStepId: 'review',
      canProceed: false,
      blockedReason: 'Review active constraints before proceeding.',
    });
  });

  it('adds an unavailable step and blocks progression when execution is unavailable', () => {
    const flow = createConfirmationFlow({
      shell: createShell({
        confirmation: {
          requiresConfirmation: true,
          pathType: 'UNAVAILABLE',
          stepsLabel: 'Execution path unavailable',
          executionAvailable: false,
        },
      }),
    });

    expect(flow.steps.map((step) => step.type)).toEqual([
      'REVIEW',
      'UNAVAILABLE',
      'CONFIRM_INTENT',
    ]);
    expect(flow.canProceed).toBe(false);
    expect(flow.blockedReason).toBe('Execution remains unavailable in this phase.');
  });

  it('recomputes step completion in memory without auto-advancing execution', () => {
    const shell = createShell();
    const reviewComplete = markConfirmationFlowStepComplete({
      shell,
      flow: createConfirmationFlow({ shell }),
      stepId: 'review',
    });
    const readyToProceed = markConfirmationFlowStepComplete({
      shell,
      flow: reviewComplete,
      stepId: 'confirm-intent',
    });

    expect(reviewComplete.currentStepId).toBe('confirm-intent');
    expect(reviewComplete.canProceed).toBe(false);
    expect(readyToProceed.steps).toEqual([
      {
        stepId: 'review',
        type: 'REVIEW',
        label: 'Review single confirmation flow',
        completed: true,
        required: true,
      },
      {
        stepId: 'confirm-intent',
        type: 'CONFIRM_INTENT',
        label: 'Confirm user intent before any later execution step',
        completed: true,
        required: true,
      },
    ]);
    expect(readyToProceed.currentStepId).toBe('confirm-intent');
    expect(readyToProceed.canProceed).toBe(true);
    expect(readyToProceed.blockedReason).toBeUndefined();
  });
});
