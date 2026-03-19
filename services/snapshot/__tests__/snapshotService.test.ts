import { DEFAULT_USER_PROFILE } from '@/app/state/profileState';
import type { StrategySignal } from '@/core/strategy/types';
import { createEventLedgerService } from '@/services/events/eventLedgerService';
import { createInMemoryLastViewedState } from '@/services/orientation/lastViewedState';
import { runForegroundScan } from '@/services/scan/foregroundScanService';
import { fetchSnapshotVM, formatAlignmentState } from '@/services/snapshot/snapshotService';
import { resolveActiveStrategies } from '@/services/strategy/activeStrategiesService';
import { runStrategies } from '@/services/strategy/runStrategiesService';

jest.mock('@/services/scan/foregroundScanService');
jest.mock('@/services/strategy/activeStrategiesService');
jest.mock('@/services/strategy/runStrategiesService');

describe('snapshotService market event integration', () => {
  const mockRunForegroundScan = jest.mocked(runForegroundScan);
  const mockResolveActiveStrategies = jest.mocked(resolveActiveStrategies);
  const mockRunStrategies = jest.mocked(runStrategies);

  beforeEach(() => {
    jest.resetAllMocks();

    mockRunForegroundScan.mockResolvedValue({
      accountId: 'acct-test',
      symbols: ['AAPL', 'MSFT'],
      quotes: {
        AAPL: {
          symbol: 'AAPL',
          price: 100,
          source: 'stub',
          timestampMs: 1_700_000_000_000,
          estimated: false,
        },
        MSFT: {
          symbol: 'MSFT',
          price: 200,
          source: 'stub',
          timestampMs: 1_700_000_000_000,
          estimated: true,
        },
      },
      baselineQuotes: undefined,
      pctChangeBySymbol: { AAPL: 0.05, MSFT: -0.02 },
      estimatedFlags: { AAPL: false, MSFT: true },
      instrumentation: {
        requests: 1,
        symbolsRequested: 2,
        symbolsFetched: 2,
        symbolsBlocked: 0,
      },
      quoteMeta: {
        provider: 'broker:live',
        fallbackUsed: false,
        requestedSymbols: ['AAPL', 'MSFT'],
        returnedSymbols: ['AAPL', 'MSFT'],
        missingSymbols: [],
        timestampMs: 1_700_000_000_000,
        providersTried: ['broker:live'],
        sourceBySymbol: {
          AAPL: 'stub',
          MSFT: 'stub',
        },
      },
    });
    mockResolveActiveStrategies.mockReturnValue([]);
  });

  it('turns strategy signals into first-class market events and event stream output', async () => {
    const ledger = createEventLedgerService();
    const signals: StrategySignal[] = [
      {
        strategyId: 'data_quality',
        signalCode: 'estimated_quote',
        symbol: 'MSFT',
        severity: 'INFO',
        title: 'Estimated quote',
        message: 'Price may be delayed or inferred.',
        timestampMs: 1_700_000_000_005,
        tags: ['data', 'estimated'],
        eventHint: {
          eventType: 'ESTIMATED_PRICE',
          alignmentState: 'WATCHFUL',
          confidenceScore: 0.8,
          relatedSymbols: ['MSFT'],
        },
      },
      {
        strategyId: 'data_quality',
        signalCode: 'budget_blocked_symbols',
        severity: 'WATCH',
        title: 'Scan incomplete',
        message: '1 symbols were blocked by quote budget limits, so some quotes may be missing.',
        timestampMs: 1_700_000_000_001,
        tags: ['data', 'budget'],
        eventHint: {
          eventType: 'DATA_QUALITY',
          alignmentState: 'NEEDS_REVIEW',
          confidenceScore: 0.98,
          relatedSymbols: ['AAPL'],
        },
      },
    ];
    mockRunStrategies.mockReturnValue(signals);

    const result = await fetchSnapshotVM({
      profile: DEFAULT_USER_PROFILE,
      nowProvider: () => 1_700_000_000_100,
      eventLedger: ledger,
    });

    expect(result.marketEvents).toHaveLength(2);
    expect(result.marketEvents[0]).toEqual(
      expect.objectContaining({
        accountId: 'acct-test',
        symbol: 'MSFT',
        certainty: 'estimated',
        eventType: 'ESTIMATED_PRICE',
      }),
    );
    expect(result.eventStream.events.map((event) => event.eventId)).toEqual([
      'acct-test:data_quality:budget_blocked_symbols:AAPL:1700000000001',
      'acct-test:data_quality:estimated_quote:MSFT:1700000000005',
    ]);
    expect(ledger.getEventsByAccount('acct-test').map((event) => event.eventId)).toEqual(
      result.eventStream.events.map((event) => event.eventId),
    );
    expect(result.strategyAlignment).toBe('Needs review');
    expect(result.snapshotModel).toEqual({
      core: {
        currentState: {
          price: 200,
          pctChange24h: -0.02,
          certainty: 'estimated',
        },
        strategyStatus: {
          alignmentState: 'Needs review',
          latestEventType: 'ESTIMATED_PRICE',
          trendDirection: 'weakening',
        },
      },
      secondary: {},
      history: {
        hasMeaningfulChanges: false,
        eventsSinceLastViewedCount: 0,
        sinceLastCheckedSummaryCount: null,
      },
    });
    expect(result.orientationContext.currentState.latestRelevantEvent).toEqual(
      result.eventStream.events[1],
    );
    expect(result.orientationContext.historyContext.eventsSinceLastViewed).toEqual([]);
  });

  it('includes ledger comparison details in debug observatory payload when enabled', async () => {
    const ledger = createEventLedgerService();
    mockRunStrategies.mockReturnValue([
      {
        strategyId: 'data_quality',
        signalCode: 'estimated_quote',
        symbol: 'MSFT',
        severity: 'INFO',
        title: 'Estimated quote',
        message: 'Price may be delayed or inferred.',
        timestampMs: 1_700_000_000_005,
        tags: ['data', 'estimated'],
        eventHint: {
          eventType: 'ESTIMATED_PRICE',
          alignmentState: 'WATCHFUL',
          confidenceScore: 0.8,
          relatedSymbols: ['MSFT'],
        },
      },
    ]);

    const result = await fetchSnapshotVM({
      profile: DEFAULT_USER_PROFILE,
      nowProvider: () => 1_700_000_000_100,
      includeDebugObservatory: true,
      eventLedger: ledger,
    });

    expect(result.debugObservatory?.eventLedger).toEqual(
      expect.objectContaining({
        countsMatch: true,
        sequencesMatch: true,
      }),
    );
  });

  it('can expose since-last-viewed ledger entries for snapshot-adjacent orchestration', async () => {
    const ledger = createEventLedgerService([
      {
        eventId: 'acct-test:data_quality:earlier:AAPL:1700000000000',
        timestamp: 1_700_000_000_000,
        accountId: 'acct-test',
        symbol: 'AAPL',
        strategyId: 'data_quality',
        eventType: 'DATA_QUALITY',
        alignmentState: 'WATCHFUL',
        signalsTriggered: ['earlier'],
        confidenceScore: 0.8,
        certainty: 'confirmed',
        price: 100,
        pctChange: 0.01,
        metadata: {},
      },
    ]);
    mockRunStrategies.mockReturnValue([
      {
        strategyId: 'data_quality',
        signalCode: 'estimated_quote',
        symbol: 'MSFT',
        severity: 'INFO',
        title: 'Estimated quote',
        message: 'Price may be delayed or inferred.',
        timestampMs: 1_700_000_000_005,
        tags: ['data', 'estimated'],
        eventHint: {
          eventType: 'ESTIMATED_PRICE',
          alignmentState: 'WATCHFUL',
          confidenceScore: 0.8,
          relatedSymbols: ['MSFT'],
        },
      },
    ]);

    const result = await fetchSnapshotVM({
      profile: DEFAULT_USER_PROFILE,
      nowProvider: () => 1_700_000_000_100,
      eventLedger: ledger,
      lastViewedTimestamp: 1_700_000_000_001,
    });

    expect(result.eventsSinceLastViewed?.map((event) => event.eventId)).toEqual([
      'acct-test:data_quality:estimated_quote:MSFT:1700000000005',
    ]);
    expect(result.sinceLastChecked).toEqual({
      sinceTimestamp: 1_700_000_000_001,
      accountId: 'acct-test',
      events: result.eventsSinceLastViewed,
      summaryCount: 1,
    });
    expect(result.snapshotModel.history).toEqual({
      hasMeaningfulChanges: true,
      eventsSinceLastViewedCount: 1,
      sinceLastCheckedSummaryCount: 1,
    });
    expect(result.orientationContext.historyContext.eventsSinceLastViewed).toEqual(
      result.eventsSinceLastViewed,
    );
    expect(result.orientationContext.historyContext.sinceLastChecked).toEqual(result.sinceLastChecked);
  });

  it('can resolve last-viewed history through the dedicated lastViewedState boundary', async () => {
    const ledger = createEventLedgerService([
      {
        eventId: 'acct-test:data_quality:earlier:AAPL:1700000000000',
        timestamp: 1_700_000_000_000,
        accountId: 'acct-test',
        symbol: 'AAPL',
        strategyId: 'data_quality',
        eventType: 'DATA_QUALITY',
        alignmentState: 'WATCHFUL',
        signalsTriggered: ['earlier'],
        confidenceScore: 0.8,
        certainty: 'confirmed',
        price: 100,
        pctChange: 0.01,
        metadata: {},
      },
    ]);
    const lastViewedState = createInMemoryLastViewedState([
      {
        surfaceId: 'snapshot',
        accountId: 'acct-test',
        timestamp: 1_700_000_000_001,
      },
    ]);
    mockRunStrategies.mockReturnValue([
      {
        strategyId: 'data_quality',
        signalCode: 'estimated_quote',
        symbol: 'MSFT',
        severity: 'INFO',
        title: 'Estimated quote',
        message: 'Price may be delayed or inferred.',
        timestampMs: 1_700_000_000_005,
        tags: ['data', 'estimated'],
        eventHint: {
          eventType: 'ESTIMATED_PRICE',
          alignmentState: 'WATCHFUL',
          confidenceScore: 0.8,
          relatedSymbols: ['MSFT'],
        },
      },
    ]);

    const result = await fetchSnapshotVM({
      profile: DEFAULT_USER_PROFILE,
      nowProvider: () => 1_700_000_000_100,
      eventLedger: ledger,
      lastViewedState,
    });

    expect(result.sinceLastChecked).toEqual({
      sinceTimestamp: 1_700_000_000_001,
      accountId: 'acct-test',
      events: result.eventsSinceLastViewed,
      summaryCount: 1,
    });
  });

  it('formats alignment labels for UI-facing layers', () => {
    expect(formatAlignmentState('ALIGNED')).toBe('Aligned');
    expect(formatAlignmentState('WATCHFUL')).toBe('Watchful');
    expect(formatAlignmentState('NEEDS_REVIEW')).toBe('Needs review');
  });
});
