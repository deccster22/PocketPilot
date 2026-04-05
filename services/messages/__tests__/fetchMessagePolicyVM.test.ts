import {
  fetchDashboardSurfaceVM,
  type DashboardSurfaceVM,
} from '@/services/dashboard/dashboardSurfaceService';
import { fetchMessagePolicyVM } from '@/services/messages/fetchMessagePolicyVM';
import { fetchSnapshotSurfaceVM } from '@/services/snapshot/fetchSnapshotSurfaceVM';
import {
  fetchConfirmationSessionVM,
  type ConfirmationSessionVM,
} from '@/services/trade/fetchConfirmationSessionVM';
import type { SnapshotSurfaceVM } from '@/services/snapshot/fetchSnapshotSurfaceVM';

jest.mock('@/services/dashboard/dashboardSurfaceService');
jest.mock('@/services/snapshot/fetchSnapshotSurfaceVM');
jest.mock('@/services/trade/fetchConfirmationSessionVM');

function createSnapshotSurface(): SnapshotSurfaceVM {
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
            value: 0.05,
          },
          strategyStatus: {
            label: 'Strategy Status',
            value: 'Watchful',
          },
        },
      },
      portfolioValue: 100,
      change24h: 0.05,
      strategyAlignment: 'Watchful',
      bundleName: 'Advanced Core',
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
        quoteMeta: {
          role: 'execution',
          providerId: 'broker:live',
          freshness: 'UNAVAILABLE',
          certainty: 'UNAVAILABLE',
          lastUpdatedAt: null,
          lastGoodAt: null,
          usedLastGood: false,
          fallbackUsed: false,
          requestedSymbols: [],
          returnedSymbols: [],
          missingSymbols: [],
          timestampMs: Date.parse('2026-04-05T00:00:00.000Z'),
          providersTried: ['broker:live'],
          sourceBySymbol: {},
          coalescedRequest: false,
          policyStateBySymbol: {},
          providerHealthSummary: {
            'broker:live': {
              providerId: 'broker:live',
              requests: 0,
              symbolsRequested: 0,
              symbolsFetched: 0,
              symbolsBlocked: 0,
              cooldown: 'INACTIVE',
            },
          },
          policy: {
            staleIfError: 'FAILED_WITHOUT_LAST_GOOD',
            staleWhileRevalidate: 'NOT_IMPLEMENTED_FOREGROUND_ONLY',
            cooldown: 'INACTIVE',
            cooldownSkippedProviders: [],
          },
        },
      },
      signals: [],
      marketEvents: [],
      eventStream: {
        accountId: 'acct-1',
        timestamp: Date.parse('2026-04-05T00:00:00.000Z'),
        events: [],
      },
      orientationContext: {
        accountId: 'acct-1',
        currentState: {
          latestRelevantEvent: {
            eventId: 'evt-price-move-3',
            timestamp: Date.parse('2026-04-05T00:00:00.000Z'),
            accountId: 'acct-1',
            symbol: 'ETH',
            strategyId: 'momentum_basics',
            eventType: 'PRICE_MOVEMENT',
            alignmentState: 'WATCHFUL',
            signalsTriggered: ['momentum_signal'],
            confidenceScore: 0.95,
            certainty: 'confirmed',
            price: 120,
            pctChange: 0.08,
            metadata: {
              signalTitle: 'Momentum spike',
            },
          },
          strategyAlignment: 'WATCHFUL',
          certainty: 'confirmed',
        },
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
  };
}

function createDashboardSurface(overrides: Partial<DashboardSurfaceVM> = {}): DashboardSurfaceVM {
  return {
    model: {
      primeZone: { items: [] },
      secondaryZone: {
        items: [
          {
            symbol: 'ETH',
            accountId: 'acct-1',
            strategyId: 'strategy-b',
            eventType: 'ESTIMATED_PRICE',
            alignmentState: 'NEEDS_REVIEW',
            trendDirection: 'neutral',
            certainty: 'estimated',
            timestamp: 490,
          },
        ],
      },
      deepZone: { items: [] },
      meta: {
        profile: 'BEGINNER',
        hasPrimeItems: false,
        hasSecondaryItems: true,
        hasDeepItems: false,
      },
    },
    scan: {} as never,
    explanation: {
      status: 'UNAVAILABLE',
      reason: 'NO_EXPLANATION_TARGET',
    },
    ...overrides,
  };
}

function createConfirmationSessionVm(
  overrides: Partial<ConfirmationSessionVM['session']> = {},
): ConfirmationSessionVM {
  return {
    session: {
      planId: 'plan-1',
      accountId: 'acct-live',
      executionCapability: {
        accountId: 'acct-live',
        path: 'UNAVAILABLE',
        confirmationPath: 'UNAVAILABLE',
        supported: false,
        unavailableReason:
          'Account capabilities do not support a protected execution path for this plan.',
      },
      preparedRiskReferences: null,
      preview: null,
      shell: null,
      flow: null,
      ...overrides,
    },
    actions: {
      acknowledgeStep: jest.fn(),
      unacknowledgeStep: jest.fn(),
      resetFlow: jest.fn(),
      selectPlan: jest.fn(),
    },
    scan: {} as never,
  };
}

describe('fetchMessagePolicyVM', () => {
  const mockFetchDashboardSurfaceVM = jest.mocked(fetchDashboardSurfaceVM);
  const mockFetchSnapshotSurfaceVM = jest.mocked(fetchSnapshotSurfaceVM);
  const mockFetchConfirmationSessionVM = jest.mocked(fetchConfirmationSessionVM);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('uses a provided Snapshot surface instead of fetching a second time', async () => {
    const snapshotSurface = createSnapshotSurface();

    const result = await fetchMessagePolicyVM({
      surface: 'SNAPSHOT',
      profile: 'ADVANCED',
      snapshotSurface,
    });

    expect(mockFetchSnapshotSurfaceVM).not.toHaveBeenCalled();
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
  });

  it('fetches the Snapshot surface when one is not supplied', async () => {
    const snapshotSurface = createSnapshotSurface();
    mockFetchSnapshotSurfaceVM.mockResolvedValue(snapshotSurface);

    const result = await fetchMessagePolicyVM({
      surface: 'SNAPSHOT',
      profile: 'ADVANCED',
      baselineScan: snapshotSurface.snapshot.scan,
      reorientationDismissState: {
        dismissedAt: null,
      },
      currentSessionDismissState: {
        dismissedAt: null,
      },
    });

    expect(mockFetchSnapshotSurfaceVM).toHaveBeenCalledWith({
      profile: 'ADVANCED',
      baselineScan: snapshotSurface.snapshot.scan,
      nowProvider: undefined,
      includeDebugObservatory: undefined,
      eventLedger: undefined,
      eventLedgerQueries: undefined,
      lastViewedTimestamp: undefined,
      lastViewedState: undefined,
      preference: undefined,
      reorientationDismissState: {
        dismissedAt: null,
      },
      currentSessionDismissState: {
        dismissedAt: null,
      },
      reorientationVisibility: undefined,
    });
    expect(result).toMatchObject({
      status: 'AVAILABLE',
      messages: [
        {
          kind: 'ALERT',
          priority: 'MEDIUM',
          surface: 'SNAPSHOT',
        },
      ],
    });
  });

  it('keeps beginner Snapshot policy service-owned by downgrading strong interpreted change to a briefing', async () => {
    const snapshotSurface = createSnapshotSurface();
    snapshotSurface.snapshot.model.profile = 'BEGINNER';

    const result = await fetchMessagePolicyVM({
      surface: 'SNAPSHOT',
      profile: 'BEGINNER',
      snapshotSurface,
    });

    expect(mockFetchSnapshotSurfaceVM).not.toHaveBeenCalled();
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
  });

  it('uses a provided Dashboard surface for referral eligibility without fetching Snapshot logic', async () => {
    const dashboardSurface = createDashboardSurface();

    const result = await fetchMessagePolicyVM({
      surface: 'DASHBOARD',
      profile: 'BEGINNER',
      dashboardSurface,
    });

    expect(mockFetchDashboardSurfaceVM).not.toHaveBeenCalled();
    expect(mockFetchSnapshotSurfaceVM).not.toHaveBeenCalled();
    expect(result).toEqual({
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
  });

  it('fetches the Dashboard surface through the canonical seam when one is not supplied', async () => {
    const dashboardSurface = createDashboardSurface();
    mockFetchDashboardSurfaceVM.mockResolvedValue(dashboardSurface);

    const result = await fetchMessagePolicyVM({
      surface: 'DASHBOARD',
      profile: 'BEGINNER',
      baselineScan: dashboardSurface.scan,
    });

    expect(mockFetchDashboardSurfaceVM).toHaveBeenCalledWith({
      profile: 'BEGINNER',
      baselineScan: dashboardSurface.scan,
      nowProvider: undefined,
    });
    expect(result).toMatchObject({
      status: 'AVAILABLE',
      messages: [
        {
          kind: 'REFERRAL',
          surface: 'DASHBOARD',
        },
      ],
    });
  });

  it('uses a provided Trade Hub confirmation session for guarded-stop eligibility', async () => {
    const confirmationSession = createConfirmationSessionVm().session;

    const result = await fetchMessagePolicyVM({
      surface: 'TRADE_HUB',
      profile: 'ADVANCED',
      confirmationSession,
    });

    expect(mockFetchConfirmationSessionVM).not.toHaveBeenCalled();
    expect(result).toEqual({
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
    expect(JSON.stringify(result)).not.toMatch(/providerId|eventId|strategyId|unread|badge|urgent/);
  });

  it('fetches the Trade Hub confirmation session when one is not supplied', async () => {
    const confirmationSessionVm = createConfirmationSessionVm();
    mockFetchConfirmationSessionVM.mockResolvedValue(confirmationSessionVm);

    const result = await fetchMessagePolicyVM({
      surface: 'TRADE_HUB',
      profile: 'ADVANCED',
      baselineScan: confirmationSessionVm.scan,
    });

    expect(mockFetchConfirmationSessionVM).toHaveBeenCalledWith({
      profile: 'ADVANCED',
      baselineScan: confirmationSessionVm.scan,
      nowProvider: undefined,
      eventLedger: undefined,
      eventLedgerQueries: undefined,
      lastViewedTimestamp: undefined,
      lastViewedState: undefined,
    });
    expect(result).toMatchObject({
      status: 'AVAILABLE',
      messages: [
        {
          kind: 'GUARDED_STOP',
          surface: 'TRADE_HUB',
        },
      ],
    });
  });
});
