import { createTradeHubSurfaceModel } from '@/services/trade/createTradeHubSurfaceModel';
import { createUnavailableTradeHubRiskLane } from '@/services/trade/createTradeHubRiskLane';
import type {
  PreparedTradeRiskLane,
  ProtectionPlan,
  TradeHubRiskLane,
} from '@/services/trade/types';

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
    preparedRiskReferences: null,
    createdAt: 100,
    ...overrides,
  };
}

function createPreparedRiskLane(
  overrides: Partial<PreparedTradeRiskLane> = {},
): PreparedTradeRiskLane {
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
    ...overrides,
  };
}

function createTradeHubRiskLaneFixture(
  overrides: Partial<TradeHubRiskLane> = {},
): TradeHubRiskLane {
  return {
    selectedRiskBasis: 'ACCOUNT_PERCENT',
    preparedRiskLane: createPreparedRiskLane(),
    preferredRiskBasisAvailability: {
      status: 'UNAVAILABLE',
      reason: 'NO_ACCOUNT_CONTEXT',
    },
    positionSizingAvailability: {
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    },
    riskInputGuidanceAvailability: {
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    },
    guardrailPreferencesAvailability: {
      status: 'UNAVAILABLE',
      reason: 'NO_ACCOUNT_CONTEXT',
    },
    guardrailEvaluationAvailability: {
      status: 'UNAVAILABLE',
      reason: 'INSUFFICIENT_CONTEXT',
    },
    ...overrides,
  };
}

describe('createTradeHubSurfaceModel', () => {
  it('creates one primary plan and profile-limited alternatives', () => {
    const result = createTradeHubSurfaceModel({
      profile: 'BEGINNER',
      riskLane: createTradeHubRiskLaneFixture(),
      protectionPlans: [
        createPlan({
          planId: 'wait-plan',
          symbol: 'SOL',
          intentType: 'WAIT',
          rationale: {
            primaryEventId: 'event-3',
            supportingEventIds: ['event-3'],
            summary: 'Wait for confirmed pricing before framing a trading action.',
          },
          riskProfile: {
            certainty: 'LOW',
            alignment: 'MISALIGNED',
          },
        }),
        createPlan({
          planId: 'caution-plan',
          symbol: 'ETH',
          intentType: 'HOLD',
          rationale: {
            primaryEventId: 'event-2',
            supportingEventIds: ['event-2', 'event-4'],
            summary: 'Hold for now while price movement is monitored without a clearer setup.',
          },
          riskProfile: {
            certainty: 'MEDIUM',
            alignment: 'NEUTRAL',
          },
        }),
        createPlan(),
      ],
    });

    expect(result).toEqual({
      primaryPlan: {
        planId: 'plan-btc',
        intentType: 'ACCUMULATE',
        symbol: 'BTC',
        alignment: 'ALIGNED',
        certainty: 'HIGH',
        summary:
          'Accumulation setup is supported by confirmed momentum building. Focus symbol: BTC.',
        supportingEventCount: 1,
        actionState: 'READY',
      },
      alternativePlans: [
        {
          planId: 'caution-plan',
          intentType: 'HOLD',
          symbol: 'ETH',
          alignment: 'NEUTRAL',
          certainty: 'MEDIUM',
          summary: 'Hold for now while price movement is monitored without a clearer setup.',
          supportingEventCount: 2,
          actionState: 'CAUTION',
        },
      ],
      riskLane: createTradeHubRiskLaneFixture(),
      meta: {
        hasPrimaryPlan: true,
        profile: 'BEGINNER',
        requiresConfirmation: true,
      },
    });
  });

  it('orders plans deterministically for the same inputs', () => {
    const ready = createPlan({
      planId: 'ready-plan',
    });
    const caution = createPlan({
      planId: 'caution-plan',
      intentType: 'HOLD',
      riskProfile: {
        certainty: 'MEDIUM',
        alignment: 'NEUTRAL',
      },
    });
    const wait = createPlan({
      planId: 'wait-plan',
      intentType: 'WAIT',
      riskProfile: {
        certainty: 'LOW',
        alignment: 'MISALIGNED',
      },
    });

    const resultA = createTradeHubSurfaceModel({
      profile: 'ADVANCED',
      riskLane: createTradeHubRiskLaneFixture(),
      protectionPlans: [wait, ready, caution],
    });
    const resultB = createTradeHubSurfaceModel({
      profile: 'ADVANCED',
      riskLane: createTradeHubRiskLaneFixture(),
      protectionPlans: [caution, ready, wait],
    });

    expect(resultA).toEqual(resultB);
  });

  it('does not leak non-surface fields into plan cards', () => {
    const [alternativePlan] = createTradeHubSurfaceModel({
      profile: 'MIDDLE',
      riskLane: createTradeHubRiskLaneFixture(),
      protectionPlans: [
        createPlan({
          planId: 'alt-plan',
          rationale: {
            primaryEventId: 'event-1',
            supportingEventIds: ['event-1', 'event-2'],
            summary: 'Accumulation setup is supported by a detected dip in price action.',
          },
        }),
        createPlan({
          planId: 'primary-plan',
        }),
      ],
    }).alternativePlans;

    expect(alternativePlan).not.toHaveProperty('accountId');
    expect(alternativePlan).not.toHaveProperty('strategyId');
    expect(alternativePlan).not.toHaveProperty('constraints');
    expect(alternativePlan).not.toHaveProperty('rationale');
  });

  it('returns an empty surface when no plans are available', () => {
    expect(
      createTradeHubSurfaceModel({
        profile: 'ADVANCED',
        protectionPlans: [],
      }),
    ).toEqual({
      primaryPlan: null,
      alternativePlans: [],
      riskLane: createUnavailableTradeHubRiskLane(),
      meta: {
        hasPrimaryPlan: false,
        profile: 'ADVANCED',
        requiresConfirmation: true,
      },
    });
  });
});
