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
          acknowledged: true,
          required: true,
          acknowledgementLabel: 'Acknowledge review',
        },
        {
          stepId: 'confirm-intent',
          type: 'CONFIRM_INTENT',
          label: 'Confirm user intent before any later execution step',
          completed: false,
          acknowledged: false,
          required: true,
          acknowledgementLabel: 'Acknowledge intent',
        },
      ],
      currentStepId: 'confirm-intent',
      canProceed: false,
      allRequiredAcknowledged: false,
      blockedReason: 'Complete all required confirmation steps before proceeding.',
    });

    expect(view).toEqual({
      planId: 'plan-btc',
      currentStepId: 'confirm-intent',
      canProceedText: 'Confirmation cannot proceed yet.',
      allRequiredAcknowledgedText: 'Required acknowledgement is still pending.',
      blockedReasonText: 'Complete all required confirmation steps before proceeding.',
      steps: [
        {
          stepId: 'review',
          type: 'REVIEW',
          label: 'Review single confirmation flow',
          acknowledged: true,
          acknowledgementLabel: 'Acknowledge review',
          statusText: 'Acknowledged',
        },
        {
          stepId: 'confirm-intent',
          type: 'CONFIRM_INTENT',
          label: 'Confirm user intent before any later execution step',
          acknowledged: false,
          acknowledgementLabel: 'Acknowledge intent',
          statusText: 'Requires acknowledgement',
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
