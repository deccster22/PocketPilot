import { createInMemoryAccountPreferenceStore } from '@/services/accounts/accountPreferenceStore';
import { fetchSelectedAccountContext } from '@/services/accounts/fetchSelectedAccountContext';
import { setPrimaryAccount } from '@/services/accounts/setPrimaryAccount';

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

describe('setPrimaryAccount', () => {
  it('updates the primary-account preference explicitly and reuses it as the fallback seam', async () => {
    const accountPreferenceStore = createInMemoryAccountPreferenceStore();
    const initial = await fetchSelectedAccountContext({
      accounts,
      accountPreferenceStore,
      isSwitchingEnabledForSurface: true,
    });

    const result = await setPrimaryAccount({
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
        selectedAccountId: null,
        accountPreferenceStore,
        isSwitchingEnabledForSurface: true,
      }),
    ).resolves.toMatchObject({
      status: 'AVAILABLE',
      account: {
        accountId: 'acct-basic',
        displayName: 'Basic account',
        selectionMode: 'PRIMARY_FALLBACK',
      },
      switching: {
        status: 'AVAILABLE',
        options: expect.arrayContaining([
          expect.objectContaining({ accountId: 'acct-basic', isPrimary: true }),
        ]),
      },
    });
  });

  it('does not silently override an explicit selected account after primary changes', async () => {
    const accountPreferenceStore = createInMemoryAccountPreferenceStore({
      selectedAccountId: 'acct-live',
    });
    const initial = await fetchSelectedAccountContext({
      accounts,
      accountPreferenceStore,
      isSwitchingEnabledForSurface: true,
    });

    await setPrimaryAccount({
      options:
        initial.switching?.status === 'AVAILABLE' ? initial.switching.options : [],
      accountId: 'acct-basic',
      accountPreferenceStore,
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
        accountId: 'acct-live',
        selectionMode: 'EXPLICIT',
      },
      switching: {
        status: 'AVAILABLE',
        options: expect.arrayContaining([
          expect.objectContaining({ accountId: 'acct-live', isSelected: true }),
          expect.objectContaining({ accountId: 'acct-basic', isPrimary: true }),
        ]),
      },
    });
  });

  it('rejects invalid account updates honestly', async () => {
    await expect(
      setPrimaryAccount({
        options: [],
        accountId: 'missing-account',
      }),
    ).resolves.toEqual({
      status: 'REJECTED',
      reason: 'ACCOUNT_NOT_FOUND',
    });
  });
});
