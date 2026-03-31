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
      statusText: 'Submission intent is blocked at the non-dispatch boundary.',
      detailText:
        'Blocked until readiness requirements are complete; no simulated adapter handoff is prepared.',
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
      statusText: 'Submission intent is ready for simulated adapter handoff.',
      detailText: 'BRACKET path prepared for plan plan-btc; dispatch remains unavailable.',
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

  it('keeps submission-intent wording calm and non-dispatching', () => {
    const blocked = createTradeSubmissionIntentViewData({
      status: 'BLOCKED',
      blockers: [
        {
          code: 'UNAVAILABLE_PATH',
          message: 'The current confirmation session has no available execution path.',
        },
      ],
      warnings: [],
    });
    const ready = createTradeSubmissionIntentViewData({
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
          fieldsPresent: ['symbol'],
          executable: false,
        },
      ],
      warnings: [],
    });

    expect(`${blocked.statusText} ${blocked.detailText}`).toContain('blocked');
    expect(`${ready.statusText} ${ready.detailText}`).toContain('simulated adapter handoff');
    expect(JSON.stringify({ blocked, ready })).not.toMatch(/place order|submit order|buy now/i);
  });
});
