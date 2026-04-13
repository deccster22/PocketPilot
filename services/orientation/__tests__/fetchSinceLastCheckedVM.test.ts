import type { EventLedgerEntry } from '@/core/types/eventLedger';
import { fetchSinceLastCheckedVM } from '@/services/orientation/fetchSinceLastCheckedVM';
import { fetchSnapshotVM } from '@/services/snapshot/snapshotService';
import type { SnapshotVM } from '@/services/snapshot/snapshotService';

jest.mock('@/services/snapshot/snapshotService');

function createEvent(params: {
  accountId: string;
  eventId: string;
  eventType: 'DATA_QUALITY' | 'ESTIMATED_PRICE' | 'MOMENTUM_BUILDING' | 'DIP_DETECTED';
  symbol?: string;
  timestamp: number;
}): EventLedgerEntry {
  return {
    eventId: params.eventId,
    timestamp: params.timestamp,
    accountId: params.accountId,
    symbol: params.symbol ?? null,
    strategyId: 'data_quality',
    eventType: params.eventType,
    alignmentState: 'WATCHFUL',
    signalsTriggered: ['signal'],
    confidenceScore: 0.9,
    certainty: 'confirmed',
    price: 100,
    pctChange: 0.03,
    metadata: {},
  };
}

function createSnapshot(): Pick<SnapshotVM, 'model' | 'orientationContext'> {
  return {
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
    orientationContext: {
      accountId: 'acct-1',
      currentState: {
        latestRelevantEvent: null,
        strategyAlignment: 'WATCHFUL',
        certainty: null,
      },
      historyContext: {
        eventsSinceLastViewed: [
          createEvent({
            accountId: 'acct-1',
            eventId: 'acct-1:data_quality:1',
            eventType: 'DATA_QUALITY',
            symbol: 'BTC',
            timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
          }),
          createEvent({
            accountId: 'acct-1',
            eventId: 'acct-1:estimated_price:2',
            eventType: 'ESTIMATED_PRICE',
            symbol: 'ETH',
            timestamp: Date.parse('2026-03-21T00:00:00.000Z'),
          }),
          createEvent({
            accountId: 'acct-1',
            eventId: 'acct-1:momentum:3',
            eventType: 'MOMENTUM_BUILDING',
            symbol: 'SOL',
            timestamp: Date.parse('2026-03-22T00:00:00.000Z'),
          }),
          createEvent({
            accountId: 'acct-1',
            eventId: 'acct-1:dip:4',
            eventType: 'DIP_DETECTED',
            symbol: 'DOGE',
            timestamp: Date.parse('2026-03-23T00:00:00.000Z'),
          }),
          createEvent({
            accountId: 'acct-2',
            eventId: 'acct-2:dip:5',
            eventType: 'DIP_DETECTED',
            symbol: 'XRP',
            timestamp: Date.parse('2026-03-24T00:00:00.000Z'),
          }),
        ],
        sinceLastChecked: {
          sinceTimestamp: Date.parse('2026-02-28T00:00:00.000Z'),
          accountId: 'acct-1',
          summaryCount: 5,
          events: [],
        },
      },
    },
  };
}

describe('fetchSinceLastCheckedVM', () => {
  const mockFetchSnapshotVM = jest.mocked(fetchSnapshotVM);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('uses a provided snapshot without fetching again', async () => {
    const snapshot = createSnapshot();

    const result = await fetchSinceLastCheckedVM({
      snapshot,
    });

    expect(mockFetchSnapshotVM).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: 'AVAILABLE',
      title: 'Since last checked',
      summary: 'A calm read on the most meaningful interpreted changes since your last visit.',
      items: [
        {
          title: 'Data context',
          summary: 'Some recent market context was captured with data quality limits in view.',
          emphasis: 'CONTEXT',
        },
        {
          title: 'ETH price context',
          summary: 'Recent pricing context for ETH remains estimated.',
          emphasis: 'CONTEXT',
        },
        {
          title: 'DOGE pullback',
          summary: 'A measured pullback was recorded for DOGE while you were away.',
          emphasis: 'CHANGE',
        },
      ],
    });
  });

  it('fetches the snapshot first when only service inputs are supplied', async () => {
    const snapshot = createSnapshot();
    mockFetchSnapshotVM.mockResolvedValue(snapshot as Awaited<ReturnType<typeof fetchSnapshotVM>>);

    const result = await fetchSinceLastCheckedVM({
      profile: 'BEGINNER',
      nowProvider: () => Date.parse('2026-04-01T00:00:00.000Z'),
    });

    expect(mockFetchSnapshotVM).toHaveBeenCalledWith({
      profile: 'BEGINNER',
      accounts: undefined,
      selectedAccountId: undefined,
      baselineScan: undefined,
      nowProvider: expect.any(Function),
      includeDebugObservatory: undefined,
      eventLedger: undefined,
      eventLedgerQueries: undefined,
      lastViewedTimestamp: undefined,
      lastViewedState: undefined,
    });
    expect(result).toMatchObject({
      status: 'AVAILABLE',
      title: 'Since last checked',
    });
  });
});
