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
        createdAt: 110,
      },
      {
        planId:
          'acct-1:momentum_basics:BTC:ACCUMULATE:acct-1:momentum_basics:momentum:BTC:100',
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
        createdAt: 100,
      },
    ]);
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
