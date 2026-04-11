import type { MarketEvent } from '@/core/types/marketEvent';
import { createMessagePolicyVM } from '@/services/messages/createMessagePolicyVM';
import type {
  MessagePolicyDashboardContext,
  MessagePolicySnapshotContext,
  MessagePolicyTradeHubContext,
} from '@/services/messages/types';

function createMarketEvent(overrides: Partial<MarketEvent> = {}): MarketEvent {
  return {
    eventId: 'evt-price-move-1',
    timestamp: Date.parse('2026-04-05T00:00:00.000Z'),
    accountId: 'acct-1',
    symbol: 'ETH',
    strategyId: 'momentum_basics',
    eventType: 'PRICE_MOVEMENT',
    alignmentState: 'WATCHFUL',
    signalsTriggered: ['momentum_signal'],
    confidenceScore: 0.92,
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
    latestRelevantEvent: null,
    ...overrides,
  };
}

function createDashboardContext(
  overrides: Partial<MessagePolicyDashboardContext> = {},
): MessagePolicyDashboardContext {
  return {
    hasPrimeItems: false,
    hasSupportingItems: true,
    ...overrides,
  };
}

function createTradeHubContext(
  overrides: Partial<MessagePolicyTradeHubContext> = {},
): MessagePolicyTradeHubContext {
  return {
    hasSelectedPlan: true,
    executionPathSupported: false,
    executionPathUnavailableReason:
      'Account capabilities do not support a protected execution path for this plan.',
    ...overrides,
  };
}

function availableRationale(summary: string, items: string[]) {
  return {
    status: 'AVAILABLE' as const,
    rationale: {
      title: 'Why this is here',
      summary,
      items,
    },
  };
}

function unavailableRationale(reason: 'NO_RATIONALE_AVAILABLE' | 'NOT_ENABLED_FOR_SURFACE') {
  return {
    status: 'UNAVAILABLE' as const,
    reason,
  };
}

describe('createMessagePolicyVM', () => {
  it('keeps reorientation distinct from alert-worthy change and prefers the prepared reorientation note', () => {
    const result = createMessagePolicyVM({
      surface: 'SNAPSHOT',
      snapshot: createSnapshotContext({
        briefing: {
          status: 'VISIBLE',
          kind: 'REORIENTATION',
          title: 'Welcome back',
          subtitle: 'Welcome back. Here is a quick briefing to help you get your bearings.',
          items: [
            {
              label: 'Current orientation',
              detail: 'Snapshot reads up with strategy status at watchful.',
            },
          ],
          dismissible: true,
        },
        reorientation: {
          status: 'VISIBLE',
          reason: 'AVAILABLE',
          summary: {
            status: 'AVAILABLE',
            profileId: 'ADVANCED',
            inactiveDays: 14,
            headline: 'A few meaningful shifts were prepared while you were away.',
            summaryItems: [
              {
                kind: 'PRICE_CHANGE',
                label: 'Current orientation',
                detail: 'Snapshot reads up with strategy status at watchful.',
              },
            ],
            generatedFrom: {
              lastActiveAt: '2026-03-22T00:00:00.000Z',
              now: '2026-04-05T00:00:00.000Z',
            },
            maxItems: 3,
          },
          dismissible: true,
        },
        latestRelevantEvent: createMarketEvent({
          eventId: 'evt-hidden-alert',
          strategyId: 'strategy_should_not_leak',
          signalsTriggered: ['raw_signal_id'],
        }),
      }),
    });

    expect(result).toEqual({
      status: 'AVAILABLE',
      messages: [
        {
          kind: 'REORIENTATION',
          title: 'Welcome back',
          summary:
            'Welcome back. Here is a quick briefing to help you get your bearings. Snapshot reads up with strategy status at watchful.',
          priority: 'MEDIUM',
          surface: 'SNAPSHOT',
          dismissible: true,
        },
      ],
      rationale: availableRationale(
        'Shown as a reorientation because you are returning after a meaningful gap and Snapshot should help you regain context first.',
        [
          'It stays separate from alerts so the surface can help you get your bearings first.',
          'The note stays compact because Snapshot already holds the fuller view.',
        ],
      ),
    });
    expect(JSON.stringify(result)).not.toMatch(
      /evt-hidden-alert|strategy_should_not_leak|raw_signal_id|notification|badge|unread|urgent/,
    );
  });

  it('creates a narrower advanced alert only from strong confirmed interpreted change when no briefing already owns Snapshot', () => {
    const result = createMessagePolicyVM({
      surface: 'SNAPSHOT',
      snapshot: createSnapshotContext({
        latestRelevantEvent: createMarketEvent({
          eventId: 'evt-price-move-2',
          strategyId: 'dip_buying',
          signalsTriggered: ['dip_signal'],
        }),
      }),
    });

    expect(result).toEqual({
      status: 'AVAILABLE',
      messages: [
        {
          kind: 'ALERT',
          title: 'Meaningful change noticed',
          summary:
            'ETH is standing out in recent interpreted context. Review Snapshot if it changes your plan.',
          priority: 'MEDIUM',
          surface: 'SNAPSHOT',
          dismissible: false,
        },
      ],
      rationale: availableRationale(
        "Shown as an alert because the change is focused enough for Snapshot's alert posture.",
        [
          'The change is focused enough to keep visible without crowding the surface.',
          'The note stays compact so it points back to Snapshot instead of becoming a stream of messages.',
        ],
      ),
    });
    expect(JSON.stringify(result)).not.toMatch(/evt-price-move-2|dip_buying|dip_signal/);
  });

  it('uses richer interpreted history support to keep borderline advanced change as an alert without widening the family model', () => {
    const result = createMessagePolicyVM({
      surface: 'SNAPSHOT',
      snapshot: createSnapshotContext({
        sinceLastCheckedSummaryCount: 2,
        latestRelevantEvent: createMarketEvent({
          confidenceScore: 0.89,
          pctChange: 0.05,
        }),
      }),
    });

    expect(result).toEqual({
      status: 'AVAILABLE',
      messages: [
        {
          kind: 'ALERT',
          title: 'Meaningful change noticed',
          summary:
            'ETH is standing out in recent interpreted context. Recent interpreted history supports keeping it in view. Review Snapshot if it changes your plan.',
          priority: 'MEDIUM',
          surface: 'SNAPSHOT',
          dismissible: false,
        },
      ],
      rationale: availableRationale(
        "Shown as an alert because the change is focused enough for Snapshot's alert posture.",
        [
          'Recent continuity supports keeping it visible without turning it into a feed item.',
          'The note stays compact so it points back to Snapshot instead of becoming a stream of messages.',
        ],
      ),
    });
  });

  it('keeps strong beginner event context as a calm briefing instead of a louder alert', () => {
    const result = createMessagePolicyVM({
      surface: 'SNAPSHOT',
      snapshot: createSnapshotContext({
        profile: 'BEGINNER',
        latestRelevantEvent: createMarketEvent({
          eventId: 'evt-price-move-beginner',
          strategyId: 'momentum_basics',
          signalsTriggered: ['raw_signal_should_not_leak'],
        }),
      }),
    });

    expect(result).toEqual({
      status: 'AVAILABLE',
      messages: [
        {
          kind: 'BRIEFING',
          title: 'A change is worth a calm look',
          summary:
            'ETH is standing out in recent interpreted context. Snapshot can help you decide whether it changes your plan without rushing.',
          priority: 'LOW',
          surface: 'SNAPSHOT',
          dismissible: false,
        },
      ],
      rationale: availableRationale(
        'Shown as a briefing because PocketPilot keeps this kind of change quieter until the picture settles a bit more.',
        [
          'The change is focused enough to keep visible without crowding the surface.',
          'Snapshot keeps the fuller review space, so this note stays brief on purpose.',
        ],
      ),
    });
    expect(JSON.stringify(result)).not.toMatch(/evt-price-move-beginner|raw_signal_should_not_leak/);
  });

  it('keeps richer multi-symbol context conservative by turning it into a briefing instead of a louder alert', () => {
    const result = createMessagePolicyVM({
      surface: 'SNAPSHOT',
      snapshot: createSnapshotContext({
        sinceLastCheckedSummaryCount: 2,
        latestRelevantEvent: createMarketEvent({
          metadata: {
            signalTitle: 'Cluster move',
            relatedSymbols: ['ETH', 'BTC'],
          },
        }),
      }),
    });

    expect(result).toEqual({
      status: 'AVAILABLE',
      messages: [
        {
          kind: 'BRIEFING',
          title: 'A change is worth a calm look',
          summary:
            'A small group of symbols is standing out in recent interpreted context. Recent interpreted history supports keeping it in view. Snapshot can help you judge whether it changes your current setup.',
          priority: 'LOW',
          surface: 'SNAPSHOT',
          dismissible: false,
        },
      ],
      rationale: availableRationale(
        'Shown as a briefing because the context is broader than PocketPilot uses for an alert.',
        [
          'The context spans more than one symbol, so PocketPilot keeps the posture quiet.',
          'Snapshot keeps the fuller review space, so this note stays brief on purpose.',
        ],
      ),
    });
  });

  it('keeps Dashboard referral and Trade Hub guarded stop as separate message families', () => {
    const referralResult = createMessagePolicyVM({
      surface: 'DASHBOARD',
      dashboard: createDashboardContext(),
    });
    const guardedStopResult = createMessagePolicyVM({
      surface: 'TRADE_HUB',
      tradeHub: createTradeHubContext(),
    });

    expect(referralResult).toEqual({
      status: 'AVAILABLE',
      messages: [
        {
          kind: 'REFERRAL',
          title: 'Snapshot is the steadier fit',
          summary:
            'Dashboard has supporting context but not a strong top-focus item right now. Snapshot is the better place for a calm first read.',
          priority: 'LOW',
          surface: 'DASHBOARD',
          dismissible: false,
        },
      ],
      rationale: availableRationale(
        'Shown as a referral because Dashboard has useful context, but Snapshot is the steadier first read right now.',
        [
          'Snapshot is the surface PocketPilot uses for a calmer first look when top focus is still forming.',
          'Routing notes stay compact instead of turning into alerts.',
        ],
      ),
    });
    expect(guardedStopResult).toEqual({
      status: 'AVAILABLE',
      messages: [
        {
          kind: 'GUARDED_STOP',
          title: 'Protected path unavailable',
          summary:
            'Account capabilities do not support a protected execution path for this plan. Trade Hub will keep the plan visible as a read-only framing note instead of carrying the action path further.',
          priority: 'HIGH',
          surface: 'TRADE_HUB',
          dismissible: false,
        },
      ],
      rationale: availableRationale(
        'Shown as a guarded stop because Trade Hub should keep the current boundary visible instead of carrying the path further.',
        [
          'Trade Hub keeps the plan visible as read-only context when the path cannot continue here.',
          'The note is informational only and does not start an order path.',
        ],
      ),
    });
    expect(JSON.stringify({ referralResult, guardedStopResult })).not.toMatch(
      /notification|badge|unread|urgent|toast|popup/,
    );
  });

  it('keeps missing or invalid context distinct from a Dashboard referral note', () => {
    expect(
      createMessagePolicyVM({
        surface: 'DASHBOARD',
        dashboard: createDashboardContext({
          hasSupportingItems: false,
        }),
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_MESSAGE',
      rationale: unavailableRationale('NO_RATIONALE_AVAILABLE'),
    });
  });

  it('does not turn normal confirmation-safe Trade Hub states into guarded stops', () => {
    expect(
      createMessagePolicyVM({
        surface: 'TRADE_HUB',
        tradeHub: createTradeHubContext({
          executionPathSupported: true,
          executionPathUnavailableReason: null,
        }),
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_MESSAGE',
      rationale: unavailableRationale('NO_RATIONALE_AVAILABLE'),
    });
    expect(
      createMessagePolicyVM({
        surface: 'TRADE_HUB',
        tradeHub: createTradeHubContext({
          hasSelectedPlan: false,
          executionPathSupported: null,
          executionPathUnavailableReason: null,
        }),
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_MESSAGE',
      rationale: unavailableRationale('NO_RATIONALE_AVAILABLE'),
    });
  });

  it('returns NOT_ENABLED_FOR_SURFACE when a message exists but belongs somewhere else', () => {
    expect(
      createMessagePolicyVM({
        surface: 'SNAPSHOT',
        dashboard: createDashboardContext(),
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
      rationale: unavailableRationale('NOT_ENABLED_FOR_SURFACE'),
    });
  });

  it('keeps middling Snapshot change as a briefing for middle profile instead of elevating it to an alert', () => {
    expect(
      createMessagePolicyVM({
        surface: 'SNAPSHOT',
        snapshot: createSnapshotContext({
          profile: 'MIDDLE',
          latestRelevantEvent: createMarketEvent({
            confidenceScore: 0.85,
            pctChange: 0.04,
          }),
        }),
      }),
    ).toEqual({
      status: 'AVAILABLE',
      messages: [
        {
          kind: 'BRIEFING',
          title: 'A change is worth a calm look',
          summary:
            'ETH is standing out in recent interpreted context. Snapshot can help you judge whether it changes your current setup.',
          priority: 'LOW',
          surface: 'SNAPSHOT',
          dismissible: false,
        },
      ],
      rationale: availableRationale(
        'Shown as a briefing because the change is meaningful but not strong enough for an alert.',
        [
          'The change is focused enough to keep visible without crowding the surface.',
          'Snapshot keeps the fuller review space, so this note stays brief on purpose.',
        ],
      ),
    });
  });

  it('returns NO_MESSAGE when interpreted Snapshot context is present but the tuned alert metrics are too thin', () => {
    expect(
      createMessagePolicyVM({
        surface: 'SNAPSHOT',
        snapshot: createSnapshotContext({
          latestRelevantEvent: createMarketEvent({
            pctChange: null,
          }),
        }),
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_MESSAGE',
      rationale: unavailableRationale('NO_RATIONALE_AVAILABLE'),
    });
  });

  it('does not let advanced profile bypass alert thresholds when context stays middling and unsupported', () => {
    expect(
      createMessagePolicyVM({
        surface: 'SNAPSHOT',
        snapshot: createSnapshotContext({
          profile: 'ADVANCED',
          latestRelevantEvent: createMarketEvent({
            confidenceScore: 0.89,
            pctChange: 0.05,
          }),
        }),
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_MESSAGE',
      rationale: unavailableRationale('NO_RATIONALE_AVAILABLE'),
    });
  });

  it('returns INSUFFICIENT_INTERPRETED_CONTEXT when no prepared inputs are available', () => {
    expect(
      createMessagePolicyVM({
        surface: 'SNAPSHOT',
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'INSUFFICIENT_INTERPRETED_CONTEXT',
      rationale: unavailableRationale('NO_RATIONALE_AVAILABLE'),
    });
  });

  it('is deterministic for identical inputs', () => {
    const input = {
      surface: 'DASHBOARD' as const,
      dashboard: createDashboardContext(),
    };

    expect(createMessagePolicyVM(input)).toEqual(createMessagePolicyVM(input));
  });
});
