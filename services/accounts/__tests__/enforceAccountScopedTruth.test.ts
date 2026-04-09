import {
  enforceAccountScopedTruth,
  filterAccountScopedItems,
  requireSelectedAccountContext,
  scopeOrientationContextToSelectedAccount,
} from '@/services/accounts/enforceAccountScopedTruth';
import type { SelectedAccountAvailability } from '@/services/accounts/types';

const selectedAccountContext: SelectedAccountAvailability = {
  status: 'AVAILABLE',
  account: {
    accountId: 'acct-live',
    displayName: 'Live account',
    selectionMode: 'PRIMARY_FALLBACK',
    baseCurrency: 'USD',
    strategyId: 'momentum_basics',
  },
};

describe('enforceAccountScopedTruth', () => {
  it('filters account-scoped items to the selected account only', () => {
    expect(
      filterAccountScopedItems({
        selectedAccount: requireSelectedAccountContext(selectedAccountContext),
        items: [
          { accountId: 'acct-basic', value: 'drop' },
          { accountId: 'acct-live', value: 'keep' },
        ],
      }),
    ).toEqual([{ accountId: 'acct-live', value: 'keep' }]);
  });

  it('throws when a prepared seam tries to carry mismatched account ids', () => {
    expect(() =>
      enforceAccountScopedTruth({
        label: 'Strategy alignment',
        selectedAccount: requireSelectedAccountContext(selectedAccountContext),
        accountIds: ['acct-live', 'acct-basic'],
        value: 'unreachable',
      }),
    ).toThrow('Strategy alignment must remain scoped to account acct-live.');
  });

  it('scopes orientation context to the selected account only', () => {
    expect(
      scopeOrientationContextToSelectedAccount({
        selectedAccount: requireSelectedAccountContext(selectedAccountContext),
        orientationContext: {
          accountId: 'acct-basic',
          symbol: 'ETH',
          strategyId: 'dip_buying',
          currentState: {
            latestRelevantEvent: {
              eventId: 'evt-live',
              timestamp: 100,
              accountId: 'acct-live',
              symbol: 'BTC',
              strategyId: 'momentum_basics',
              eventType: 'MOMENTUM_BUILDING',
              alignmentState: 'ALIGNED',
              signalsTriggered: ['signal'],
              confidenceScore: 0.9,
              certainty: 'confirmed',
              price: 100,
              pctChange: 0.02,
              metadata: {},
            },
            strategyAlignment: 'Aligned',
            certainty: 'confirmed',
          },
          historyContext: {
            eventsSinceLastViewed: [
              {
                eventId: 'evt-drop',
                timestamp: 90,
                accountId: 'acct-basic',
                symbol: 'ETH',
                strategyId: 'dip_buying',
                eventType: 'PRICE_MOVEMENT',
                alignmentState: 'WATCHFUL',
                signalsTriggered: ['signal'],
                confidenceScore: 0.5,
                certainty: 'estimated',
                price: 20,
                pctChange: -0.08,
                metadata: {},
              },
              {
                eventId: 'evt-keep',
                timestamp: 95,
                accountId: 'acct-live',
                symbol: 'BTC',
                strategyId: 'momentum_basics',
                eventType: 'PRICE_MOVEMENT',
                alignmentState: 'ALIGNED',
                signalsTriggered: ['signal'],
                confidenceScore: 0.8,
                certainty: 'confirmed',
                price: 99,
                pctChange: 0.01,
                metadata: {},
              },
            ],
            sinceLastChecked: {
              sinceTimestamp: 80,
              accountId: 'acct-basic',
              summaryCount: 2,
              events: [
                {
                  eventId: 'evt-drop',
                  timestamp: 90,
                  accountId: 'acct-basic',
                  symbol: 'ETH',
                  strategyId: 'dip_buying',
                  eventType: 'PRICE_MOVEMENT',
                  alignmentState: 'WATCHFUL',
                  signalsTriggered: ['signal'],
                  confidenceScore: 0.5,
                  certainty: 'estimated',
                  price: 20,
                  pctChange: -0.08,
                  metadata: {},
                },
                {
                  eventId: 'evt-keep',
                  timestamp: 95,
                  accountId: 'acct-live',
                  symbol: 'BTC',
                  strategyId: 'momentum_basics',
                  eventType: 'PRICE_MOVEMENT',
                  alignmentState: 'ALIGNED',
                  signalsTriggered: ['signal'],
                  confidenceScore: 0.8,
                  certainty: 'confirmed',
                  price: 99,
                  pctChange: 0.01,
                  metadata: {},
                },
              ],
            },
          },
        },
      }),
    ).toMatchObject({
      accountId: 'acct-live',
      symbol: 'BTC',
      strategyId: 'momentum_basics',
      currentState: {
        latestRelevantEvent: {
          accountId: 'acct-live',
        },
      },
      historyContext: {
        eventsSinceLastViewed: [{ accountId: 'acct-live' }],
        sinceLastChecked: {
          accountId: 'acct-live',
          events: [{ accountId: 'acct-live' }],
        },
      },
    });
  });
});

