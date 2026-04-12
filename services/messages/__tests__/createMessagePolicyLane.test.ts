import type { MarketEvent } from '@/core/types/marketEvent';
import { createMessagePolicyLane } from '@/services/messages/createMessagePolicyLane';
import type { MessagePolicySnapshotContext } from '@/services/messages/types';

function createMarketEvent(overrides: Partial<MarketEvent> = {}): MarketEvent {
  return {
    eventId: 'evt-price-move-lane',
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

function unavailableRationale() {
  return {
    status: 'UNAVAILABLE' as const,
    reason: 'NO_RATIONALE_AVAILABLE' as const,
  };
}

describe('createMessagePolicyLane', () => {
  it('composes the canonical policy and rationale results into one deterministic lane', () => {
    const input = {
      surface: 'SNAPSHOT' as const,
      snapshot: createSnapshotContext({
        latestRelevantEvent: createMarketEvent(),
      }),
    };

    const lane = createMessagePolicyLane(input);

    expect(lane).toEqual({
      policyAvailability: {
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
      },
      rationaleAvailability: availableRationale(
        "Shown as an alert because the change is focused enough for Snapshot's alert posture.",
        [
          'The change is focused enough to keep visible without crowding the surface.',
          'The note stays compact so it points back to Snapshot instead of becoming a stream of messages.',
        ],
      ),
    });
    expect(lane.rationaleAvailability).toBe(lane.policyAvailability.rationale);
    expect(JSON.stringify(lane)).not.toMatch(/badge|inbox|notification|push|background|unread|popup|urgent/);
  });

  it('preserves downgrade and suppress tuning behavior through the grouped lane', () => {
    const downgradedLane = createMessagePolicyLane({
      surface: 'SNAPSHOT',
      snapshot: createSnapshotContext({
        profile: 'BEGINNER',
        latestRelevantEvent: createMarketEvent(),
      }),
    });
    const suppressedLane = createMessagePolicyLane({
      surface: 'SNAPSHOT',
      snapshot: createSnapshotContext({
        latestRelevantEvent: createMarketEvent({
          pctChange: null,
        }),
      }),
    });

    expect(downgradedLane.policyAvailability).toEqual({
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
    expect(suppressedLane).toEqual({
      policyAvailability: {
        status: 'UNAVAILABLE',
        reason: 'NO_MESSAGE',
        rationale: unavailableRationale(),
      },
      rationaleAvailability: unavailableRationale(),
    });
    expect(JSON.stringify(suppressedLane)).not.toMatch(
      /badge|inbox|notification|push|background|unread|popup|urgent/,
    );
  });
});
