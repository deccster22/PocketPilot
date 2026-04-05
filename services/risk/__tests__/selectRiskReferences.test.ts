import { selectRiskReferences } from '@/services/risk/selectRiskReferences';

describe('selectRiskReferences', () => {
  it('keeps explicit user values authoritative over prepared references', () => {
    const result = selectRiskReferences({
      input: {
        accountSize: null,
        riskAmount: null,
        riskPercent: null,
        entryPrice: 101,
        stopPrice: null,
        targetPrice: null,
        symbol: 'BTC',
        allowPreparedReferences: true,
      },
      preparedQuoteContext: {
        currentPrice: 99,
      },
      preparedPlanContext: {
        entryPrice: 98,
        stopPrice: 94,
        targetPrice: 110,
      },
    });

    expect(result).toEqual({
      entryReference: {
        value: 101,
        source: 'USER_INPUT',
      },
      stopReference: {
        value: 94,
        source: 'PREPARED_PLAN',
      },
      targetReference: {
        value: 110,
        source: 'PREPARED_PLAN',
      },
    });
  });

  it('labels a prepared quote entry reference honestly when user input is absent', () => {
    const result = selectRiskReferences({
      input: {
        accountSize: null,
        riskAmount: null,
        riskPercent: null,
        entryPrice: null,
        stopPrice: null,
        targetPrice: null,
        symbol: 'BTC',
        allowPreparedReferences: true,
      },
      preparedQuoteContext: {
        currentPrice: 105.25,
      },
    });

    expect(result.entryReference).toEqual({
      value: 105.25,
      source: 'PREPARED_QUOTE',
    });
  });

  it('does not invent stop or target references when no honest prepared plan values exist', () => {
    const result = selectRiskReferences({
      input: {
        accountSize: null,
        riskAmount: null,
        riskPercent: null,
        entryPrice: null,
        stopPrice: null,
        targetPrice: null,
        symbol: 'BTC',
        allowPreparedReferences: true,
      },
      preparedQuoteContext: {
        currentPrice: 105.25,
      },
      preparedPlanContext: {
        entryPrice: null,
        stopPrice: null,
        targetPrice: null,
      },
    });

    expect(result.stopReference).toEqual({
      value: null,
      source: 'UNAVAILABLE',
    });
    expect(result.targetReference).toEqual({
      value: null,
      source: 'UNAVAILABLE',
    });
  });

  it('can leave prepared references disabled even when quote context is available', () => {
    const result = selectRiskReferences({
      input: {
        accountSize: null,
        riskAmount: null,
        riskPercent: null,
        entryPrice: null,
        stopPrice: null,
        targetPrice: null,
        symbol: 'BTC',
        allowPreparedReferences: false,
      },
      preparedQuoteContext: {
        currentPrice: 105.25,
      },
      preparedPlanContext: {
        entryPrice: 106,
        stopPrice: 100,
        targetPrice: 112,
      },
    });

    expect(result).toEqual({
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
    });
  });
});
