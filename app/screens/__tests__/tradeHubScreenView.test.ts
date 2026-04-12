import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type {
  MessagePolicyAvailability,
  MessagePolicyLane,
} from '@/services/messages/types';
import { createUnavailableTradeHubRiskLane } from '@/services/trade/createTradeHubRiskLane';
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

function createMessagePolicyLane(policyAvailability: MessagePolicyAvailability): MessagePolicyLane {
  return {
    policyAvailability,
    rationaleAvailability: policyAvailability.rationale,
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
        riskLane: {
          selectedRiskBasis: 'FIXED_CURRENCY',
          preparedRiskLane: {
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
          preferredRiskBasisAvailability: {
            status: 'AVAILABLE',
            accountId: 'acct-live',
            preferredBasis: 'FIXED_CURRENCY',
          },
          positionSizingAvailability: {
            status: 'AVAILABLE',
            output: {
              sizeLabel: 'Position size (Fixed currency)',
              sizeValue: '10 units at $1,000.00 cap',
              maxLossLabel: 'Max loss at stop',
              maxLossValue: '$50.00',
              notes: [
                'Prepared entry $100.00 to stop $95.00.',
                'Support-only readout; no order path is opened here.',
              ],
            },
          },
          riskInputGuidanceAvailability: {
            status: 'UNAVAILABLE',
            reason: 'NO_GUIDANCE_NEEDED',
          },
          guardrailPreferencesAvailability: {
            status: 'AVAILABLE',
            accountId: 'acct-live',
            preferences: {
              riskLimitPerTrade: {
                isEnabled: true,
                thresholdLabel: '2%',
              },
              dailyLossThreshold: {
                isEnabled: false,
                thresholdLabel: null,
              },
              cooldownAfterLoss: {
                isEnabled: true,
                windowLabel: '1 day',
              },
            },
          },
          guardrailEvaluationAvailability: {
            status: 'AVAILABLE',
            evaluation: {
              title: 'Prepared guardrail status',
              summary:
                'One enabled guardrail sits outside the chosen structure. Trade Hub prepared the rest as not evaluated, and is only describing that status here.',
              items: [
                {
                  guardrailKey: 'riskLimitPerTrade',
                  status: 'OUTSIDE_GUARDRAIL',
                  label: 'Risk limit per trade',
                  summary: 'Current risk per trade sits above your saved threshold.',
                },
                {
                  guardrailKey: 'cooldownAfterLoss',
                  status: 'NOT_EVALUATED',
                  label: 'Cooldown after loss',
                  summary: 'The current plan does not yet carry a cooldown state.',
                },
              ],
            },
          },
        },
        meta: {
          hasPrimaryPlan: true,
          profile: 'ADVANCED',
          requiresConfirmation: true,
        },
      },
      createMessagePolicyLane(unavailableMessagePolicy()),
    );

    expect(view).toEqual({
      profileLabel: 'ADVANCED',
      safetyText: 'Trade Hub frames possible actions only. Nothing here executes a trade.',
      confirmationText: 'Every action remains confirmation-safe and non-executing in this phase.',
      message: {
        visible: false,
      },
      riskLane: {
        risk: {
          selectedBasisLabel: 'Fixed currency',
          preferredRiskBasisText: 'Usual basis for this account: Fixed currency',
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
        guardrailPreferences: {
          accountText: 'Account: acct-live',
          summaryText: '2 optional guardrails are enabled and 1 are off by default.',
          statusText: 'Guardrail preferences are ready for this account.',
          canEdit: true,
          items: [
            {
              key: 'riskLimitPerTrade',
              label: 'Risk limit per trade',
              isEnabled: true,
              stateText: 'Enabled - 2%',
              detailText: 'Threshold: 2%',
              inputPlaceholder: 'e.g. 2%',
            },
            {
              key: 'dailyLossThreshold',
              label: 'Daily loss threshold',
              isEnabled: false,
              stateText: 'Off by default',
              detailText: 'Threshold not set',
              inputPlaceholder: 'e.g. 4%',
            },
            {
              key: 'cooldownAfterLoss',
              label: 'Cooldown after loss',
              isEnabled: true,
              stateText: 'Enabled - 1 day',
              detailText: 'Window: 1 day',
              inputPlaceholder: 'e.g. 1 day',
            },
          ],
        },
        guardrailEvaluation: {
          titleText: 'Prepared guardrail status',
          summaryText:
            'One enabled guardrail sits outside the chosen structure. Trade Hub prepared the rest as not evaluated, and is only describing that status here.',
          items: [
            {
              key: 'riskLimitPerTrade',
              label: 'Risk limit per trade',
              statusText: 'Outside guardrail',
              summaryText: 'Current risk per trade sits above your saved threshold.',
            },
            {
              key: 'cooldownAfterLoss',
              label: 'Cooldown after loss',
              statusText: 'Not evaluated',
              summaryText: 'The current plan does not yet carry a cooldown state.',
            },
          ],
        },
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

    expect(source).toMatch(/messagePolicyLane\?\.policyAvailability/);
    expect(source).toMatch(/policyAvailability\?\.status === 'AVAILABLE'/);
    expect(source).toMatch(/policyAvailability\.messages\[0\]/);
    expect(source).toMatch(/messagePolicyLane\?\.rationaleAvailability \?\? policyAvailability\.rationale/);
    expect(source).toMatch(/surface\.riskLane\.preparedRiskLane\.basisAvailability\.status !== 'AVAILABLE'/);
    expect(source).toMatch(/surface\.riskLane\.preferredRiskBasisAvailability/);
    expect(source).toMatch(/surface\.riskLane\.guardrailPreferencesAvailability/);
    expect(source).toMatch(/surface\.riskLane\.guardrailEvaluationAvailability/);
    expect(source).not.toMatch(/kind === 'GUARDED_STOP'/);
    expect(source).not.toMatch(
      /createPreparedMessageInputs|createPreparedMessageRationale|subjectScope|changeStrength|confirmationSupport/,
    );
    expect(source).not.toMatch(/executionCapability|unavailableReason|supportsBracketOrders|supportsOCO/);
    expect(source).not.toMatch(/Math\.abs|portfolioValue|maxPositionSize|entryPrice|stopPrice/);
    expect(source).not.toMatch(
      /updatePreferredRiskBasis|updateGuardrailPreferences|preferredRiskBasisStore|guardrailPreferencesStore|normalisePreferredRiskBasisState|normaliseGuardrailPreferencesState|createInMemoryPreferredRiskBasisStore|createInMemoryGuardrailPreferencesStore|createGuardrailEvaluation|compareComparableValues|parseComparableValue|classifyComparableValue/,
    );
    expect(source).not.toMatch(/from '@\/services\/trade\/createTradeHubRiskLane'/);
  });

  it('keeps preference persistence routed through the screen component service seam, not a screen-owned store', () => {
    const source = readFileSync(join(process.cwd(), 'app', 'screens', 'TradeHubScreen.tsx'), 'utf8');

    expect(source).toMatch(/updatePreferredRiskBasis/);
    expect(source).toMatch(/updateGuardrailPreferences/);
    expect(source).toMatch(/surfaceModel\?\.riskLane\.preferredRiskBasisAvailability/);
    expect(source).toMatch(/riskLaneView\?\.guardrailEvaluation/);
    expect(source).not.toMatch(
      /preferredRiskBasisStore|guardrailPreferencesStore|normalisePreferredRiskBasisState|normaliseGuardrailPreferencesState|createInMemoryPreferredRiskBasisStore|createInMemoryGuardrailPreferencesStore|createGuardrailEvaluation|compareComparableValues|parseComparableValue|classifyComparableValue/,
    );
  });

  it('renders the prepared risk-input guidance note from the preview lane without rebuilding it locally', () => {
    const source = readFileSync(join(process.cwd(), 'app', 'screens', 'TradeHubScreen.tsx'), 'utf8');

    expect(source).toMatch(/previewView\.riskInputGuidance/);
    expect(source).toMatch(/previewView\.riskInputGuidance\.guidance\.title/);
    expect(source).not.toMatch(/createRiskInputGuidance/);
    expect(source).not.toMatch(/Prepared risk context incomplete|A supported risk basis on this surface/);
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
          riskLane: createUnavailableTradeHubRiskLane(),
          meta: {
            hasPrimaryPlan: false,
            profile: 'ADVANCED',
            requiresConfirmation: true,
          },
        },
        createMessagePolicyLane(messagePolicy),
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
