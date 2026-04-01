import {
  createSnapshotScreenViewData,
  refreshSnapshotScreenSurface,
  shouldRefreshSnapshotOnAppForegroundTransition,
} from '@/app/screens/snapshotScreenView';
import type { SnapshotSurfaceVM } from '@/services/snapshot/fetchSnapshotSurfaceVM';

const availableSurface = {
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
    bundleName: 'Beginner Core',
    portfolioValue: 100,
    change24h: 0.03,
    strategyAlignment: 'Watchful',
    scan: {
      accountId: 'acct-1',
      symbols: [],
      quotes: {},
      baselineQuotes: undefined,
      pctChangeBySymbol: {},
      estimatedFlags: {},
      instrumentation: {
        requests: 0,
        symbolsRequested: 0,
        symbolsFetched: 0,
        symbolsBlocked: 0,
      },
    },
    signals: [],
    marketEvents: [],
    eventStream: {
      accountId: 'acct-1',
      timestamp: Date.parse('2026-04-01T00:00:00.000Z'),
      events: [],
    },
    orientationContext: {
      accountId: 'acct-1',
      currentState: {
        latestRelevantEvent: null,
        strategyAlignment: 'WATCHFUL',
        certainty: null,
      },
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

describe('snapshotForegroundRefresh', () => {
  it('refreshes only on explicit background or inactive to active transitions', () => {
    expect(shouldRefreshSnapshotOnAppForegroundTransition('background', 'active')).toBe(true);
    expect(shouldRefreshSnapshotOnAppForegroundTransition('inactive', 'active')).toBe(true);
    expect(shouldRefreshSnapshotOnAppForegroundTransition('active', 'active')).toBe(false);
    expect(shouldRefreshSnapshotOnAppForegroundTransition('active', 'inactive')).toBe(false);
    expect(shouldRefreshSnapshotOnAppForegroundTransition('active', 'background')).toBe(false);
    expect(shouldRefreshSnapshotOnAppForegroundTransition('unknown', 'active')).toBe(false);
  });

  it('routes foreground refresh through the same prepared Snapshot VM path as mount', async () => {
    const fetchSnapshotSurface = jest.fn().mockResolvedValue(availableSurface);

    const initialMountResult = await refreshSnapshotScreenSurface({
      profile: 'BEGINNER',
      reorientationDismissState: {
        dismissedAt: null,
      },
      currentSessionDismissState: {
        dismissedAt: null,
      },
      fetchSnapshotSurface,
    });
    const foregroundResult = await refreshSnapshotScreenSurface({
      profile: 'BEGINNER',
      baselineScan: initialMountResult.nextBaselineScan,
      reorientationDismissState: {
        dismissedAt: null,
      },
      currentSessionDismissState: {
        dismissedAt: null,
      },
      fetchSnapshotSurface,
    });

    expect(fetchSnapshotSurface).toHaveBeenNthCalledWith(1, {
      profile: 'BEGINNER',
      baselineScan: undefined,
      includeDebugObservatory: undefined,
      reorientationDismissState: {
        dismissedAt: null,
      },
      currentSessionDismissState: {
        dismissedAt: null,
      },
    });
    expect(fetchSnapshotSurface).toHaveBeenNthCalledWith(2, {
      profile: 'BEGINNER',
      baselineScan: availableSurface.snapshot.scan,
      includeDebugObservatory: undefined,
      reorientationDismissState: {
        dismissedAt: null,
      },
      currentSessionDismissState: {
        dismissedAt: null,
      },
    });
    expect(initialMountResult.surface).toBe(availableSurface);
    expect(foregroundResult.surface).toBe(availableSurface);
  });

  it('keeps a dismissed cycle hidden after foreground refresh without leaking raw signals', async () => {
    const fetchSnapshotSurface = jest.fn().mockResolvedValue({
      ...availableSurface,
      reorientation: {
        ...availableSurface.reorientation,
        status: 'HIDDEN',
        reason: 'DISMISSED',
      },
      briefing: {
        status: 'HIDDEN',
        reason: 'NO_MEANINGFUL_BRIEFING',
      },
    } as SnapshotSurfaceVM);

    const result = await refreshSnapshotScreenSurface({
      profile: 'BEGINNER',
      reorientationDismissState: {
        dismissedAt: '2026-04-01T00:00:00.000Z',
      },
      currentSessionDismissState: {
        dismissedAt: '2026-04-01T00:00:00.000Z',
      },
      fetchSnapshotSurface,
    });

    expect(createSnapshotScreenViewData(result.surface)).toEqual({
      currentStateLabel: 'Current State',
      currentStateValue: 'Up',
      change24hLabel: 'Last 24h Change',
      change24hValue: '3.00%',
      strategyStatusLabel: 'Strategy Status',
      strategyStatusValue: 'Watchful',
      bundleName: undefined,
      portfolioValueText: undefined,
      briefing: {
        visible: false,
      },
    });
    expect(JSON.stringify(result.surface.reorientation.summary)).not.toMatch(
      /signalsTriggered|budget_blocked_symbols|signalTitle/,
    );
    expect(JSON.stringify(result.surface.briefing)).not.toMatch(/unread|badge|notification|urgent/);
  });

  it('marks stale persisted dismissal for clearing when a newer eligible cycle appears on foreground refresh', async () => {
    const fetchSnapshotSurface = jest.fn().mockResolvedValue({
      ...availableSurface,
      reorientation: {
        ...availableSurface.reorientation,
        summary: {
          ...availableSurface.reorientation.summary,
          generatedFrom: {
            lastActiveAt: '2026-04-05T00:00:00.000Z',
            now: '2026-05-10T00:00:00.000Z',
          },
          inactiveDays: 35,
        },
      },
    } as SnapshotSurfaceVM);

    const result = await refreshSnapshotScreenSurface({
      profile: 'BEGINNER',
      reorientationDismissState: {
        dismissedAt: '2026-04-01T00:00:00.000Z',
      },
      currentSessionDismissState: {
        dismissedAt: '2026-04-01T00:00:00.000Z',
      },
      fetchSnapshotSurface,
    });

    expect(result.shouldClearPersistedDismissState).toBe(true);
  });
});
