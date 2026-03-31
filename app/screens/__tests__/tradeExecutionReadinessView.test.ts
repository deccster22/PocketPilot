import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createTradeExecutionReadinessViewData } from '@/app/screens/tradeExecutionReadinessView';

describe('createTradeExecutionReadinessViewData', () => {
  it('reads the prepared readiness contract without deriving submission logic in the app', () => {
    expect(
      createTradeExecutionReadinessViewData({
        eligible: false,
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
        summary: {
          requiresAcknowledgement: true,
          hasUnavailablePath: false,
          hasCapabilityMismatch: false,
        },
      }),
    ).toEqual({
      eligibilityText: 'Submission is not eligible in the prepared readiness gate.',
      blockerCountText: '1 blocker',
      warningCountText: '1 warning',
      summaryText: [
        'Required acknowledgement is still pending.',
        'Prepared execution path is available.',
        'Prepared adapter capability matches the selected path.',
      ],
      blockers: [
        'NOT_ACKNOWLEDGED: Complete every required acknowledgement before submission can become eligible.',
      ],
      warnings: [
        'LOW_CERTAINTY: This plan is prepared with low certainty and should be reviewed carefully.',
      ],
    });
  });

  it('keeps readiness evaluation logic out of the app screen', () => {
    const screenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'TradeHubScreen.tsx'),
      'utf8',
    );

    expect(screenSource).not.toMatch(/createExecutionReadiness/);
    expect(screenSource).toMatch(/fetchExecutionReadinessVM/);
  });

  it('reads readiness wording from the shared execution-boundary display helper', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'screens', 'tradeExecutionReadinessView.ts'),
      'utf8',
    );

    expect(source).toMatch(/createExecutionReadinessDisplayState/);
    expect(source).not.toMatch(/Required acknowledgement is still pending/);
    expect(source).not.toMatch(/Submission is not eligible in the prepared readiness gate/);
  });
});
