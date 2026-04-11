import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { MessagePolicyAvailability } from '@/services/messages/types';
import { createTradeHubScreenViewData } from '@/app/screens/tradeHubScreenView';

function unavailableMessagePolicy(): MessagePolicyAvailability {
  return {
    status: 'UNAVAILABLE',
    reason: 'NO_MESSAGE',
    rationale: {
      status: 'UNAVAILABLE',
      reason: 'NO_RATIONALE_AVAILABLE',
    },
  };
}

describe('createTradeHubScreenViewData', () => {
  it('reads the prepared Trade Hub surface contract without re-prioritising it', () => {
    const view = createTradeHubScreenViewData(
      {
        primaryPlan: {
          planId: 'primary-plan',
          intentType: 'ACCUMULATE',
          symbol: 'BTC',
          alignment: 'ALIGNED',
          certainty: 'HIGH',
          summary:
            'Accumulation setup is supported by confirmed momentum building. Focus symbol: BTC.',
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
        risk: {
          activeBasis: 'FIXED_CURRENCY',
          activeBasisLabel: 'Fixed currency',
          basisAvailability: {
            status: 'AVAILABLE',
            selectedBasis: 'FIXED_CURRENCY',
            options: [
              {
                basis: 'ACCOUNT_PERCENT',
                label: 'Account %',
                isSelected: false,
              },
              {
                basis: 'FIXED_CURRENCY',
                label: 'Fixed currency',
                isSelected: true,
              },
              {
                basis: 'POSITION_PERCENT',
                label: 'Position %',
                isSelected: false,
              },
            ],
          },
          context: {
            status: 'AVAILABLE',
            basis: 'FIXED_CURRENCY',
            headline: 'Fixed-currency risk frame',
            summary:
              'Shows the capped loss from this prepared plan as a fixed currency amount using prepared references only.',
            items: [
              {
                label: 'Risk per trade',
                value: '$50.00',
              },
            ],
          },
        },
        meta: {
          hasPrimaryPlan: true,
          profile: 'ADVANCED',
          requiresConfirmation: true,
        },
      },
      unavailableMessagePolicy(),
    );

    expect(view).toEqual({
      profileLabel: 'ADVANCED',
      safetyText: 'Trade Hub frames possible actions only. Nothing here executes a trade.',
      confirmationText: 'Every action remains confirmation-safe and non-executing in this phase.',
      message: {
        visible: false,
      },
      risk: {
        selectedBasisLabel: 'Fixed currency',
        statusText: 'Prepared risk context available',
        headline: 'Fixed-currency risk frame',
        summary:
          'Shows the capped loss from this prepared plan as a fixed currency amount using prepared references only.',
        options: [
          {
            basis: 'ACCOUNT_PERCENT',
            label: 'Account %',
            isSelected: false,
          },
          {
            basis: 'FIXED_CURRENCY',
            label: 'Fixed currency',
            isSelected: true,
          },
          {
            basis: 'POSITION_PERCENT',
            label: 'Position %',
            isSelected: false,
          },
        ],
        items: [
          {
            label: 'Risk per trade',
            value: '$50.00',
          },
        ],
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
    expect(source).toMatch(/messagePolicy\.rationale/);
    expect(source).toMatch(/surface\.risk\.basisAvailability\.status !== 'AVAILABLE'/);
    expect(source).not.toMatch(/kind === 'GUARDED_STOP'/);
    expect(source).not.toMatch(
      /createPreparedMessageInputs|createPreparedMessageRationale|subjectScope|changeStrength|confirmationSupport/,
    );
    expect(source).not.toMatch(/executionCapability|unavailableReason|supportsBracketOrders|supportsOCO/);
    expect(source).not.toMatch(/Math\.abs|portfolioValue|maxPositionSize|entryPrice|stopPrice/);
  });

  it('passes through the prepared guarded-stop note and rationale without classifying it locally', () => {
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
      rationale: {
        status: 'AVAILABLE',
        rationale: {
          title: 'Why this is here',
          summary:
            'Shown as a guarded stop because Trade Hub should keep the current boundary visible instead of carrying the path further.',
          items: [
            'Trade Hub keeps the plan visible as read-only context when the path cannot continue here.',
            'The note is informational only and does not start an order path.',
          ],
        },
      },
    };

    expect(
      createTradeHubScreenViewData(
        {
          primaryPlan: null,
          alternativePlans: [],
          risk: {
            activeBasis: null,
            activeBasisLabel: null,
            basisAvailability: {
              status: 'UNAVAILABLE',
              reason: 'NOT_ENABLED_FOR_SURFACE',
            },
            context: null,
          },
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
        rationale: messagePolicy.rationale,
      },
    });
    expect(JSON.stringify(messagePolicy)).not.toMatch(/badge|unread|notification|urgent|popup/);
  });

  it('returns null when the prepared trade hub surface is unavailable', () => {
    expect(createTradeHubScreenViewData(null)).toBeNull();
  });
});
