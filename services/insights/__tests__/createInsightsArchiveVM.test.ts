import type { MarketEvent } from '@/core/types/marketEvent';
import { createSinceLastChecked } from '@/services/events/createSinceLastChecked';
import { createEventLedgerQueries } from '@/services/events/eventLedgerQueries';
import { createEventLedgerService } from '@/services/events/eventLedgerService';
import { createInsightsArchiveVM } from '@/services/insights/createInsightsArchiveVM';
import { createInsightsContinuity } from '@/services/insights/createInsightsContinuity';
import { createInsightsHistoryVM } from '@/services/insights/createInsightsHistoryVM';
import { INSIGHTS_LAST_VIEWED_SECTION_ID } from '@/services/insights/types';
import { createOrientationContext } from '@/services/orientation/createOrientationContext';

function createMarketEvent(overrides: Partial<MarketEvent> & Pick<MarketEvent, 'eventId'>): MarketEvent {
  return {
    eventId: overrides.eventId,
    timestamp: overrides.timestamp ?? Date.parse('2026-04-01T00:00:00.000Z'),
    accountId: overrides.accountId ?? 'acct-1',
    symbol: overrides.symbol ?? 'BTC',
    strategyId: overrides.strategyId ?? 'strategy-alpha',
    eventType: overrides.eventType ?? 'PRICE_MOVEMENT',
    alignmentState: overrides.alignmentState ?? 'WATCHFUL',
    signalsTriggered: overrides.signalsTriggered ?? ['raw_signal_code'],
    confidenceScore: overrides.confidenceScore ?? 0.72,
    certainty: overrides.certainty ?? 'confirmed',
    price: overrides.price ?? 100,
    pctChange: overrides.pctChange ?? 0.03,
    metadata: overrides.metadata ?? {
      providerId: 'broker:live',
      signalTitle: 'Raw signal title',
    },
  };
}

function createArchiveInputs() {
  const ledger = createEventLedgerService([
    createMarketEvent({
      eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
      timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
      symbol: 'BTC',
      eventType: 'PRICE_MOVEMENT',
      pctChange: 0.03,
    }),
    createMarketEvent({
      eventId: 'acct-1:strategy-alpha:price-b:BTC:101',
      timestamp: Date.parse('2026-03-21T00:00:00.000Z'),
      symbol: 'BTC',
      eventType: 'PRICE_MOVEMENT',
      pctChange: 0.04,
    }),
    createMarketEvent({
      eventId: 'acct-1:strategy-alpha:dip-a:ETH:102',
      timestamp: Date.parse('2026-03-22T00:00:00.000Z'),
      symbol: 'ETH',
      eventType: 'DIP_DETECTED',
      pctChange: -0.05,
    }),
    createMarketEvent({
      eventId: 'acct-1:strategy-alpha:estimate-a:SOL:103',
      timestamp: Date.parse('2026-03-23T00:00:00.000Z'),
      symbol: 'SOL',
      eventType: 'ESTIMATED_PRICE',
      certainty: 'estimated',
      pctChange: null,
    }),
  ]);
  const queries = createEventLedgerQueries(ledger);
  const sinceLastChecked = createSinceLastChecked({
    sinceTimestamp: Date.parse('2026-03-21T12:00:00.000Z'),
    accountId: 'acct-1',
    eventQueries: queries,
  });
  const orientationContext = createOrientationContext({
    accountId: 'acct-1',
    sinceLastChecked,
  });
  const history = ledger.getAllEvents();
  const historyVM = createInsightsHistoryVM({
    generatedAt: '2026-04-03T00:00:00.000Z',
    history,
    orientationContext,
  });
  const continuity = createInsightsContinuity({
    historyVM,
    lastViewedBoundary: {
      viewedAt: '2026-03-21T12:00:00.000Z',
    },
  });

  return {
    history,
    historyVM,
    continuity,
    orientationContext,
  };
}

describe('createInsightsArchiveVM', () => {
  it('builds one deeper interpreted archive with richer notes and service-owned selection', () => {
    const result = createInsightsArchiveVM({
      generatedAt: '2026-04-03T00:00:00.000Z',
      ...createArchiveInputs(),
    });

    expect(result).toEqual({
      generatedAt: '2026-04-03T00:00:00.000Z',
      availability: {
        status: 'AVAILABLE',
        sections: [
          {
            id: INSIGHTS_LAST_VIEWED_SECTION_ID,
            title: 'Since you last viewed Insights',
            items: [
              {
                title: 'SOL price context stayed estimated',
                summary:
                  'Recent pricing context for SOL remained estimated, so this part of the picture stayed provisional.',
                timestamp: '2026-03-23T00:00:00.000Z',
                symbol: 'SOL',
                eventKind: 'CONTEXT',
                detailNote:
                  'The interpreted posture stayed watchful rather than settled. Estimated pricing context remained part of this note, so the interpretation stayed provisional.',
              },
              {
                title: 'ETH pullback entered view',
                summary: 'A measured pullback around ETH entered recent interpreted history.',
                timestamp: '2026-03-22T00:00:00.000Z',
                symbol: 'ETH',
                eventKind: 'VOLATILITY',
                detailNote:
                  'The interpreted posture stayed watchful rather than settled. This described a measured pullback entering view, not a dispatch signal.',
              },
            ],
          },
          {
            id: 'earlier-context',
            title: 'Earlier context',
            items: [
              {
                title: 'BTC price picture shifted',
                summary:
                  'Price context for BTC moved up by 4.00% in the recent interpreted picture. The same interpreted picture appeared across 2 recent updates.',
                timestamp: '2026-03-21T00:00:00.000Z',
                symbol: 'BTC',
                eventKind: 'STATE_CHANGE',
                detailNote:
                  'The interpreted posture stayed watchful rather than settled. Within this interpreted window, price context moved up by 4.00%. This note remained descriptive rather than prescriptive. This archive note stands in for 2 closely related updates.',
              },
            ],
          },
        ],
      },
      selectedSectionId: INSIGHTS_LAST_VIEWED_SECTION_ID,
      sinceLastCheckedContinuity: {
        status: 'UNAVAILABLE',
        reason: 'NO_ARCHIVED_CONTINUITY',
      },
    });
  });

  it('keeps the archive interpreted rather than dumping every raw row', () => {
    const repeatedHistory = [
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
        timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
        pctChange: 0.03,
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-b:BTC:101',
        timestamp: Date.parse('2026-03-21T00:00:00.000Z'),
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
        pctChange: 0.04,
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-c:BTC:102',
        timestamp: Date.parse('2026-03-22T00:00:00.000Z'),
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
        pctChange: 0.05,
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:estimate-a:SOL:103',
        timestamp: Date.parse('2026-03-23T00:00:00.000Z'),
        symbol: 'SOL',
        eventType: 'ESTIMATED_PRICE',
        certainty: 'estimated',
        pctChange: null,
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:dip-a:ETH:104',
        timestamp: Date.parse('2026-03-24T00:00:00.000Z'),
        symbol: 'ETH',
        eventType: 'DIP_DETECTED',
        pctChange: -0.05,
      }),
    ];

    const result = createInsightsArchiveVM({
      generatedAt: '2026-04-03T00:00:00.000Z',
      history: repeatedHistory,
      historyVM: createInsightsHistoryVM({
        generatedAt: '2026-04-03T00:00:00.000Z',
        history: repeatedHistory,
      }),
    });

    expect(result.availability).toMatchObject({
      status: 'AVAILABLE',
      sections: [
        {
          id: 'recent-history',
          items: [
            {
              title: 'ETH pullback entered view',
            },
            {
              title: 'SOL price context stayed estimated',
            },
            {
              title: 'BTC price picture shifted',
            },
          ],
        },
      ],
    });
  });

  it('returns unavailable honestly when deeper archive history is too thin', () => {
    const thinHistory = [
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:price-a:BTC:100',
        timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
        symbol: 'BTC',
        eventType: 'PRICE_MOVEMENT',
        pctChange: 0.03,
      }),
      createMarketEvent({
        eventId: 'acct-1:strategy-alpha:dip-a:ETH:101',
        timestamp: Date.parse('2026-03-21T00:00:00.000Z'),
        symbol: 'ETH',
        eventType: 'DIP_DETECTED',
        pctChange: -0.05,
      }),
    ];

    expect(
      createInsightsArchiveVM({
        generatedAt: '2026-04-03T00:00:00.000Z',
        history: thinHistory,
        historyVM: createInsightsHistoryVM({
          generatedAt: '2026-04-03T00:00:00.000Z',
          history: thinHistory,
        }),
      }),
    ).toEqual({
      generatedAt: '2026-04-03T00:00:00.000Z',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'INSUFFICIENT_INTERPRETED_HISTORY',
      },
      selectedSectionId: null,
      sinceLastCheckedContinuity: {
        status: 'UNAVAILABLE',
        reason: 'NO_ARCHIVED_CONTINUITY',
      },
    });
  });

  it('does not leak raw ids, signal codes, strategy ids, or provider metadata into user-facing archive copy', () => {
    const result = createInsightsArchiveVM({
      generatedAt: '2026-04-03T00:00:00.000Z',
      ...createArchiveInputs(),
    });

    expect(JSON.stringify(result)).not.toMatch(
      /eventId|signalsTriggered|strategy-alpha|strategyId|providerId|broker:live|raw_signal_code|signalTitle/i,
    );
  });

  it('is deterministic for identical inputs regardless of history order', () => {
    const inputs = createArchiveInputs();

    expect(
      createInsightsArchiveVM({
        generatedAt: '2026-04-03T00:00:00.000Z',
        ...inputs,
      }),
    ).toEqual(
      createInsightsArchiveVM({
        generatedAt: '2026-04-03T00:00:00.000Z',
        history: [...inputs.history].reverse(),
        historyVM: inputs.historyVM,
        continuity: inputs.continuity,
        orientationContext: inputs.orientationContext,
      }),
    );
  });
});
