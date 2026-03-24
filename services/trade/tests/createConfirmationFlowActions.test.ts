import { createConfirmationFlow } from '@/services/trade/createConfirmationFlow';
import { createConfirmationFlowActions } from '@/services/trade/createConfirmationFlowActions';
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

describe('createConfirmationFlowActions', () => {
  it('acknowledges required steps and recomputes proceed readiness deterministically', () => {
    const shell = createShell({
      constraints: {
        cooldownActive: true,
      },
    });
    const actions = createConfirmationFlowActions({ shell });
    const initialFlow = createConfirmationFlow({ shell });

    const reviewAcknowledged = actions.acknowledgeStep(initialFlow, 'review');
    const readyToProceed = actions.acknowledgeStep(
      actions.acknowledgeStep(reviewAcknowledged, 'constraint-check'),
      'confirm-intent',
    );

    expect(reviewAcknowledged.steps[0]).toMatchObject({
      stepId: 'review',
      acknowledged: true,
      completed: true,
    });
    expect(reviewAcknowledged.currentStepId).toBe('constraint-check');
    expect(readyToProceed.allRequiredAcknowledged).toBe(true);
    expect(readyToProceed.canProceed).toBe(true);
    expect(readyToProceed.blockedReason).toBeUndefined();
    expect(actions.acknowledgeStep(initialFlow, 'review')).toEqual(reviewAcknowledged);
  });

  it('allows acknowledgements to be reversed without UI-owned progression logic', () => {
    const shell = createShell();
    const actions = createConfirmationFlowActions({ shell });
    const acknowledgedFlow = actions.acknowledgeStep(
      actions.acknowledgeStep(createConfirmationFlow({ shell }), 'review'),
      'confirm-intent',
    );

    const revertedFlow = actions.unacknowledgeStep(acknowledgedFlow, 'review');

    expect(revertedFlow.steps).toEqual([
      {
        stepId: 'review',
        type: 'REVIEW',
        label: 'Review single confirmation flow',
        completed: false,
        acknowledged: false,
        required: true,
        acknowledgementLabel: 'Acknowledge review',
      },
      {
        stepId: 'confirm-intent',
        type: 'CONFIRM_INTENT',
        label: 'Confirm user intent before any later execution step',
        completed: true,
        acknowledged: true,
        required: true,
        acknowledgementLabel: 'Acknowledge intent',
      },
    ]);
    expect(revertedFlow.currentStepId).toBe('review');
    expect(revertedFlow.allRequiredAcknowledged).toBe(false);
    expect(revertedFlow.canProceed).toBe(false);
    expect(revertedFlow.blockedReason).toBe(
      'Complete all required confirmation steps before proceeding.',
    );
  });

  it('resets the flow back to an unacknowledged state', () => {
    const shell = createShell({
      constraints: {
        maxPositionSize: 0.25,
      },
    });
    const actions = createConfirmationFlowActions({ shell });
    const acknowledgedFlow = actions.acknowledgeStep(
      actions.acknowledgeStep(
        actions.acknowledgeStep(createConfirmationFlow({ shell }), 'review'),
        'constraint-check',
      ),
      'confirm-intent',
    );

    expect(actions.resetFlow(acknowledgedFlow)).toEqual(createConfirmationFlow({ shell }));
  });

  it('does not let unavailable steps create a valid proceed state', () => {
    const shell = createShell({
      confirmation: {
        requiresConfirmation: true,
        pathType: 'UNAVAILABLE',
        stepsLabel: 'Execution path unavailable',
        executionAvailable: false,
      },
    });
    const actions = createConfirmationFlowActions({ shell });
    const initialFlow = createConfirmationFlow({ shell });

    const unavailableAttempt = actions.acknowledgeStep(initialFlow, 'unavailable');
    const acknowledgedReview = actions.acknowledgeStep(initialFlow, 'review');
    const acknowledgedIntent = actions.acknowledgeStep(acknowledgedReview, 'confirm-intent');

    expect(unavailableAttempt).toEqual(initialFlow);
    expect(acknowledgedIntent.allRequiredAcknowledged).toBe(true);
    expect(acknowledgedIntent.currentStepId).toBe('unavailable');
    expect(acknowledgedIntent.canProceed).toBe(false);
    expect(acknowledgedIntent.blockedReason).toBe(
      'Execution remains unavailable in this phase.',
    );
  });

  it('ignores unknown step identifiers and recomputes from the current acknowledged state', () => {
    const shell = createShell();
    const actions = createConfirmationFlowActions({ shell });
    const flow = actions.acknowledgeStep(createConfirmationFlow({ shell }), 'review');

    expect(actions.acknowledgeStep(flow, 'not-a-step')).toEqual(flow);
    expect(actions.unacknowledgeStep(flow, 'not-a-step')).toEqual(flow);
  });
});
