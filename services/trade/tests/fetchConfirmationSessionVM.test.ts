import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { MarketEvent } from '@/core/types/marketEvent';
import { fetchConfirmationSessionVM } from '@/services/trade/fetchConfirmationSessionVM';
import { getAccountCapabilities } from '@/services/trade/getAccountCapabilities';
import { fetchSurfaceContext } from '@/services/upstream/fetchSurfaceContext';

jest.mock('@/services/upstream/fetchSurfaceContext');
jest.mock('@/services/trade/getAccountCapabilities');

function createEvent(overrides: Partial<MarketEvent> = {}): MarketEvent {
  return {
    eventId: 'acct-live:momentum_basics:signal:BTC:100',
    timestamp: 100,
    accountId: 'acct-live',
    symbol: 'BTC',
    strategyId: 'momentum_basics',
    eventType: 'MOMENTUM_BUILDING',
    alignmentState: 'ALIGNED',
    signalsTriggered: ['hidden-signal'],
    confidenceScore: 0.9,
    certainty: 'confirmed',
    price: 100,
    pctChange: 0.04,
    metadata: {
      hidden: true,
    },
    ...overrides,
  };
}

describe('fetchConfirmationSessionVM', () => {
  const mockFetchSurfaceContext = jest.mocked(fetchSurfaceContext);
  const mockGetAccountCapabilities = jest.mocked(getAccountCapabilities);

  beforeEach(() => {
    jest.resetAllMocks();
    mockGetAccountCapabilities.mockImplementation(async (accountId: string) => ({
      accountId,
      brokerId: `${accountId}-broker`,
      supportsBracketOrders: accountId === 'acct-live',
      supportsOCO: accountId === 'acct-live',
      requiresSeparateOrders: accountId !== 'acct-live',
      supportsStopLoss: true,
      supportsTakeProfit: true,
    }));
  });

  function mockUpstreamContext() {
    const btcEvent = createEvent();
    const ethEvent = createEvent({
      eventId: 'acct-basic:momentum_basics:signal:ETH:200',
      timestamp: 200,
      accountId: 'acct-basic',
      symbol: 'ETH',
      eventType: 'PRICE_MOVEMENT',
      alignmentState: 'WATCHFUL',
      certainty: 'estimated',
      metadata: {
        hidden: 'eth',
      },
    });

    mockFetchSurfaceContext.mockResolvedValue({
      portfolioValue: 300,
      change24h: 0.02,
      strategyAlignment: 'Aligned',
      bundleName: 'Advanced Core',
      eventLedger: {
        appendEvents: jest.fn(),
        getEventsByAccount: jest.fn().mockReturnValue([]),
      } as never,
      scan: {
        accountId: 'acct-live',
        symbols: ['BTC', 'ETH'],
        quotes: {
          BTC: {
            symbol: 'BTC',
            price: 100,
            source: 'stub',
            timestampMs: 1_700_000_000_000,
            estimated: false,
          },
          ETH: {
            symbol: 'ETH',
            price: 200,
            source: 'stub',
            timestampMs: 1_700_000_000_100,
            estimated: true,
          },
        },
        baselineQuotes: undefined,
        pctChangeBySymbol: { BTC: 0.04, ETH: 0.01 },
        estimatedFlags: { BTC: false, ETH: true },
        instrumentation: {
          requests: 1,
          symbolsRequested: 2,
          symbolsFetched: 2,
          symbolsBlocked: 0,
        },
        quoteMeta: {
          role: 'execution',
          providerId: 'broker:live',
          freshness: 'FRESH',
          certainty: 'CONFIRMED',
          lastUpdatedAt: '2023-11-14T22:13:20.000Z',
          lastGoodAt: null,
          usedLastGood: false,
          fallbackUsed: false,
          requestedSymbols: ['BTC', 'ETH'],
          returnedSymbols: ['BTC', 'ETH'],
          missingSymbols: [],
          timestampMs: 1_700_000_000_000,
          providersTried: ['broker:live'],
          sourceBySymbol: { BTC: 'stub', ETH: 'stub' },
          coalescedRequest: false,
          policyStateBySymbol: { BTC: 'FRESH', ETH: 'FRESH' },
          providerHealthSummary: {
            'broker:live': {
              providerId: 'broker:live',
              requests: 1,
              symbolsRequested: 2,
              symbolsFetched: 2,
              symbolsBlocked: 0,
              cooldown: 'INACTIVE',
            },
          },
          policy: {
            staleIfError: 'NOT_NEEDED',
            staleWhileRevalidate: 'NOT_IMPLEMENTED_FOREGROUND_ONLY',
            cooldown: 'INACTIVE',
            cooldownSkippedProviders: [],
          },
        },
      },
      signals: [],
      marketEvents: [btcEvent, ethEvent],
      eventStream: {
        accountId: 'acct-live',
        timestamp: 200,
        events: [btcEvent, ethEvent],
      },
      orientationContext: {
        accountId: 'acct-live',
        symbol: 'BTC',
        strategyId: 'momentum_basics',
        currentState: {
          latestRelevantEvent: btcEvent,
          strategyAlignment: 'Aligned',
          certainty: 'confirmed',
        },
        historyContext: {
          eventsSinceLastViewed: [],
          sinceLastChecked: null,
        },
      },
      eventsSinceLastViewed: undefined,
      sinceLastChecked: undefined,
    });
  }

  it('returns one prepared confirmation session VM without raw signal leakage', async () => {
    mockUpstreamContext();

    const result = await fetchConfirmationSessionVM({
      profile: 'ADVANCED',
    });

    expect(result.session).toEqual({
      planId: 'acct-live:momentum_basics:BTC:ACCUMULATE:acct-live:momentum_basics:signal:BTC:100',
      accountId: 'acct-live',
      executionCapability: {
        accountId: 'acct-live',
        path: 'BRACKET',
        confirmationPath: 'BRACKET',
        supported: true,
        unavailableReason: null,
      },
      preview: {
        planId: 'acct-live:momentum_basics:BTC:ACCUMULATE:acct-live:momentum_basics:signal:BTC:100',
        headline: {
          intentType: 'ACCUMULATE',
          symbol: 'BTC',
          actionState: 'READY',
        },
        rationale: {
          summary:
            'Accumulation setup is supported by confirmed momentum building. Focus symbol: BTC.',
          primaryEventId: 'acct-live:momentum_basics:signal:BTC:100',
          supportingEventIds: ['acct-live:momentum_basics:signal:BTC:100'],
          supportingEventCount: 1,
        },
        constraints: {
          requiresConfirmation: true,
          maxPositionSize: 0.1,
        },
        readiness: {
          alignment: 'ALIGNED',
          certainty: 'HIGH',
        },
        placeholders: {
          orderPreviewAvailable: false,
          executionPreviewAvailable: false,
        },
      },
      shell: {
        planId: 'acct-live:momentum_basics:BTC:ACCUMULATE:acct-live:momentum_basics:signal:BTC:100',
        headline: {
          intentType: 'ACCUMULATE',
          symbol: 'BTC',
          actionState: 'READY',
        },
        readiness: {
          alignment: 'ALIGNED',
          certainty: 'HIGH',
        },
        confirmation: {
          requiresConfirmation: true,
          pathType: 'BRACKET',
          stepsLabel: 'Single confirmation flow',
          executionAvailable: false,
        },
        constraints: {
          maxPositionSize: 0.1,
        },
        placeholders: {
          orderPayloadAvailable: false,
          executionPreviewAvailable: false,
        },
      },
      flow: {
        planId: 'acct-live:momentum_basics:BTC:ACCUMULATE:acct-live:momentum_basics:signal:BTC:100',
        steps: [
          {
            stepId: 'review',
            type: 'REVIEW',
            label: 'Review single confirmation flow',
            completed: false,
            acknowledged: false,
            required: true,
            acknowledgementLabel: 'Acknowledge review',
          },
          {
            stepId: 'constraint-check',
            type: 'CONSTRAINT_CHECK',
            label: 'Review constraints: max position size 0.1',
            completed: false,
            acknowledged: false,
            required: true,
            acknowledgementLabel: 'Acknowledge constraints',
          },
          {
            stepId: 'unavailable',
            type: 'UNAVAILABLE',
            label: 'Execution remains unavailable in this phase',
            completed: false,
            acknowledged: false,
            required: true,
          },
          {
            stepId: 'confirm-intent',
            type: 'CONFIRM_INTENT',
            label: 'Confirm user intent before any later execution step',
            completed: false,
            acknowledged: false,
            required: true,
            acknowledgementLabel: 'Acknowledge intent',
          },
        ],
        currentStepId: 'review',
        canProceed: false,
        allRequiredAcknowledged: false,
        blockedReason: 'Execution remains unavailable in this phase.',
      },
    });
    expect(JSON.stringify(result.session)).not.toContain('hidden-signal');
    expect(JSON.stringify(result.session)).not.toContain('hidden');
  });

  it('switches the selected plan and recomputes the prepared session deterministically', async () => {
    mockUpstreamContext();

    const first = await fetchConfirmationSessionVM({
      profile: 'ADVANCED',
    });
    const second = await fetchConfirmationSessionVM({
      profile: 'ADVANCED',
    });

    expect(first.session).toEqual(second.session);

    const switched = await first.actions.selectPlan(
      'acct-basic:momentum_basics:ETH:HOLD:acct-basic:momentum_basics:signal:ETH:200',
    );

    expect(switched.planId).toBe(
      'acct-basic:momentum_basics:ETH:HOLD:acct-basic:momentum_basics:signal:ETH:200',
    );
    expect(switched.preview?.headline).toEqual({
      intentType: 'HOLD',
      symbol: 'ETH',
      actionState: 'WAIT',
    });
    expect(switched.shell?.confirmation).toEqual({
      requiresConfirmation: true,
      pathType: 'GUIDED_SEQUENCE',
      stepsLabel: 'Review separate order steps',
      executionAvailable: false,
    });
    expect(switched.flow?.planId).toBe(switched.planId);
  });

  it('recomputes acknowledgement state through the session API and resets back to the initial session', async () => {
    mockUpstreamContext();

    const result = await fetchConfirmationSessionVM({
      profile: 'ADVANCED',
    });
    const initialSession = result.session;

    const reviewAcknowledged = result.actions.acknowledgeStep('review');

    expect(reviewAcknowledged.flow?.steps[0].acknowledged).toBe(true);
    expect(reviewAcknowledged.flow?.currentStepId).toBe('constraint-check');

    result.actions.acknowledgeStep('constraint-check');
    const intentAcknowledged = result.actions.acknowledgeStep('confirm-intent');

    expect(intentAcknowledged.flow?.canProceed).toBe(false);
    expect(intentAcknowledged.flow?.allRequiredAcknowledged).toBe(true);

    const reverted = result.actions.unacknowledgeStep('review');

    expect(reverted.flow?.steps[0].acknowledged).toBe(false);
    expect(reverted.flow?.canProceed).toBe(false);

    expect(result.actions.resetFlow()).toEqual(initialSession);
  });

  it('supports explicit clearing through selectPlan(null)', async () => {
    mockUpstreamContext();

    const result = await fetchConfirmationSessionVM({
      profile: 'ADVANCED',
    });

    expect(await result.actions.selectPlan(null)).toEqual({
      planId: null,
      accountId: null,
      executionCapability: null,
      preview: null,
      shell: null,
      flow: null,
    });
  });

  it('keeps session ownership in trade services and out of snapshot and dashboard paths', () => {
    const serviceSource = readFileSync(
      join(process.cwd(), 'services', 'trade', 'fetchConfirmationSessionVM.ts'),
      'utf8',
    );

    expect(serviceSource).not.toMatch(/fetchSnapshotVM/);
    expect(serviceSource).not.toMatch(/snapshotService/);
    expect(serviceSource).not.toMatch(/fetchDashboardSurfaceVM/);
    expect(serviceSource).not.toMatch(/dashboardSurfaceService/);
  });
});
