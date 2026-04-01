import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { MarketEvent } from '@/core/types/marketEvent';
import { getAccountCapabilities } from '@/services/trade/getAccountCapabilities';
import { fetchTradePlanConfirmationVM } from '@/services/trade/fetchTradePlanConfirmationVM';
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

describe('fetchTradePlanConfirmationVM', () => {
  const mockFetchSurfaceContext = jest.mocked(fetchSurfaceContext);
  const mockGetAccountCapabilities = jest.mocked(getAccountCapabilities);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('resolves the selected plan and shapes a capability-aware confirmation shell', async () => {
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
          policy: {
            staleIfError: 'NOT_NEEDED',
            staleWhileRevalidate: 'NOT_IMPLEMENTED_FOREGROUND_ONLY',
            cooldown: 'INACTIVE',
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
    mockGetAccountCapabilities.mockResolvedValue({
      accountId: 'acct-live',
      brokerId: 'broker-demo',
      supportsBracketOrders: false,
      supportsOCO: false,
      requiresSeparateOrders: true,
      supportsStopLoss: true,
      supportsTakeProfit: true,
    });

    const result = await fetchTradePlanConfirmationVM({
      profile: 'ADVANCED',
      selectedPlanId:
        'acct-live:momentum_basics:ETH:HOLD:acct-live:momentum_basics:signal:ETH:200',
    });

    expect(mockGetAccountCapabilities).toHaveBeenCalledWith('acct-live');
    expect(result.selectedPlanId).toBe(
      'acct-live:momentum_basics:ETH:HOLD:acct-live:momentum_basics:signal:ETH:200',
    );
    expect(result.confirmationShell).toEqual({
      planId: 'acct-live:momentum_basics:ETH:HOLD:acct-live:momentum_basics:signal:ETH:200',
      headline: {
        intentType: 'HOLD',
        symbol: 'ETH',
        actionState: 'WAIT',
      },
      readiness: {
        alignment: 'NEUTRAL',
        certainty: 'LOW',
      },
      confirmation: {
        requiresConfirmation: true,
        pathType: 'GUIDED_SEQUENCE',
        stepsLabel: 'Review separate order steps',
        executionAvailable: false,
      },
      constraints: {},
      placeholders: {
        orderPayloadAvailable: false,
        executionPreviewAvailable: false,
      },
    });
    expect(JSON.stringify(result.confirmationShell)).not.toContain('hidden-signal');
    expect(JSON.stringify(result.confirmationShell)).not.toContain('hidden');
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
          certainty: 'CONFIRMED',
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
          policy: {
            staleIfError: 'NOT_NEEDED',
            staleWhileRevalidate: 'NOT_IMPLEMENTED_FOREGROUND_ONLY',
            cooldown: 'INACTIVE',
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
    mockGetAccountCapabilities.mockResolvedValue({
      accountId: 'acct-live',
      brokerId: 'broker-demo',
      supportsBracketOrders: true,
      supportsOCO: true,
      requiresSeparateOrders: false,
      supportsStopLoss: true,
      supportsTakeProfit: true,
    });

    const result = await fetchTradePlanConfirmationVM({
      profile: 'ADVANCED',
    });

    expect(result.selectedPlanId).toBe(
      'acct-live:momentum_basics:BTC:ACCUMULATE:acct-live:momentum_basics:signal:BTC:100',
    );
    expect(result.confirmationShell?.headline).toEqual({
      intentType: 'ACCUMULATE',
      symbol: 'BTC',
      actionState: 'READY',
    });
    expect(result.confirmationShell?.confirmation.pathType).toBe('BRACKET');
  });

  it('stays decoupled from snapshot and dashboard service paths', () => {
    const serviceSource = readFileSync(
      join(process.cwd(), 'services', 'trade', 'fetchTradePlanConfirmationVM.ts'),
      'utf8',
    );

    expect(serviceSource).not.toMatch(/fetchSnapshotVM/);
    expect(serviceSource).not.toMatch(/snapshotService/);
    expect(serviceSource).not.toMatch(/fetchDashboardSurfaceVM/);
    expect(serviceSource).not.toMatch(/dashboardSurfaceService/);
  });
});
