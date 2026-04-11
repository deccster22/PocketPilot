import { createPositionSizingOutput } from '@/services/trade/createPositionSizingOutput';
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

describe('createPositionSizingOutput', () => {
  it('returns a prepared sizing output from selected plan, basis, and account context', () => {
    expect(
      createPositionSizingOutput({
        plan: createPlan(),
        risk: createRiskLane(),
        accountContext: {
          portfolioValue: 10_000,
          baseCurrency: 'USD',
        },
      }),
    ).toEqual({
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
    });
  });

  it('updates the sizing label when the selected basis changes without changing the prepared max loss', () => {
    const accountContext = {
      portfolioValue: 10_000,
      baseCurrency: 'USD',
    };
    const accountPercent = createPositionSizingOutput({
      plan: createPlan(),
      risk: createRiskLane(),
      accountContext,
    });
    const fixedCurrency = createPositionSizingOutput({
      plan: createPlan(),
      risk: createRiskLane({
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
      }),
      accountContext,
    });

    expect(accountPercent).toEqual({
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
    });
    expect(fixedCurrency).toEqual({
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
    });
  });

  it('returns honest unavailable states when inputs are thin or the surface is disabled', () => {
    expect(
      createPositionSizingOutput({
        plan: createPlan({
          preparedRiskReferences: {
            entryPrice: 100,
            stopPrice: null,
            targetPrice: null,
          },
        }),
        risk: createRiskLane(),
        accountContext: {
          portfolioValue: 10_000,
          baseCurrency: 'USD',
        },
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'INSUFFICIENT_INPUTS',
    });

    expect(
      createPositionSizingOutput({
        plan: createPlan(),
        risk: createRiskLane(),
        accountContext: {
          portfolioValue: 10_000,
          baseCurrency: 'USD',
        },
        isEnabledForSurface: false,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });
  });

  it('keeps hype, profit, and advice wording out of the sizing readout', () => {
    const result = createPositionSizingOutput({
      plan: createPlan(),
      risk: createRiskLane(),
      accountContext: {
        portfolioValue: 10_000,
        baseCurrency: 'USD',
      },
    });

    expect(JSON.stringify(result)).not.toMatch(
      /profit|win|should|must|advice|casino|execute|dispatch|submit|enforce|block/i,
    );
  });
});
