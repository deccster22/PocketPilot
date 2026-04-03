import type { MarketEvent } from '@/core/types/marketEvent';
import { selectExplanationLineage } from '@/services/explanation/selectExplanationLineage';

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

describe('selectExplanationLineage', () => {
  it('prefers a distinct interpreted support event over repetitive history', () => {
    const currentEvent = createEvent();
    const repeatedMomentum = createEvent({
      eventId: 'acct-1:momentum_basics:signal-breakout:BTC:99',
      timestamp: 99,
    });
    const supportingContext = createEvent({
      eventId: 'acct-1:momentum_basics:signal-data-quality:BTC:98',
      timestamp: 98,
      eventType: 'DATA_QUALITY',
      signalsTriggered: ['signal-data-quality'],
    });

    const result = selectExplanationLineage({
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
          eventsSinceLastViewed: [supportingContext, repeatedMomentum, currentEvent],
          sinceLastChecked: null,
        },
      },
    });

    expect(result.items.map((item) => item.label)).toEqual([
      'BTC momentum context',
      'Current interpreted state',
      'BTC data context',
    ]);
    expect(result.supportingHistoryCount).toBe(2);
  });

  it('falls back to one calm history context item when support is repetitive or generic', () => {
    const currentEvent = createEvent();
    const repeatedMomentum = createEvent({
      eventId: 'acct-1:momentum_basics:signal-breakout:BTC:99',
      timestamp: 99,
    });
    const genericPriceMove = createEvent({
      eventId: 'acct-1:momentum_basics:signal-price-move:BTC:98',
      timestamp: 98,
      eventType: 'PRICE_MOVEMENT',
      signalsTriggered: ['signal-price-move'],
    });

    const result = selectExplanationLineage({
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
          sinceLastChecked: null,
        },
      },
    });

    expect(result.items).toHaveLength(3);
    expect(result.items.map((item) => item.label)).toEqual([
      'BTC momentum context',
      'Current interpreted state',
      'Recent interpreted history',
    ]);
  });

  it('returns fewer items instead of padding thin context', () => {
    const currentEvent = createEvent({
      alignmentState: 'ALIGNED',
      certainty: 'confirmed',
    });

    const result = selectExplanationLineage({
      target: {
        symbol: 'BTC',
        accountId: 'acct-1',
        strategyId: 'momentum_basics',
        eventType: 'MOMENTUM_BUILDING',
        alignmentState: undefined,
        certainty: undefined,
        timestamp: 100,
      },
      currentEvent,
      orientationContext: {
        currentState: {
          latestRelevantEvent: currentEvent,
          strategyAlignment: null,
          certainty: null,
        },
        historyContext: {
          eventsSinceLastViewed: [currentEvent],
          sinceLastChecked: null,
        },
      },
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      label: 'BTC momentum context',
    });
  });
});
