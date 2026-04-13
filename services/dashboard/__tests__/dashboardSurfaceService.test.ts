import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { MarketEvent } from '@/core/types/marketEvent';
import { fetchDashboardData } from '@/services/dashboard/dashboardDataService';
import { fetchDashboardSurfaceVM } from '@/services/dashboard/dashboardSurfaceService';

jest.mock('@/services/dashboard/dashboardDataService');

function createEvent(overrides: Partial<MarketEvent> = {}): MarketEvent {
  return {
    eventId: 'acct-live:strategy-a:signal:BTC:100',
    timestamp: 100,
    accountId: 'acct-live',
    symbol: 'BTC',
    strategyId: 'strategy-a',
    eventType: 'MOMENTUM_BUILDING',
    alignmentState: 'WATCHFUL',
    signalsTriggered: ['signal'],
    confidenceScore: 0.8,
    certainty: 'confirmed',
    price: 100,
    pctChange: 0.03,
    metadata: {
      hidden: true,
    },
    ...overrides,
  };
}

describe('fetchDashboardSurfaceVM', () => {
  const mockFetchDashboardData = jest.mocked(fetchDashboardData);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('preserves the dashboard surface contract for app consumers and adds one prepared why note', async () => {
    const event = createEvent();

    mockFetchDashboardData.mockResolvedValue({
      accountContext: {
        status: 'AVAILABLE',
        account: {
          accountId: 'acct-live',
          displayName: 'Live account',
          selectionMode: 'PRIMARY_FALLBACK',
          baseCurrency: 'USD',
          strategyId: 'strategy-a',
        },
      },
      aggregatePortfolioContext: {
        status: 'AVAILABLE',
        portfolio: {
          totalValue: 16_500,
          currency: 'USD',
          accountCount: 3,
          assets: [
            {
              symbol: 'BTC',
              amount: 0.17,
              value: 10_200,
              weightPct: 61.81818181818181,
            },
          ],
        },
      },
      scan: {
        accountId: 'acct-live',
        symbols: ['BTC'],
        quotes: {
          BTC: {
            symbol: 'BTC',
            price: 100,
            source: 'stub',
            timestampMs: 1_700_000_000_000,
            estimated: false,
          },
        },
        baselineQuotes: undefined,
        pctChangeBySymbol: { BTC: 0.03 },
        estimatedFlags: { BTC: false },
        instrumentation: {
          requests: 1,
          symbolsRequested: 1,
          symbolsFetched: 1,
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
          requestedSymbols: ['BTC'],
          returnedSymbols: ['BTC'],
          missingSymbols: [],
          timestampMs: 1_700_000_000_000,
          providersTried: ['broker:live'],
          sourceBySymbol: { BTC: 'stub' },
          coalescedRequest: false,
          policyStateBySymbol: { BTC: 'FRESH' },
          providerHealthSummary: {
            'broker:live': {
              providerId: 'broker:live',
              requests: 1,
              symbolsRequested: 1,
              symbolsFetched: 1,
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
      orientationContext: {
        profile: 'ADVANCED',
        assets: [],
      },
      explanationContext: {
        accountId: 'acct-live',
        symbol: 'BTC',
        strategyId: 'strategy-a',
        currentState: {
          latestRelevantEvent: event,
          strategyAlignment: 'Watchful',
          certainty: 'confirmed',
        },
        historyContext: {
          eventsSinceLastViewed: [event],
          sinceLastChecked: {
            sinceTimestamp: 90,
            accountId: 'acct-live',
            summaryCount: 1,
            events: [event],
          },
        },
      },
      events: [event],
    });

    const result = await fetchDashboardSurfaceVM({ profile: 'ADVANCED' });

    expect(result.accountContext).toEqual({
      status: 'AVAILABLE',
      account: {
        accountId: 'acct-live',
        displayName: 'Live account',
        selectionMode: 'PRIMARY_FALLBACK',
        baseCurrency: 'USD',
        strategyId: 'strategy-a',
      },
    });
    expect(result.aggregatePortfolioContext).toEqual({
      status: 'AVAILABLE',
      portfolio: {
        totalValue: 16_500,
        currency: 'USD',
        accountCount: 3,
        assets: [
          {
            symbol: 'BTC',
            amount: 0.17,
            value: 10_200,
            weightPct: 61.81818181818181,
          },
        ],
      },
    });
    expect(result.scan.accountId).toBe('acct-live');
    expect(result.model).toEqual({
      primeZone: {
        items: [
          {
            symbol: 'BTC',
            accountId: 'acct-live',
            strategyId: 'strategy-a',
            eventType: 'MOMENTUM_BUILDING',
            alignmentState: 'WATCHFUL',
            trendDirection: 'strengthening',
            certainty: 'confirmed',
            timestamp: 100,
          },
        ],
      },
      secondaryZone: {
        items: [],
      },
      deepZone: {
        items: [],
      },
      meta: {
        profile: 'ADVANCED',
        hasPrimeItems: true,
        hasSecondaryItems: false,
        hasDeepItems: false,
      },
    });
    expect(result.model.primeZone.items[0]).not.toHaveProperty('signalsTriggered');
    expect(result.model.primeZone.items[0]).not.toHaveProperty('metadata');
    expect(result.contextualKnowledgeLane).toMatchObject({
      availability: {
        status: 'AVAILABLE',
        surface: 'DASHBOARD',
      },
    });
    expect(result.contextualKnowledgeLane.linkage).toEqual({
      selectedTopicIds: ['strategy-momentum-pulse', 'pp-what-dashboard-is-for'],
      selectionReason: 'MIXED',
    });
    expect(result.contextualKnowledgeLane.topics).toHaveLength(1);
    expect(result.contextualKnowledgeLane.topics[0].reason).toEqual(expect.any(String));
    expect(result.explanation).toMatchObject({
      status: 'AVAILABLE',
      explanation: {
        title: 'Why BTC is in focus',
      },
    });

    const serialized = JSON.stringify(result.explanation);

    expect(serialized).not.toMatch(/signalsTriggered|metadata|eventId|providerId/);
  });

  it('keeps Dashboard account-scoped when upstream data contains other-account events', async () => {
    const selectedAccountEvent = createEvent();
    const otherAccountEvent = createEvent({
      eventId: 'acct-basic:strategy-b:signal:ETH:300',
      timestamp: 300,
      accountId: 'acct-basic',
      symbol: 'ETH',
      strategyId: 'strategy-b',
      eventType: 'PRICE_MOVEMENT',
      alignmentState: 'NEEDS_REVIEW',
      pctChange: -0.08,
    });

    mockFetchDashboardData.mockResolvedValue({
      accountContext: {
        status: 'AVAILABLE',
        account: {
          accountId: 'acct-live',
          displayName: 'Live account',
          selectionMode: 'PRIMARY_FALLBACK',
          baseCurrency: 'USD',
          strategyId: 'strategy-a',
        },
      },
      aggregatePortfolioContext: {
        status: 'AVAILABLE',
        portfolio: {
          totalValue: 16_500,
          currency: 'USD',
          accountCount: 3,
          assets: [
            {
              symbol: 'BTC',
              amount: 0.17,
              value: 10_200,
              weightPct: 61.81818181818181,
            },
          ],
        },
      },
      scan: {
        accountId: 'acct-live',
      } as never,
      orientationContext: {
        profile: 'ADVANCED',
        assets: [],
      },
      explanationContext: {
        accountId: 'acct-live',
        currentState: {
          latestRelevantEvent: selectedAccountEvent,
          strategyAlignment: 'Watchful',
          certainty: 'confirmed',
        },
        historyContext: {
          eventsSinceLastViewed: [otherAccountEvent, selectedAccountEvent],
          sinceLastChecked: {
            sinceTimestamp: 90,
            accountId: 'acct-live',
            summaryCount: 2,
            events: [otherAccountEvent, selectedAccountEvent],
          },
        },
      },
      events: [otherAccountEvent, selectedAccountEvent],
    });

    const result = await fetchDashboardSurfaceVM({ profile: 'ADVANCED' });

    expect(result.model.primeZone.items).toEqual([
      expect.objectContaining({
        accountId: 'acct-live',
        symbol: 'BTC',
      }),
    ]);
    expect(JSON.stringify(result.model)).not.toContain('acct-basic');
  });

  it('keeps Dashboard account-scoped after the selected account changes explicitly', async () => {
    const switchedAccountEvent = createEvent({
      eventId: 'acct-basic:strategy-b:signal:ETH:300',
      timestamp: 300,
      accountId: 'acct-basic',
      symbol: 'ETH',
      strategyId: 'strategy-b',
      eventType: 'PRICE_MOVEMENT',
      alignmentState: 'NEEDS_REVIEW',
      pctChange: -0.08,
    });
    const otherAccountEvent = createEvent();

    mockFetchDashboardData.mockResolvedValue({
      accountContext: {
        status: 'AVAILABLE',
        account: {
          accountId: 'acct-basic',
          displayName: 'Basic account',
          selectionMode: 'EXPLICIT',
          baseCurrency: 'USD',
          strategyId: 'strategy-b',
        },
      },
      aggregatePortfolioContext: {
        status: 'AVAILABLE',
        portfolio: {
          totalValue: 16_500,
          currency: 'USD',
          accountCount: 3,
          assets: [
            {
              symbol: 'BTC',
              amount: 0.17,
              value: 10_200,
              weightPct: 61.81818181818181,
            },
          ],
        },
      },
      scan: {
        accountId: 'acct-basic',
      } as never,
      orientationContext: {
        profile: 'ADVANCED',
        assets: [],
      },
      explanationContext: {
        accountId: 'acct-basic',
        currentState: {
          latestRelevantEvent: switchedAccountEvent,
          strategyAlignment: 'Needs review',
          certainty: 'confirmed',
        },
        historyContext: {
          eventsSinceLastViewed: [otherAccountEvent, switchedAccountEvent],
          sinceLastChecked: {
            sinceTimestamp: 90,
            accountId: 'acct-basic',
            summaryCount: 2,
            events: [otherAccountEvent, switchedAccountEvent],
          },
        },
      },
      events: [otherAccountEvent, switchedAccountEvent],
    });

    const result = await fetchDashboardSurfaceVM({ profile: 'ADVANCED' });

    expect(result.accountContext).toMatchObject({
      status: 'AVAILABLE',
      account: {
        accountId: 'acct-basic',
        selectionMode: 'EXPLICIT',
      },
    });
    expect(result.model.primeZone.items).toEqual([
      expect.objectContaining({
        accountId: 'acct-basic',
        symbol: 'ETH',
      }),
    ]);
    expect(JSON.stringify(result.model)).not.toContain('acct-live');
  });

  it('keeps dashboard decoupled from snapshot service flow', () => {
    const serviceSource = readFileSync(
      join(process.cwd(), 'services', 'dashboard', 'dashboardSurfaceService.ts'),
      'utf8',
    );

    expect(serviceSource).not.toMatch(/fetchSnapshotVM/);
    expect(serviceSource).not.toMatch(/snapshotService/);
  });
});
