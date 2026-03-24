import type {
  ConfirmationFlow,
  ConfirmationFlowStep,
  TradePlanConfirmationShell,
} from '@/services/trade/types';

const REVIEW_STEP_ID = 'review';
const CONSTRAINT_CHECK_STEP_ID = 'constraint-check';
const UNAVAILABLE_STEP_ID = 'unavailable';
const CONFIRM_INTENT_STEP_ID = 'confirm-intent';

function resolveAcknowledgementLabel(
  step: Pick<ConfirmationFlowStep, 'type'>,
): string | undefined {
  switch (step.type) {
    case 'REVIEW':
      return 'Acknowledge review';
    case 'CONSTRAINT_CHECK':
      return 'Acknowledge constraints';
    case 'CONFIRM_INTENT':
      return 'Acknowledge intent';
    default:
      return undefined;
  }
}

function stepSupportsAcknowledgement(step: ConfirmationFlowStep): boolean {
  return step.required && step.type !== 'UNAVAILABLE';
}

function resolveReviewLabel(shell: TradePlanConfirmationShell): string {
  const stepsLabel = shell.confirmation.stepsLabel.trim();

  if (/^review\b/i.test(stepsLabel)) {
    return stepsLabel;
  }

  return `Review ${stepsLabel.toLowerCase()}`;
}

function buildSteps(shell: TradePlanConfirmationShell): ConfirmationFlowStep[] {
  const steps: ConfirmationFlowStep[] = [
    {
      stepId: REVIEW_STEP_ID,
      type: 'REVIEW',
      label: resolveReviewLabel(shell),
      completed: false,
      acknowledged: false,
      required: true,
      acknowledgementLabel: 'Acknowledge review',
    },
  ];

  if (
    shell.constraints.cooldownActive === true ||
    shell.constraints.maxPositionSize !== undefined
  ) {
    const constraintParts = [];

    if (shell.constraints.cooldownActive) {
      constraintParts.push('cooldown active');
    }

    if (shell.constraints.maxPositionSize !== undefined) {
      constraintParts.push(`max position size ${shell.constraints.maxPositionSize}`);
    }

    steps.push({
      stepId: CONSTRAINT_CHECK_STEP_ID,
      type: 'CONSTRAINT_CHECK',
      label: `Review constraints: ${constraintParts.join(' | ')}`,
      completed: false,
      acknowledged: false,
      required: true,
      acknowledgementLabel: 'Acknowledge constraints',
    });
  }

  if (!shell.confirmation.executionAvailable) {
    steps.push({
      stepId: UNAVAILABLE_STEP_ID,
      type: 'UNAVAILABLE',
      label: 'Execution remains unavailable in this phase',
      completed: false,
      acknowledged: false,
      required: true,
    });
  }

  steps.push({
    stepId: CONFIRM_INTENT_STEP_ID,
    type: 'CONFIRM_INTENT',
    label: 'Confirm user intent before any later execution step',
    completed: false,
    acknowledged: false,
    required: true,
    acknowledgementLabel: 'Acknowledge intent',
  });

  return steps;
}

function applyAcknowledgedSteps(
  steps: ConfirmationFlowStep[],
  acknowledgedStepIds: readonly string[],
): ConfirmationFlowStep[] {
  return steps.map((step) => ({
    ...step,
    acknowledged:
      stepSupportsAcknowledgement(step) && acknowledgedStepIds.includes(step.stepId),
    completed:
      stepSupportsAcknowledgement(step) && acknowledgedStepIds.includes(step.stepId),
    acknowledgementLabel: resolveAcknowledgementLabel(step),
  }));
}

function resolveBlockedReason(steps: ConfirmationFlowStep[]): string | undefined {
  if (steps.some((step) => step.type === 'UNAVAILABLE')) {
    return 'Execution remains unavailable in this phase.';
  }

  const incompleteConstraintStep = steps.find(
    (step) => step.type === 'CONSTRAINT_CHECK' && step.required && !step.acknowledged,
  );

  if (incompleteConstraintStep) {
    return 'Review active constraints before proceeding.';
  }

  const incompleteRequiredStep = steps.find(
    (step) => stepSupportsAcknowledgement(step) && !step.acknowledged,
  );

  if (incompleteRequiredStep) {
    return 'Complete all required confirmation steps before proceeding.';
  }

  return undefined;
}

function resolveCurrentStepId(steps: ConfirmationFlowStep[]): string {
  return (
    steps.find((step) => stepSupportsAcknowledgement(step) && !step.acknowledged)?.stepId ??
    steps.find((step) => !step.completed)?.stepId ??
    steps[steps.length - 1].stepId
  );
}

export function createConfirmationFlow(params: {
  shell: TradePlanConfirmationShell;
  acknowledgedStepIds?: readonly string[];
}): ConfirmationFlow {
  const steps = applyAcknowledgedSteps(
    buildSteps(params.shell),
    params.acknowledgedStepIds ?? [],
  );
  const blockedReason = resolveBlockedReason(steps);
  const allRequiredAcknowledged = steps
    .filter((step) => stepSupportsAcknowledgement(step))
    .every((step) => step.acknowledged);

  return {
    planId: params.shell.planId,
    steps,
    currentStepId: resolveCurrentStepId(steps),
    canProceed:
      !steps.some((step) => step.type === 'UNAVAILABLE') && allRequiredAcknowledged,
    allRequiredAcknowledged,
    ...(blockedReason ? { blockedReason } : {}),
  };
}
