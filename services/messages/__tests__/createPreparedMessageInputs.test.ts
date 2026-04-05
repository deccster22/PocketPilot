import type { MarketEvent } from '@/core/types/marketEvent';
import { createPreparedMessageInputs } from '@/services/messages/createPreparedMessageInputs';
import type { MessagePolicySnapshotContext } from '@/services/messages/types';

function createMarketEvent(overrides: Partial<MarketEvent> = {}): MarketEvent {
  return {
    eventId: 'evt-prepared-input',
    timestamp: Date.parse('2026-04-05T00:00:00.000Z'),
    accountId: 'acct-1',
    symbol: 'ETH',
    strategyId: 'momentum_basics',
    eventType: 'PRICE_MOVEMENT',
    alignmentState: 'WATCHFUL',
    signalsTriggered: ['hidden-raw-signal'],
    confidenceScore: 0.95,
    certainty: 'confirmed',
    price: 120,
    pctChange: 0.08,
    metadata: {
      signalTitle: 'Momentum spike',
      relatedSymbols: ['ETH'],
    },
    ...overrides,
  };
}

function createSnapshotContext(
  overrides: Partial<MessagePolicySnapshotContext> = {},
): MessagePolicySnapshotContext {
  return {
    profile: 'ADVANCED',
    briefing: {
      status: 'HIDDEN',
      reason: 'NO_REORIENTATION',
    },
    reorientation: {
      status: 'HIDDEN',
      reason: 'NOT_NEEDED',
      summary: null,
      dismissible: false,
    },
    sinceLastCheckedSummaryCount: 0,
    latestRelevantEvent: createMarketEvent(),
    ...overrides,
  };
}

describe('createPreparedMessageInputs', () => {
  it('derives strong single-symbol interpreted context from a confirmed event', () => {
    expect(createPreparedMessageInputs(createSnapshotContext())).toEqual({
      subjectLabel: 'ETH',
      subjectScope: 'SINGLE_SYMBOL',
      isSingleSymbolScope: true,
      eventFamily: 'PRICE_CHANGE',
      confirmationSupport: 'CONFIRMED_EVENT',
      changeStrength: 'STRONG',
      hasSinceLastCheckedContext: false,
      hasReorientationContext: false,
    });
  });

  it('marks confirmed history support when Snapshot already has interpreted continuity context', () => {
    expect(
      createPreparedMessageInputs(
        createSnapshotContext({
          sinceLastCheckedSummaryCount: 2,
        }),
      ),
    ).toMatchObject({
      confirmationSupport: 'CONFIRMED_WITH_HISTORY',
      hasSinceLastCheckedContext: true,
    });
  });

  it('keeps subject scope explicit when the interpreted event spans more than one symbol', () => {
    const result = createPreparedMessageInputs(
      createSnapshotContext({
        sinceLastCheckedSummaryCount: 2,
        latestRelevantEvent: createMarketEvent({
          metadata: {
            signalTitle: 'Cluster move',
            relatedSymbols: ['ETH', 'BTC'],
          },
        }),
      }),
    );

    expect(result).toEqual({
      subjectLabel: null,
      subjectScope: 'MULTI_SYMBOL',
      isSingleSymbolScope: false,
      eventFamily: 'PRICE_CHANGE',
      confirmationSupport: 'CONFIRMED_WITH_HISTORY',
      changeStrength: 'STRONG',
      hasSinceLastCheckedContext: true,
      hasReorientationContext: false,
    });
    expect(JSON.stringify(result)).not.toMatch(/evt-prepared-input|momentum_basics|hidden-raw-signal/);
  });

  it('keeps thin or estimated interpreted context honest instead of inventing strength', () => {
    expect(
      createPreparedMessageInputs(
        createSnapshotContext({
          latestRelevantEvent: createMarketEvent({
            certainty: 'estimated',
            pctChange: null,
          }),
        }),
      ),
    ).toEqual({
      subjectLabel: 'ETH',
      subjectScope: 'SINGLE_SYMBOL',
      isSingleSymbolScope: true,
      eventFamily: 'PRICE_CHANGE',
      confirmationSupport: 'ESTIMATED_OR_THIN',
      changeStrength: 'THIN',
      hasSinceLastCheckedContext: false,
      hasReorientationContext: false,
    });
  });

  it('returns null when no interpreted event is available and stays deterministic for identical inputs', () => {
    const input = createSnapshotContext({
      latestRelevantEvent: null,
    });

    expect(createPreparedMessageInputs(input)).toBeNull();
    expect(createPreparedMessageInputs(createSnapshotContext())).toEqual(
      createPreparedMessageInputs(createSnapshotContext()),
    );
  });
});
