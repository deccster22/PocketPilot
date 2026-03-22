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

  it('preserves the dashboard surface contract for app consumers', async () => {
    mockFetchDashboardData.mockResolvedValue({
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
          provider: 'broker:live',
          fallbackUsed: false,
          requestedSymbols: ['BTC'],
          returnedSymbols: ['BTC'],
          missingSymbols: [],
          timestampMs: 1_700_000_000_000,
          providersTried: ['broker:live'],
          sourceBySymbol: { BTC: 'stub' },
        },
      },
      orientationContext: {
        profile: 'ADVANCED',
        assets: [],
      },
      events: [createEvent()],
    });

    const result = await fetchDashboardSurfaceVM({ profile: 'ADVANCED' });

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
