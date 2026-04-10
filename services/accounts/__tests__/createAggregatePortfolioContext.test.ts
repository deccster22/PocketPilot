import { createAggregatePortfolioContext } from '@/services/accounts/createAggregatePortfolioContext';

describe('createAggregatePortfolioContext', () => {
  it('aggregates portfolio totals and holdings deterministically across accounts', () => {
    const result = createAggregatePortfolioContext({
      accounts: [
        {
          id: 'acct-2',
          displayName: 'Second account',
          baseCurrency: 'USD',
          portfolio: {
            totalValue: 6_500,
            positions: [
              {
                symbol: 'SOL',
                amount: 80,
                value: 3_500,
              },
              {
                symbol: 'BTC',
                amount: 0.05,
                value: 3_000,
              },
            ],
          },
        },
        {
          id: 'acct-1',
          displayName: 'First account',
          baseCurrency: 'USD',
          portfolioValue: 10_000,
          portfolio: {
            positions: [
              {
                symbol: 'ETH',
                amount: 1.5,
                value: 2_800,
              },
              {
                symbol: 'BTC',
                amount: 0.12,
                value: 7_200,
              },
            ],
          },
        },
        {
          id: 'acct-3',
          displayName: 'Third account',
          baseCurrency: 'USD',
          portfolio: {
            totalValue: 4_250,
            positions: [
              {
                symbol: 'DOGE',
                amount: 5_000,
                value: 2_850,
              },
              {
                symbol: 'ETH',
                amount: 0.75,
                value: 1_400,
              },
            ],
          },
        },
      ],
    });

    expect(result.status).toBe('AVAILABLE');

    if (result.status !== 'AVAILABLE') {
      throw new Error('Expected aggregate portfolio to be available.');
    }

    expect(result.portfolio.totalValue).toBe(20_750);
    expect(result.portfolio.currency).toBe('USD');
    expect(result.portfolio.accountCount).toBe(3);
    expect(result.portfolio.assets).toEqual([
      {
        symbol: 'BTC',
        amount: 0.17,
        value: 10_200,
        weightPct: expect.any(Number),
      },
      {
        symbol: 'ETH',
        amount: 2.25,
        value: 4_200,
        weightPct: expect.any(Number),
      },
      {
        symbol: 'SOL',
        amount: 80,
        value: 3_500,
        weightPct: expect.any(Number),
      },
      {
        symbol: 'DOGE',
        amount: 5_000,
        value: 2_850,
        weightPct: expect.any(Number),
      },
    ]);
    expect(result.portfolio.assets[0].weightPct).toBeCloseTo(49.1566265060241);
    expect(result.portfolio.assets[1].weightPct).toBeCloseTo(20.240963855421686);
    expect(result.portfolio.assets[2].weightPct).toBeCloseTo(16.867469879518072);
    expect(result.portfolio.assets[3].weightPct).toBeCloseTo(13.734939759036145);
    expect(JSON.stringify(result)).not.toMatch(/alignment|fit|message|execution|risk/i);
  });

  it('returns an honest unavailable result when portfolio data is too thin', () => {
    expect(
      createAggregatePortfolioContext({
        accounts: [
          {
            id: 'acct-1',
            displayName: 'Thin account',
            baseCurrency: 'USD',
          },
          {
            id: 'acct-2',
            displayName: 'Also thin',
            baseCurrency: 'USD',
            portfolio: {
              positions: [
                {
                  symbol: 'BTC',
                  amount: null,
                  value: null,
                },
              ],
            },
          },
        ],
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_AGGREGATABLE_PORTFOLIO_DATA',
    });
  });

  it('keeps amount-only exposure aggregateable without inventing cross-currency values', () => {
    const result = createAggregatePortfolioContext({
      accounts: [
        {
          id: 'acct-usd',
          baseCurrency: 'USD',
          portfolio: {
            totalValue: 5_000,
            positions: [
              {
                symbol: 'BTC',
                amount: 0.1,
                value: 5_000,
              },
            ],
          },
        },
        {
          id: 'acct-eur',
          baseCurrency: 'EUR',
          portfolio: {
            totalValue: 4_000,
            positions: [
              {
                symbol: 'BTC',
                amount: 0.2,
                value: 4_000,
              },
            ],
          },
        },
      ],
    });

    expect(result).toEqual({
      status: 'AVAILABLE',
      portfolio: {
        totalValue: null,
        currency: null,
        accountCount: 2,
        assets: [
          {
            symbol: 'BTC',
            amount: 0.3,
            value: null,
            weightPct: null,
          },
        ],
      },
    });
  });
});
