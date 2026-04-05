import { createPreparedContextInputs } from '@/services/context/createPreparedContextInputs';

describe('createPreparedContextInputs', () => {
  it('derives a conservative richer interpreted context model from existing service seams', () => {
    const result = createPreparedContextInputs({
      strategyAlignment: 'Watchful',
      change24h: -0.065,
      currentState: 'DOWN',
      currentEvents: [
        {
          eventType: 'PRICE_MOVEMENT',
          alignmentState: 'WATCHFUL',
          certainty: 'confirmed',
          pctChange: -0.065,
        },
        {
          eventType: 'DIP_DETECTED',
          alignmentState: 'WATCHFUL',
          certainty: 'confirmed',
          pctChange: -0.065,
        },
      ],
      orientationContext: {
        historyContext: {
          eventsSinceLastViewed: [
            {
              eventId: 'evt-1',
              timestamp: Date.parse('2026-04-01T00:00:00.000Z'),
              accountId: 'acct-1',
              symbol: 'BTC',
              strategyId: 'snapshot_change',
              eventType: 'PRICE_MOVEMENT',
              alignmentState: 'WATCHFUL',
              signalsTriggered: ['snapshot_move_threshold_met'],
              confidenceScore: 0.81,
              certainty: 'confirmed',
              price: 100,
              pctChange: -0.04,
              metadata: {},
            },
            {
              eventId: 'evt-2',
              timestamp: Date.parse('2026-04-02T00:00:00.000Z'),
              accountId: 'acct-1',
              symbol: 'ETH',
              strategyId: 'dip_buying',
              eventType: 'DIP_DETECTED',
              alignmentState: 'WATCHFUL',
              signalsTriggered: ['dip_threshold_met'],
              confidenceScore: 0.84,
              certainty: 'confirmed',
              price: 200,
              pctChange: -0.05,
              metadata: {},
            },
            {
              eventId: 'evt-3',
              timestamp: Date.parse('2026-04-03T00:00:00.000Z'),
              accountId: 'acct-1',
              symbol: 'SOL',
              strategyId: 'momentum_basics',
              eventType: 'MOMENTUM_BUILDING',
              alignmentState: 'WATCHFUL',
              signalsTriggered: ['momentum_threshold_met'],
              confidenceScore: 0.84,
              certainty: 'confirmed',
              price: 220,
              pctChange: 0.04,
              metadata: {},
            },
          ],
          sinceLastChecked: {
            sinceTimestamp: Date.parse('2026-03-31T00:00:00.000Z'),
            accountId: 'acct-1',
            summaryCount: 3,
            events: [],
          },
        },
      },
    });

    expect(result).toEqual({
      alignmentState: 'WATCHFUL',
      contextStrength: 'SUPPORTED',
      currentState: 'DOWN',
      hasEstimatedContext: false,
      volatilityContext: {
        state: 'EXPANDING',
      },
      structureContext: {
        posture: 'STRAINED',
      },
      conditionState: 'STRESSED',
      fitSupport: 'STRAINED',
      historicalGrounding: {
        state: 'ACTIVE',
      },
    });
  });

  it('keeps thin estimated-only context honest instead of inflating structural confidence', () => {
    const result = createPreparedContextInputs({
      strategyAlignment: 'Watchful',
      change24h: 0.01,
      currentState: 'FLAT',
      currentEvents: [
        {
          eventType: 'ESTIMATED_PRICE',
          alignmentState: 'WATCHFUL',
          certainty: 'estimated',
          pctChange: null,
        },
      ],
      orientationContext: {
        historyContext: {
          eventsSinceLastViewed: [],
          sinceLastChecked: {
            sinceTimestamp: Date.parse('2026-04-04T00:00:00.000Z'),
            accountId: 'acct-1',
            summaryCount: 0,
            events: [],
          },
        },
      },
    });

    expect(result).toEqual({
      alignmentState: 'WATCHFUL',
      contextStrength: 'THIN',
      currentState: 'FLAT',
      hasEstimatedContext: true,
      volatilityContext: null,
      structureContext: null,
      conditionState: 'UNKNOWN',
      fitSupport: 'UNKNOWN',
      historicalGrounding: {
        state: 'LIGHT',
      },
    });
  });

  it('is deterministic for identical inputs', () => {
    const params = {
      strategyAlignment: 'Aligned' as const,
      change24h: 0.01,
      currentState: 'UP' as const,
      currentEvents: [] as Array<{
        eventType: 'PRICE_MOVEMENT' | 'DIP_DETECTED' | 'MOMENTUM_BUILDING';
        alignmentState: 'ALIGNED' | 'WATCHFUL' | 'NEEDS_REVIEW';
        certainty: 'confirmed' | 'estimated';
        pctChange: number | null;
      }>,
      orientationContext: {
        historyContext: {
          eventsSinceLastViewed: [],
          sinceLastChecked: null,
        },
      },
    };

    expect(createPreparedContextInputs(params)).toEqual(createPreparedContextInputs(params));
  });
});
