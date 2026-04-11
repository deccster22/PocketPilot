import { createTradePlanPreview } from '@/services/trade/createTradePlanPreview';
import type { PreparedTradeRiskLane, ProtectionPlan } from '@/services/trade/types';

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

describe('createTradePlanPreview', () => {
  it('creates the confirmation-safe preview model shape from a protection plan', () => {
    expect(
      createTradePlanPreview(createPlan(), createRiskLane(), {
        portfolioValue: 10_000,
        baseCurrency: 'USD',
      }),
    ).toEqual({
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
      risk: createRiskLane(),
      positionSizing: {
        status: 'AVAILABLE',
        output: {
          sizeLabel: 'Position size (Account %)',
          sizeValue: '10 units at $1,000.00 cap',
          maxLossLabel: 'Max loss at stop',
          maxLossValue: '$50.00',
          notes: [
            'Prepared entry $100.00 to stop $95.00.',
            'Support-only readout; no order path is opened here.',
          ],
        },
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

    const risk = createRiskLane();
    const accountContext = {
      portfolioValue: 10_000,
      baseCurrency: 'USD',
    };
    const first = createTradePlanPreview(plan, risk, accountContext);
    const second = createTradePlanPreview(plan, risk, accountContext);

    expect(first).toEqual(second);
    expect(first).not.toHaveProperty('accountId');
    expect(first).not.toHaveProperty('strategyId');
    expect(first).not.toHaveProperty('createdAt');
  });

  it('keeps prepared risk references out of the preview contract even when the plan carries them', () => {
    const preview = createTradePlanPreview(
      createPlan({
        preparedRiskReferences: {
          entryPrice: 101,
          stopPrice: 95,
          targetPrice: 112,
        },
      }),
      createRiskLane({
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
      }),
      {
        portfolioValue: 10_000,
        baseCurrency: 'USD',
      },
    );

    expect(preview).not.toHaveProperty('preparedRiskReferences');
    expect(JSON.stringify(preview)).not.toContain('entryPrice');
    expect(JSON.stringify(preview)).not.toContain('stopPrice');
    expect(JSON.stringify(preview)).not.toContain('targetPrice');
  });
});
