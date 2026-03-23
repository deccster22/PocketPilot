import type { ConfirmationFlow, ConfirmationFlowStepType } from '@/services/trade/types';

export type TradeConfirmationFlowViewData = {
  planId: string;
  currentStepId: string;
  canProceedText: string;
  blockedReasonText: string;
  steps: Array<{
    stepId: string;
    type: ConfirmationFlowStepType;
    label: string;
    statusText: string;
  }>;
};

function formatStepStatus(completed: boolean, required: boolean): string {
  if (completed) {
    return 'Completed';
  }

  return required ? 'Required' : 'Optional';
}

export function createTradeConfirmationFlowViewData(
  flow: ConfirmationFlow | null,
): TradeConfirmationFlowViewData | null {
  if (!flow) {
    return null;
  }

  return {
    planId: flow.planId,
    currentStepId: flow.currentStepId,
    canProceedText: flow.canProceed
      ? 'All required confirmation steps are complete.'
      : 'Confirmation cannot proceed yet.',
    blockedReasonText: flow.blockedReason ?? 'No current block.',
    steps: flow.steps.map((step) => ({
      stepId: step.stepId,
      type: step.type,
      label: step.label,
      statusText: formatStepStatus(step.completed, step.required),
    })),
  };
}
