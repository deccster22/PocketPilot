import { createRiskPerTradeContext } from '@/services/trade/createRiskPerTradeContext';
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

describe('createRiskPerTradeContext', () => {
  it('builds deterministic account-percent framing from prepared plan context', () => {
    expect(
      createRiskPerTradeContext({
        selectedBasis: 'ACCOUNT_PERCENT',
        plan: createPlan(),
        accountContext: {
          portfolioValue: 10_000,
          baseCurrency: 'USD',
        },
      }),
    ).toEqual({
      status: 'AVAILABLE',
      basis: 'ACCOUNT_PERCENT',
      headline: 'Account % risk frame',
      summary:
        'Shows the capped loss from this prepared plan as a share of current account value using prepared planning levels only.',
      items: [
        {
          label: 'Risk per trade',
          value: '0.50%',
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
    });
  });

  it('updates the prepared framing when the selected basis changes', () => {
    expect(
      createRiskPerTradeContext({
        selectedBasis: 'FIXED_CURRENCY',
        plan: createPlan(),
        accountContext: {
          portfolioValue: 10_000,
          baseCurrency: 'USD',
        },
      }),
    ).toEqual({
      status: 'AVAILABLE',
      basis: 'FIXED_CURRENCY',
      headline: 'Fixed-currency risk frame',
      summary:
        'Shows the capped loss from this prepared plan as a fixed currency amount using prepared planning levels only.',
      items: [
        {
          label: 'Risk per trade',
          value: '$50.00',
        },
        {
          label: 'Position cap value',
          value: '$1,000.00',
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
    });
  });

  it('returns an honest unavailable context when the prepared price path is too thin', () => {
    expect(
      createRiskPerTradeContext({
        selectedBasis: 'POSITION_PERCENT',
        plan: createPlan({
          preparedRiskReferences: {
            entryPrice: 100,
            stopPrice: null,
            targetPrice: null,
          },
        }),
        accountContext: {
          portfolioValue: 10_000,
          baseCurrency: 'USD',
        },
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      basis: 'POSITION_PERCENT',
      headline: 'Position % risk frame unavailable',
      summary:
        'PocketPilot can frame this basis once prepared entry, stop, and position-cap context are all available.',
      items: [
        {
          label: 'Needed',
          value: 'Prepared entry, prepared stop, and a prepared position cap',
        },
      ],
      reason: 'MISSING_PRICE_REFERENCES',
    });
  });

  it('keeps hype and advice wording out of the prepared context copy', () => {
    const context = createRiskPerTradeContext({
      selectedBasis: 'ACCOUNT_PERCENT',
      plan: createPlan(),
      accountContext: {
        portfolioValue: 10_000,
        baseCurrency: 'USD',
      },
    });

    expect(JSON.stringify(context)).not.toMatch(/profit|win|should|must|upside|maximize/i);
  });
});
