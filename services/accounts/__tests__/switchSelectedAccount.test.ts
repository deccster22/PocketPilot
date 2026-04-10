import { createInMemoryAccountPreferenceStore } from '@/services/accounts/accountPreferenceStore';
import { fetchSelectedAccountContext } from '@/services/accounts/fetchSelectedAccountContext';
import { switchSelectedAccount } from '@/services/accounts/switchSelectedAccount';

const accounts = [
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
    portfolioValue: 6_500,
    baseCurrency: 'USD',
    strategyId: 'dip_buying',
  },
];

describe('switchSelectedAccount', () => {
  it('updates selected-account truth explicitly through the canonical service-owned seam', async () => {
    const accountPreferenceStore = createInMemoryAccountPreferenceStore();
    const initial = await fetchSelectedAccountContext({
      accounts,
      accountPreferenceStore,
      isSwitchingEnabledForSurface: true,
    });

    expect(initial).toMatchObject({
      status: 'AVAILABLE',
      account: {
        accountId: 'acct-live',
        selectionMode: 'PRIMARY_FALLBACK',
      },
      switching: {
        status: 'AVAILABLE',
        selectedAccountId: 'acct-live',
      },
    });

    const result = await switchSelectedAccount({
      options:
        initial.switching?.status === 'AVAILABLE' ? initial.switching.options : [],
      accountId: 'acct-basic',
      accountPreferenceStore,
    });

    expect(result).toEqual({
      status: 'UPDATED',
      accountId: 'acct-basic',
    });

    await expect(
      fetchSelectedAccountContext({
        accounts,
        accountPreferenceStore,
        isSwitchingEnabledForSurface: true,
      }),
    ).resolves.toMatchObject({
      status: 'AVAILABLE',
      account: {
        accountId: 'acct-basic',
        displayName: 'Basic account',
        selectionMode: 'EXPLICIT',
      },
      switching: {
        status: 'AVAILABLE',
        selectedAccountId: 'acct-basic',
        options: expect.arrayContaining([
          expect.objectContaining({ accountId: 'acct-basic', isSelected: true }),
        ]),
      },
    });
  });

  it('rejects invalid account ids instead of silently falling back', async () => {
    await expect(
      switchSelectedAccount({
        options: [],
        accountId: '   ',
      }),
    ).resolves.toEqual({
      status: 'REJECTED',
      reason: 'INVALID_ACCOUNT',
    });
  });
});
