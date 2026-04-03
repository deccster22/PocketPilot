import { createInsightsContinuity } from '@/services/insights/createInsightsContinuity';
import {
  INSIGHTS_LAST_VIEWED_SECTION_ID,
  type InsightsHistoryVM,
} from '@/services/insights/types';

function createHistoryVM(overrides?: Partial<InsightsHistoryVM>): InsightsHistoryVM {
  return {
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
            },
          ],
        },
        {
          id: 'earlier-context',
          title: 'Earlier context',
          items: [
            {
              title: 'BTC price picture shifted',
              summary: 'Price context for BTC moved up by 4.00% in the recent interpreted picture.',
              timestamp: '2026-03-21T00:00:00.000Z',
              symbol: 'BTC',
              eventKind: 'STATE_CHANGE',
            },
          ],
        },
      ],
    },
    ...overrides,
  };
}

describe('createInsightsContinuity', () => {
  it('returns NO_HISTORY when meaningful interpreted history is unavailable', () => {
    expect(
      createInsightsContinuity({
        historyVM: {
          generatedAt: '2026-04-03T00:00:00.000Z',
          availability: {
            status: 'UNAVAILABLE',
            reason: 'INSUFFICIENT_INTERPRETED_HISTORY',
          },
        },
        lastViewedBoundary: {
          viewedAt: '2026-03-22T12:00:00.000Z',
        },
      }),
    ).toEqual({
      state: 'NO_HISTORY',
      viewedAt: '2026-03-22T12:00:00.000Z',
      newestEventAt: null,
      newItemCount: 0,
      summary: null,
    });
  });

  it('returns NEW_HISTORY_AVAILABLE when newer interpreted history exists for Insights', () => {
    expect(
      createInsightsContinuity({
        historyVM: createHistoryVM({
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
                  },
                  {
                    title: 'ETH pullback entered view',
                    summary: 'A measured pullback around ETH entered recent interpreted history.',
                    timestamp: '2026-03-22T00:00:00.000Z',
                    symbol: 'ETH',
                    eventKind: 'VOLATILITY',
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
                      'Price context for BTC moved up by 4.00% in the recent interpreted picture.',
                    timestamp: '2026-03-21T00:00:00.000Z',
                    symbol: 'BTC',
                    eventKind: 'STATE_CHANGE',
                  },
                ],
              },
            ],
          },
        }),
        lastViewedBoundary: {
          viewedAt: '2026-03-21T12:00:00.000Z',
        },
      }),
    ).toEqual({
      state: 'NEW_HISTORY_AVAILABLE',
      viewedAt: '2026-03-21T12:00:00.000Z',
      newestEventAt: '2026-03-23T00:00:00.000Z',
      newItemCount: 2,
      summary: 'Since you last viewed Insights, 2 newer interpreted history notes are available.',
    });
  });

  it('returns NO_NEW_HISTORY when history exists but no newer interpreted items do', () => {
    expect(
      createInsightsContinuity({
        historyVM: createHistoryVM({
          availability: {
            status: 'AVAILABLE',
            sections: [
              {
                id: 'earlier-context',
                title: 'Earlier context',
                items: [
                  {
                    title: 'BTC price picture shifted',
                    summary:
                      'Price context for BTC moved up by 4.00% in the recent interpreted picture.',
                    timestamp: '2026-03-21T00:00:00.000Z',
                    symbol: 'BTC',
                    eventKind: 'STATE_CHANGE',
                  },
                  {
                    title: 'ETH momentum kept building',
                    summary: 'Momentum around ETH continued to build in recent interpreted history.',
                    timestamp: '2026-03-20T00:00:00.000Z',
                    symbol: 'ETH',
                    eventKind: 'ALIGNMENT',
                  },
                ],
              },
            ],
          },
        }),
        lastViewedBoundary: {
          viewedAt: '2026-03-23T12:00:00.000Z',
        },
      }),
    ).toEqual({
      state: 'NO_NEW_HISTORY',
      viewedAt: '2026-03-23T12:00:00.000Z',
      newestEventAt: '2026-03-21T00:00:00.000Z',
      newItemCount: 0,
      summary: 'Since you last viewed Insights, no newer interpreted history is available.',
    });
  });

  it('prefers NO_NEW_HISTORY over fake novelty when no last-viewed boundary exists yet', () => {
    expect(
      createInsightsContinuity({
        historyVM: createHistoryVM({
          availability: {
            status: 'AVAILABLE',
            sections: [
              {
                id: 'recent-history',
                title: 'Recent history',
                items: [
                  {
                    title: 'BTC price picture shifted',
                    summary:
                      'Price context for BTC moved up by 4.00% in the recent interpreted picture.',
                    timestamp: '2026-03-21T00:00:00.000Z',
                    symbol: 'BTC',
                    eventKind: 'STATE_CHANGE',
                  },
                  {
                    title: 'ETH momentum kept building',
                    summary: 'Momentum around ETH continued to build in recent interpreted history.',
                    timestamp: '2026-03-20T00:00:00.000Z',
                    symbol: 'ETH',
                    eventKind: 'ALIGNMENT',
                  },
                ],
              },
            ],
          },
        }),
        lastViewedBoundary: {
          viewedAt: null,
        },
      }),
    ).toEqual({
      state: 'NO_NEW_HISTORY',
      viewedAt: null,
      newestEventAt: '2026-03-21T00:00:00.000Z',
      newItemCount: 0,
      summary: null,
    });
  });

  it('keeps continuity copy calm and non-inbox-like without raw identifiers', () => {
    const result = createInsightsContinuity({
      historyVM: createHistoryVM(),
      lastViewedBoundary: {
        viewedAt: '2026-03-21T12:00:00.000Z',
      },
    });

    expect(JSON.stringify(result)).not.toMatch(
      /unread|badge|notification|inbox|alert|eventId|strategy-alpha|providerId|raw_signal_code/i,
    );
  });

  it('is deterministic for identical inputs', () => {
    const params = {
      historyVM: createHistoryVM(),
      lastViewedBoundary: {
        viewedAt: '2026-03-21T12:00:00.000Z',
      },
    };

    expect(createInsightsContinuity(params)).toEqual(createInsightsContinuity(params));
  });
});
