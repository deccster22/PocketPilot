import type { ConfirmationFlow, ConfirmationFlowStepType } from '@/services/trade/types';

export type TradeConfirmationFlowViewData = {
  planId: string;
  currentStepId: string;
  canProceedText: string;
  allRequiredAcknowledgedText: string;
  blockedReasonText: string;
  steps: Array<{
    stepId: string;
    type: ConfirmationFlowStepType;
    label: string;
    acknowledged: boolean;
    acknowledgementLabel?: string;
    statusText: string;
  }>;
};

function formatStepStatus(step: ConfirmationFlow['steps'][number]): string {
  if (step.type === 'UNAVAILABLE') {
    return 'Unavailable';
  }

  if (step.acknowledged) {
    return 'Acknowledged';
  }

  return step.required ? 'Requires acknowledgement' : 'Optional';
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
      ? 'All required acknowledgements are complete.'
      : 'Confirmation cannot proceed yet.',
    allRequiredAcknowledgedText: flow.allRequiredAcknowledged
      ? 'All required steps have been acknowledged.'
      : 'Required acknowledgement is still pending.',
    blockedReasonText: flow.blockedReason ?? 'No current block.',
    steps: flow.steps.map((step) => ({
      stepId: step.stepId,
      type: step.type,
      label: step.label,
      acknowledged: step.acknowledged,
      acknowledgementLabel: step.acknowledgementLabel,
      statusText: formatStepStatus(step),
    })),
  };
}
