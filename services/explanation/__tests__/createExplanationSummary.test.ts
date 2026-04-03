import type { MarketEvent } from '@/core/types/marketEvent';
import { createExplanationSummary } from '@/services/explanation/createExplanationSummary';

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

describe('createExplanationSummary', () => {
  it('builds a calm explanation from interpreted context without raw leakage', () => {
    const currentEvent = createEvent();
    const previousEvent = createEvent({
      eventId: 'acct-1:momentum_basics:signal-breakout:BTC:90',
      timestamp: 90,
      certainty: 'estimated',
      eventType: 'PRICE_MOVEMENT',
      signalsTriggered: ['signal-pullback'],
      metadata: {
        providerId: 'provider-hidden',
      },
    });

    const result = createExplanationSummary({
      surface: 'DASHBOARD_PRIME',
      target: {
        symbol: 'BTC',
        accountId: 'acct-1',
        strategyId: 'momentum_basics',
        eventType: 'MOMENTUM_BUILDING',
        alignmentState: 'WATCHFUL',
        certainty: 'confirmed',
        timestamp: 100,
      },
      currentEvent,
      orientationContext: {
        currentState: {
          latestRelevantEvent: currentEvent,
          strategyAlignment: 'Watchful',
          certainty: 'confirmed',
        },
        historyContext: {
          eventsSinceLastViewed: [previousEvent, currentEvent],
          sinceLastChecked: {
            sinceTimestamp: 80,
            accountId: 'acct-1',
            summaryCount: 2,
            events: [previousEvent, currentEvent],
          },
        },
      },
    });

    expect(result).toMatchObject({
      status: 'AVAILABLE',
      explanation: {
        title: 'Why BTC is in focus',
        confidence: 'HIGH',
        confidenceNote: expect.stringContaining('evidence support'),
      },
    });

    if (result.status !== 'AVAILABLE') {
      throw new Error('Expected explanation to be available.');
    }

    expect(result.explanation.summary).toContain('BTC is in focus because momentum is strengthening');
    expect(result.explanation.summary).toContain('Recent interpreted history still supports that reading.');
    expect(result.explanation.lineage).toHaveLength(3);
    expect(result.explanation.limitations).toEqual([
      'This explanation reflects current interpreted conditions only.',
      'Some supporting context remains estimated.',
    ]);

    const serialized = JSON.stringify(result.explanation);

    expect(serialized).not.toMatch(/signal-breakout|signal-pullback|acct-1:momentum_basics|provider-hidden|broker:live/);
    expect(serialized).not.toMatch(/profit|win rate|likely outcome|act now|urgent/i);
  });

  it('returns unavailable when interpreted context is too thin', () => {
    expect(
      createExplanationSummary({
        surface: 'DASHBOARD_PRIME',
        target: {
          symbol: 'BTC',
          accountId: 'acct-1',
          strategyId: 'momentum_basics',
          eventType: 'MOMENTUM_BUILDING',
          alignmentState: undefined,
          certainty: 'confirmed',
          timestamp: 100,
        },
        currentEvent: null,
        orientationContext: {
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
      reason: 'INSUFFICIENT_INTERPRETED_CONTEXT',
    });
  });

  it('remains deterministic for identical interpreted inputs', () => {
    const event = createEvent();
    const params = {
      surface: 'DASHBOARD_PRIME' as const,
      target: {
        symbol: 'BTC',
        accountId: 'acct-1',
        strategyId: 'momentum_basics',
        eventType: 'MOMENTUM_BUILDING' as const,
        alignmentState: 'WATCHFUL' as const,
        certainty: 'confirmed' as const,
        timestamp: 100,
      },
      currentEvent: event,
      orientationContext: {
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

    expect(createExplanationSummary(params)).toEqual(createExplanationSummary(params));
  });
});
