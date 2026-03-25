import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createTradeSubmissionIntentViewData } from '@/app/screens/tradeSubmissionIntentView';

describe('createTradeSubmissionIntentViewData', () => {
  it('reads the prepared blocked submission-intent contract without creating submission logic in the app', () => {
    expect(
      createTradeSubmissionIntentViewData({
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
      statusText: 'Submission intent is blocked in the prepared non-dispatch seam.',
      detailText:
        'Prepared blockers must clear before a placeholder submission contract can exist.',
      warningCountText: '1 warning',
      blockers: [
        'NOT_ACKNOWLEDGED: Complete every required acknowledgement before submission can become eligible.',
      ],
      warnings: [
        'LOW_CERTAINTY: This plan is prepared with low certainty and should be reviewed carefully.',
      ],
      placeholderText: 'No placeholder submission contract is prepared while blockers remain.',
      payloadSummary: [],
    });
  });

  it('reads the prepared ready submission-intent contract without constructing payloads in the app', () => {
    expect(
      createTradeSubmissionIntentViewData({
        status: 'READY',
        adapterType: 'BRACKET',
        placeholderOnly: true,
        planId: 'plan-btc',
        accountId: 'acct-live',
        symbol: 'BTC',
        payloadPreview: [
          {
            payloadType: 'BRACKET',
            symbol: 'BTC',
            orderCount: 1,
            fieldsPresent: ['symbol', 'entryOrderType'],
            executable: false,
          },
        ],
        warnings: [],
      }),
    ).toEqual({
      statusText: 'Submission intent is ready as a placeholder-only contract.',
      detailText: 'BRACKET adapter path prepared for plan plan-btc.',
      warningCountText: '0 warnings',
      blockers: [],
      warnings: [],
      placeholderText: 'placeholderOnly=true | Account acct-live | Symbol BTC',
      payloadSummary: ['BRACKET: 1 order placeholder | symbol, entryOrderType'],
    });
  });

  it('keeps submission-intent orchestration out of the app screen', () => {
    const screenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'TradeHubScreen.tsx'),
      'utf8',
    );

    expect(screenSource).not.toMatch(/createSubmissionIntent\(/);
    expect(screenSource).toMatch(/fetchSubmissionIntentVM/);
  });
});
