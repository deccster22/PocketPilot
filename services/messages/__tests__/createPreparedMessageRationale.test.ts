import { createPreparedMessageRationale } from '@/services/messages/createPreparedMessageRationale';
import type { PreparedMessageInputContext } from '@/services/messages/types';

function createPreparedInputContext(
  overrides: Partial<PreparedMessageInputContext> = {},
): PreparedMessageInputContext {
  return {
    subjectLabel: 'ETH',
    subjectScope: 'SINGLE_SYMBOL',
    isSingleSymbolScope: true,
    eventFamily: 'PRICE_CHANGE',
    confirmationSupport: 'CONFIRMED_EVENT',
    changeStrength: 'MEANINGFUL',
    hasSinceLastCheckedContext: false,
    hasReorientationContext: false,
    ...overrides,
  };
}

describe('createPreparedMessageRationale', () => {
  it('keeps rationale availability explicit when no visible message exists', () => {
    expect(
      createPreparedMessageRationale({
        status: 'UNAVAILABLE',
        reason: 'NO_MESSAGE',
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_RATIONALE_AVAILABLE',
    });

    expect(
      createPreparedMessageRationale({
        status: 'UNAVAILABLE',
        reason: 'NOT_ENABLED_FOR_SURFACE',
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });
  });

  it('can explain why a calm briefing surfaced instead of an alert', () => {
    expect(
      createPreparedMessageRationale({
        status: 'AVAILABLE',
        message: {
          kind: 'BRIEFING',
          title: 'A change is worth a calm look',
          summary:
            'ETH is standing out in recent interpreted context. Snapshot can help you judge whether it changes your current setup.',
          priority: 'LOW',
          surface: 'SNAPSHOT',
          dismissible: false,
        },
        source: 'SNAPSHOT_TUNED_CHANGE',
        inputContext: createPreparedInputContext(),
        decision: 'DOWNGRADE_TO_BRIEFING',
        sensitivity: 'BALANCED',
      }),
    ).toEqual({
      status: 'AVAILABLE',
      rationale: {
        title: 'Why this is here',
        summary:
          'Shown as a briefing because the change is meaningful but not strong enough for an alert.',
        items: [
          'The change is focused enough to keep visible without crowding the surface.',
          'Snapshot keeps the fuller review space, so this note stays brief on purpose.',
        ],
      },
    });
  });

  it('keeps broader multi-symbol context conservatively explained without leaking raw internals', () => {
    const result = createPreparedMessageRationale({
      status: 'AVAILABLE',
      message: {
        kind: 'BRIEFING',
        title: 'A change is worth a calm look',
        summary:
          'A small group of symbols is standing out in recent interpreted context. Recent interpreted history supports keeping it in view.',
        priority: 'LOW',
        surface: 'SNAPSHOT',
        dismissible: false,
      },
      source: 'SNAPSHOT_TUNED_CHANGE',
      inputContext: createPreparedInputContext({
        subjectLabel: null,
        subjectScope: 'MULTI_SYMBOL',
        isSingleSymbolScope: false,
        confirmationSupport: 'CONFIRMED_WITH_HISTORY',
        changeStrength: 'STRONG',
      }),
      decision: 'DOWNGRADE_TO_BRIEFING',
      sensitivity: 'DIRECT',
    });

    expect(result).toEqual({
      status: 'AVAILABLE',
      rationale: {
        title: 'Why this is here',
        summary:
          'Shown as a briefing because the context is broader than PocketPilot uses for an alert.',
        items: [
          'The context spans more than one symbol, so PocketPilot keeps the posture quiet.',
          'Snapshot keeps the fuller review space, so this note stays brief on purpose.',
        ],
      },
    });
    expect(JSON.stringify(result)).not.toMatch(
      /eventId|strategyId|signalsTriggered|confidenceScore|pctChange|providerId|runtime|debug/i,
    );
  });

  it('keeps referral rationale user-facing and compact', () => {
    const result = createPreparedMessageRationale({
      status: 'AVAILABLE',
      message: {
        kind: 'REFERRAL',
        title: 'Snapshot is the steadier fit',
        summary:
          'Dashboard has supporting context but not a strong top-focus item right now. Snapshot is the better place for a calm first read.',
        priority: 'LOW',
        surface: 'DASHBOARD',
        dismissible: false,
      },
      source: 'DASHBOARD_REFERRAL',
    });

    expect(result).toEqual({
      status: 'AVAILABLE',
      rationale: {
        title: 'Why this is here',
        summary:
          'Shown as a referral because Dashboard has useful context, but Snapshot is the steadier first read right now.',
        items: [
          'Snapshot is the surface PocketPilot uses for a calmer first look when top focus is still forming.',
          'Routing notes stay compact instead of turning into alerts.',
        ],
      },
    });
    expect(JSON.stringify(result)).not.toMatch(/urgent|warning|toast|badge|notification/i);
  });
});
