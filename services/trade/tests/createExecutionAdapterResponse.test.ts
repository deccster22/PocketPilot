import { createExecutionAdapterResponse } from '@/services/trade/createExecutionAdapterResponse';
import type { ReadySubmissionIntent } from '@/services/trade/types';

function createReadySubmissionIntent(
  adapterType: ReadySubmissionIntent['adapterType'],
): ReadySubmissionIntent {
  return {
    status: 'READY',
    adapterType,
    placeholderOnly: true,
    planId: 'plan-btc',
    accountId: 'acct-live',
    symbol: 'BTC',
    payloadPreview: [
      {
        payloadType: adapterType,
        symbol: 'BTC',
        orderCount: adapterType === 'SEPARATE_ORDERS' ? 3 : adapterType === 'OCO' ? 2 : 1,
        fieldsPresent: ['symbol', 'entryOrderType'],
        executable: false,
      },
    ],
    warnings: [
      {
        code: 'LOW_CERTAINTY',
        message: 'This plan is prepared with low certainty and should be reviewed carefully.',
      },
    ],
  };
}

describe('createExecutionAdapterResponse', () => {
  it.each([
    ['BRACKET', 1, ['mock-plan-btc-1']],
    ['OCO', 2, ['mock-plan-btc-1', 'mock-plan-btc-2']],
    ['SEPARATE_ORDERS', 3, ['mock-plan-btc-1', 'mock-plan-btc-2', 'mock-plan-btc-3']],
  ] as const)(
    'returns a deterministic simulated response for %s intents',
    (adapterType, orderCount, simulatedOrderIds) => {
      const result = createExecutionAdapterResponse(createReadySubmissionIntent(adapterType));

      expect(result).toEqual({
        status: 'SIMULATED',
        dispatchEnabled: false,
        placeholderOnly: true,
        adapterType,
        outcome: 'SIMULATED_ACCEPTABLE',
        simulatedOrderIds,
        executionSummary: {
          planId: 'plan-btc',
          accountId: 'acct-live',
          symbol: 'BTC',
          orderCount,
          path: adapterType,
        },
        warnings: [
          {
            code: 'LOW_CERTAINTY',
            message: 'This plan is prepared with low certainty and should be reviewed carefully.',
          },
        ],
      });
    },
  );

  it('preserves warnings, remains deterministic, and does not leak raw signal or dispatch data', () => {
    const submissionIntent = createReadySubmissionIntent('SEPARATE_ORDERS');

    const first = createExecutionAdapterResponse(submissionIntent);
    const second = createExecutionAdapterResponse(submissionIntent);

    expect(first).toEqual(second);
    expect(first.warnings).toEqual(submissionIntent.warnings);
    expect(JSON.stringify(first)).not.toContain('signalsTriggered');
    expect(JSON.stringify(first)).not.toContain('hidden-signal');
    expect(JSON.stringify(first)).not.toContain('submitOrder');
    expect(JSON.stringify(first)).toContain('"dispatchEnabled":false');
  });
});
