import { fetchSelectedAccountContext } from '@/services/accounts/fetchSelectedAccountContext';

describe('fetchSelectedAccountContext', () => {
  it('returns the canonical prepared availability contract without provider fields', async () => {
    const result = await fetchSelectedAccountContext({
      accounts: [
        {
          id: 'acct-live',
          displayName: 'Live account',
          portfolioValue: 10_000,
          isPrimary: true,
          baseCurrency: 'USD',
          strategyId: 'momentum_basics',
        },
      ],
    });

    expect(result).toEqual({
      status: 'AVAILABLE',
      account: {
        accountId: 'acct-live',
        displayName: 'Live account',
        selectionMode: 'PRIMARY_FALLBACK',
        baseCurrency: 'USD',
        strategyId: 'momentum_basics',
      },
    });
    expect(JSON.stringify(result)).not.toMatch(/portfolioValue|isPrimary|broker|provider|execution/);
  });

  it('keeps unavailable states explicit and honest', async () => {
    await expect(
      fetchSelectedAccountContext({
        accounts: [],
      }),
    ).resolves.toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_ACCOUNTS_AVAILABLE',
    });
  });
});

