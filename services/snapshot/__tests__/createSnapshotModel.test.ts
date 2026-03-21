import {
  createSnapshotModel,
  deriveTrendDirection,
  formatCurrentState,
} from '@/services/snapshot/createSnapshotModel';

describe('createSnapshotModel', () => {
  const scan = {
    accountId: 'acct-test',
    symbols: ['BTC', 'ETH', 'SOL', 'DOGE'],
    quotes: {
      BTC: {
        symbol: 'BTC',
        price: 100,
        source: 'stub',
        timestampMs: 1,
        estimated: false,
      },
      ETH: {
        symbol: 'ETH',
        price: 200,
        source: 'stub',
        timestampMs: 1,
        estimated: true,
      },
      SOL: {
        symbol: 'SOL',
        price: 300,
        source: 'stub',
        timestampMs: 1,
        estimated: false,
      },
      DOGE: {
        symbol: 'DOGE',
        price: 400,
        source: 'stub',
        timestampMs: 1,
        estimated: false,
      },
    },
    baselineQuotes: undefined,
    pctChangeBySymbol: {
      BTC: 0.01,
      ETH: -0.04,
      SOL: 0.08,
      DOGE: -0.02,
    },
    estimatedFlags: {
      BTC: false,
      ETH: true,
      SOL: false,
      DOGE: false,
    },
    instrumentation: {
      requests: 1,
      symbolsRequested: 4,
      symbolsFetched: 4,
      symbolsBlocked: 0,
    },
  };

  it('builds the canonical Snapshot core from deterministic inputs', () => {
    const model = createSnapshotModel({
      profile: 'ADVANCED',
      scan,
      bundleName: 'Calm Starter',
      portfolioValue: 1_000,
      change24h: 0.0075,
      strategyAlignment: 'Watchful',
      sinceLastChecked: {
        sinceTimestamp: 1,
        accountId: 'acct-test',
        events: [],
        summaryCount: 0,
      },
    });

    expect(model.core).toEqual({
      currentState: {
        label: 'Current State',
        value: 'Up',
        trendDirection: 'UP',
      },
      change24h: {
        label: 'Last 24h Change',
        value: 0.0075,
      },
      strategyStatus: {
        label: 'Strategy Status',
        value: 'Watchful',
      },
    });
    expect(model.secondary).toEqual({
      bundleName: 'Calm Starter',
      portfolioValue: 1_000,
    });
    expect(model.history).toEqual({
      hasNewSinceLastCheck: false,
    });
  });

  it('keeps trend direction derivation deterministic at each boundary', () => {
    expect(deriveTrendDirection(0.01)).toBe('UP');
    expect(deriveTrendDirection(-0.01)).toBe('DOWN');
    expect(deriveTrendDirection(0)).toBe('FLAT');
    expect(formatCurrentState('UP')).toBe('Up');
    expect(formatCurrentState('DOWN')).toBe('Down');
    expect(formatCurrentState('FLAT')).toBe('Flat');
  });
});
