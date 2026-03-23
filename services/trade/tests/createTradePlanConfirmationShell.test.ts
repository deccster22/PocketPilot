import { createTradePlanConfirmationShell } from '@/services/trade/createTradePlanConfirmationShell';
import type { AccountCapabilityContext, ProtectionPlan } from '@/services/trade/types';

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
      maxPositionSize: 0.1,
      cooldownActive: false,
    },
    createdAt: 100,
    ...overrides,
  };
}

function createCapabilities(
  overrides: Partial<AccountCapabilityContext> = {},
): AccountCapabilityContext {
  return {
    accountId: 'acct-live',
    brokerId: 'broker-demo',
    supportsBracketOrders: false,
    supportsOCO: false,
    requiresSeparateOrders: false,
    supportsStopLoss: false,
    supportsTakeProfit: false,
    ...overrides,
  };
}

describe('createTradePlanConfirmationShell', () => {
  it('creates the confirmation shell model shape without leaking raw plan internals', () => {
    const shell = createTradePlanConfirmationShell({
      plan: createPlan(),
      capabilities: createCapabilities({
        supportsBracketOrders: true,
        supportsStopLoss: true,
        supportsTakeProfit: true,
      }),
    });

    expect(shell).toEqual({
      planId: 'plan-btc',
      headline: {
        intentType: 'ACCUMULATE',
        symbol: 'BTC',
        actionState: 'READY',
      },
      readiness: {
        alignment: 'ALIGNED',
        certainty: 'HIGH',
      },
      confirmation: {
        requiresConfirmation: true,
        pathType: 'BRACKET',
        stepsLabel: 'Single confirmation flow',
        executionAvailable: false,
      },
      constraints: {
        cooldownActive: false,
        maxPositionSize: 0.1,
      },
      placeholders: {
        orderPayloadAvailable: false,
        executionPreviewAvailable: false,
      },
    });
    expect(shell).not.toHaveProperty('accountId');
    expect(shell).not.toHaveProperty('strategyId');
    expect(JSON.stringify(shell)).not.toContain('event-1');
    expect(JSON.stringify(shell)).not.toContain('momentum_basics');
  });

  it.each([
    [
      'OCO',
      createCapabilities({
        supportsOCO: true,
        supportsStopLoss: true,
        supportsTakeProfit: true,
      }),
      'Link exits after entry',
    ],
    [
      'GUIDED_SEQUENCE',
      createCapabilities({
        requiresSeparateOrders: true,
        supportsStopLoss: true,
        supportsTakeProfit: true,
      }),
      'Review separate order steps',
    ],
    ['UNAVAILABLE', createCapabilities(), 'Execution path unavailable'],
  ])(
    'selects the %s path deterministically from capability context',
    (expectedPathType, capabilities, expectedStepsLabel) => {
      const first = createTradePlanConfirmationShell({
        plan: createPlan(),
        capabilities,
      });
      const second = createTradePlanConfirmationShell({
        plan: createPlan(),
        capabilities,
      });

      expect(first).toEqual(second);
      expect(first.confirmation.pathType).toBe(expectedPathType);
      expect(first.confirmation.stepsLabel).toBe(expectedStepsLabel);
    },
  );
});
