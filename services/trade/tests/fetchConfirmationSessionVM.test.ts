import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { MarketEvent } from '@/core/types/marketEvent';
import { createInMemoryPreferredRiskBasisStore } from '@/services/trade/preferredRiskBasisStore';
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
      preparedRiskReferences: {
        entryPrice: 100,
        stopPrice: 95,
        targetPrice: 112,
      },
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

  function mockUpstreamContext(
    overrides: {
      btcEvent?: MarketEvent;
      ethEvent?: MarketEvent;
      marketEvents?: MarketEvent[];
      latestRelevantEvent?: MarketEvent;
    } = {},
  ) {
    const btcEvent = overrides.btcEvent ?? createEvent();
    const ethEvent =
      overrides.ethEvent ??
      createEvent({
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
    const marketEvents = overrides.marketEvents ?? [btcEvent, ethEvent];
    const latestRelevantEvent = overrides.latestRelevantEvent ?? btcEvent;

    mockFetchSurfaceContext.mockResolvedValue({
      selectedAccountContext: {
        status: 'AVAILABLE',
        account: {
          accountId: 'acct-live',
          displayName: 'Live account',
          selectionMode: 'PRIMARY_FALLBACK',
          baseCurrency: 'USD',
          strategyId: 'momentum_basics',
        },
      },
      selectedAccountPortfolioValue: 10_000,
      aggregatePortfolioContext: {
        status: 'UNAVAILABLE',
        reason: 'NOT_ENABLED_FOR_SURFACE',
      },
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
      marketEvents,
      eventStream: {
        accountId: 'acct-live',
        timestamp: 200,
        events: marketEvents,
      },
      orientationContext: {
        accountId: 'acct-live',
        symbol: 'BTC',
        strategyId: 'momentum_basics',
        currentState: {
          latestRelevantEvent,
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
      preparedRiskReferences: {
        entryPrice: 100,
        stopPrice: 95,
        targetPrice: 112,
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
        risk: {
          activeBasis: 'ACCOUNT_PERCENT',
          activeBasisLabel: 'Account %',
          basisAvailability: {
            status: 'AVAILABLE',
            selectedBasis: 'ACCOUNT_PERCENT',
            options: [
              {
                basis: 'ACCOUNT_PERCENT',
                label: 'Account %',
                isSelected: true,
              },
              {
                basis: 'FIXED_CURRENCY',
                label: 'Fixed currency',
                isSelected: false,
              },
              {
                basis: 'POSITION_PERCENT',
                label: 'Position %',
                isSelected: false,
              },
            ],
          },
          context: {
            status: 'AVAILABLE',
            basis: 'ACCOUNT_PERCENT',
            headline: 'Account % risk frame',
            summary:
              'Shows the capped loss from this prepared plan as a share of current account value using prepared references only.',
            items: [
              {
                label: 'Risk per trade',
                value: '0.50%',
              },
              {
                label: 'Max loss at cap',
                value: '$50.00',
              },
              {
                label: 'Position cap used',
                value: '10.00%',
              },
              {
                label: 'Prepared price path',
                value: '$100.00 entry to $95.00 stop',
              },
            ],
          },
        },
        positionSizing: {
          status: 'AVAILABLE',
          output: {
            sizeLabel: 'Position size (Account %)',
            sizeValue: '10 units at $1,000.00 cap',
            maxLossLabel: 'Max loss at stop',
            maxLossValue: '$50.00',
            notes: [
              'Prepared entry $100.00 to stop $95.00.',
              'Support-only readout; no order path is opened here.',
            ],
          },
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
            acknowledgementLabel: undefined,
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

  it('carries explicit prepared stop and target references from the plan producer without leaking metadata', async () => {
    const preparedEvent = createEvent({
      metadata: {
        hidden: true,
        preparedRiskReferences: {
          entryPrice: 101,
          stopPrice: 95,
          targetPrice: 112,
        },
        providerNote: 'do-not-leak',
      },
    });

    mockUpstreamContext({
      btcEvent: preparedEvent,
      marketEvents: [preparedEvent],
      latestRelevantEvent: preparedEvent,
    });

    const result = await fetchConfirmationSessionVM({
      profile: 'ADVANCED',
    });

    expect(result.session.preparedRiskReferences).toEqual({
      entryPrice: 101,
      stopPrice: 95,
      targetPrice: 112,
    });
    expect(JSON.stringify(result.session)).not.toContain('providerNote');
    expect(JSON.stringify(result.session)).not.toContain('do-not-leak');
  });

  it('carries strategy-owned prepared stop and target references through the selected session without leaking internals', async () => {
    const momentumEvent = createEvent({
      eventId: 'acct-live:momentum_basics:signal:BTC:140',
      timestamp: 140,
      price: 104,
      pctChange: 0.04,
      metadata: {
        hidden: true,
        relatedSymbols: ['BTC'],
        strategyPreparedRiskContext: {
          stopPrice: {
            basis: 'BASELINE_PRICE',
          },
        },
        runtimeNote: 'do-not-leak',
      },
    });

    mockUpstreamContext({
      btcEvent: momentumEvent,
      marketEvents: [momentumEvent],
      latestRelevantEvent: momentumEvent,
    });

    const result = await fetchConfirmationSessionVM({
      profile: 'ADVANCED',
    });

    expect(result.session.preparedRiskReferences).toEqual({
      entryPrice: 104,
      stopPrice: 100,
      targetPrice: null,
    });
    expect(JSON.stringify(result.session)).not.toContain('strategyPreparedRiskContext');
    expect(JSON.stringify(result.session)).not.toContain('runtimeNote');
    expect(JSON.stringify(result.session)).not.toContain('do-not-leak');
  });

  it('keeps risk and execution support scoped to the selected account even when another-account plan id is requested', async () => {
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

    expect(switched).toEqual({
      planId: null,
      accountId: null,
      executionCapability: null,
      preparedRiskReferences: null,
      preview: null,
      shell: null,
      flow: null,
    });
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
      preparedRiskReferences: null,
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

  it('changes the prepared risk frame without changing execution capability or default blocking posture', async () => {
    mockUpstreamContext();
    const preferredRiskBasisStore = createInMemoryPreferredRiskBasisStore([
      {
        accountId: 'acct-live',
        riskBasis: 'ACCOUNT_PERCENT',
      },
    ]);

    const accountPercentSession = await fetchConfirmationSessionVM({
      profile: 'ADVANCED',
      selectedRiskBasis: 'ACCOUNT_PERCENT',
      preferredRiskBasisStore,
    });
    const fixedCurrencySession = await fetchConfirmationSessionVM({
      profile: 'ADVANCED',
      selectedRiskBasis: 'FIXED_CURRENCY',
      preferredRiskBasisStore,
    });

    expect(fixedCurrencySession.session.executionCapability).toEqual(
      accountPercentSession.session.executionCapability,
    );
    expect(fixedCurrencySession.session.flow).toEqual(accountPercentSession.session.flow);
    expect(fixedCurrencySession.session.preview?.risk.activeBasis).toBe('FIXED_CURRENCY');
    expect(fixedCurrencySession.session.preview?.risk.context?.items[0]).toEqual({
      label: 'Risk per trade',
      value: '$50.00',
    });
  });
});
