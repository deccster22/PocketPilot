import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createTradeExecutionAdapterViewData } from '@/app/screens/tradeExecutionAdapterView';

describe('createTradeExecutionAdapterViewData', () => {
  it('reads the prepared blocked adapter-attempt contract without creating execution logic in the app', () => {
    expect(
      createTradeExecutionAdapterViewData({
        status: 'BLOCKED',
        blockers: [
          {
            code: 'NOT_ACKNOWLEDGED',
            message:
              'Complete every required acknowledgement before submission can become eligible.',
          },
        ],
        warnings: [
          {
            code: 'LOW_CERTAINTY',
            message: 'This plan is prepared with low certainty and should be reviewed carefully.',
          },
        ],
      }),
    ).toEqual({
      statusText: 'Execution adapter remains blocked at the submission-intent boundary.',
      detailText:
        'A ready submission intent is required before the simulated adapter seam can respond.',
      warningsText: '1 warning',
      blockers: [
        'NOT_ACKNOWLEDGED: Complete every required acknowledgement before submission can become eligible.',
      ],
      warnings: [
        'LOW_CERTAINTY: This plan is prepared with low certainty and should be reviewed carefully.',
      ],
      orderSummaryText: 'No simulated orders are prepared while blockers remain.',
      simulatedOrderIdsText: 'None',
    });
  });

  it('reads the prepared simulated adapter response without constructing adapter behavior in the app', () => {
    expect(
      createTradeExecutionAdapterViewData({
        status: 'SIMULATED',
        dispatchEnabled: false,
        placeholderOnly: true,
        adapterType: 'BRACKET',
        outcome: 'ACCEPTED',
        simulatedOrderIds: ['mock-plan-btc-1'],
        executionSummary: {
          planId: 'plan-btc',
          accountId: 'acct-live',
          symbol: 'BTC',
          orderCount: 1,
          path: 'BRACKET',
        },
        warnings: [],
      }),
    ).toEqual({
      statusText: 'Execution adapter response is simulated only.',
      detailText: 'BRACKET path returned ACCEPTED with dispatchEnabled=false.',
      warningsText: '0 warnings',
      blockers: [],
      warnings: [],
      orderSummaryText: 'placeholderOnly=true | Account acct-live | Symbol BTC | Orders 1',
      simulatedOrderIdsText: 'mock-plan-btc-1',
    });
  });

  it('keeps execution-adapter orchestration out of the app screen', () => {
    const screenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'TradeHubScreen.tsx'),
      'utf8',
    );

    expect(screenSource).not.toMatch(/createExecutionAdapterResponse\(/);
    expect(screenSource).toMatch(/fetchExecutionAdapterResponseVM/);
  });
});
