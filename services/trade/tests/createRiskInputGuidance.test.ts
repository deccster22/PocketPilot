import { createPositionSizingOutput } from '@/services/trade/createPositionSizingOutput';
import { createRiskInputGuidance } from '@/services/trade/createRiskInputGuidance';
import type {
  PreparedTradeRiskLane,
  PositionSizingAvailability,
  ProtectionPlan,
} from '@/services/trade/types';

type PositionSizingUnavailableReason = Extract<
  PositionSizingAvailability,
  { status: 'UNAVAILABLE' }
>['reason'];

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
    context: null,
    ...overrides,
  };
}

function createUnavailablePositionSizing(reason: PositionSizingUnavailableReason): PositionSizingAvailability {
  return {
    status: 'UNAVAILABLE',
    reason,
  };
}

describe('createRiskInputGuidance', () => {
  it('returns calm guidance when the selected plan is missing its prepared price references', () => {
    const plan = createPlan({
      preparedRiskReferences: {
        entryPrice: null,
        stopPrice: null,
        targetPrice: null,
      },
    });
    const risk = createRiskLane();
    const positionSizing = createPositionSizingOutput({
      plan,
      risk,
      accountContext: {
        portfolioValue: 10_000,
        baseCurrency: 'USD',
      },
    });

    expect(positionSizing).toEqual({
      status: 'UNAVAILABLE',
      reason: 'INSUFFICIENT_INPUTS',
    });
    expect(
      createRiskInputGuidance({
        plan,
        risk,
        accountContext: {
          portfolioValue: 10_000,
          baseCurrency: 'USD',
        },
        positionSizing,
      }),
    ).toEqual({
      status: 'AVAILABLE',
      guidance: {
        title: 'Prepared risk context incomplete',
        summary:
          'PocketPilot can finish sizing and max-loss framing once the selected plan carries the missing context.',
        items: ['Prepared entry and stop-loss prices'],
      },
    });
  });

  it('returns calm guidance when the selected basis is unsupported on the current surface', () => {
    const plan = createPlan();
    const risk = createRiskLane({
      activeBasis: null,
      activeBasisLabel: null,
      basisAvailability: {
        status: 'UNAVAILABLE',
        reason: 'NOT_ENABLED_FOR_SURFACE',
      },
    });
    const positionSizing = createPositionSizingOutput({
      plan,
      risk,
      accountContext: {
        portfolioValue: 10_000,
        baseCurrency: 'USD',
      },
    });

    expect(positionSizing).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });
    expect(
      createRiskInputGuidance({
        plan,
        risk,
        accountContext: {
          portfolioValue: 10_000,
          baseCurrency: 'USD',
        },
        positionSizing,
      }),
    ).toEqual({
      status: 'AVAILABLE',
      guidance: {
        title: 'Prepared risk context incomplete',
        summary:
          'PocketPilot can finish sizing and max-loss framing once a supported basis is available on this surface.',
        items: ['A supported risk basis on this surface'],
      },
    });
  });

  it('suppresses guidance cleanly once the prepared sizing lane is complete', () => {
    const plan = createPlan();
    const risk = createRiskLane();
    const positionSizing = createPositionSizingOutput({
      plan,
      risk,
      accountContext: {
        portfolioValue: 10_000,
        baseCurrency: 'USD',
      },
    });

    expect(positionSizing.status).toBe('AVAILABLE');
    expect(
      createRiskInputGuidance({
        plan,
        risk,
        accountContext: {
          portfolioValue: 10_000,
          baseCurrency: 'USD',
        },
        positionSizing,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_GUIDANCE_NEEDED',
    });
  });

  it('returns an honest unavailable state when the surface is disabled', () => {
    expect(
      createRiskInputGuidance({
        plan: createPlan(),
        risk: createRiskLane(),
        accountContext: {
          portfolioValue: 10_000,
          baseCurrency: 'USD',
        },
        positionSizing: createUnavailablePositionSizing('NOT_ENABLED_FOR_SURFACE'),
        isEnabledForSurface: false,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });
  });

  it('keeps blame, advice, and execution wording out of the guidance copy', () => {
    const guidance = createRiskInputGuidance({
      plan: createPlan({
        preparedRiskReferences: {
          entryPrice: null,
          stopPrice: null,
          targetPrice: null,
        },
      }),
      risk: createRiskLane(),
      accountContext: {
        portfolioValue: 10_000,
        baseCurrency: 'USD',
      },
      positionSizing: createUnavailablePositionSizing('INSUFFICIENT_INPUTS'),
    });

    expect(JSON.stringify(guidance)).not.toMatch(
      /advice|should|must|execute|dispatch|profit|win|casino|blame|scold/i,
    );
  });
});
