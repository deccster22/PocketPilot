import { resolveSelectedAccountContext } from '@/services/accounts/resolveSelectedAccountContext';

describe('resolveSelectedAccountContext', () => {
  it('returns explicit selection when the selected account is valid', () => {
    expect(
      resolveSelectedAccountContext({
        selectedAccountId: 'acct-2',
        accounts: [
          {
            id: 'acct-1',
            displayName: 'Primary account',
            portfolioValue: 9_000,
            isPrimary: true,
            baseCurrency: 'USD',
            strategyId: 'momentum_basics',
          },
          {
            id: 'acct-2',
            displayName: 'Secondary account',
            portfolioValue: 2_000,
            baseCurrency: 'AUD',
            strategyId: 'dip_buying',
          },
        ],
      }),
    ).toEqual({
      status: 'AVAILABLE',
      account: {
        accountId: 'acct-2',
        displayName: 'Secondary account',
        selectionMode: 'EXPLICIT',
        baseCurrency: 'AUD',
        strategyId: 'dip_buying',
      },
    });
  });

  it('falls back to the nominated primary account when explicit selection is absent', () => {
    expect(
      resolveSelectedAccountContext({
        accounts: [
          {
            id: 'acct-1',
            displayName: 'Secondary account',
            portfolioValue: 12_000,
          },
          {
            id: 'acct-2',
            displayName: 'Primary account',
            portfolioValue: 3_000,
            isPrimary: true,
            baseCurrency: 'USD',
            strategyId: 'momentum_basics',
          },
        ],
      }),
    ).toEqual({
      status: 'AVAILABLE',
      account: {
        accountId: 'acct-2',
        displayName: 'Primary account',
        selectionMode: 'PRIMARY_FALLBACK',
        baseCurrency: 'USD',
        strategyId: 'momentum_basics',
      },
    });
  });

  it('uses the highest-value fallback when neither explicit nor valid primary context exists', () => {
    expect(
      resolveSelectedAccountContext({
        selectedAccountId: 'missing-account',
        accounts: [
          {
            id: 'acct-2',
            displayName: 'Growth account',
            portfolioValue: 12_500,
          },
          {
            id: 'acct-1',
            displayName: 'Income account',
            portfolioValue: 12_500,
          },
          {
            id: 'acct-3',
            displayName: 'Cash account',
            portfolioValue: 6_000,
          },
        ],
      }),
    ).toEqual({
      status: 'AVAILABLE',
      account: {
        accountId: 'acct-1',
        displayName: 'Income account',
        selectionMode: 'HIGHEST_VALUE_FALLBACK',
        baseCurrency: null,
        strategyId: null,
      },
    });
  });

  it('returns honest unavailability when no accounts are available', () => {
    expect(
      resolveSelectedAccountContext({
        accounts: [],
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_ACCOUNTS_AVAILABLE',
    });
  });

  it('returns honest unavailability when no valid account context can be formed', () => {
    expect(
      resolveSelectedAccountContext({
        accounts: [
          {
            id: '   ',
            displayName: 'Broken account',
            portfolioValue: 1_000,
          },
        ],
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_VALID_ACCOUNT_CONTEXT',
    });
  });
});

