import type { MarketEvent } from '@/core/types/marketEvent';
import {
  applyMessageProfileTuning,
  resolveMessageSensitivityProfile,
} from '@/services/messages/applyMessageProfileTuning';
import { createPreparedMessageInputs } from '@/services/messages/createPreparedMessageInputs';
import type { MessagePolicySnapshotContext, PreparedMessage } from '@/services/messages/types';

function createMarketEvent(overrides: Partial<MarketEvent> = {}): MarketEvent {
  return {
    eventId: 'evt-profile-tuning',
    timestamp: Date.parse('2026-04-05T00:00:00.000Z'),
    accountId: 'acct-1',
    symbol: 'ETH',
    strategyId: 'momentum_basics',
    eventType: 'PRICE_MOVEMENT',
    alignmentState: 'WATCHFUL',
    signalsTriggered: ['raw_signal'],
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

function createAlertCandidate(): PreparedMessage {
  return {
    kind: 'ALERT',
    title: 'Meaningful change noticed',
    summary: 'A prepared alert is available for calm review in Snapshot.',
    priority: 'MEDIUM',
    surface: 'SNAPSHOT',
    dismissible: false,
  };
}

describe('applyMessageProfileTuning', () => {
  it('maps canonical user profiles to explicit message sensitivities', () => {
    expect(resolveMessageSensitivityProfile('BEGINNER')).toBe('GUIDED');
    expect(resolveMessageSensitivityProfile('MIDDLE')).toBe('BALANCED');
    expect(resolveMessageSensitivityProfile('ADVANCED')).toBe('DIRECT');
  });

  it('downgrades strong beginner alert candidates to calmer briefings', () => {
    const snapshot = createSnapshotContext({
      profile: 'BEGINNER',
    });
    const result = applyMessageProfileTuning({
      candidate: createAlertCandidate(),
      snapshot,
      inputContext: createPreparedMessageInputs(snapshot),
    });

    expect(result).toEqual({
      decision: 'DOWNGRADE_TO_BRIEFING',
      sensitivity: 'GUIDED',
      message: {
        kind: 'BRIEFING',
        title: 'A change is worth a calm look',
        summary:
          'ETH is standing out in recent interpreted context. Snapshot can help you decide whether it changes your plan without rushing.',
        priority: 'LOW',
        surface: 'SNAPSHOT',
        dismissible: false,
      },
    });
  });

  it('downgrades middle-profile meaningful change to a briefing instead of elevating it to an alert', () => {
    const snapshot = createSnapshotContext({
      profile: 'MIDDLE',
      latestRelevantEvent: createMarketEvent({
        confidenceScore: 0.85,
        pctChange: 0.04,
      }),
    });
    const result = applyMessageProfileTuning({
      candidate: createAlertCandidate(),
      snapshot,
      inputContext: createPreparedMessageInputs(snapshot),
    });

    expect(result).toEqual({
      decision: 'DOWNGRADE_TO_BRIEFING',
      sensitivity: 'BALANCED',
      message: {
        kind: 'BRIEFING',
        title: 'A change is worth a calm look',
        summary:
          'ETH is standing out in recent interpreted context. Snapshot can help you judge whether it changes your current setup.',
        priority: 'LOW',
        surface: 'SNAPSHOT',
        dismissible: false,
      },
    });
  });

  it('keeps advanced history-backed meaningful change as an alert when the subject scope stays clear', () => {
    const snapshot = createSnapshotContext({
      sinceLastCheckedSummaryCount: 2,
      latestRelevantEvent: createMarketEvent({
        confidenceScore: 0.89,
        pctChange: 0.05,
      }),
    });
    const result = applyMessageProfileTuning({
      candidate: createAlertCandidate(),
      snapshot,
      inputContext: createPreparedMessageInputs(snapshot),
    });

    expect(result).toEqual({
      decision: 'KEEP_AS_ALERT',
      sensitivity: 'DIRECT',
      message: {
        kind: 'ALERT',
        title: 'Meaningful change noticed',
        summary:
          'ETH is standing out in recent interpreted context. Recent interpreted history supports keeping it in view. Review Snapshot if it changes your plan.',
        priority: 'MEDIUM',
        surface: 'SNAPSHOT',
        dismissible: false,
      },
    });
  });

  it('keeps multi-symbol context conservative by downgrading it to a briefing even when the change is strong', () => {
    const snapshot = createSnapshotContext({
      sinceLastCheckedSummaryCount: 2,
      latestRelevantEvent: createMarketEvent({
        symbol: 'ETH',
        metadata: {
          signalTitle: 'Cluster move',
          relatedSymbols: ['ETH', 'BTC'],
        },
      }),
    });
    const result = applyMessageProfileTuning({
      candidate: createAlertCandidate(),
      snapshot,
      inputContext: createPreparedMessageInputs(snapshot),
    });

    expect(result).toEqual({
      decision: 'DOWNGRADE_TO_BRIEFING',
      sensitivity: 'DIRECT',
      message: {
        kind: 'BRIEFING',
        title: 'A change is worth a calm look',
        summary:
          'A small group of symbols is standing out in recent interpreted context. Recent interpreted history supports keeping it in view. Snapshot can help you judge whether it changes your current setup.',
        priority: 'LOW',
        surface: 'SNAPSHOT',
        dismissible: false,
      },
    });
  });

  it('suppresses advanced alert candidates when meaningful change lacks supporting interpreted history', () => {
    const snapshot = createSnapshotContext({
      latestRelevantEvent: createMarketEvent({
        confidenceScore: 0.89,
        pctChange: 0.05,
      }),
    });
    const result = applyMessageProfileTuning({
      candidate: createAlertCandidate(),
      snapshot,
      inputContext: createPreparedMessageInputs(snapshot),
    });

    expect(result).toEqual({
      decision: 'SUPPRESS',
      sensitivity: 'DIRECT',
      message: null,
    });
  });

  it('suppresses alert candidates when interpreted metrics are too thin for honest tuning', () => {
    const snapshot = createSnapshotContext({
      latestRelevantEvent: createMarketEvent({
        pctChange: null,
      }),
    });
    const result = applyMessageProfileTuning({
      candidate: createAlertCandidate(),
      snapshot,
      inputContext: createPreparedMessageInputs(snapshot),
    });

    expect(result).toEqual({
      decision: 'SUPPRESS',
      sensitivity: 'DIRECT',
      message: null,
    });
    expect(JSON.stringify(result)).not.toMatch(/eventId|strategyId|raw_signal|notification|badge|unread|urgent/);
  });
});
