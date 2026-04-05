import type { StrategySignal } from '@/core/strategy/types';
import { createMarketEvents } from '@/services/events/createMarketEvents';
import { createEventStream } from '@/services/events/eventStream';

describe('createMarketEvents', () => {
  const signals: StrategySignal[] = [
    {
      strategyId: 'momentum_basics',
      signalCode: 'momentum_threshold_met',
      symbol: 'AAPL',
      severity: 'WATCH',
      title: 'Momentum building',
      message: 'AAPL is up ~5.0% vs baseline.',
      timestampMs: 1_700_000_000_000,
      tags: ['delta', 'momentum'],
      eventHint: {
        eventType: 'MOMENTUM_BUILDING',
        alignmentState: 'WATCHFUL',
        confidenceScore: 0.75,
        relatedSymbols: ['AAPL'],
        metadata: {
          threshold: 0.04,
        },
      },
    },
    {
      strategyId: 'data_quality',
      signalCode: 'budget_blocked_symbols',
      severity: 'WATCH',
      title: 'Scan incomplete',
      message: '2 symbols were blocked by quote budget limits, so some quotes may be missing.',
      timestampMs: 1_700_000_000_000,
      tags: ['data', 'budget'],
      eventHint: {
        eventType: 'DATA_QUALITY',
        alignmentState: 'NEEDS_REVIEW',
        confidenceScore: 1.2,
        relatedSymbols: ['AAPL', 'MSFT'],
        metadata: {
          blockedSymbols: 2,
        },
      },
    },
  ];

  const quotesBySymbol = {
    AAPL: {
      symbol: 'AAPL',
      price: 105,
      source: 'test-feed',
      timestampMs: 1_700_000_000_000,
      estimated: true,
    },
    MSFT: {
      symbol: 'MSFT',
      price: 205,
      source: 'test-feed',
      timestampMs: 1_700_000_000_000,
      estimated: false,
    },
  };

  it('produces canonical MarketEvent objects with no ad-hoc fields', () => {
    const [event] = createMarketEvents({
      accountId: 'acct-1',
      quotesBySymbol,
      pctChangeBySymbol: { AAPL: 0.05, MSFT: -0.01 },
      signals,
    });

    expect(Object.keys(event).sort()).toEqual([
      'accountId',
      'alignmentState',
      'certainty',
      'confidenceScore',
      'eventId',
      'eventType',
      'metadata',
      'pctChange',
      'price',
      'signalsTriggered',
      'strategyId',
      'symbol',
      'timestamp',
    ]);
    expect(event).toEqual(
      expect.objectContaining({
        eventId: 'acct-1:momentum_basics:momentum_threshold_met:AAPL:1700000000000',
        timestamp: 1_700_000_000_000,
        accountId: 'acct-1',
        symbol: 'AAPL',
        strategyId: 'momentum_basics',
        eventType: 'MOMENTUM_BUILDING',
        alignmentState: 'WATCHFUL',
        signalsTriggered: ['momentum_threshold_met'],
        confidenceScore: 0.75,
        certainty: 'estimated',
        price: 105,
        pctChange: 0.05,
      }),
    );
  });

  it('is deterministic for the same input', () => {
    const first = createMarketEvents({
      accountId: 'acct-1',
      quotesBySymbol,
      pctChangeBySymbol: { AAPL: 0.05, MSFT: -0.01 },
      signals,
    });
    const second = createMarketEvents({
      accountId: 'acct-1',
      quotesBySymbol,
      pctChangeBySymbol: { AAPL: 0.05, MSFT: -0.01 },
      signals,
    });

    expect(first).toEqual(second);
  });

  it('propagates certainty and account scope into summary events', () => {
    const [, summaryEvent] = createMarketEvents({
      accountId: 'acct-42',
      quotesBySymbol,
      pctChangeBySymbol: { AAPL: 0.05, MSFT: -0.01 },
      signals,
    });

    expect(summaryEvent.accountId).toBe('acct-42');
    expect(summaryEvent.eventId).toContain('acct-42:data_quality:budget_blocked_symbols');
    expect(summaryEvent.certainty).toBe('estimated');
    expect(summaryEvent.eventType).toBe('DATA_QUALITY');
    expect(summaryEvent.alignmentState).toBe('NEEDS_REVIEW');
    expect(summaryEvent.price).toBe(105);
    expect(summaryEvent.pctChange).toBe(0.05);
    expect(summaryEvent.confidenceScore).toBe(1);
  });

  it('preserves strategy-owned prepared risk context inside event metadata for later trade services', () => {
    const [event] = createMarketEvents({
      accountId: 'acct-1',
      quotesBySymbol,
      pctChangeBySymbol: { AAPL: 0.05, MSFT: -0.01 },
      signals: [
        {
          ...signals[0]!,
          eventHint: {
            ...signals[0]!.eventHint,
            metadata: {
              threshold: 0.04,
              strategyPreparedRiskContext: {
                stopPrice: {
                  basis: 'BASELINE_PRICE',
                },
              },
            },
          },
        },
      ],
    });

    expect(event.metadata).toEqual(
      expect.objectContaining({
        strategyPreparedRiskContext: {
          stopPrice: {
            basis: 'BASELINE_PRICE',
          },
        },
      }),
    );
  });
});

describe('eventStream', () => {
  it('orders events deterministically by timestamp and eventId', () => {
    const stream = createEventStream({
      accountId: 'acct-1',
      timestamp: 3,
      events: [
        {
          eventId: 'b',
          timestamp: 2,
          accountId: 'acct-1',
          symbol: 'MSFT',
          strategyId: 's2',
          eventType: 'PRICE_MOVEMENT',
          alignmentState: 'WATCHFUL',
          signalsTriggered: ['b'],
          confidenceScore: 0.7,
          certainty: 'confirmed',
          price: 2,
          pctChange: 0.02,
          metadata: {},
        },
        {
          eventId: 'a',
          timestamp: 2,
          accountId: 'acct-1',
          symbol: 'AAPL',
          strategyId: 's1',
          eventType: 'PRICE_MOVEMENT',
          alignmentState: 'WATCHFUL',
          signalsTriggered: ['a'],
          confidenceScore: 0.7,
          certainty: 'confirmed',
          price: 1,
          pctChange: 0.01,
          metadata: {},
        },
        {
          eventId: 'c',
          timestamp: 1,
          accountId: 'acct-1',
          symbol: 'BTC',
          strategyId: 's3',
          eventType: 'ESTIMATED_PRICE',
          alignmentState: 'WATCHFUL',
          signalsTriggered: ['c'],
          confidenceScore: 0.8,
          certainty: 'estimated',
          price: 3,
          pctChange: null,
          metadata: {},
        },
      ],
    });

    expect(stream.events.map((event) => event.eventId)).toEqual(['c', 'a', 'b']);
  });
});
