import { createAccountSwitchingAvailability } from '@/services/accounts/createAccountSwitchingAvailability';
import type { SelectedAccountAvailability } from '@/services/accounts/types';

const selectedAccountAvailability: SelectedAccountAvailability = {
  status: 'AVAILABLE',
  account: {
    accountId: 'acct-live',
    displayName: 'Live account',
    selectionMode: 'PRIMARY_FALLBACK',
    baseCurrency: 'USD',
    strategyId: 'momentum_basics',
  },
};

describe('createAccountSwitchingAvailability', () => {
  it('builds one deterministic selected-account-first switching contract', () => {
    expect(
      createAccountSwitchingAvailability({
        accounts: [
          {
            id: 'acct-manual',
            displayName: 'Manual account',
            strategyId: 'data_quality',
          },
          {
            id: 'acct-live',
            displayName: 'Live account',
            isPrimary: true,
            strategyId: 'momentum_basics',
          },
          {
            id: 'acct-basic',
            displayName: 'Basic account',
            strategyId: 'dip_buying',
          },
        ],
        selectedAccountAvailability,
        isEnabledForSurface: true,
      }),
    ).toEqual({
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
        {
          accountId: 'acct-manual',
          displayName: 'Manual account',
          strategyId: 'data_quality',
          isPrimary: false,
          isSelected: false,
        },
      ],
    });
  });

  it('returns single-account-only when switching would be fake', () => {
    expect(
      createAccountSwitchingAvailability({
        accounts: [
          {
            id: 'acct-live',
            displayName: 'Live account',
            isPrimary: true,
            strategyId: 'momentum_basics',
          },
        ],
        selectedAccountAvailability,
        isEnabledForSurface: true,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'SINGLE_ACCOUNT_ONLY',
    });
  });

  it('returns not-enabled-for-surface when the current surface should stay passive', () => {
    expect(
      createAccountSwitchingAvailability({
        accounts: [
          {
            id: 'acct-live',
            displayName: 'Live account',
            isPrimary: true,
          },
          {
            id: 'acct-basic',
            displayName: 'Basic account',
          },
        ],
        selectedAccountAvailability,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });
  });

  it('returns an honest unavailable state when no selected account context exists', () => {
    expect(
      createAccountSwitchingAvailability({
        accounts: [
          {
            id: 'acct-live',
            displayName: 'Live account',
            isPrimary: true,
          },
          {
            id: 'acct-basic',
            displayName: 'Basic account',
          },
        ],
        selectedAccountAvailability: {
          status: 'UNAVAILABLE',
          reason: 'NO_VALID_ACCOUNT_CONTEXT',
        },
        isEnabledForSurface: true,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_SWITCHABLE_ACCOUNTS',
    });
  });
});
