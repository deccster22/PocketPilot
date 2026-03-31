import type { MockExecutionAdapterResponse, ReadySubmissionIntent } from '@/services/trade/types';

function createDeterministicSimulatedOrderIds(
  submissionIntent: ReadySubmissionIntent,
): ReadonlyArray<string> {
  return submissionIntent.payloadPreview.flatMap((payload) =>
    Array.from({ length: payload.orderCount }, (_, index) => `mock-${submissionIntent.planId}-${index + 1}`),
  );
}

export function createExecutionAdapterResponse(
  submissionIntent: ReadySubmissionIntent,
): MockExecutionAdapterResponse {
  const simulatedOrderIds = createDeterministicSimulatedOrderIds(submissionIntent);

  return {
    status: 'SIMULATED',
    dispatchEnabled: false,
    placeholderOnly: true,
    adapterType: submissionIntent.adapterType,
    outcome: 'ACCEPTED',
    simulatedOrderIds,
    executionSummary: {
      planId: submissionIntent.planId,
      accountId: submissionIntent.accountId,
      symbol: submissionIntent.symbol,
      orderCount: simulatedOrderIds.length,
      path: submissionIntent.adapterType,
    },
    warnings: submissionIntent.warnings,
  };
}
