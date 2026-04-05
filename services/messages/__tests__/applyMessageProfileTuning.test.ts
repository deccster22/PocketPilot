import type { MarketEvent } from '@/core/types/marketEvent';
import { applyMessageProfileTuning, resolveMessageSensitivityProfile } from '@/services/messages/applyMessageProfileTuning';
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
    const result = applyMessageProfileTuning({
      candidate: createAlertCandidate(),
      snapshot: createSnapshotContext({
        profile: 'BEGINNER',
      }),
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

  it('downgrades middle-profile alert candidates when context deserves a calm check-in but not an alert', () => {
    const result = applyMessageProfileTuning({
      candidate: createAlertCandidate(),
      snapshot: createSnapshotContext({
        profile: 'MIDDLE',
        latestRelevantEvent: createMarketEvent({
          confidenceScore: 0.85,
          pctChange: 0.04,
        }),
      }),
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

  it('suppresses advanced alert candidates when interpreted context stays middling', () => {
    const result = applyMessageProfileTuning({
      candidate: createAlertCandidate(),
      snapshot: createSnapshotContext({
        latestRelevantEvent: createMarketEvent({
          confidenceScore: 0.85,
          pctChange: 0.04,
        }),
      }),
    });

    expect(result).toEqual({
      decision: 'SUPPRESS',
      sensitivity: 'DIRECT',
      message: null,
    });
  });

  it('keeps strong advanced alert candidates as compact medium-priority alerts', () => {
    const result = applyMessageProfileTuning({
      candidate: createAlertCandidate(),
      snapshot: createSnapshotContext(),
    });

    expect(result).toEqual({
      decision: 'KEEP_AS_ALERT',
      sensitivity: 'DIRECT',
      message: {
        kind: 'ALERT',
        title: 'Meaningful change noticed',
        summary: 'ETH is standing out in recent interpreted context. Review Snapshot if it changes your plan.',
        priority: 'MEDIUM',
        surface: 'SNAPSHOT',
        dismissible: false,
      },
    });
  });

  it('suppresses alert candidates when interpreted metrics are too thin for honest tuning', () => {
    const result = applyMessageProfileTuning({
      candidate: createAlertCandidate(),
      snapshot: createSnapshotContext({
        latestRelevantEvent: createMarketEvent({
          pctChange: null,
        }),
      }),
    });

    expect(result).toEqual({
      decision: 'SUPPRESS',
      sensitivity: 'DIRECT',
      message: null,
    });
    expect(JSON.stringify(result)).not.toMatch(/eventId|strategyId|raw_signal|notification|badge|unread|urgent/);
  });
});
