import { createRiskToolVM } from '@/services/risk/createRiskToolVM';

describe('createRiskToolVM', () => {
  it('builds one calm ready summary from explicit risk, entry, and stop inputs', () => {
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
      },
      generatedAtMs: nowMs,
    });

    expect(result).toEqual({
      generatedAt: '2023-11-14T22:13:20.000Z',
      summary: {
        state: 'READY',
        symbol: 'BTC',
        entryPrice: 50,
        stopPrice: 45,
        targetPrice: 60,
        stopDistance: 5,
        riskAmount: 150,
        riskPercent: 1.5,
        positionSize: 30,
        rewardRiskRatio: 2,
        notes: [],
      },
    });
  });

  it('derives risk amount from account size and risk percent when explicit risk is absent', () => {
    const result = createRiskToolVM({
      input: {
        accountSize: 5_000,
        riskAmount: null,
        riskPercent: 1,
        entryPrice: 100,
        stopPrice: 95,
        targetPrice: 98,
        symbol: null,
      },
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
      stopDistance: 5,
      riskAmount: 50,
      riskPercent: 1,
      positionSize: 10,
      rewardRiskRatio: null,
      notes: ['Reward/risk is left empty until the target sits on the reward side of the entry.'],
    });
  });

  it('stays incomplete and avoids fake precision when required inputs are missing', () => {
    const result = createRiskToolVM({
      input: {
        accountSize: null,
        riskAmount: null,
        riskPercent: 1,
        entryPrice: 100,
        stopPrice: null,
        targetPrice: null,
        symbol: 'BTC',
      },
    });

    expect(result.summary).toEqual({
      state: 'INCOMPLETE',
      symbol: 'BTC',
      entryPrice: 100,
      stopPrice: null,
      targetPrice: null,
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
      },
    });

    expect(result).toEqual({
      generatedAt: null,
      summary: {
        state: 'UNAVAILABLE',
        symbol: null,
        entryPrice: null,
        stopPrice: null,
        targetPrice: null,
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
      },
      context: {
        symbol: 'SOL',
        hasPreparedContext: true,
      },
      generatedAt: '2026-04-05T00:00:00.000Z',
    } as const;

    expect(createRiskToolVM(params)).toEqual(createRiskToolVM(params));
  });
});
