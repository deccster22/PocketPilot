import { createDashboardSurfaceModel } from '@/services/dashboard/createDashboardSurfaceModel';
import { createDashboardModel } from '@/services/dashboard/createDashboardModel';
import type { MarketEvent } from '@/core/types/marketEvent';
import type { DashboardItem } from '@/services/dashboard/types';

function createDashboardItem(overrides: Partial<DashboardItem> = {}): DashboardItem {
  return {
    symbol: 'BTC',
    accountId: 'acct-1',
    strategyId: 'strategy-a',
    eventType: 'PRICE_MOVEMENT',
    alignmentState: 'WATCHFUL',
    trendDirection: 'neutral',
    certainty: 'estimated',
    timestamp: 100,
    ...overrides,
  };
}

describe('createDashboardSurfaceModel', () => {
  it('maps dashboard buckets into explicit surface zones with meta flags', () => {
    const surface = createDashboardSurfaceModel({
      profile: 'MIDDLE',
      model: {
        prime: [createDashboardItem({ symbol: 'BTC', certainty: 'confirmed', trendDirection: 'strengthening' })],
        secondary: [createDashboardItem({ symbol: 'ETH', eventType: 'ESTIMATED_PRICE' })],
        background: [createDashboardItem({ symbol: 'SOL' })],
      },
    });

    expect(surface).toEqual({
      primeZone: {
        items: [
          {
            symbol: 'BTC',
            accountId: 'acct-1',
            strategyId: 'strategy-a',
            eventType: 'PRICE_MOVEMENT',
            alignmentState: 'WATCHFUL',
            trendDirection: 'strengthening',
            certainty: 'confirmed',
            timestamp: 100,
          },
        ],
      },
      secondaryZone: {
        items: [
          {
            symbol: 'ETH',
            accountId: 'acct-1',
            strategyId: 'strategy-a',
            eventType: 'ESTIMATED_PRICE',
            alignmentState: 'WATCHFUL',
            trendDirection: 'neutral',
            certainty: 'estimated',
            timestamp: 100,
          },
        ],
      },
      deepZone: {
        items: [
          {
            symbol: 'SOL',
            accountId: 'acct-1',
            strategyId: 'strategy-a',
            eventType: 'PRICE_MOVEMENT',
            alignmentState: 'WATCHFUL',
            trendDirection: 'neutral',
            certainty: 'estimated',
            timestamp: 100,
          },
        ],
      },
      meta: {
        profile: 'MIDDLE',
        hasPrimeItems: true,
        hasSecondaryItems: true,
        hasDeepItems: true,
      },
    });
  });

  it('keeps surface population deterministic and clones the underlying buckets', () => {
    const model = {
      prime: [createDashboardItem({ symbol: 'ADA', certainty: 'confirmed', trendDirection: 'strengthening' })],
      secondary: [createDashboardItem({ symbol: 'DOGE', eventType: 'DATA_QUALITY' })],
      background: [],
    };

    const first = createDashboardSurfaceModel({ model, profile: 'ADVANCED' });
    const second = createDashboardSurfaceModel({ model, profile: 'ADVANCED' });

    expect(first).toEqual(second);
    expect(first.primeZone.items).not.toBe(model.prime);
    expect(first.secondaryZone.items).not.toBe(model.secondary);
  });

  it('preserves profile-shaped density differences without introducing raw signal leakage', () => {
    const events: MarketEvent[] = [
      {
        eventId: 'acct-1:strategy-a:signal:BTC:300',
        timestamp: 300,
        accountId: 'acct-1',
        symbol: 'BTC',
        strategyId: 'strategy-a',
        eventType: 'MOMENTUM_BUILDING',
        alignmentState: 'WATCHFUL',
        signalsTriggered: ['signal-a'],
        confidenceScore: 0.9,
        certainty: 'confirmed',
        price: 100,
        pctChange: 0.03,
        metadata: { hidden: true },
      },
      {
        eventId: 'acct-1:strategy-b:signal:ETH:290',
        timestamp: 290,
        accountId: 'acct-1',
        symbol: 'ETH',
        strategyId: 'strategy-b',
        eventType: 'ESTIMATED_PRICE',
        alignmentState: 'WATCHFUL',
        signalsTriggered: ['signal-b'],
        confidenceScore: 0.4,
        certainty: 'estimated',
        price: null,
        pctChange: null,
        metadata: { hidden: 'secondary' },
      },
      {
        eventId: 'acct-1:strategy-c:signal:SOL:280',
        timestamp: 280,
        accountId: 'acct-1',
        symbol: 'SOL',
        strategyId: 'strategy-c',
        eventType: 'PRICE_MOVEMENT',
        alignmentState: 'ALIGNED',
        signalsTriggered: ['signal-c'],
        confidenceScore: 0.2,
        certainty: 'estimated',
        price: 20,
        pctChange: 0,
        metadata: { hidden: 'deep' },
      },
    ];

    const beginnerSurface = createDashboardSurfaceModel({
      profile: 'BEGINNER',
      model: createDashboardModel({
        orientationContext: { profile: 'BEGINNER', assets: [] },
        events: [...events],
      }),
    });
    const intermediateSurface = createDashboardSurfaceModel({
      profile: 'MIDDLE',
      model: createDashboardModel({
        orientationContext: { profile: 'MIDDLE', assets: [] },
        events: [...events],
      }),
    });
    const advancedSurface = createDashboardSurfaceModel({
      profile: 'ADVANCED',
      model: createDashboardModel({
        orientationContext: { profile: 'ADVANCED', assets: [] },
        events: [...events],
      }),
    });

    expect(beginnerSurface.primeZone.items).toHaveLength(1);
    expect(beginnerSurface.secondaryZone.items).toHaveLength(0);
    expect(beginnerSurface.deepZone.items).toHaveLength(0);

    expect(intermediateSurface.primeZone.items).toHaveLength(1);
    expect(intermediateSurface.secondaryZone.items).toHaveLength(1);
    expect(intermediateSurface.deepZone.items).toHaveLength(1);

    expect(advancedSurface.primeZone.items).toHaveLength(1);
    expect(advancedSurface.secondaryZone.items).toHaveLength(1);
    expect(advancedSurface.deepZone.items).toHaveLength(1);

    expect(advancedSurface.primeZone.items[0]).not.toHaveProperty('signalsTriggered');
    expect(advancedSurface.primeZone.items[0]).not.toHaveProperty('metadata');
    expect(advancedSurface.primeZone.items[0]).not.toHaveProperty('confidenceScore');
    expect(advancedSurface.primeZone.items[0]).not.toHaveProperty('price');
  });
});
