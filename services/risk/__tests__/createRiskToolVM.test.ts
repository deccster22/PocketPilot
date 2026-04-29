import { createRiskToolVM } from '@/services/risk/createRiskToolVM';
import type { RiskToolReferences } from '@/services/risk/types';

function createReferences(overrides: Partial<RiskToolReferences> = {}): RiskToolReferences {
  return {
    entryReference: {
      value: null,
      source: 'UNAVAILABLE',
    },
    stopReference: {
      value: null,
      source: 'UNAVAILABLE',
    },
    targetReference: {
      value: null,
      source: 'UNAVAILABLE',
    },
    ...overrides,
  };
}

describe('createRiskToolVM', () => {
  it('builds one calm ready summary from explicit risk inputs and source-tagged references', () => {
    const nowMs = 1_700_000_000_000;

    const result = createRiskToolVM({
      input: {
        accountSize: 10_000,
        riskAmount: 150,
        riskPercent: null,
        entryPrice: 50,
        stopPrice: 45,
        targetPrice: 60,
        symbol: 'BTC',
        allowPreparedReferences: true,
      },
      references: createReferences({
        entryReference: {
          value: 50,
          source: 'USER_INPUT',
        },
        stopReference: {
          value: 45,
          source: 'USER_INPUT',
        },
        targetReference: {
          value: 60,
          source: 'USER_INPUT',
        },
      }),
      generatedAtMs: nowMs,
    });

    expect(result).toEqual({
      generatedAt: '2023-11-14T22:13:20.000Z',
      inlineHelpAffordances: {
        status: 'UNAVAILABLE',
        reason: 'NO_ELIGIBLE_TERMS',
      },
      summary: {
        state: 'READY',
        symbol: 'BTC',
        entryPrice: 50,
        stopPrice: 45,
        targetPrice: 60,
        entryReference: {
          value: 50,
          source: 'USER_INPUT',
        },
        stopReference: {
          value: 45,
          source: 'USER_INPUT',
        },
        targetReference: {
          value: 60,
          source: 'USER_INPUT',
        },
        stopDistance: 5,
        riskAmount: 150,
        riskPercent: 1.5,
        positionSize: 30,
        rewardRiskRatio: 2,
        notes: [],
      },
    });
  });

  it('uses prepared quote and plan references when explicit prices are absent', () => {
    const result = createRiskToolVM({
      input: {
        accountSize: 5_000,
        riskAmount: null,
        riskPercent: 1,
        entryPrice: null,
        stopPrice: null,
        targetPrice: null,
        symbol: null,
        allowPreparedReferences: true,
      },
      references: createReferences({
        entryReference: {
          value: 100,
          source: 'PREPARED_QUOTE',
        },
        stopReference: {
          value: 95,
          source: 'PREPARED_PLAN',
        },
        targetReference: {
          value: 98,
          source: 'PREPARED_PLAN',
        },
      }),
      context: {
        symbol: 'ETH',
        hasPreparedContext: true,
      },
    });

    expect(result.summary).toEqual({
      state: 'READY',
      symbol: 'ETH',
      entryPrice: 100,
      stopPrice: 95,
      targetPrice: 98,
      entryReference: {
        value: 100,
        source: 'PREPARED_QUOTE',
      },
      stopReference: {
        value: 95,
        source: 'PREPARED_PLAN',
      },
      targetReference: {
        value: 98,
        source: 'PREPARED_PLAN',
      },
      stopDistance: 5,
      riskAmount: 50,
      riskPercent: 1,
      positionSize: 10,
      rewardRiskRatio: null,
      notes: ['Reward/risk is left empty until the target sits on the reward side of the entry.'],
    });
    expect(JSON.stringify(result)).not.toContain('executionCapability');
    expect(JSON.stringify(result)).not.toContain('payloadPreview');
    expect(JSON.stringify(result)).not.toContain('dispatch');
  });

  it('stays incomplete and avoids fake precision when required references are missing', () => {
    const result = createRiskToolVM({
      input: {
        accountSize: null,
        riskAmount: null,
        riskPercent: 1,
        entryPrice: 100,
        stopPrice: null,
        targetPrice: null,
        symbol: 'BTC',
        allowPreparedReferences: true,
      },
      references: createReferences({
        entryReference: {
          value: 100,
          source: 'USER_INPUT',
        },
      }),
    });

    expect(result.summary).toEqual({
      state: 'INCOMPLETE',
      symbol: 'BTC',
      entryPrice: 100,
      stopPrice: null,
      targetPrice: null,
      entryReference: {
        value: 100,
        source: 'USER_INPUT',
      },
      stopReference: {
        value: null,
        source: 'UNAVAILABLE',
      },
      targetReference: {
        value: null,
        source: 'UNAVAILABLE',
      },
      stopDistance: null,
      riskAmount: null,
      riskPercent: 1,
      positionSize: null,
      rewardRiskRatio: null,
      notes: [
        'Add distinct entry and stop prices to frame stop distance.',
        'Add a risk amount, or combine account size with risk percent.',
      ],
    });
  });

  it('returns an honest unavailable result when there is no sensible risk context', () => {
    const result = createRiskToolVM({
      input: {
        accountSize: null,
        riskAmount: null,
        riskPercent: null,
        entryPrice: null,
        stopPrice: null,
        targetPrice: null,
        symbol: null,
        allowPreparedReferences: true,
      },
      references: createReferences(),
    });

    expect(result).toEqual({
      generatedAt: null,
      inlineHelpAffordances: {
        status: 'UNAVAILABLE',
        reason: 'NO_ELIGIBLE_TERMS',
      },
      summary: {
        state: 'UNAVAILABLE',
        symbol: null,
        entryPrice: null,
        stopPrice: null,
        targetPrice: null,
        entryReference: {
          value: null,
          source: 'UNAVAILABLE',
        },
        stopReference: {
          value: null,
          source: 'UNAVAILABLE',
        },
        targetReference: {
          value: null,
          source: 'UNAVAILABLE',
        },
        stopDistance: null,
        riskAmount: null,
        riskPercent: null,
        positionSize: null,
        rewardRiskRatio: null,
        notes: [],
      },
    });
  });

  it('stays deterministic for identical inputs', () => {
    const params = {
      input: {
        accountSize: 12_500,
        riskAmount: 125,
        riskPercent: null,
        entryPrice: 25,
        stopPrice: 24,
        targetPrice: 28,
        symbol: 'SOL',
        allowPreparedReferences: true,
      },
      references: createReferences({
        entryReference: {
          value: 25,
          source: 'USER_INPUT',
        },
        stopReference: {
          value: 24,
          source: 'USER_INPUT',
        },
        targetReference: {
          value: 28,
          source: 'USER_INPUT',
        },
      }),
      context: {
        symbol: 'SOL',
        hasPreparedContext: true,
      },
      generatedAt: '2026-04-05T00:00:00.000Z',
    } as const;

    expect(createRiskToolVM(params)).toEqual(createRiskToolVM(params));
  });
});
