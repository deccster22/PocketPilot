import { fetchAggregatePortfolioContext } from '@/services/accounts/fetchAggregatePortfolioContext';

describe('fetchAggregatePortfolioContext', () => {
  it('returns a surface-disabled result when aggregate holdings are not enabled', async () => {
    await expect(
      fetchAggregatePortfolioContext({
        accounts: [
          {
            id: 'acct-1',
            baseCurrency: 'USD',
            portfolio: {
              totalValue: 10_000,
              positions: [
                {
                  symbol: 'BTC',
                  amount: 0.1,
                  value: 10_000,
                },
              ],
            },
          },
        ],
      }),
    ).resolves.toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });
  });

  it('returns the canonical prepared aggregate portfolio contract when enabled', async () => {
    const result = await fetchAggregatePortfolioContext({
      isEnabledForSurface: true,
      accounts: [
        {
          id: 'acct-1',
          baseCurrency: 'USD',
          portfolio: {
            totalValue: 10_000,
            positions: [
              {
                symbol: 'BTC',
                amount: 0.1,
                value: 10_000,
              },
            ],
          },
        },
        {
          id: 'acct-2',
          baseCurrency: 'USD',
          portfolio: {
            totalValue: 5_000,
            positions: [
              {
                symbol: 'ETH',
                amount: 2,
                value: 5_000,
              },
            ],
          },
        },
      ],
    });

    expect(result).toEqual({
      status: 'AVAILABLE',
      portfolio: {
        totalValue: 15_000,
        currency: 'USD',
        accountCount: 2,
        assets: [
          {
            symbol: 'BTC',
            amount: 0.1,
            value: 10_000,
            weightPct: 66.66666666666666,
          },
          {
            symbol: 'ETH',
            amount: 2,
            value: 5_000,
            weightPct: 33.33333333333333,
          },
        ],
      },
    });
    expect(JSON.stringify(result)).not.toMatch(/broker|provider|runtime|execution/i);
  });
});
