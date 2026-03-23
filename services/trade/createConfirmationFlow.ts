import type {
  ConfirmationFlow,
  ConfirmationFlowStep,
  TradePlanConfirmationShell,
} from '@/services/trade/types';

const REVIEW_STEP_ID = 'review';
const CONSTRAINT_CHECK_STEP_ID = 'constraint-check';
const UNAVAILABLE_STEP_ID = 'unavailable';
const CONFIRM_INTENT_STEP_ID = 'confirm-intent';

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
      required: true,
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
      required: true,
    });
  }

  if (!shell.confirmation.executionAvailable) {
    steps.push({
      stepId: UNAVAILABLE_STEP_ID,
      type: 'UNAVAILABLE',
      label: 'Execution remains unavailable in this phase',
      completed: false,
      required: true,
    });
  }

  steps.push({
    stepId: CONFIRM_INTENT_STEP_ID,
    type: 'CONFIRM_INTENT',
    label: 'Confirm user intent before any later execution step',
    completed: false,
    required: true,
  });

  return steps;
}

function applyCompletedSteps(
  steps: ConfirmationFlowStep[],
  completedStepIds: readonly string[],
): ConfirmationFlowStep[] {
  return steps.map((step) => ({
    ...step,
    completed:
      step.type === 'UNAVAILABLE' ? false : completedStepIds.includes(step.stepId),
  }));
}

function resolveBlockedReason(steps: ConfirmationFlowStep[]): string | undefined {
  if (steps.some((step) => step.type === 'UNAVAILABLE')) {
    return 'Execution remains unavailable in this phase.';
  }

  const incompleteConstraintStep = steps.find(
    (step) => step.type === 'CONSTRAINT_CHECK' && step.required && !step.completed,
  );

  if (incompleteConstraintStep) {
    return 'Review active constraints before proceeding.';
  }

  const incompleteRequiredStep = steps.find((step) => step.required && !step.completed);

  if (incompleteRequiredStep) {
    return 'Complete all required confirmation steps before proceeding.';
  }

  return undefined;
}

function resolveCurrentStepId(steps: ConfirmationFlowStep[]): string {
  return steps.find((step) => !step.completed)?.stepId ?? steps[steps.length - 1].stepId;
}

export function createConfirmationFlow(params: {
  shell: TradePlanConfirmationShell;
  completedStepIds?: readonly string[];
}): ConfirmationFlow {
  const steps = applyCompletedSteps(
    buildSteps(params.shell),
    params.completedStepIds ?? [],
  );
  const blockedReason = resolveBlockedReason(steps);

  return {
    planId: params.shell.planId,
    steps,
    currentStepId: resolveCurrentStepId(steps),
    canProceed:
      !steps.some((step) => step.type === 'UNAVAILABLE') &&
      steps.every((step) => !step.required || step.completed),
    ...(blockedReason ? { blockedReason } : {}),
  };
}

export function markConfirmationFlowStepComplete(
  params: {
    shell: TradePlanConfirmationShell;
    flow: ConfirmationFlow;
    stepId: string;
  },
): ConfirmationFlow {
  const completedStepIds = params.flow.steps
    .filter((step) => step.completed)
    .map((step) => step.stepId);

  if (!completedStepIds.includes(params.stepId)) {
    completedStepIds.push(params.stepId);
  }

  return createConfirmationFlow({
    shell: params.shell,
    completedStepIds,
  });
}
