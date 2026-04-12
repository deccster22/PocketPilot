import { createGuardrailEvaluation } from '@/services/trade/createGuardrailEvaluation';
import type { PreparedTradeRiskLane, ProtectionPlan } from '@/services/trade/types';

function createPlan(overrides: Partial<ProtectionPlan> = {}): ProtectionPlan {
  return {
    planId: 'plan-btc',
    accountId: 'acct-a',
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
    preparedRiskReferences: null,
    createdAt: 100,
    ...overrides,
  };
}

function createRiskLane(overrides: Partial<PreparedTradeRiskLane> = {}): PreparedTradeRiskLane {
  return {
    activeBasis: 'ACCOUNT_PERCENT',
    activeBasisLabel: 'Account %',
    basisAvailability: {
      status: 'AVAILABLE',
      selectedBasis: 'ACCOUNT_PERCENT',
      options: [
        {
          basis: 'ACCOUNT_PERCENT',
          label: 'Account %',
          isSelected: true,
        },
        {
          basis: 'FIXED_CURRENCY',
          label: 'Fixed currency',
          isSelected: false,
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
      basis: 'ACCOUNT_PERCENT',
      headline: 'Account % risk frame',
      summary:
        'Shows the capped loss from this prepared plan as a share of current account value using prepared references only.',
      items: [
        {
          label: 'Risk per trade',
          value: '5.00%',
        },
        {
          label: 'Max loss at cap',
          value: '$500.00',
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
    ...overrides,
  };
}

describe('createGuardrailEvaluation', () => {
  it('keeps account-scoped preference states explicit and suppresses evaluation when nothing is enabled', () => {
    const sharedPlan = createPlan();
    const sharedRisk = createRiskLane();

    const accountAResult = createGuardrailEvaluation({
      plan: sharedPlan,
      risk: sharedRisk,
      guardrailPreferencesAvailability: {
        status: 'AVAILABLE',
        accountId: 'acct-a',
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
      accountValue: 10_000,
      isEnabledForSurface: true,
    });
    const accountBResult = createGuardrailEvaluation({
      plan: sharedPlan,
      risk: sharedRisk,
      guardrailPreferencesAvailability: {
        status: 'AVAILABLE',
        accountId: 'acct-b',
        preferences: {
          riskLimitPerTrade: {
            isEnabled: false,
            thresholdLabel: null,
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
      accountValue: 10_000,
      isEnabledForSurface: true,
    });

    expect(accountAResult).toEqual({
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
    });

    expect(accountBResult).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_ENABLED_GUARDRAILS',
    });
  });

  it('marks a near guardrail when a plan sits close to the daily loss threshold', () => {
    const result = createGuardrailEvaluation({
      plan: createPlan(),
      risk: createRiskLane({
        context: {
          status: 'AVAILABLE',
          basis: 'ACCOUNT_PERCENT',
          headline: 'Account % risk frame',
          summary:
            'Shows the capped loss from this prepared plan as a share of current account value using prepared references only.',
          items: [
            {
              label: 'Risk per trade',
              value: '1.50%',
            },
            {
              label: 'Max loss at cap',
              value: '$45.00',
            },
          ],
        },
      }),
      guardrailPreferencesAvailability: {
        status: 'AVAILABLE',
        accountId: 'acct-a',
        preferences: {
          riskLimitPerTrade: {
            isEnabled: false,
            thresholdLabel: null,
          },
          dailyLossThreshold: {
            isEnabled: true,
            thresholdLabel: '$50.00',
          },
          cooldownAfterLoss: {
            isEnabled: false,
            windowLabel: null,
          },
        },
      },
      accountValue: 10_000,
      isEnabledForSurface: true,
    });

    expect(result).toEqual({
      status: 'AVAILABLE',
      evaluation: {
        title: 'Prepared guardrail status',
        summary:
          'One enabled guardrail sits near the chosen structure. Trade Hub is only describing that status here.',
        items: [
          {
            guardrailKey: 'dailyLossThreshold',
            status: 'NEAR_GUARDRAIL',
            label: 'Daily loss threshold',
            summary: 'Current max loss at cap sits close to your saved threshold.',
          },
        ],
      },
    });
  });

  it('keeps partially missing context descriptive instead of blocking the lane', () => {
    const result = createGuardrailEvaluation({
      plan: createPlan({
        constraints: {
          cooldownActive: false,
          maxPositionSize: 0.1,
        },
      }),
      risk: createRiskLane({
        context: {
          status: 'UNAVAILABLE',
          basis: 'ACCOUNT_PERCENT',
          headline: 'Account % risk frame unavailable',
          summary:
            'PocketPilot can frame this basis once prepared entry, stop, and position-cap context are all available.',
          items: [
            {
              label: 'Needed',
              value: 'Prepared entry, prepared stop, and a prepared position cap',
            },
          ],
          reason: 'MISSING_PRICE_REFERENCES',
        },
      }),
      guardrailPreferencesAvailability: {
        status: 'AVAILABLE',
        accountId: 'acct-a',
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
      accountValue: 10_000,
      isEnabledForSurface: true,
    });

    expect(result).toEqual({
      status: 'AVAILABLE',
      evaluation: {
        title: 'Prepared guardrail status',
        summary:
          'Trade Hub prepared the enabled guardrails it could compare, and left the rest as not evaluated.',
        items: [
          {
            guardrailKey: 'riskLimitPerTrade',
            status: 'NOT_EVALUATED',
            label: 'Risk limit per trade',
            summary: 'Current risk per trade could not be compared with the current plan.',
          },
          {
            guardrailKey: 'cooldownAfterLoss',
            status: 'WITHIN_GUARDRAIL',
            label: 'Cooldown after loss',
            summary: 'No cooldown is active right now.',
          },
        ],
      },
    });
  });

  it('treats cooldown as descriptive only when active', () => {
    const result = createGuardrailEvaluation({
      plan: createPlan({
        constraints: {
          cooldownActive: true,
          maxPositionSize: 0.1,
        },
      }),
      risk: createRiskLane({
        context: {
          status: 'UNAVAILABLE',
          basis: 'ACCOUNT_PERCENT',
          headline: 'Account % risk frame unavailable',
          summary:
            'PocketPilot can frame this basis once prepared entry, stop, and position-cap context are all available.',
          items: [
            {
              label: 'Needed',
              value: 'Prepared entry, prepared stop, and a prepared position cap',
            },
          ],
          reason: 'MISSING_PRICE_REFERENCES',
        },
      }),
      guardrailPreferencesAvailability: {
        status: 'AVAILABLE',
        accountId: 'acct-a',
        preferences: {
          riskLimitPerTrade: {
            isEnabled: false,
            thresholdLabel: null,
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
      accountValue: 10_000,
      isEnabledForSurface: true,
    });

    expect(result).toEqual({
      status: 'AVAILABLE',
      evaluation: {
        title: 'Prepared guardrail status',
        summary:
          'One enabled guardrail sits outside the chosen structure. Trade Hub is only describing that status here.',
        items: [
          {
            guardrailKey: 'cooldownAfterLoss',
            status: 'OUTSIDE_GUARDRAIL',
            label: 'Cooldown after loss',
            summary: 'A cooldown window is active after a loss.',
          },
        ],
      },
    });

    expect(JSON.stringify(result)).not.toMatch(/\bblock|must|should|compliance|advice|execution\b/i);
  });

  it('returns honest unavailable states when the selected plan or surface context is missing', () => {
    expect(
      createGuardrailEvaluation({
        plan: null,
        risk: createRiskLane(),
        guardrailPreferencesAvailability: {
          status: 'AVAILABLE',
          accountId: 'acct-a',
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
        accountValue: 10_000,
        isEnabledForSurface: true,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'INSUFFICIENT_CONTEXT',
    });

    expect(
      createGuardrailEvaluation({
        plan: createPlan(),
        risk: createRiskLane(),
        guardrailPreferencesAvailability: {
          status: 'AVAILABLE',
          accountId: 'acct-a',
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
        accountValue: 10_000,
        isEnabledForSurface: false,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });
  });
});
