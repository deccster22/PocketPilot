import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { MessagePolicyAvailability } from '@/services/messages/types';
import { createTradeHubScreenViewData } from '@/app/screens/tradeHubScreenView';

describe('createTradeHubScreenViewData', () => {
  it('reads the prepared Trade Hub surface contract without re-prioritising it', () => {
    const view = createTradeHubScreenViewData({
      primaryPlan: {
        planId: 'primary-plan',
        intentType: 'ACCUMULATE',
        symbol: 'BTC',
        alignment: 'ALIGNED',
        certainty: 'HIGH',
        summary: 'Accumulation setup is supported by confirmed momentum building. Focus symbol: BTC.',
        supportingEventCount: 2,
        actionState: 'READY',
      },
      alternativePlans: [
        {
          planId: 'alt-plan',
          intentType: 'HOLD',
          symbol: 'ETH',
          alignment: 'NEUTRAL',
          certainty: 'MEDIUM',
          summary: 'Hold for now while price movement is monitored without a clearer setup.',
          supportingEventCount: 1,
          actionState: 'CAUTION',
        },
      ],
      meta: {
        hasPrimaryPlan: true,
        profile: 'ADVANCED',
        requiresConfirmation: true,
      },
    });

    expect(view).toEqual({
      profileLabel: 'ADVANCED',
      safetyText: 'Trade Hub frames possible actions only. Nothing here executes a trade.',
      confirmationText: 'Every action remains confirmation-safe and non-executing in this phase.',
      message: {
        visible: false,
      },
      primaryPlan: {
        planId: 'primary-plan',
        intentLabel: 'Accumulate',
        symbolLabel: 'BTC',
        summary:
          'Accumulation setup is supported by confirmed momentum building. Focus symbol: BTC.',
        alignmentText: 'aligned',
        certaintyText: 'high',
        actionStateText: 'Ready for confirmation',
        supportingEventsText: '2 supporting events',
      },
      alternativePlans: [
        {
          planId: 'alt-plan',
          intentLabel: 'Hold',
          symbolLabel: 'ETH',
          summary: 'Hold for now while price movement is monitored without a clearer setup.',
          alignmentText: 'neutral',
          certaintyText: 'medium',
          actionStateText: 'Caution before confirmation',
          supportingEventsText: '1 supporting event',
        },
      ],
    });
  });

  it('keeps the screen helper on the prepared message-policy and Trade Hub contracts only', () => {
    const source = readFileSync(join(process.cwd(), 'app', 'screens', 'tradeHubScreenView.ts'), 'utf8');

    expect(source).toMatch(/messagePolicy\?\.status === 'AVAILABLE'/);
    expect(source).toMatch(/messagePolicy\.messages\[0\]/);
    expect(source).not.toMatch(/kind === 'GUARDED_STOP'/);
    expect(source).not.toMatch(/executionCapability|unavailableReason|supportsBracketOrders|supportsOCO/);
  });

  it('passes through the prepared guarded-stop note without classifying it locally', () => {
    const messagePolicy: MessagePolicyAvailability = {
      status: 'AVAILABLE',
      messages: [
        {
          kind: 'GUARDED_STOP',
          title: 'Protected path unavailable',
          summary:
            'Account capabilities do not support a protected execution path for this plan. Trade Hub will keep the plan visible as a read-only framing note instead of carrying the action path further.',
          priority: 'HIGH',
          surface: 'TRADE_HUB',
          dismissible: false,
        },
      ],
    };

    expect(
      createTradeHubScreenViewData(
        {
          primaryPlan: null,
          alternativePlans: [],
          meta: {
            hasPrimaryPlan: false,
            profile: 'ADVANCED',
            requiresConfirmation: true,
          },
        },
        messagePolicy,
      ),
    ).toMatchObject({
      message: {
        visible: true,
        kind: 'GUARDED_STOP',
        priority: 'HIGH',
        title: 'Protected path unavailable',
        summary:
          'Account capabilities do not support a protected execution path for this plan. Trade Hub will keep the plan visible as a read-only framing note instead of carrying the action path further.',
      },
    });
    expect(JSON.stringify(messagePolicy)).not.toMatch(/badge|unread|notification|urgent|popup/);
  });

  it('returns null when the prepared trade hub surface is unavailable', () => {
    expect(createTradeHubScreenViewData(null)).toBeNull();
  });
});
