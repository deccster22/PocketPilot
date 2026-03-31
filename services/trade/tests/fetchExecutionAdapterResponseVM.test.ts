import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { fetchExecutionAdapterResponseVM } from '@/services/trade/fetchExecutionAdapterResponseVM';
import type { SubmissionIntentResult } from '@/services/trade/types';

function createBlockedSubmissionIntent(): SubmissionIntentResult {
  return {
    status: 'BLOCKED',
    blockers: [
      {
        code: 'NOT_ACKNOWLEDGED',
        message: 'Complete every required acknowledgement before submission can become eligible.',
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

function createReadySubmissionIntent(): SubmissionIntentResult {
  return {
    status: 'READY',
    adapterType: 'SEPARATE_ORDERS',
    placeholderOnly: true,
    planId: 'plan-btc',
    accountId: 'acct-live',
    symbol: 'BTC',
    payloadPreview: [
      {
        payloadType: 'SEPARATE_ORDERS',
        symbol: 'BTC',
        orderCount: 3,
        fieldsPresent: ['symbol', 'entryOrderType', 'stopLossOrder', 'takeProfitOrder'],
        executable: false,
      },
    ],
    warnings: [
      {
        code: 'LOW_CERTAINTY',
        message: 'This plan is prepared with low certainty and should be reviewed carefully.',
      },
      {
        code: 'PARTIAL_CAPABILITY',
        message:
          'The prepared path relies on separate-order scaffolding instead of a native combined order path.',
      },
    ],
  };
}

describe('fetchExecutionAdapterResponseVM', () => {
  it('passes blocked submission intent through unchanged', async () => {
    await expect(
      fetchExecutionAdapterResponseVM({
        submissionIntent: createBlockedSubmissionIntent(),
      }),
    ).resolves.toEqual({
      status: 'BLOCKED',
      blockers: [
        {
          code: 'NOT_ACKNOWLEDGED',
          message: 'Complete every required acknowledgement before submission can become eligible.',
        },
      ],
      warnings: [
        {
          code: 'LOW_CERTAINTY',
          message: 'This plan is prepared with low certainty and should be reviewed carefully.',
        },
      ],
    });
  });

  it('returns a simulated adapter response from ready submission intent only', async () => {
    await expect(
      fetchExecutionAdapterResponseVM({
        submissionIntent: createReadySubmissionIntent(),
      }),
    ).resolves.toEqual({
      status: 'SIMULATED',
      dispatchEnabled: false,
      placeholderOnly: true,
      adapterType: 'SEPARATE_ORDERS',
      outcome: 'ACCEPTED',
      simulatedOrderIds: ['mock-plan-btc-1', 'mock-plan-btc-2', 'mock-plan-btc-3'],
      executionSummary: {
        planId: 'plan-btc',
        accountId: 'acct-live',
        symbol: 'BTC',
        orderCount: 3,
        path: 'SEPARATE_ORDERS',
      },
      warnings: [
        {
          code: 'LOW_CERTAINTY',
          message: 'This plan is prepared with low certainty and should be reviewed carefully.',
        },
        {
          code: 'PARTIAL_CAPABILITY',
          message:
            'The prepared path relies on separate-order scaffolding instead of a native combined order path.',
        },
      ],
    });
  });

  it('keeps earlier seam orchestration out of the execution-adapter fetch seam', () => {
    const source = readFileSync(
      join(process.cwd(), 'services', 'trade', 'fetchExecutionAdapterResponseVM.ts'),
      'utf8',
    );

    expect(source).not.toMatch(/fetchExecutionPreviewVM/);
    expect(source).not.toMatch(/fetchExecutionReadinessVM/);
    expect(source).not.toMatch(/createSubmissionIntent/);
    expect(source).not.toMatch(/ConfirmationSession/);
    expect(source).toMatch(/createExecutionAdapterResponse/);
  });
});
