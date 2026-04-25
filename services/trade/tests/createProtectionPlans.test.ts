import type { MarketEvent } from '@/core/types/marketEvent';
import { createOrientationContext } from '@/services/orientation/createOrientationContext';
import { createProtectionPlans } from '@/services/trade/createProtectionPlans';

function createEvent(overrides: Partial<MarketEvent>): MarketEvent {
  return {
    eventId: 'acct-1:momentum_basics:event:BTC:100',
    timestamp: 100,
    accountId: 'acct-1',
    symbol: 'BTC',
    strategyId: 'momentum_basics',
    eventType: 'MOMENTUM_BUILDING',
    alignmentState: 'ALIGNED',
    signalsTriggered: ['signal-hidden-from-plans'],
    confidenceScore: 0.8,
    certainty: 'confirmed',
    price: 100,
    pctChange: 0.05,
    metadata: {
      signalTitle: 'Hidden signal title',
      signalSeverity: 'ACTION',
    },
    ...overrides,
  };
}

describe('createProtectionPlans', () => {
  it('maps dip and momentum events into accumulate intents with explicit structure', () => {
    const dipEvent = createEvent({
      eventId: 'acct-1:dip_buying:dip:ETH:110',
      timestamp: 110,
      symbol: 'ETH',
      strategyId: 'dip_buying',
      eventType: 'DIP_DETECTED',
    });
    const momentumEvent = createEvent({
      eventId: 'acct-1:momentum_basics:momentum:BTC:100',
      timestamp: 100,
      symbol: 'BTC',
      strategyId: 'momentum_basics',
      eventType: 'MOMENTUM_BUILDING',
    });
    const orientationContext = createOrientationContext({
      accountId: 'acct-1',
      currentEvents: [dipEvent, momentumEvent],
      strategyAlignment: 'Aligned',
    });

    const result = createProtectionPlans({
      orientationContext,
      marketEvents: [dipEvent, momentumEvent],
    });

    expect(result).toEqual([
      {
        planId: 'acct-1:dip_buying:ETH:ACCUMULATE:acct-1:dip_buying:dip:ETH:110',
        accountId: 'acct-1',
        strategyId: 'dip_buying',
        symbol: 'ETH',
        intentType: 'ACCUMULATE',
        rationale: {
          primaryEventId: 'acct-1:dip_buying:dip:ETH:110',
          supportingEventIds: ['acct-1:dip_buying:dip:ETH:110'],
          summary:
            'Accumulation setup is supported by a detected dip in price action. Focus symbol: ETH.',
        },
        riskProfile: {
          certainty: 'MEDIUM',
          alignment: 'ALIGNED',
        },
        constraints: {
          maxPositionSize: 0.05,
        },
        preparedRiskReferences: {
          entryPrice: 100,
          stopPrice: null,
          targetPrice: null,
        },
        preparedTradeReferencesAvailability: {
          status: 'UNAVAILABLE',
          reason: 'NO_STRATEGY_REFERENCE',
        },
        createdAt: 110,
      },
      {
        planId: 'acct-1:momentum_basics:BTC:ACCUMULATE:acct-1:momentum_basics:momentum:BTC:100',
        accountId: 'acct-1',
        strategyId: 'momentum_basics',
        symbol: 'BTC',
        intentType: 'ACCUMULATE',
        rationale: {
          primaryEventId: 'acct-1:momentum_basics:momentum:BTC:100',
          supportingEventIds: ['acct-1:momentum_basics:momentum:BTC:100'],
          summary:
            'Accumulation setup is supported by confirmed momentum building. Focus symbol: BTC.',
        },
        riskProfile: {
          certainty: 'HIGH',
          alignment: 'ALIGNED',
        },
        constraints: {
          maxPositionSize: 0.1,
        },
        preparedRiskReferences: {
          entryPrice: 100,
          stopPrice: null,
          targetPrice: null,
        },
        preparedTradeReferencesAvailability: {
          status: 'UNAVAILABLE',
          reason: 'NO_STRATEGY_REFERENCE',
        },
        createdAt: 100,
      },
    ]);
  });

  it('uses explicit service-owned prepared references when the grouped plan context expresses one clear value', () => {
    const momentumEvent = createEvent({
      eventId: 'acct-1:momentum_basics:momentum:BTC:120',
      timestamp: 120,
      metadata: {
        signalTitle: 'Hidden signal title',
        preparedRiskReferences: {
          entryPrice: 99.5,
          stopPrice: 95,
          targetPrice: 108,
        },
      },
    });
    const movementEvent = createEvent({
      eventId: 'acct-1:momentum_basics:move:BTC:121',
      timestamp: 121,
      eventType: 'PRICE_MOVEMENT',
      metadata: {
        signalTitle: 'Hidden movement title',
        preparedRiskReferences: {
          stopPrice: 95,
          targetPrice: 108,
        },
      },
    });
    const orientationContext = createOrientationContext({
      accountId: 'acct-1',
      currentEvents: [momentumEvent, movementEvent],
      strategyAlignment: 'Aligned',
    });

    const [plan] = createProtectionPlans({
      orientationContext,
      marketEvents: [momentumEvent, movementEvent],
    });

    expect(plan.preparedRiskReferences).toEqual({
      entryPrice: 99.5,
      stopPrice: 95,
      targetPrice: 108,
    });
    expect(plan.preparedTradeReferencesAvailability).toEqual({
      status: 'AVAILABLE',
      references: [
        {
          kind: 'STOP',
          label: 'Prepared stop reference',
          value: '95',
          sourceLabel: 'Source: prepared plan',
        },
        {
          kind: 'TARGET',
          label: 'Prepared target reference',
          value: '108',
          sourceLabel: 'Source: prepared plan',
        },
      ],
    });
  });

  it('publishes strategy-owned baseline stop and target references only when the grouped context grounds them', () => {
    const momentumEvent = createEvent({
      eventId: 'acct-1:momentum_basics:momentum:BTC:121',
      timestamp: 121,
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
    const dipEvent = createEvent({
      eventId: 'acct-1:dip_buying:dip:ETH:122',
      timestamp: 122,
      symbol: 'ETH',
      strategyId: 'dip_buying',
      eventType: 'DIP_DETECTED',
      price: 96,
      pctChange: -0.04,
      metadata: {
        relatedSymbols: ['ETH'],
        strategyPreparedRiskContext: {
          targetPrice: {
            basis: 'BASELINE_PRICE',
          },
        },
      },
    });
    const orientationContext = createOrientationContext({
      accountId: 'acct-1',
      currentEvents: [momentumEvent, dipEvent],
      strategyAlignment: 'Aligned',
    });

    const result = createProtectionPlans({
      orientationContext,
      marketEvents: [momentumEvent, dipEvent],
    });

    expect(result[0]?.preparedRiskReferences).toEqual({
      entryPrice: 96,
      stopPrice: null,
      targetPrice: 100,
    });
    expect(result[0]?.preparedTradeReferencesAvailability).toEqual({
      status: 'AVAILABLE',
      references: [
        {
          kind: 'TARGET',
          label: 'Prepared target reference',
          value: '100',
          sourceLabel: 'Source: strategy context',
          limitations: ['Derived from confirmed strategy context and omitted when context is thin.'],
        },
      ],
    });
    expect(result[1]?.preparedRiskReferences).toEqual({
      entryPrice: 104,
      stopPrice: 100,
      targetPrice: null,
    });
    expect(result[1]?.preparedTradeReferencesAvailability).toEqual({
      status: 'AVAILABLE',
      references: [
        {
          kind: 'STOP',
          label: 'Prepared stop reference',
          value: '100',
          sourceLabel: 'Source: strategy context',
          limitations: ['Derived from confirmed strategy context and omitted when context is thin.'],
        },
      ],
    });
  });

  it('downgrades certainty and waits when data quality or estimated pricing is present', () => {
    const dataQualityEvent = createEvent({
      eventId: 'acct-1:data_quality:data:BTC:300',
      timestamp: 300,
      strategyId: 'data_quality',
      eventType: 'DATA_QUALITY',
      alignmentState: 'NEEDS_REVIEW',
      certainty: 'estimated',
    });
    const orientationContext = createOrientationContext({
      accountId: 'acct-1',
      currentEvents: [dataQualityEvent],
      strategyAlignment: 'Needs review',
    });

    const [plan] = createProtectionPlans({
      orientationContext,
      marketEvents: [dataQualityEvent],
    });

    expect(plan.intentType).toBe('WAIT');
    expect(plan.riskProfile).toEqual({
      certainty: 'LOW',
      alignment: 'MISALIGNED',
    });
    expect(plan.constraints).toEqual({
      cooldownActive: true,
    });
    expect(plan.preparedRiskReferences).toBeNull();
    expect(plan.preparedTradeReferencesAvailability).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });
  });

  it('uses hold when conflicting action events exist for the same scope', () => {
    const dipEvent = createEvent({
      eventId: 'acct-1:mean_reversion:dip:SOL:200',
      timestamp: 200,
      symbol: 'SOL',
      strategyId: 'mean_reversion',
      eventType: 'DIP_DETECTED',
    });
    const momentumEvent = createEvent({
      eventId: 'acct-1:mean_reversion:momentum:SOL:210',
      timestamp: 210,
      symbol: 'SOL',
      strategyId: 'mean_reversion',
      eventType: 'MOMENTUM_BUILDING',
    });
    const orientationContext = createOrientationContext({
      accountId: 'acct-1',
      currentEvents: [dipEvent, momentumEvent],
      strategyAlignment: 'Aligned',
    });

    const [plan] = createProtectionPlans({
      orientationContext,
      marketEvents: [dipEvent, momentumEvent],
    });

    expect(plan.intentType).toBe('HOLD');
    expect(plan.rationale.primaryEventId).toBe('acct-1:mean_reversion:dip:SOL:200');
    expect(plan.riskProfile.certainty).toBe('MEDIUM');
    expect(plan.preparedRiskReferences).toBeNull();
    expect(plan.preparedTradeReferencesAvailability).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });
  });

  it('leaves ambiguous prepared stop and target references unset instead of guessing', () => {
    const firstEvent = createEvent({
      eventId: 'acct-1:momentum_basics:momentum:BTC:610',
      timestamp: 610,
      metadata: {
        preparedRiskReferences: {
          stopPrice: 95,
          targetPrice: 108,
        },
      },
    });
    const secondEvent = createEvent({
      eventId: 'acct-1:momentum_basics:move:BTC:611',
      timestamp: 611,
      eventType: 'PRICE_MOVEMENT',
      metadata: {
        preparedRiskReferences: {
          stopPrice: 94,
          targetPrice: 111,
        },
      },
    });
    const orientationContext = createOrientationContext({
      accountId: 'acct-1',
      currentEvents: [firstEvent, secondEvent],
      strategyAlignment: 'Aligned',
    });

    const [plan] = createProtectionPlans({
      orientationContext,
      marketEvents: [firstEvent, secondEvent],
    });

    expect(plan.preparedRiskReferences).toEqual({
      entryPrice: 100,
      stopPrice: null,
      targetPrice: null,
    });
    expect(plan.preparedTradeReferencesAvailability).toEqual({
      status: 'UNAVAILABLE',
      reason: 'THIN_CONTEXT',
    });
  });

  it('keeps strategy-owned stop publishing quiet when grouped context is ambiguous', () => {
    const firstEvent = createEvent({
      eventId: 'acct-1:momentum_basics:momentum:BTC:620',
      timestamp: 620,
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
      eventId: 'acct-1:momentum_basics:move:BTC:621',
      timestamp: 621,
      eventType: 'PRICE_MOVEMENT',
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
    const orientationContext = createOrientationContext({
      accountId: 'acct-1',
      currentEvents: [firstEvent, secondEvent],
      strategyAlignment: 'Aligned',
    });

    const [plan] = createProtectionPlans({
      orientationContext,
      marketEvents: [firstEvent, secondEvent],
    });

    expect(plan.preparedRiskReferences).toEqual({
      entryPrice: 104,
      stopPrice: null,
      targetPrice: null,
    });
    expect(plan.preparedTradeReferencesAvailability).toEqual({
      status: 'UNAVAILABLE',
      reason: 'THIN_CONTEXT',
    });
  });

  it('is deterministic for the same inputs regardless of input event order', () => {
    const first = createEvent({
      eventId: 'acct-1:snapshot_change:move:BTC:410',
      timestamp: 410,
      strategyId: 'snapshot_change',
      eventType: 'PRICE_MOVEMENT',
    });
    const second = createEvent({
      eventId: 'acct-1:data_quality:data:ETH:415',
      timestamp: 415,
      symbol: 'ETH',
      strategyId: 'data_quality',
      eventType: 'DATA_QUALITY',
      alignmentState: 'NEEDS_REVIEW',
    });
    const orientationContext = createOrientationContext({
      accountId: 'acct-1',
      currentEvents: [first, second],
      strategyAlignment: 'Needs review',
    });

    const resultA = createProtectionPlans({
      orientationContext,
      marketEvents: [first, second],
    });
    const resultB = createProtectionPlans({
      orientationContext,
      marketEvents: [second, first],
    });

    expect(resultA).toEqual(resultB);
  });

  it('does not leak raw signal internals into the plan output', () => {
    const event = createEvent({
      eventId: 'acct-1:momentum_basics:momentum:BTC:500',
      signalsTriggered: ['alpha-signal'],
      metadata: {
        signalTitle: 'Momentum hidden',
        internalNote: 'do-not-leak',
      },
    });
    const orientationContext = createOrientationContext({
      accountId: 'acct-1',
      currentEvents: [event],
      strategyAlignment: 'Aligned',
    });

    const [plan] = createProtectionPlans({
      orientationContext,
      marketEvents: [event],
    });

    expect(JSON.stringify(plan)).not.toContain('alpha-signal');
    expect(JSON.stringify(plan)).not.toContain('do-not-leak');
    expect(JSON.stringify(plan)).not.toContain('signalTitle');
  });
});
