import type { MarketEvent } from '@/core/types/marketEvent';
import { createDashboardModel } from '@/services/dashboard/createDashboardModel';

function createEvent(overrides: Partial<MarketEvent> = {}): MarketEvent {
  return {
    eventId: 'acct-1:strategy-a:signal:BTC:100',
    timestamp: 100,
    accountId: 'acct-1',
    symbol: 'BTC',
    strategyId: 'strategy-a',
    eventType: 'PRICE_MOVEMENT',
    alignmentState: 'WATCHFUL',
    signalsTriggered: ['signal'],
    confidenceScore: 0.7,
    certainty: 'confirmed',
    price: 100,
    pctChange: 0.03,
    metadata: {
      signalTitle: 'Momentum',
      nested: {
        hidden: true,
      },
    },
    ...overrides,
  };
}

describe('createDashboardModel', () => {
  it('builds a profile-aware dashboard model across multiple assets', () => {
    const result = createDashboardModel({
      orientationContext: {
        profile: 'ADVANCED',
        assets: [
          {
            symbol: 'BTC',
            accountId: 'acct-1',
            strategyId: 'strategy-a',
            alignmentState: 'WATCHFUL',
            trendDirection: 'strengthening',
            certainty: 'confirmed',
            timestamp: 500,
          },
          {
            symbol: 'ETH',
            accountId: 'acct-2',
            strategyId: 'strategy-b',
            alignmentState: 'NEEDS_REVIEW',
            trendDirection: 'weakening',
            certainty: 'estimated',
            timestamp: 490,
          },
        ],
      },
      events: [
        createEvent({
          eventId: 'acct-1:strategy-a:signal:BTC:500',
          timestamp: 500,
          symbol: 'BTC',
          accountId: 'acct-1',
          strategyId: 'strategy-a',
          eventType: 'MOMENTUM_BUILDING',
          certainty: 'confirmed',
          pctChange: 0.03,
        }),
        createEvent({
          eventId: 'acct-2:strategy-b:signal:ETH:490',
          timestamp: 490,
          symbol: 'ETH',
          accountId: 'acct-2',
          strategyId: 'strategy-b',
          eventType: 'ESTIMATED_PRICE',
          certainty: 'estimated',
          pctChange: -0.05,
        }),
        createEvent({
          eventId: 'acct-1:strategy-c:signal:SOL:480',
          timestamp: 480,
          symbol: 'SOL',
          accountId: 'acct-1',
          strategyId: 'strategy-c',
          eventType: 'PRICE_MOVEMENT',
          certainty: 'estimated',
          alignmentState: 'ALIGNED',
          pctChange: 0,
        }),
      ],
    });

    expect(result).toEqual({
      prime: [
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
      secondary: [
        {
          symbol: 'ETH',
          accountId: 'acct-2',
          strategyId: 'strategy-b',
          eventType: 'ESTIMATED_PRICE',
          alignmentState: 'NEEDS_REVIEW',
          trendDirection: 'weakening',
          certainty: 'estimated',
          timestamp: 490,
        },
      ],
      background: [
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
    });
  });

  it('reduces dashboard density for beginner profiles', () => {
    const result = createDashboardModel({
      orientationContext: {
        profile: 'BEGINNER',
        assets: [],
      },
      events: [
        createEvent({
          eventId: 'acct-1:strategy-a:signal:BTC:300',
          timestamp: 300,
          symbol: 'BTC',
          eventType: 'MOMENTUM_BUILDING',
          certainty: 'confirmed',
          pctChange: 0.03,
        }),
        createEvent({
          eventId: 'acct-1:strategy-b:signal:ETH:290',
          timestamp: 290,
          symbol: 'ETH',
          strategyId: 'strategy-b',
          eventType: 'DIP_DETECTED',
          certainty: 'confirmed',
          pctChange: -0.04,
        }),
        createEvent({
          eventId: 'acct-1:strategy-c:signal:SOL:280',
          timestamp: 280,
          symbol: 'SOL',
          strategyId: 'strategy-c',
          eventType: 'ESTIMATED_PRICE',
          certainty: 'estimated',
          pctChange: null,
        }),
      ],
    });

    expect(result).toEqual({
      prime: [
        {
          symbol: 'BTC',
          accountId: 'acct-1',
          strategyId: 'strategy-a',
          eventType: 'MOMENTUM_BUILDING',
          alignmentState: 'WATCHFUL',
          trendDirection: 'strengthening',
          certainty: 'confirmed',
          timestamp: 300,
        },
      ],
      secondary: [],
      background: [],
    });
  });

  it('keeps the dashboard model free of raw signal leakage', () => {
    const result = createDashboardModel({
      orientationContext: {
        profile: 'ADVANCED',
        assets: [],
      },
      events: [createEvent()],
    });

    expect(result.prime[0]).toEqual({
      symbol: 'BTC',
      accountId: 'acct-1',
      strategyId: 'strategy-a',
      eventType: 'PRICE_MOVEMENT',
      alignmentState: 'WATCHFUL',
      trendDirection: 'strengthening',
      certainty: 'confirmed',
      timestamp: 100,
    });
    expect(result.prime[0]).not.toHaveProperty('signalsTriggered');
    expect(result.prime[0]).not.toHaveProperty('metadata');
    expect(result.prime[0]).not.toHaveProperty('confidenceScore');
    expect(result.prime[0]).not.toHaveProperty('price');
  });
});
