import type { MarketEvent } from '@/core/types/marketEvent';
import { fetchDashboardExplanationVM } from '@/services/dashboard/fetchDashboardExplanationVM';

function createEvent(overrides: Partial<MarketEvent> = {}): MarketEvent {
  return {
    eventId: 'acct-1:momentum_basics:signal-breakout:BTC:100',
    timestamp: 100,
    accountId: 'acct-1',
    symbol: 'BTC',
    strategyId: 'momentum_basics',
    eventType: 'MOMENTUM_BUILDING',
    alignmentState: 'WATCHFUL',
    signalsTriggered: ['signal-breakout'],
    confidenceScore: 0.82,
    certainty: 'confirmed',
    price: 100,
    pctChange: 0.04,
    metadata: {
      providerId: 'broker:live',
    },
    ...overrides,
  };
}

describe('fetchDashboardExplanationVM', () => {
  it('builds the Dashboard why note from the prime item only', () => {
    const primeEvent = createEvent();

    const result = fetchDashboardExplanationVM({
      surfaceModel: {
        primeZone: {
          items: [
            {
              symbol: 'BTC',
              accountId: 'acct-1',
              strategyId: 'momentum_basics',
              eventType: 'MOMENTUM_BUILDING',
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
              strategyId: 'dip_buying',
              eventType: 'DIP_DETECTED',
              alignmentState: 'WATCHFUL',
              trendDirection: 'weakening',
              certainty: 'estimated',
              timestamp: 99,
            },
          ],
        },
        deepZone: {
          items: [],
        },
        meta: {
          profile: 'ADVANCED',
          hasPrimeItems: true,
          hasSecondaryItems: true,
          hasDeepItems: false,
        },
      },
      events: [primeEvent],
      explanationContext: {
        accountId: 'acct-1',
        symbol: 'BTC',
        strategyId: 'momentum_basics',
        currentState: {
          latestRelevantEvent: primeEvent,
          strategyAlignment: 'Watchful',
          certainty: 'confirmed',
        },
        historyContext: {
          eventsSinceLastViewed: [primeEvent],
          sinceLastChecked: {
            sinceTimestamp: 80,
            accountId: 'acct-1',
            summaryCount: 1,
            events: [primeEvent],
          },
        },
      },
    });

    expect(result).toMatchObject({
      status: 'AVAILABLE',
      explanation: {
        title: 'Why BTC is in focus',
      },
    });
  });

  it('returns unavailable instead of inventing a secondary-surface explanation', () => {
    expect(
      fetchDashboardExplanationVM({
        surfaceModel: {
          primeZone: {
            items: [],
          },
          secondaryZone: {
            items: [
              {
                symbol: 'ETH',
                accountId: 'acct-1',
                strategyId: 'dip_buying',
                eventType: 'DIP_DETECTED',
                alignmentState: 'WATCHFUL',
                trendDirection: 'weakening',
                certainty: 'estimated',
                timestamp: 99,
              },
            ],
          },
          deepZone: {
            items: [],
          },
          meta: {
            profile: 'ADVANCED',
            hasPrimeItems: false,
            hasSecondaryItems: true,
            hasDeepItems: false,
          },
        },
        events: [createEvent()],
        explanationContext: {
          accountId: 'acct-1',
          currentState: {
            latestRelevantEvent: null,
            strategyAlignment: null,
            certainty: null,
          },
          historyContext: {
            eventsSinceLastViewed: [],
            sinceLastChecked: null,
          },
        },
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_EXPLANATION_TARGET',
    });
  });

  it('remains deterministic for identical Dashboard inputs', () => {
    const event = createEvent();
    const params = {
      surfaceModel: {
        primeZone: {
          items: [
            {
              symbol: 'BTC',
              accountId: 'acct-1',
              strategyId: 'momentum_basics',
              eventType: 'MOMENTUM_BUILDING' as const,
              alignmentState: 'WATCHFUL' as const,
              trendDirection: 'strengthening' as const,
              certainty: 'confirmed' as const,
              timestamp: 100,
            },
          ],
        },
        secondaryZone: {
          items: [],
        },
        deepZone: {
          items: [],
        },
        meta: {
          profile: 'ADVANCED' as const,
          hasPrimeItems: true,
          hasSecondaryItems: false,
          hasDeepItems: false,
        },
      },
      events: [event],
      explanationContext: {
        accountId: 'acct-1',
        symbol: 'BTC',
        strategyId: 'momentum_basics',
        currentState: {
          latestRelevantEvent: event,
          strategyAlignment: 'Watchful',
          certainty: 'confirmed' as const,
        },
        historyContext: {
          eventsSinceLastViewed: [],
          sinceLastChecked: null,
        },
      },
    };

    expect(fetchDashboardExplanationVM(params)).toEqual(fetchDashboardExplanationVM(params));
  });
});
