import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createTradeConfirmationFlowViewData } from '@/app/screens/tradeConfirmationFlowView';

describe('createTradeConfirmationFlowViewData', () => {
  it('reads the prepared confirmation flow without inferring steps in the app', () => {
    const view = createTradeConfirmationFlowViewData({
      planId: 'plan-btc',
      steps: [
        {
          stepId: 'review',
          type: 'REVIEW',
          label: 'Review single confirmation flow',
          completed: true,
          required: true,
        },
        {
          stepId: 'confirm-intent',
          type: 'CONFIRM_INTENT',
          label: 'Confirm user intent before any later execution step',
          completed: false,
          required: true,
        },
      ],
      currentStepId: 'confirm-intent',
      canProceed: false,
      blockedReason: 'Complete all required confirmation steps before proceeding.',
    });

    expect(view).toEqual({
      planId: 'plan-btc',
      currentStepId: 'confirm-intent',
      canProceedText: 'Confirmation cannot proceed yet.',
      blockedReasonText: 'Complete all required confirmation steps before proceeding.',
      steps: [
        {
          stepId: 'review',
          type: 'REVIEW',
          label: 'Review single confirmation flow',
          statusText: 'Completed',
        },
        {
          stepId: 'confirm-intent',
          type: 'CONFIRM_INTENT',
          label: 'Confirm user intent before any later execution step',
          statusText: 'Required',
        },
      ],
    });
  });

  it('returns null when no prepared confirmation flow is available', () => {
    expect(createTradeConfirmationFlowViewData(null)).toBeNull();
  });

  it('keeps capability and flow orchestration logic out of the app screen', () => {
    const screenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'TradeHubScreen.tsx'),
      'utf8',
    );

    expect(screenSource).not.toMatch(/supportsBracketOrders/);
    expect(screenSource).not.toMatch(/supportsOCO/);
    expect(screenSource).not.toMatch(/requiresSeparateOrders/);
    expect(screenSource).not.toMatch(/createConfirmationFlow/);
  });
});
