import { createSurfaceAccountContext } from '@/services/accounts/createSurfaceAccountContext';

describe('createSurfaceAccountContext', () => {
  it('creates one normalized prepared surface account context from selected-account truth', () => {
    expect(
      createSurfaceAccountContext({
        selectedAccountContext: {
          status: 'AVAILABLE',
          account: {
            accountId: 'acct-live',
            displayName: 'Live account',
            selectionMode: 'PRIMARY_FALLBACK',
            baseCurrency: 'USD',
            strategyId: 'momentum_basics',
          },
        },
        selectedAccountPortfolioValue: 10_000,
      }),
    ).toEqual({
      selectedAccountContext: {
        status: 'AVAILABLE',
        account: {
          accountId: 'acct-live',
          displayName: 'Live account',
          selectionMode: 'PRIMARY_FALLBACK',
          baseCurrency: 'USD',
          strategyId: 'momentum_basics',
        },
      },
      selectedAccount: {
        accountId: 'acct-live',
        displayName: 'Live account',
        selectionMode: 'PRIMARY_FALLBACK',
        baseCurrency: 'USD',
        strategyId: 'momentum_basics',
      },
      selectedAccountId: 'acct-live',
      selectedAccountPortfolioValue: 10_000,
      selectedAccountBaseCurrency: 'USD',
      riskContext: {
        portfolioValue: 10_000,
        baseCurrency: 'USD',
      },
    });
  });

  it('keeps unavailable account context explicit without inventing a fallback account', () => {
    expect(
      createSurfaceAccountContext({
        selectedAccountContext: {
          status: 'UNAVAILABLE',
          reason: 'NO_VALID_ACCOUNT_CONTEXT',
        },
      }),
    ).toEqual({
      selectedAccountContext: {
        status: 'UNAVAILABLE',
        reason: 'NO_VALID_ACCOUNT_CONTEXT',
      },
      selectedAccount: null,
      selectedAccountId: null,
      selectedAccountPortfolioValue: null,
      selectedAccountBaseCurrency: null,
      riskContext: null,
    });
  });

  it('normalizes a missing or non-positive prepared portfolio value to null', () => {
    expect(
      createSurfaceAccountContext({
        selectedAccountContext: {
          status: 'AVAILABLE',
          account: {
            accountId: 'acct-live',
            displayName: 'Live account',
            selectionMode: 'EXPLICIT',
            baseCurrency: null,
            strategyId: null,
          },
        },
        selectedAccountPortfolioValue: 0,
      }).selectedAccountPortfolioValue,
    ).toBeNull();
  });
});
