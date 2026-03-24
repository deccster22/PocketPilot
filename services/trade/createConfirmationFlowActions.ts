import { createConfirmationFlow } from '@/services/trade/createConfirmationFlow';
import type {
  ConfirmationFlow,
  ConfirmationFlowActions,
  TradePlanConfirmationShell,
} from '@/services/trade/types';

function getAcknowledgedStepIds(flow: ConfirmationFlow): string[] {
  return flow.steps
    .filter((step) => step.acknowledged)
    .map((step) => step.stepId);
}

export function createConfirmationFlowActions(params: {
  shell: TradePlanConfirmationShell;
}): ConfirmationFlowActions {
  function recomputeWithAcknowledgements(acknowledgedStepIds: readonly string[]) {
    return createConfirmationFlow({
      shell: params.shell,
      acknowledgedStepIds,
    });
  }

  return {
    acknowledgeStep(flow, stepId) {
      const step = flow.steps.find((candidate) => candidate.stepId === stepId);

      if (!step || !step.required || step.type === 'UNAVAILABLE') {
        return recomputeWithAcknowledgements(getAcknowledgedStepIds(flow));
      }

      const acknowledgedStepIds = getAcknowledgedStepIds(flow);

      if (!acknowledgedStepIds.includes(stepId)) {
        acknowledgedStepIds.push(stepId);
      }

      return recomputeWithAcknowledgements(acknowledgedStepIds);
    },

    unacknowledgeStep(flow, stepId) {
      const step = flow.steps.find((candidate) => candidate.stepId === stepId);

      if (!step || !step.acknowledged) {
        return recomputeWithAcknowledgements(getAcknowledgedStepIds(flow));
      }

      return recomputeWithAcknowledgements(
        getAcknowledgedStepIds(flow).filter((acknowledgedStepId) => acknowledgedStepId !== stepId),
      );
    },

    resetFlow() {
      return createConfirmationFlow({
        shell: params.shell,
      });
    },
  };
}
