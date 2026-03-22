import { createDashboardScreenViewData } from '@/app/screens/dashboardScreenView';

describe('createDashboardScreenViewData', () => {
  it('reads the prepared Dashboard surface contract without re-ranking it', () => {
    const view = createDashboardScreenViewData({
      primeZone: {
        items: [
          {
            symbol: 'BTC',
            accountId: 'acct-1',
            strategyId: 'strategy-a',
            eventType: 'MOMENTUM_BUILDING',
            alignmentState: 'WATCHFUL',
            trendDirection: 'strengthening',
            certainty: 'confirmed',
            timestamp: 500,
          },
        ],
      },
      secondaryZone: {
        items: [
          {
            symbol: 'ETH',
            accountId: 'acct-1',
            strategyId: 'strategy-b',
            eventType: 'ESTIMATED_PRICE',
            alignmentState: 'NEEDS_REVIEW',
            trendDirection: 'neutral',
            certainty: 'estimated',
            timestamp: 490,
          },
        ],
      },
      deepZone: {
        items: [
          {
            symbol: 'SOL',
            accountId: 'acct-1',
            strategyId: 'strategy-c',
            eventType: 'PRICE_MOVEMENT',
            alignmentState: 'ALIGNED',
            trendDirection: 'neutral',
            certainty: 'estimated',
            timestamp: 480,
          },
        ],
      },
      meta: {
        profile: 'ADVANCED',
        hasPrimeItems: true,
        hasSecondaryItems: true,
        hasDeepItems: true,
      },
    });

    expect(view).toEqual({
      profileLabel: 'ADVANCED',
      primeZone: {
        title: 'Prime Zone',
        items: [
          {
            title: 'BTC - Momentum building',
            subtitle: 'Strengthening | watchful',
            certaintyText: 'Confirmed',
          },
        ],
      },
      secondaryZone: {
        title: 'Secondary Zone',
        items: [
          {
            title: 'ETH - Estimated price',
            subtitle: 'Neutral | needs review',
            certaintyText: 'Estimated',
          },
        ],
      },
      deepZone: {
        title: 'Deep Zone',
        items: [
          {
            title: 'SOL - Price movement',
            subtitle: 'Neutral | aligned',
            certaintyText: 'Estimated',
          },
        ],
      },
    });
  });

  it('returns null when the prepared surface is unavailable', () => {
    expect(createDashboardScreenViewData(null)).toBeNull();
  });
});
