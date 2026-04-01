import type { SnapshotSurfaceVM } from '@/services/snapshot/fetchSnapshotSurfaceVM';
import { createSnapshotScreenViewData } from '@/app/screens/snapshotScreenView';

describe('createSnapshotScreenViewData', () => {
  it('uses the SnapshotModel path instead of legacy bridge fields', () => {
    const surface = {
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
        status: 'HIDDEN',
        reason: 'NO_REORIENTATION',
      },
    } as SnapshotSurfaceVM;

    expect(createSnapshotScreenViewData(surface)).toEqual({
      currentStateLabel: 'Current State',
      currentStateValue: 'Up',
      change24hLabel: 'Last 24h Change',
      change24hValue: '12.00%',
      strategyStatusLabel: 'Strategy Status',
      strategyStatusValue: 'Aligned',
      bundleName: 'Model Bundle',
      portfolioValueText: '321.12',
      briefing: {
        visible: false,
      },
    });
  });

  it('returns null when the prepared model is unavailable', () => {
    expect(createSnapshotScreenViewData(null)).toBeNull();
  });

  it('keeps the canonical core visible for beginner snapshots even without secondary context', () => {
    const surface = {
      snapshot: {
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
        bundleName: '',
        portfolioValue: 0,
        change24h: 0,
        strategyAlignment: 'Aligned',
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
        status: 'HIDDEN',
        reason: 'NO_REORIENTATION',
      },
    } as SnapshotSurfaceVM;

    expect(createSnapshotScreenViewData(surface)).toEqual({
      currentStateLabel: 'Current State',
      currentStateValue: 'Flat',
      change24hLabel: 'Last 24h Change',
      change24hValue: '0.00%',
      strategyStatusLabel: 'Strategy Status',
      strategyStatusValue: 'Aligned',
      bundleName: undefined,
      portfolioValueText: undefined,
      briefing: {
        visible: false,
      },
    });
  });

  it('passes through the prepared Snapshot briefing only when the surface VM marks it visible', () => {
    const surface = {
      snapshot: {
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
        },
        bundleName: '',
        portfolioValue: 0,
        change24h: 0.03,
        strategyAlignment: 'Watchful',
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
        status: 'VISIBLE',
        reason: 'AVAILABLE',
        dismissible: true,
        summary: {
          status: 'AVAILABLE',
          profileId: 'BEGINNER',
          inactiveDays: 32,
          headline: 'A few meaningful shifts were prepared while you were away.',
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
      },
      briefing: {
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
      },
    } as SnapshotSurfaceVM;

    expect(createSnapshotScreenViewData(surface)).toMatchObject({
      briefing: {
        visible: true,
        kind: 'REORIENTATION',
        dismissible: true,
        title: 'Welcome back',
        subtitle: 'Welcome back. Here is a quick briefing to help you get your bearings.',
        items: [
          {
            label: 'Data context',
            detail: 'Some recent market context was captured with data quality limits in view.',
          },
        ],
      },
    });
  });

  it('reads a Since Last Checked briefing from the prepared surface without deciding precedence locally', () => {
    const surface = {
      snapshot: {
        model: {
          profile: 'ADVANCED',
          core: {
            currentState: {
              label: 'Current State',
              value: 'Down',
              trendDirection: 'DOWN',
            },
            change24h: {
              label: 'Last 24h Change',
              value: -0.02,
            },
            strategyStatus: {
              label: 'Strategy Status',
              value: 'Watchful',
            },
          },
        },
        bundleName: '',
        portfolioValue: 0,
        change24h: -0.02,
        strategyAlignment: 'Watchful',
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
    } as SnapshotSurfaceVM;

    expect(createSnapshotScreenViewData(surface)).toMatchObject({
      briefing: {
        visible: true,
        kind: 'SINCE_LAST_CHECKED',
        title: 'Since last checked',
        dismissible: false,
        items: [
          {
            label: 'Current orientation',
            detail: 'Snapshot reads down with strategy status at watchful.',
          },
        ],
      },
    });
  });
});
