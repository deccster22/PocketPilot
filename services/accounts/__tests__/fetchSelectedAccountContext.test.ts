import { createInMemoryAccountPreferenceStore } from '@/services/accounts/accountPreferenceStore';
import { fetchSelectedAccountContext } from '@/services/accounts/fetchSelectedAccountContext';

describe('fetchSelectedAccountContext', () => {
  it('returns the canonical prepared availability contract with one prepared Dashboard switching seam', async () => {
    const accountPreferenceStore = createInMemoryAccountPreferenceStore();
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
        {
          id: 'acct-basic',
          displayName: 'Basic account',
          portfolioValue: 4_000,
          baseCurrency: 'USD',
          strategyId: 'dip_buying',
        },
      ],
      accountPreferenceStore,
      isSwitchingEnabledForSurface: true,
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
      switching: {
        status: 'AVAILABLE',
        selectedAccountId: 'acct-live',
        options: [
          {
            accountId: 'acct-live',
            displayName: 'Live account',
            strategyId: 'momentum_basics',
            isPrimary: true,
            isSelected: true,
          },
          {
            accountId: 'acct-basic',
            displayName: 'Basic account',
            strategyId: 'dip_buying',
            isPrimary: false,
            isSelected: false,
          },
        ],
      },
    });
    expect(JSON.stringify(result)).not.toMatch(/portfolioValue|broker|provider|execution/);
  });

  it('hides switching cleanly when only one valid account exists on the surface', async () => {
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
      isSwitchingEnabledForSurface: true,
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
      switching: {
        status: 'UNAVAILABLE',
        reason: 'SINGLE_ACCOUNT_ONLY',
      },
    });
  });

  it('keeps unavailable states explicit and honest', async () => {
    await expect(
      fetchSelectedAccountContext({
        accounts: [],
      }),
    ).resolves.toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_ACCOUNTS_AVAILABLE',
      switching: {
        status: 'UNAVAILABLE',
        reason: 'NOT_ENABLED_FOR_SURFACE',
      },
    });
  });
});
