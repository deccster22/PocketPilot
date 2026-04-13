import {
  createInMemoryLastViewedState,
  SNAPSHOT_LAST_VIEWED_SURFACE_ID,
} from '@/services/orientation/lastViewedState';
import {
  markSinceLastCheckedViewed,
  resolveSinceLastCheckedViewedTimestamp,
} from '@/services/orientation/sinceLastCheckedViewedState';

describe('sinceLastCheckedViewedState', () => {
  it('keeps the viewed boundary account-scoped when marking the snapshot surface', () => {
    const lastViewedState = createInMemoryLastViewedState([
      {
        surfaceId: SNAPSHOT_LAST_VIEWED_SURFACE_ID,
        accountId: 'acct-1',
        timestamp: Date.parse('2026-03-20T00:00:00.000Z'),
      },
    ]);

    expect(
      markSinceLastCheckedViewed({
        accountId: 'acct-2',
        viewedAt: '2026-04-03T00:00:00.000Z',
        lastViewedState,
      }),
    ).toEqual({
      viewedAt: '2026-04-03T00:00:00.000Z',
    });

    expect(
      resolveSinceLastCheckedViewedTimestamp({
        accountId: 'acct-1',
        lastViewedState,
      }),
    ).toBe(Date.parse('2026-03-20T00:00:00.000Z'));
    expect(
      resolveSinceLastCheckedViewedTimestamp({
        accountId: 'acct-2',
        lastViewedState,
      }),
    ).toBe(Date.parse('2026-04-03T00:00:00.000Z'));
    expect(
      lastViewedState.getLastViewedTimestamp({
        surfaceId: SNAPSHOT_LAST_VIEWED_SURFACE_ID,
        accountId: 'acct-1',
      }),
    ).toBe(Date.parse('2026-03-20T00:00:00.000Z'));
    expect(
      lastViewedState.getLastViewedTimestamp({
        surfaceId: SNAPSHOT_LAST_VIEWED_SURFACE_ID,
        accountId: 'acct-2',
      }),
    ).toBe(Date.parse('2026-04-03T00:00:00.000Z'));
  });

  it('falls back to nowProvider when a viewedAt timestamp is not supplied', () => {
    const lastViewedState = createInMemoryLastViewedState();

    expect(
      markSinceLastCheckedViewed({
        accountId: 'acct-1',
        nowProvider: () => Date.parse('2026-04-03T01:02:03.000Z'),
        lastViewedState,
      }),
    ).toEqual({
      viewedAt: '2026-04-03T01:02:03.000Z',
    });
  });
});
