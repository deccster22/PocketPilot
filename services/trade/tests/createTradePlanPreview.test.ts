import { createTradePlanPreview } from '@/services/trade/createTradePlanPreview';
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
      supportingEventIds: ['event-1', 'event-2'],
      summary: 'Accumulation setup is supported by confirmed momentum building. Focus symbol: BTC.',
    },
    riskProfile: {
      certainty: 'HIGH',
      alignment: 'ALIGNED',
    },
    constraints: {
      maxPositionSize: 0.1,
    },
    preparedRiskReferences: null,
    createdAt: 100,
    ...overrides,
  };
}

describe('createTradePlanPreview', () => {
  it('creates the confirmation-safe preview model shape from a protection plan', () => {
    expect(createTradePlanPreview(createPlan())).toEqual({
      planId: 'plan-btc',
      headline: {
        intentType: 'ACCUMULATE',
        symbol: 'BTC',
        actionState: 'READY',
      },
      rationale: {
        summary:
          'Accumulation setup is supported by confirmed momentum building. Focus symbol: BTC.',
        primaryEventId: 'event-1',
        supportingEventIds: ['event-1', 'event-2'],
        supportingEventCount: 2,
      },
      constraints: {
        requiresConfirmation: true,
        maxPositionSize: 0.1,
      },
      readiness: {
        alignment: 'ALIGNED',
        certainty: 'HIGH',
      },
      placeholders: {
        orderPreviewAvailable: false,
        executionPreviewAvailable: false,
      },
    });
  });

  it('stays deterministic and omits non-preview fields', () => {
    const plan = createPlan({
      intentType: 'WAIT',
      rationale: {
        primaryEventId: null,
        supportingEventIds: ['event-3'],
        summary: 'Wait for confirmed pricing before framing a trading action. Do not frame an action for BTC yet.',
      },
      riskProfile: {
        certainty: 'LOW',
        alignment: 'MISALIGNED',
      },
      constraints: {
        cooldownActive: true,
      },
    });

    const first = createTradePlanPreview(plan);
    const second = createTradePlanPreview(plan);

    expect(first).toEqual(second);
    expect(first).not.toHaveProperty('accountId');
    expect(first).not.toHaveProperty('strategyId');
    expect(first).not.toHaveProperty('createdAt');
  });
});
