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
    const supportingContextEvent = createEvent({
      eventId: 'acct-1:momentum_basics:signal-data-quality:BTC:96',
      timestamp: 96,
      eventType: 'DATA_QUALITY',
      signalsTriggered: ['signal-data-quality'],
      metadata: {
        providerId: 'provider-hidden',
      },
    });
    const estimatedHistoryEvent = createEvent({
      eventId: 'acct-1:momentum_basics:signal-pullback:BTC:90',
      timestamp: 90,
      eventType: 'ESTIMATED_PRICE',
      certainty: 'estimated',
      signalsTriggered: ['signal-pullback'],
      metadata: {
        providerId: 'provider-hidden-2',
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
          eventsSinceLastViewed: [estimatedHistoryEvent, supportingContextEvent, currentEvent],
          sinceLastChecked: {
            sinceTimestamp: 80,
            accountId: 'acct-1',
            summaryCount: 3,
            events: [estimatedHistoryEvent, supportingContextEvent, currentEvent],
          },
        },
      },
    });

    expect(result).toMatchObject({
      status: 'AVAILABLE',
      explanation: {
        title: 'Why BTC is in focus',
        confidence: 'MODERATE',
      },
    });

    if (result.status !== 'AVAILABLE') {
      throw new Error('Expected explanation to be available.');
    }

    expect(result.explanation.summary).toContain('BTC is in focus because momentum has continued to build');
    expect(result.explanation.summary).toContain('The current state still reads watchful');
    expect(result.explanation.contextNote).toContain('watchful');
    expect(result.explanation.confidenceNote).toContain('evidence support');
    expect(result.explanation.confidenceNote).toContain('estimated');
    expect(result.explanation.lineage).toEqual([
      {
        kind: 'MARKET_EVENT',
        label: 'BTC momentum context',
        detail: 'BTC stays in focus because momentum has continued to build in the current read.',
        timestamp: '1970-01-01T00:00:00.100Z',
      },
      {
        kind: 'STATE_TRANSITION',
        label: 'Current interpreted state',
        detail: 'The current interpreted state reads watchful.',
        timestamp: '1970-01-01T00:00:00.100Z',
      },
      {
        kind: 'MARKET_EVENT',
        label: 'BTC data context',
        detail: 'A recent interpreted data-quality limit still shapes how BTC is being read.',
        timestamp: '1970-01-01T00:00:00.096Z',
      },
    ]);
    expect(result.explanation.limitations).toEqual([
      'This explanation reflects current interpreted conditions only.',
      'Some supporting price context remains estimated.',
    ]);

    const serialized = JSON.stringify(result.explanation);

    expect(serialized).not.toMatch(
      /signal-breakout|signal-data-quality|signal-pullback|acct-1:momentum_basics|provider-hidden|provider-hidden-2|broker:live/,
    );
    expect(serialized).not.toMatch(/profit|win rate|likely|probability|chance|act now|urgent/i);
  });

  it('keeps repetitive interpreted history from bloating lineage', () => {
    const currentEvent = createEvent();
    const repeatedMomentum = createEvent({
      eventId: 'acct-1:momentum_basics:signal-breakout:BTC:95',
      timestamp: 95,
    });
    const genericPriceMove = createEvent({
      eventId: 'acct-1:momentum_basics:signal-price-move:BTC:94',
      timestamp: 94,
      eventType: 'PRICE_MOVEMENT',
      signalsTriggered: ['signal-price-move'],
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
          eventsSinceLastViewed: [genericPriceMove, repeatedMomentum, currentEvent],
          sinceLastChecked: {
            sinceTimestamp: 80,
            accountId: 'acct-1',
            summaryCount: 3,
            events: [genericPriceMove, repeatedMomentum, currentEvent],
          },
        },
      },
    });

    if (result.status !== 'AVAILABLE') {
      throw new Error('Expected explanation to be available.');
    }

    expect(result.explanation.lineage).toHaveLength(3);
    expect(result.explanation.lineage.map((item) => item.label)).toEqual([
      'BTC momentum context',
      'Current interpreted state',
      'Recent interpreted history',
    ]);
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

  it('keeps richer phrasing calm and concise', () => {
    const currentEvent = createEvent();

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
          eventsSinceLastViewed: [currentEvent],
          sinceLastChecked: {
            sinceTimestamp: 80,
            accountId: 'acct-1',
            summaryCount: 1,
            events: [currentEvent],
          },
        },
      },
    });

    if (result.status !== 'AVAILABLE') {
      throw new Error('Expected explanation to be available.');
    }

    expect(result.explanation.summary.split(/\s+/).length).toBeLessThanOrEqual(28);
    expect(result.explanation.contextNote?.split(/\s+/).length ?? 0).toBeLessThanOrEqual(14);
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
