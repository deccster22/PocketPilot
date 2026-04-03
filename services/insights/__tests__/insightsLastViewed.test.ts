import {
  markInsightsHistoryViewed,
  resolveInsightsLastViewedBoundary,
  resolveInsightsLastViewedTimestamp,
} from '@/services/insights/insightsLastViewed';
import {
  createInMemoryLastViewedState,
  INSIGHTS_LAST_VIEWED_SURFACE_ID,
  SNAPSHOT_LAST_VIEWED_SURFACE_ID,
} from '@/services/orientation/lastViewedState';

describe('insightsLastViewed', () => {
  it('resolves the dedicated Insights boundary through service-owned lastViewedState usage', () => {
    const lastViewedState = createInMemoryLastViewedState([
      {
        surfaceId: SNAPSHOT_LAST_VIEWED_SURFACE_ID,
        accountId: 'acct-1',
        timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
      },
      {
        surfaceId: INSIGHTS_LAST_VIEWED_SURFACE_ID,
        accountId: 'acct-1',
        timestamp: Date.parse('2026-03-22T12:00:00.000Z'),
      },
    ]);

    expect(
      resolveInsightsLastViewedBoundary({
        accountId: 'acct-1',
        lastViewedState,
      }),
    ).toEqual({
      viewedAt: '2026-03-22T12:00:00.000Z',
    });
    expect(
      resolveInsightsLastViewedTimestamp({
        accountId: 'acct-1',
        lastViewedState,
      }),
    ).toBe(Date.parse('2026-03-22T12:00:00.000Z'));
  });

  it('records the dedicated Insights boundary without mutating other surfaces', () => {
    const lastViewedState = createInMemoryLastViewedState([
      {
        surfaceId: SNAPSHOT_LAST_VIEWED_SURFACE_ID,
        accountId: 'acct-1',
        timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
      },
    ]);

    expect(
      markInsightsHistoryViewed({
        accountId: 'acct-1',
        viewedAt: '2026-04-03T00:00:00.000Z',
        lastViewedState,
      }),
    ).toEqual({
      viewedAt: '2026-04-03T00:00:00.000Z',
    });

    expect(
      lastViewedState.getLastViewedTimestamp({
        surfaceId: INSIGHTS_LAST_VIEWED_SURFACE_ID,
        accountId: 'acct-1',
      }),
    ).toBe(Date.parse('2026-04-03T00:00:00.000Z'));
    expect(
      lastViewedState.getLastViewedTimestamp({
        surfaceId: SNAPSHOT_LAST_VIEWED_SURFACE_ID,
        accountId: 'acct-1',
      }),
    ).toBe(Date.parse('2026-03-20T00:00:00.000Z'));
  });

  it('can fall back to nowProvider when the screen does not pass an explicit viewed time', () => {
    const lastViewedState = createInMemoryLastViewedState();

    expect(
      markInsightsHistoryViewed({
        accountId: 'acct-1',
        nowProvider: () => Date.parse('2026-04-03T01:02:03.000Z'),
        lastViewedState,
      }),
    ).toEqual({
      viewedAt: '2026-04-03T01:02:03.000Z',
    });
  });
});
