import type { MarketEvent } from '@/core/types/marketEvent';
import { createPreparedRiskReferences } from '@/services/trade/createPreparedRiskReferences';

function createEvent(overrides: Partial<MarketEvent> = {}): MarketEvent {
  return {
    eventId: 'acct-1:momentum_basics:event:BTC:100',
    timestamp: 100,
    accountId: 'acct-1',
    symbol: 'BTC',
    strategyId: 'momentum_basics',
    eventType: 'MOMENTUM_BUILDING',
    alignmentState: 'ALIGNED',
    signalsTriggered: ['hidden-signal'],
    confidenceScore: 0.8,
    certainty: 'confirmed',
    price: 104,
    pctChange: 0.04,
    metadata: {
      relatedSymbols: ['BTC'],
    },
    ...overrides,
  };
}

describe('createPreparedRiskReferences', () => {
  it('publishes a strategy-owned stop from baseline context only when the event scope is explicit and confirmed', () => {
    const event = createEvent({
      metadata: {
        relatedSymbols: ['BTC'],
        strategyPreparedRiskContext: {
          stopPrice: {
            basis: 'BASELINE_PRICE',
          },
        },
        providerNote: 'do-not-leak',
      },
    });

    const result = createPreparedRiskReferences({
      intentType: 'ACCUMULATE',
      primaryEvent: event,
      events: [event],
    });

    expect(result).toEqual({
      entryPrice: 104,
      stopPrice: 100,
      targetPrice: null,
    });
    expect(JSON.stringify(result)).not.toContain('providerNote');
    expect(JSON.stringify(result)).not.toContain('strategyPreparedRiskContext');
  });

  it('publishes a strategy-owned target from baseline context only when the event scope is explicit and confirmed', () => {
    const event = createEvent({
      strategyId: 'dip_buying',
      eventType: 'DIP_DETECTED',
      price: 96,
      pctChange: -0.04,
      metadata: {
        relatedSymbols: ['BTC'],
        strategyPreparedRiskContext: {
          targetPrice: {
            basis: 'BASELINE_PRICE',
          },
        },
      },
    });

    const result = createPreparedRiskReferences({
      intentType: 'ACCUMULATE',
      primaryEvent: event,
      events: [event],
    });

    expect(result).toEqual({
      entryPrice: 96,
      stopPrice: null,
      targetPrice: 100,
    });
  });

  it('keeps strategy-owned stop and target levels null when the context is weak or ambiguous', () => {
    const firstEvent = createEvent({
      eventId: 'acct-1:momentum_basics:event:BTC:100',
      price: 104,
      pctChange: 0.04,
      metadata: {
        relatedSymbols: ['BTC'],
        strategyPreparedRiskContext: {
          stopPrice: {
            basis: 'BASELINE_PRICE',
          },
        },
      },
    });
    const secondEvent = createEvent({
      eventId: 'acct-1:momentum_basics:event:BTC:110',
      timestamp: 110,
      price: 110,
      pctChange: 0.05,
      metadata: {
        relatedSymbols: ['BTC'],
        strategyPreparedRiskContext: {
          stopPrice: {
            basis: 'BASELINE_PRICE',
          },
        },
      },
    });

    const ambiguous = createPreparedRiskReferences({
      intentType: 'ACCUMULATE',
      primaryEvent: secondEvent,
      events: [firstEvent, secondEvent],
    });
    const estimated = createPreparedRiskReferences({
      intentType: 'ACCUMULATE',
      primaryEvent: {
        ...firstEvent,
        certainty: 'estimated',
      },
      events: [
        {
          ...firstEvent,
          certainty: 'estimated',
        },
      ],
    });
    const mixedScope = createPreparedRiskReferences({
      intentType: 'ACCUMULATE',
      primaryEvent: firstEvent,
      events: [
        {
          ...firstEvent,
          metadata: {
            relatedSymbols: ['BTC', 'ETH'],
            strategyPreparedRiskContext: {
              stopPrice: {
                basis: 'BASELINE_PRICE',
              },
            },
          },
        },
      ],
    });

    expect(ambiguous).toEqual({
      entryPrice: 110,
      stopPrice: null,
      targetPrice: null,
    });
    expect(estimated).toBeNull();
    expect(mixedScope).toEqual({
      entryPrice: 104,
      stopPrice: null,
      targetPrice: null,
    });
  });

  it('keeps explicit prepared planning levels authoritative over strategy-owned publishing context', () => {
    const event = createEvent({
      metadata: {
        relatedSymbols: ['BTC'],
        preparedRiskReferences: {
          stopPrice: 97,
          targetPrice: 112,
        },
        strategyPreparedRiskContext: {
          stopPrice: {
            basis: 'BASELINE_PRICE',
          },
          targetPrice: {
            basis: 'BASELINE_PRICE',
          },
        },
      },
    });

    const result = createPreparedRiskReferences({
      intentType: 'ACCUMULATE',
      primaryEvent: event,
      events: [event],
    });

    expect(result).toEqual({
      entryPrice: 104,
      stopPrice: 97,
      targetPrice: 112,
    });
  });
});
