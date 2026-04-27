import {
  createDefaultGuardrailPreferences,
  createInMemoryGuardrailPreferencesStore,
} from '@/services/trade/guardrailPreferencesStore';
import { createInMemoryPreferredRiskBasisStore } from '@/services/trade/preferredRiskBasisStore';
import { createTradeHubRiskLane } from '@/services/trade/createTradeHubRiskLane';
import type { ProtectionPlan } from '@/services/trade/types';

function createPlan(overrides: Partial<ProtectionPlan> = {}): ProtectionPlan {
  return {
    planId: 'plan-btc',
    accountId: 'acct-live',
    strategyId: 'momentum_basics',
    symbol: 'BTC',
    intentType: 'ACCUMULATE',
    rationale: {
      primaryEventId: 'event-1',
      supportingEventIds: ['event-1'],
      summary: 'Accumulation setup is supported by confirmed momentum building. Focus symbol: BTC.',
    },
    riskProfile: {
      certainty: 'HIGH',
      alignment: 'ALIGNED',
    },
    constraints: {
      cooldownActive: false,
      maxPositionSize: 0.1,
    },
    preparedRiskReferences: {
      entryPrice: 100,
      stopPrice: 95,
      targetPrice: 112,
    },
    createdAt: 100,
    ...overrides,
  };
}

describe('createTradeHubRiskLane', () => {
  it('composes the consolidated lane from the shared prepared-risk and preference seams', async () => {
    const preferredRiskBasisStore = createInMemoryPreferredRiskBasisStore([
      {
        accountId: 'acct-live',
        riskBasis: 'FIXED_CURRENCY',
      },
    ]);
    const guardrailPreferencesStore = createInMemoryGuardrailPreferencesStore([
      {
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
    ]);

    const lane = await createTradeHubRiskLane({
      plan: createPlan(),
      selectedRiskBasis: 'POSITION_PERCENT',
      accountId: 'acct-live',
      accountContext: {
        portfolioValue: 10_000,
        baseCurrency: 'USD',
      },
      preferredRiskBasisStore,
      guardrailPreferencesStore,
    });

    expect(lane).toEqual({
      selectedRiskBasis: 'POSITION_PERCENT',
      preparedRiskLane: {
        activeBasis: 'POSITION_PERCENT',
        activeBasisLabel: 'Position %',
        basisAvailability: {
          status: 'AVAILABLE',
          selectedBasis: 'POSITION_PERCENT',
          options: [
            {
              basis: 'ACCOUNT_PERCENT',
              label: 'Account %',
              isSelected: false,
            },
            {
              basis: 'FIXED_CURRENCY',
              label: 'Fixed currency',
              isSelected: false,
            },
            {
              basis: 'POSITION_PERCENT',
              label: 'Position %',
              isSelected: true,
            },
          ],
        },
        context: {
          status: 'AVAILABLE',
          basis: 'POSITION_PERCENT',
          headline: 'Position % risk frame',
          summary:
            'Shows the capped loss from this prepared plan as a share of the capped position value using prepared planning levels only.',
          items: [
            {
              label: 'Risk per trade',
              value: '5.00%',
            },
            {
              label: 'Max loss at cap',
              value: '$50.00',
            },
            {
              label: 'Position cap used',
              value: '10.00%',
            },
            {
              label: 'Prepared price path',
              value: '$100.00 entry to $95.00 stop',
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
          sizeLabel: 'Position size (Position %)',
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
            'One enabled guardrail sits outside the chosen structure. Trade Hub is only describing that status here.',
          items: [
            {
              guardrailKey: 'riskLimitPerTrade',
              status: 'OUTSIDE_GUARDRAIL',
              label: 'Risk limit per trade',
              summary: 'Current risk per trade sits above your saved threshold.',
            },
            {
              guardrailKey: 'cooldownAfterLoss',
              status: 'WITHIN_GUARDRAIL',
              label: 'Cooldown after loss',
              summary: 'No cooldown is active right now.',
            },
          ],
        },
      },
    });
    expect(JSON.stringify(lane)).not.toMatch(/\bblock|must|should|enforce|dispatch|execute\b/i);
  });

  it('suppresses guardrail evaluation cleanly when every optional guardrail stays off by default', async () => {
    const lane = await createTradeHubRiskLane({
      plan: createPlan(),
      selectedRiskBasis: 'ACCOUNT_PERCENT',
      accountId: 'acct-live',
      accountContext: {
        portfolioValue: 10_000,
        baseCurrency: 'USD',
      },
      preferredRiskBasisStore: createInMemoryPreferredRiskBasisStore(),
      guardrailPreferencesStore: createInMemoryGuardrailPreferencesStore([
        {
          accountId: 'acct-live',
          preferences: createDefaultGuardrailPreferences(),
        },
      ]),
    });

    expect(lane.guardrailPreferencesAvailability).toEqual({
      status: 'AVAILABLE',
      accountId: 'acct-live',
      preferences: createDefaultGuardrailPreferences(),
    });
    expect(lane.guardrailEvaluationAvailability).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_ENABLED_GUARDRAILS',
    });
  });

  it('returns honest unavailable states when the selected plan context is too thin to prepare a lane', async () => {
    const lane = await createTradeHubRiskLane({
      plan: null,
      selectedRiskBasis: 'POSITION_PERCENT',
      accountId: 'acct-live',
      accountContext: {
        portfolioValue: 10_000,
        baseCurrency: 'USD',
      },
      preferredRiskBasisStore: createInMemoryPreferredRiskBasisStore([
        {
          accountId: 'acct-live',
          riskBasis: 'FIXED_CURRENCY',
        },
      ]),
      guardrailPreferencesStore: createInMemoryGuardrailPreferencesStore([
        {
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
              isEnabled: false,
              windowLabel: null,
            },
          },
        },
      ]),
    });

    expect(lane.selectedRiskBasis).toBeNull();
    expect(lane.preparedRiskLane).toEqual({
      activeBasis: null,
      activeBasisLabel: null,
      basisAvailability: {
        status: 'UNAVAILABLE',
        reason: 'NOT_ENABLED_FOR_SURFACE',
      },
      context: null,
    });
    expect(lane.positionSizingAvailability).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });
    expect(lane.guardrailEvaluationAvailability).toEqual({
      status: 'UNAVAILABLE',
      reason: 'INSUFFICIENT_CONTEXT',
    });
  });
});
