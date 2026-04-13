import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type {
  MessagePolicyAvailability,
  MessagePolicyLane,
} from '@/services/messages/types';
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
    sinceLastChecked: {
      status: 'AVAILABLE',
      title: 'Since last checked',
      summary: 'A calm read on the most meaningful interpreted changes since your last visit.',
      items: [
        {
          title: 'Data context',
          summary: 'Some recent market context was captured with data quality limits in view.',
          emphasis: 'CONTEXT',
        },
        {
          title: 'Current orientation',
          summary: 'Snapshot reads up with strategy status at watchful.',
          emphasis: 'NEUTRAL',
        },
      ],
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

function unavailableMessagePolicy(): MessagePolicyAvailability {
  return {
    status: 'UNAVAILABLE',
    reason: 'NO_MESSAGE',
    rationale: {
      status: 'UNAVAILABLE',
      reason: 'NO_RATIONALE_AVAILABLE',
    },
  };
}

function createMessagePolicyLane(policyAvailability: MessagePolicyAvailability): MessagePolicyLane {
  return {
    policyAvailability,
    rationaleAvailability: policyAvailability.rationale,
  };
}

describe('createSnapshotScreenViewData', () => {
  it('keeps the screen helper on the prepared message policy contract only', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'screens', 'snapshotScreenView.ts'),
      'utf8',
    );

    expect(source).toMatch(/messagePolicyLane\?\.policyAvailability/);
    expect(source).toMatch(/policyAvailability\?\.status === 'AVAILABLE'/);
    expect(source).toMatch(/policyAvailability\.messages\[0\]/);
    expect(source).toMatch(/messagePolicyLane\?\.rationaleAvailability \?\? policyAvailability\.rationale/);
    expect(source).toMatch(/surface\?\.sinceLastChecked\?\.status === 'AVAILABLE'/);
    expect(source).toMatch(/thirtyThousandFoot\.availability\.status === 'AVAILABLE'/);
    expect(source).not.toMatch(/surface\.briefing\.status === 'VISIBLE'/);
    expect(source).not.toMatch(/kind === 'ALERT'/);
    expect(source).not.toMatch(/kind === 'REORIENTATION'/);
    expect(source).not.toMatch(/kind === 'BRIEFING'/);
    expect(source).not.toMatch(/eventsSinceLastViewed|createOrientationBriefingItems|summaryCount/);
    expect(source).not.toMatch(
      /createPreparedMessageInputs|createPreparedMessageRationale|createThirtyThousandFootVM|createStrategyFitSummary|subjectScope|changeStrength|confirmationSupport|eventStream|marketEvents|signalsTriggered|providerId|metadata/,
    );
  });

  it('uses the SnapshotModel path instead of legacy bridge fields', () => {
    const surface = createSurface();

    expect(
      createSnapshotScreenViewData(surface, createMessagePolicyLane(unavailableMessagePolicy())),
    ).toEqual({
      currentStateLabel: 'Current State',
      currentStateValue: 'Up',
      change24hLabel: 'Last 24h Change',
      change24hValue: '12.00%',
      strategyStatusLabel: 'Strategy Status',
      strategyStatusValue: 'Aligned',
      bundleName: 'Model Bundle',
      portfolioValueText: '321.12',
      sinceLastChecked: {
        visible: true,
        title: 'Since last checked',
        summary: 'A calm read on the most meaningful interpreted changes since your last visit.',
        items: [
          {
            title: 'Data context',
            summary: 'Some recent market context was captured with data quality limits in view.',
            emphasis: 'CONTEXT',
          },
          {
            title: 'Current orientation',
            summary: 'Snapshot reads up with strategy status at watchful.',
            emphasis: 'NEUTRAL',
          },
        ],
      },
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
      createSnapshotScreenViewData(
        createSurface(),
        createMessagePolicyLane(unavailableMessagePolicy()),
      ),
    ).toMatchObject({
      message: {
        visible: false,
      },
    });
  });

  it('hides the Since Last Checked section when the prepared VM is unavailable', () => {
    const surface = createSurface();
    surface.sinceLastChecked = {
      status: 'UNAVAILABLE',
      reason: 'NO_MEANINGFUL_CHANGES',
    };

    expect(
      createSnapshotScreenViewData(surface, createMessagePolicyLane(unavailableMessagePolicy())),
    ).toMatchObject({
      sinceLastChecked: {
        visible: false,
      },
    });
  });

  it('passes through the prepared Snapshot message and rationale without classifying it locally', () => {
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
      rationale: {
        status: 'AVAILABLE',
        rationale: {
          title: 'Why this is here',
          summary:
            "Shown as an alert because the change is focused enough for Snapshot's alert posture.",
          items: [
            'The change is focused enough to keep visible without crowding the surface.',
            'The note stays compact so it points back to Snapshot instead of becoming a stream of messages.',
          ],
        },
      },
    };

    expect(
      createSnapshotScreenViewData(createSurface(), createMessagePolicyLane(messagePolicy)),
    ).toMatchObject({
      message: {
        visible: true,
        kind: 'ALERT',
        priority: 'HIGH',
        dismissible: false,
        title: 'Meaningful change noticed',
        summary:
          'ETH is standing out in recent interpreted context. Review Snapshot before deciding whether it changes your plan.',
        rationale: messagePolicy.rationale,
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
      createSnapshotScreenViewData(surface, createMessagePolicyLane(unavailableMessagePolicy())),
    ).toMatchObject({
      thirtyThousandFoot: {
        visible: false,
      },
    });
  });
});
