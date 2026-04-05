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
    });
    expect(JSON.stringify(result)).not.toMatch(/evt-price-move-2|dip_buying|dip_signal/);
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
    });
    expect(JSON.stringify(result)).not.toMatch(/evt-price-move-beginner|raw_signal_should_not_leak/);
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
    });
  });

  it('does not let advanced profile bypass alert thresholds when context stays middling', () => {
    expect(
      createMessagePolicyVM({
        surface: 'SNAPSHOT',
        snapshot: createSnapshotContext({
          profile: 'ADVANCED',
          latestRelevantEvent: createMarketEvent({
            confidenceScore: 0.85,
            pctChange: 0.04,
          }),
        }),
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_MESSAGE',
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
