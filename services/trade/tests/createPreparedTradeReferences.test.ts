import type { MarketEvent } from '@/core/types/marketEvent';
import {
  createPreparedTradeReferences,
  describePreparedTradeReferencesUnavailableReason,
  normalisePreparedTradeReferencesAvailability,
  shouldRenderPreparedTradeReferencesUnavailableReason,
} from '@/services/trade/createPreparedTradeReferences';

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
          label: 'Prepared stop-loss level',
          value: '100',
          sourceLabel: 'Source: supported strategy context',
          limitations: [
            'Optional planning context from the selected plan. Your own values remain authoritative.',
            'Derived from supported strategy context and omitted when context is thin.',
          ],
        },
        {
          kind: 'TARGET',
          label: 'Prepared target level',
          value: '112',
          sourceLabel: 'Source: prepared plan context',
          limitations: ['Optional planning context from the selected plan. Your own values remain authoritative.'],
        },
      ],
    });
  });

  it('keeps explicit prepared stop values authoritative over strategy fallback context', () => {
    const event = createEvent({
      metadata: {
        relatedSymbols: ['BTC'],
        preparedRiskReferences: {
          stopPrice: 99,
        },
        strategyPreparedRiskContext: {
          stopPrice: {
            basis: 'BASELINE_PRICE',
          },
        },
      },
    });

    const result = createPreparedTradeReferences({
      intentType: 'ACCUMULATE',
      events: [event],
    });

    expect(result).toEqual({
      status: 'AVAILABLE',
      references: [
        {
          kind: 'STOP',
          label: 'Prepared stop-loss level',
          value: '99',
          sourceLabel: 'Source: prepared plan context',
          limitations: ['Optional planning context from the selected plan. Your own values remain authoritative.'],
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

    expect(copyText).not.toMatch(
      /\bexecution|dispatch|profit|opportunity|guarantee|recommended|safe|optimal|predict\b/i,
    );
  });

  it('normalises legacy source-label wording into canonical source and limitation copy', () => {
    const result = normalisePreparedTradeReferencesAvailability({
      status: 'AVAILABLE',
      references: [
        {
          kind: 'STOP',
          label: 'Legacy stop label',
          value: '99',
          sourceLabel: 'Source: strategy context',
          limitations: ['Legacy limitation copy.'],
        },
        {
          kind: 'TARGET',
          label: 'Legacy target label',
          value: '108',
          sourceLabel: 'Source: prepared plan',
        },
      ],
    });

    expect(result).toEqual({
      status: 'AVAILABLE',
      references: [
        {
          kind: 'STOP',
          label: 'Prepared stop-loss level',
          value: '99',
          sourceLabel: 'Source: supported strategy context',
          limitations: [
            'Optional planning context from the selected plan. Your own values remain authoritative.',
            'Derived from supported strategy context and omitted when context is thin.',
          ],
        },
        {
          kind: 'TARGET',
          label: 'Prepared target level',
          value: '108',
          sourceLabel: 'Source: prepared plan context',
          limitations: ['Optional planning context from the selected plan. Your own values remain authoritative.'],
        },
      ],
    });
  });

  it('keeps unavailable reason wording explicit without widening the availability contract', () => {
    expect(describePreparedTradeReferencesUnavailableReason('NO_STRATEGY_REFERENCE')).toBe(
      'This setup does not publish prepared stop-loss or target levels.',
    );
    expect(describePreparedTradeReferencesUnavailableReason('THIN_CONTEXT')).toBe(
      'This setup does not provide enough context for prepared stop-loss or target levels yet.',
    );
    expect(describePreparedTradeReferencesUnavailableReason('NOT_ENABLED_FOR_SURFACE')).toBe(
      'Prepared stop-loss or target levels are not shown on this surface.',
    );
  });

  it('keeps unavailable reference visibility conservative and service-owned', () => {
    expect(shouldRenderPreparedTradeReferencesUnavailableReason('THIN_CONTEXT')).toBe(true);
    expect(shouldRenderPreparedTradeReferencesUnavailableReason('NO_STRATEGY_REFERENCE')).toBe(
      false,
    );
    expect(shouldRenderPreparedTradeReferencesUnavailableReason('NOT_ENABLED_FOR_SURFACE')).toBe(
      false,
    );
  });
});
