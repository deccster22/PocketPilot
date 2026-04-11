import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { MarketEvent } from '@/core/types/marketEvent';
import { createInMemoryPreferredRiskBasisStore } from '@/services/trade/preferredRiskBasisStore';
import { fetchTradePlanPreviewVM } from '@/services/trade/fetchTradePlanPreviewVM';
import { fetchSurfaceContext } from '@/services/upstream/fetchSurfaceContext';

jest.mock('@/services/upstream/fetchSurfaceContext');

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

describe('fetchTradePlanPreviewVM', () => {
  const mockFetchSurfaceContext = jest.mocked(fetchSurfaceContext);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('resolves the selected plan preview from shared upstream truth', async () => {
    const btcEvent = createEvent();
    const ethEvent = createEvent({
      eventId: 'acct-live:momentum_basics:signal:ETH:200',
      timestamp: 200,
      symbol: 'ETH',
      eventType: 'PRICE_MOVEMENT',
      alignmentState: 'WATCHFUL',
      certainty: 'estimated',
      metadata: {
        hidden: 'eth',
      },
    });

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
          certainty: 'ESTIMATED',
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

    const result = await fetchTradePlanPreviewVM({
      profile: 'ADVANCED',
      selectedPlanId:
        'acct-live:momentum_basics:ETH:HOLD:acct-live:momentum_basics:signal:ETH:200',
      selectedRiskBasis: 'POSITION_PERCENT',
    });

    expect(result.selectedPlanId).toBe(
      'acct-live:momentum_basics:ETH:HOLD:acct-live:momentum_basics:signal:ETH:200',
    );
    expect(result.preview).toEqual({
      planId: 'acct-live:momentum_basics:ETH:HOLD:acct-live:momentum_basics:signal:ETH:200',
      headline: {
        intentType: 'HOLD',
        symbol: 'ETH',
        actionState: 'WAIT',
      },
      rationale: {
        summary:
          'Hold for now while price movement is monitored without a clearer setup. Keep ETH in view without escalating action.',
        primaryEventId: 'acct-live:momentum_basics:signal:ETH:200',
        supportingEventIds: ['acct-live:momentum_basics:signal:ETH:200'],
        supportingEventCount: 1,
      },
      constraints: {
        requiresConfirmation: true,
      },
      readiness: {
        alignment: 'NEUTRAL',
        certainty: 'LOW',
      },
      placeholders: {
        orderPreviewAvailable: false,
        executionPreviewAvailable: false,
      },
      risk: {
        activeBasis: 'POSITION_PERCENT',
        activeBasisLabel: 'Position %',
        basisAvailability: {
          status: 'AVAILABLE',
          selectedBasis: 'POSITION_PERCENT',
          options: [
            {
              basis: 'ACCOUNT_PERCENT',
              label: 'Account %',
              isSelected: false,
            },
            {
              basis: 'FIXED_CURRENCY',
              label: 'Fixed currency',
              isSelected: false,
            },
            {
              basis: 'POSITION_PERCENT',
              label: 'Position %',
              isSelected: true,
            },
          ],
        },
        context: {
          status: 'UNAVAILABLE',
          basis: 'POSITION_PERCENT',
          headline: 'Position % risk frame unavailable',
          summary:
            'PocketPilot can frame this basis once the prepared plan carries an explicit position cap.',
          items: [
            {
              label: 'Needed',
              value: 'A prepared position cap from the current plan',
            },
          ],
          reason: 'MISSING_POSITION_CAP',
        },
      },
    });
    expect(JSON.stringify(result.preview)).not.toContain('hidden-signal');
    expect(JSON.stringify(result.preview)).not.toContain('hidden');
  });

  it('selects the primary plan deterministically when no explicit plan is provided', async () => {
    const btcEvent = createEvent();
    const solEvent = createEvent({
      eventId: 'acct-live:momentum_basics:signal:SOL:050',
      timestamp: 50,
      symbol: 'SOL',
      eventType: 'ESTIMATED_PRICE',
      alignmentState: 'WATCHFUL',
      certainty: 'estimated',
    });

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
        symbols: ['BTC', 'SOL'],
        quotes: {
          BTC: {
            symbol: 'BTC',
            price: 100,
            source: 'stub',
            timestampMs: 1_700_000_000_000,
            estimated: false,
          },
          SOL: {
            symbol: 'SOL',
            price: 50,
            source: 'stub',
            timestampMs: 1_700_000_000_100,
            estimated: true,
          },
        },
        baselineQuotes: undefined,
        pctChangeBySymbol: { BTC: 0.04, SOL: -0.02 },
        estimatedFlags: { BTC: false, SOL: true },
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
          certainty: 'ESTIMATED',
          lastUpdatedAt: '2023-11-14T22:13:20.000Z',
          lastGoodAt: null,
          usedLastGood: false,
          fallbackUsed: false,
          requestedSymbols: ['BTC', 'SOL'],
          returnedSymbols: ['BTC', 'SOL'],
          missingSymbols: [],
          timestampMs: 1_700_000_000_000,
          providersTried: ['broker:live'],
          sourceBySymbol: { BTC: 'stub', SOL: 'stub' },
          coalescedRequest: false,
          policyStateBySymbol: { BTC: 'FRESH', SOL: 'FRESH' },
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
      marketEvents: [solEvent, btcEvent],
      eventStream: {
        accountId: 'acct-live',
        timestamp: 100,
        events: [solEvent, btcEvent],
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

    const result = await fetchTradePlanPreviewVM({
      profile: 'ADVANCED',
      preferredRiskBasisStore: createInMemoryPreferredRiskBasisStore([
        {
          accountId: 'acct-live',
          riskBasis: 'POSITION_PERCENT',
        },
      ]),
    });

    expect(result.selectedPlanId).toBe(
      'acct-live:momentum_basics:BTC:ACCUMULATE:acct-live:momentum_basics:signal:BTC:100',
    );
    expect(result.preview?.headline).toEqual({
      intentType: 'ACCUMULATE',
      symbol: 'BTC',
      actionState: 'READY',
    });
    expect(result.preview?.risk.activeBasis).toBe('POSITION_PERCENT');
    expect(result.preview?.risk.context).toEqual({
      status: 'AVAILABLE',
      basis: 'POSITION_PERCENT',
      headline: 'Position % risk frame',
      summary:
        'Shows the capped loss from this prepared plan as a share of the capped position value using prepared references only.',
      items: [
        {
          label: 'Risk per trade',
          value: '5.00%',
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
    });
  });

  it('stays decoupled from snapshot and dashboard service paths', () => {
    const serviceSource = readFileSync(
      join(process.cwd(), 'services', 'trade', 'fetchTradePlanPreviewVM.ts'),
      'utf8',
    );

    expect(serviceSource).not.toMatch(/fetchSnapshotVM/);
    expect(serviceSource).not.toMatch(/snapshotService/);
    expect(serviceSource).not.toMatch(/fetchDashboardSurfaceVM/);
    expect(serviceSource).not.toMatch(/dashboardSurfaceService/);
  });
});
