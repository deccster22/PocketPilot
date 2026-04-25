import type { MarketEvent } from '@/core/types/marketEvent';
import { createPreparedTradeReferences } from '@/services/trade/createPreparedTradeReferences';

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

describe('createPreparedTradeReferences', () => {
  it('returns one deterministic prepared stop/target bundle with explicit source labels', () => {
    const event = createEvent({
      metadata: {
        relatedSymbols: ['BTC'],
        preparedRiskReferences: {
          targetPrice: 112,
        },
        strategyPreparedRiskContext: {
          stopPrice: {
            basis: 'BASELINE_PRICE',
          },
        },
      },
    });

    const first = createPreparedTradeReferences({
      intentType: 'ACCUMULATE',
      events: [event],
    });
    const second = createPreparedTradeReferences({
      intentType: 'ACCUMULATE',
      events: [event],
    });

    expect(first).toEqual(second);
    expect(first).toEqual({
      status: 'AVAILABLE',
      references: [
        {
          kind: 'STOP',
          label: 'Prepared stop reference',
          value: '100',
          sourceLabel: 'Source: strategy context',
          limitations: ['Derived from confirmed strategy context and omitted when context is thin.'],
        },
        {
          kind: 'TARGET',
          label: 'Prepared target reference',
          value: '112',
          sourceLabel: 'Source: prepared plan',
        },
      ],
    });
  });

  it('returns an unavailable thin-context state when stop/target context is ambiguous or weak', () => {
    const firstEvent = createEvent({
      eventId: 'acct-1:momentum_basics:event:BTC:100',
      timestamp: 100,
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

    const result = createPreparedTradeReferences({
      intentType: 'ACCUMULATE',
      events: [firstEvent, secondEvent],
    });

    expect(result).toEqual({
      status: 'UNAVAILABLE',
      reason: 'THIN_CONTEXT',
    });
  });

  it('does not invent stop/target values when strategy or prepared-plan context is absent', () => {
    const result = createPreparedTradeReferences({
      intentType: 'ACCUMULATE',
      events: [createEvent()],
    });

    expect(result).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_STRATEGY_REFERENCE',
    });
  });

  it('stays unavailable when stop/target publishing is not enabled for this intent surface', () => {
    const result = createPreparedTradeReferences({
      intentType: 'WAIT',
      events: [createEvent()],
    });

    expect(result).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });
  });

  it('keeps copy support-first and free of execution or profit theatre', () => {
    const available = createPreparedTradeReferences({
      intentType: 'ACCUMULATE',
      events: [
        createEvent({
          metadata: {
            relatedSymbols: ['BTC'],
            preparedRiskReferences: {
              stopPrice: 99,
              targetPrice: 109,
            },
          },
        }),
      ],
    });
    const unavailable = createPreparedTradeReferences({
      intentType: 'WAIT',
      events: [createEvent()],
    });
    const copyText = `${JSON.stringify(available)} ${JSON.stringify(unavailable)}`;

    expect(copyText).not.toMatch(/\bexecution|dispatch|profit|opportunity|guarantee\b/i);
  });
});
