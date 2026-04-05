import { createRiskToolScreenViewData } from '@/app/screens/riskToolScreenView';

describe('createRiskToolScreenViewData', () => {
  it('reads the prepared risk VM without assembling calculations in the app', () => {
    const view = createRiskToolScreenViewData({
      generatedAt: '2026-04-05T00:00:00.000Z',
      summary: {
        state: 'READY',
        symbol: 'BTC',
        entryPrice: 100,
        stopPrice: 95,
        targetPrice: 108,
        entryReference: {
          value: 100,
          source: 'PREPARED_QUOTE',
        },
        stopReference: {
          value: 95,
          source: 'USER_INPUT',
        },
        targetReference: {
          value: 108,
          source: 'PREPARED_PLAN',
        },
        stopDistance: 5,
        riskAmount: 12.5,
        riskPercent: 0.125,
        positionSize: 999,
        rewardRiskRatio: 7.3,
        notes: ['Prepared values are rendered directly from services.'],
      },
    });

    expect(view).toEqual({
      stateText: 'Risk framing ready',
      statusText:
        'Position size is based on the current entry, stop, and risk basis in this summary.',
      boundaryText:
        'Risk framing stays support-only. It does not create an order or imply execution readiness.',
      symbolText: 'Reference symbol: BTC',
      generatedAtText: 'Prepared at 2026-04-05T00:00:00.000Z',
      detailRows: [
        {
          label: 'Entry reference',
          value: '100',
          supportingText: 'Source: current reference',
        },
        {
          label: 'Stop reference',
          value: '95',
          supportingText: 'Source: your input',
        },
        {
          label: 'Target reference',
          value: '108',
          supportingText: 'Source: prepared plan',
        },
        {
          label: 'Stop distance',
          value: '5',
        },
        {
          label: 'Risk amount',
          value: '12.5',
        },
        {
          label: 'Risk percent',
          value: '0.125%',
        },
        {
          label: 'Position size',
          value: '999 units',
        },
        {
          label: 'Reward/risk',
          value: '7.3 to 1',
        },
      ],
      notes: ['Prepared values are rendered directly from services.'],
    });
  });

  it('returns null when no prepared risk VM is available', () => {
    expect(createRiskToolScreenViewData(null)).toBeNull();
  });

  it('keeps unavailable references quiet while still showing not-set values', () => {
    const view = createRiskToolScreenViewData({
      generatedAt: null,
      summary: {
        state: 'INCOMPLETE',
        symbol: 'ETH',
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
        notes: ['Add a stop reference when you want sizing support.'],
      },
    });

    expect(view?.detailRows.slice(0, 3)).toEqual([
      {
        label: 'Entry reference',
        value: 'Not set',
      },
      {
        label: 'Stop reference',
        value: 'Not set',
      },
      {
        label: 'Target reference',
        value: 'Not set',
      },
    ]);
  });
});
