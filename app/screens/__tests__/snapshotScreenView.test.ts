import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { MessagePolicyAvailability } from '@/services/messages/types';
import type { SnapshotSurfaceVM } from '@/services/snapshot/fetchSnapshotSurfaceVM';
import { createSnapshotScreenViewData } from '@/app/screens/snapshotScreenView';

function createSurface(): SnapshotSurfaceVM {
  return {
    snapshot: {
      model: {
        profile: 'ADVANCED',
        core: {
          currentState: {
            label: 'Current State',
            value: 'Up',
            trendDirection: 'UP',
          },
          change24h: {
            label: 'Last 24h Change',
            value: 0.12,
          },
          strategyStatus: {
            label: 'Strategy Status',
            value: 'Aligned',
          },
        },
        secondary: {
          bundleName: 'Model Bundle',
          portfolioValue: 321.12,
        },
      },
      bundleName: 'Legacy Bundle',
      portfolioValue: 999,
      change24h: -0.5,
      strategyAlignment: 'Needs review',
      scan: {} as SnapshotSurfaceVM['snapshot']['scan'],
      signals: [],
      marketEvents: [],
      eventStream: { accountId: 'acct-1', timestamp: 1, events: [] },
      orientationContext: {
        currentState: {} as SnapshotSurfaceVM['snapshot']['orientationContext']['currentState'],
        historyContext: {
          eventsSinceLastViewed: [],
          sinceLastChecked: null,
        },
      },
    },
    reorientation: {
      status: 'HIDDEN',
      reason: 'NOT_NEEDED',
      summary: null,
      dismissible: false,
    },
    briefing: {
      status: 'VISIBLE',
      kind: 'SINCE_LAST_CHECKED',
      title: 'Since last checked',
      subtitle: 'A calm read on the most meaningful interpreted changes since your last visit.',
      items: [
        {
          label: 'Current orientation',
          detail: 'Snapshot reads down with strategy status at watchful.',
        },
      ],
      dismissible: false,
    },
    thirtyThousandFoot: {
      generatedAt: '2026-04-03T00:00:00.000Z',
      fit: {
        state: 'MIXED',
        summary:
          'Conditions look mixed for this strategy while volatility stays elevated relative to recent conditions.',
      },
      availability: {
        status: 'AVAILABLE',
        title: 'Broader conditions look mixed',
        summary:
          'Volatility or broader structure looks less settled than Snapshot usually needs to show.',
        details: [
          'Volatility is elevated relative to recent conditions.',
          'Broader structure still leans up, but the broader picture remains mixed.',
          'Current strategy fit currently reads mixed under this backdrop.',
        ],
      },
    },
  };
}

describe('createSnapshotScreenViewData', () => {
  it('keeps the screen helper on the prepared message policy contract only', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'screens', 'snapshotScreenView.ts'),
      'utf8',
    );

    expect(source).toMatch(/messagePolicy\?\.status === 'AVAILABLE'/);
    expect(source).toMatch(/messagePolicy\.messages\[0\]/);
    expect(source).toMatch(/thirtyThousandFoot\.availability\.status === 'AVAILABLE'/);
    expect(source).not.toMatch(/surface\.briefing\.status === 'VISIBLE'/);
    expect(source).not.toMatch(/kind === 'ALERT'/);
    expect(source).not.toMatch(/kind === 'REORIENTATION'/);
    expect(source).not.toMatch(/kind === 'BRIEFING'/);
    expect(source).not.toMatch(
      /createPreparedMessageInputs|createThirtyThousandFootVM|createStrategyFitSummary|subjectScope|changeStrength|confirmationSupport|eventStream|marketEvents|signalsTriggered|providerId|metadata/,
    );
  });

  it('uses the SnapshotModel path instead of legacy bridge fields', () => {
    const surface = createSurface();

    expect(
      createSnapshotScreenViewData(surface, {
        status: 'UNAVAILABLE',
        reason: 'NO_MESSAGE',
      }),
    ).toEqual({
      currentStateLabel: 'Current State',
      currentStateValue: 'Up',
      change24hLabel: 'Last 24h Change',
      change24hValue: '12.00%',
      strategyStatusLabel: 'Strategy Status',
      strategyStatusValue: 'Aligned',
      bundleName: 'Model Bundle',
      portfolioValueText: '321.12',
      message: {
        visible: false,
      },
      thirtyThousandFoot: {
        visible: true,
        title: 'Broader conditions look mixed',
        summary:
          'Volatility or broader structure looks less settled than Snapshot usually needs to show.',
      },
    });
  });

  it('returns null when the prepared model is unavailable', () => {
    expect(createSnapshotScreenViewData(null, null)).toBeNull();
  });

  it('hides the message when the policy seam says no message is available, even if briefing state exists upstream', () => {
    expect(
      createSnapshotScreenViewData(createSurface(), {
        status: 'UNAVAILABLE',
        reason: 'NO_MESSAGE',
      }),
    ).toMatchObject({
      message: {
        visible: false,
      },
    });
  });

  it('passes through the prepared Snapshot message without classifying it locally', () => {
    const messagePolicy: MessagePolicyAvailability = {
      status: 'AVAILABLE',
      messages: [
        {
          kind: 'ALERT',
          title: 'Meaningful change noticed',
          summary:
            'ETH is standing out in recent interpreted context. Review Snapshot before deciding whether it changes your plan.',
          priority: 'HIGH',
          surface: 'SNAPSHOT',
          dismissible: false,
        },
      ],
    };

    expect(createSnapshotScreenViewData(createSurface(), messagePolicy)).toMatchObject({
      message: {
        visible: true,
        kind: 'ALERT',
        priority: 'HIGH',
        dismissible: false,
        title: 'Meaningful change noticed',
        summary:
          'ETH is standing out in recent interpreted context. Review Snapshot before deciding whether it changes your plan.',
      },
      thirtyThousandFoot: {
        visible: true,
        title: 'Broader conditions look mixed',
      },
    });
  });

  it('hides the 30,000 ft affordance when the prepared VM says it is unavailable', () => {
    const surface = createSurface();
    surface.thirtyThousandFoot = {
      generatedAt: '2026-04-03T00:00:00.000Z',
      fit: {
        state: 'FAVOURABLE',
        summary:
          'Conditions look broadly favourable for this strategy in the current interpreted picture.',
      },
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NO_MEANINGFUL_CONTEXT',
      },
    };

    expect(
      createSnapshotScreenViewData(surface, {
        status: 'UNAVAILABLE',
        reason: 'NO_MESSAGE',
      }),
    ).toMatchObject({
      thirtyThousandFoot: {
        visible: false,
      },
    });
  });
});
