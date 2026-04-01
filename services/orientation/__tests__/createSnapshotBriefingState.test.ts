import { createSnapshotBriefingState } from '@/services/orientation/createSnapshotBriefingState';
import type { ReorientationSurfaceState } from '@/services/orientation/createReorientationSurfaceState';
import type { SnapshotVM } from '@/services/snapshot/snapshotService';

function createSnapshot(
  overrides?: Partial<Pick<SnapshotVM, 'model' | 'orientationContext'>>,
): Pick<SnapshotVM, 'model' | 'orientationContext'> {
  return {
    model: {
      profile: 'BEGINNER',
      core: {
        currentState: {
          label: 'Current State',
          value: 'Up',
          trendDirection: 'UP',
        },
        change24h: {
          label: 'Last 24h Change',
          value: 0.03,
        },
        strategyStatus: {
          label: 'Strategy Status',
          value: 'Watchful',
        },
      },
      history: {
        hasNewSinceLastCheck: true,
      },
    },
    orientationContext: {
      accountId: 'acct-1',
      currentState: {
        latestRelevantEvent: null,
        strategyAlignment: 'WATCHFUL',
        certainty: null,
      },
      historyContext: {
        eventsSinceLastViewed: [
          {
            eventId: 'evt-1',
            timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
            accountId: 'acct-1',
            symbol: 'BTC',
            strategyId: 'data_quality',
            eventType: 'DATA_QUALITY',
            alignmentState: 'WATCHFUL',
            signalsTriggered: ['budget_blocked_symbols'],
            confidenceScore: 0.9,
            certainty: 'confirmed',
            price: 100,
            pctChange: null,
            metadata: {
              signalTitle: 'Scan incomplete',
            },
          },
        ],
        sinceLastChecked: {
          sinceTimestamp: Date.parse('2026-02-28T00:00:00.000Z'),
          accountId: 'acct-1',
          summaryCount: 1,
          events: [],
        },
      },
    },
    ...overrides,
  };
}

function createReorientation(
  overrides?: Partial<ReorientationSurfaceState>,
): ReorientationSurfaceState {
  return {
    status: 'HIDDEN',
    reason: 'NOT_NEEDED',
    summary: null,
    dismissible: false,
    ...overrides,
  };
}

describe('createSnapshotBriefingState', () => {
  it('gives reorientation precedence when both candidates exist', () => {
    const result = createSnapshotBriefingState({
      reorientation: createReorientation({
        status: 'VISIBLE',
        reason: 'AVAILABLE',
        dismissible: true,
        summary: {
          status: 'AVAILABLE',
          profileId: 'BEGINNER',
          inactiveDays: 32,
          headline: 'Welcome back. Here is a quick briefing to help you get your bearings.',
          summaryItems: [
            {
              kind: 'ACCOUNT_CONTEXT',
              label: 'Data context',
              detail: 'Some recent market context was captured with data quality limits in view.',
            },
          ],
          generatedFrom: {
            lastActiveAt: '2026-02-28T00:00:00.000Z',
            now: '2026-04-01T00:00:00.000Z',
          },
          maxItems: 3,
        },
      }),
      snapshot: createSnapshot(),
    });

    expect(result).toEqual({
      status: 'VISIBLE',
      kind: 'REORIENTATION',
      title: 'Welcome back',
      subtitle: 'Welcome back. Here is a quick briefing to help you get your bearings.',
      items: [
        {
          label: 'Data context',
          detail: 'Some recent market context was captured with data quality limits in view.',
        },
      ],
      dismissible: true,
    });
  });

  it('shows Since Last Checked only when reorientation is not available', () => {
    const result = createSnapshotBriefingState({
      reorientation: createReorientation(),
      snapshot: createSnapshot(),
    });

    expect(result).toMatchObject({
      status: 'VISIBLE',
      kind: 'SINCE_LAST_CHECKED',
      title: 'Since last checked',
      dismissible: false,
      items: [
        {
          label: 'Data context',
          detail: 'Some recent market context was captured with data quality limits in view.',
        },
        {
          label: 'Current orientation',
          detail: 'Snapshot reads up with strategy status at watchful.',
        },
      ],
    });
    expect(JSON.stringify(result)).not.toMatch(
      /evt-1|budget_blocked_symbols|signalTitle|unread|badge|urgent|notification/,
    );
  });

  it('keeps the zone hidden when reorientation was available but dismissed', () => {
    const result = createSnapshotBriefingState({
      reorientation: createReorientation({
        status: 'HIDDEN',
        reason: 'DISMISSED',
        dismissible: true,
        summary: {
          status: 'AVAILABLE',
          profileId: 'BEGINNER',
          inactiveDays: 32,
          headline: 'Welcome back. Here is a quick briefing to help you get your bearings.',
          summaryItems: [
            {
              kind: 'ACCOUNT_CONTEXT',
              label: 'Data context',
              detail: 'Some recent market context was captured with data quality limits in view.',
            },
          ],
          generatedFrom: {
            lastActiveAt: '2026-02-28T00:00:00.000Z',
            now: '2026-04-01T00:00:00.000Z',
          },
          maxItems: 3,
        },
      }),
      snapshot: createSnapshot(),
    });

    expect(result).toEqual({
      status: 'HIDDEN',
      reason: 'NO_MEANINGFUL_BRIEFING',
    });
  });

  it('hides the zone when neither briefing is meaningful', () => {
    const result = createSnapshotBriefingState({
      reorientation: createReorientation(),
      snapshot: createSnapshot({
        model: {
          profile: 'BEGINNER',
          core: {
            currentState: {
              label: 'Current State',
              value: 'Flat',
              trendDirection: 'FLAT',
            },
            change24h: {
              label: 'Last 24h Change',
              value: 0,
            },
            strategyStatus: {
              label: 'Strategy Status',
              value: 'Aligned',
            },
          },
        },
        orientationContext: {
          accountId: 'acct-1',
          currentState: {
            latestRelevantEvent: null,
            strategyAlignment: 'ALIGNED',
            certainty: null,
          },
          historyContext: {
            eventsSinceLastViewed: [],
            sinceLastChecked: null,
          },
        },
      }),
    });

    expect(result).toEqual({
      status: 'HIDDEN',
      reason: 'NO_REORIENTATION',
    });
  });

  it('is deterministic for identical inputs', () => {
    const params = {
      reorientation: createReorientation(),
      snapshot: createSnapshot(),
    };

    expect(createSnapshotBriefingState(params)).toEqual(createSnapshotBriefingState(params));
  });
});
