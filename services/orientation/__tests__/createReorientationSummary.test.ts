import { createOrientationContext } from '@/services/orientation/createOrientationContext';
import { createReorientationSummary } from '@/services/orientation/createReorientationSummary';
import type { ReorientationSummaryItem } from '@/services/orientation/types';
import type { SnapshotModel } from '@/services/snapshot/types';

const baseSnapshotModel: SnapshotModel = {
  profile: 'BEGINNER',
  core: {
    currentState: {
      label: 'Current State',
      value: 'Up',
      trendDirection: 'UP',
    },
    change24h: {
      label: 'Last 24h Change',
      value: 0.04,
    },
    strategyStatus: {
      label: 'Strategy Status',
      value: 'Watchful',
    },
  },
  history: {
    hasNewSinceLastCheck: true,
  },
};

const baseSummaryItems: ReadonlyArray<ReorientationSummaryItem> = [
  {
    kind: 'PRICE_CHANGE',
    label: 'BTC movement',
    detail: 'Price context for BTC shifted by 4.00% since your last active session.',
  },
  {
    kind: 'STRATEGY_SHIFT',
    label: 'BTC strategy context',
    detail: 'Momentum around BTC has been building since your last active session.',
  },
  {
    kind: 'MARKET_EVENT',
    label: 'Current orientation',
    detail: 'Snapshot reads up with strategy status at watchful.',
  },
  {
    kind: 'ACCOUNT_CONTEXT',
    label: 'Extra item',
    detail: 'This item should be capped away.',
  },
];

function createBaseParams() {
  return {
    now: '2026-04-01T00:00:00.000Z',
    lastActiveAt: '2026-02-28T00:00:00.000Z',
    profileId: 'BEGINNER' as const,
    summarySource: {
      snapshotModel: baseSnapshotModel,
      orientationContext: createOrientationContext({
        accountId: 'acct-1',
        strategyAlignment: 'Watchful',
        sinceLastChecked: {
          sinceTimestamp: Date.parse('2026-02-28T00:00:00.000Z'),
          accountId: 'acct-1',
          summaryCount: 1,
          events: [
            {
              eventId: 'evt-1',
              timestamp: Date.parse('2026-03-15T00:00:00.000Z'),
              accountId: 'acct-1',
              symbol: 'BTC',
              strategyId: 'momentum_basics',
              eventType: 'PRICE_MOVEMENT',
              alignmentState: 'WATCHFUL',
              signalsTriggered: ['cross'],
              confidenceScore: 0.8,
              certainty: 'confirmed',
              price: 100,
              pctChange: 0.04,
              metadata: {
                signalTitle: 'Crossed',
              },
            },
          ],
        },
      }),
      accountId: 'acct-1',
    },
    summaryItems: baseSummaryItems,
  };
}

describe('createReorientationSummary', () => {
  it('triggers for beginner profiles after 30 inactive days', () => {
    const result = createReorientationSummary(createBaseParams());

    expect(result).toEqual({
      status: 'AVAILABLE',
      profileId: 'BEGINNER',
      inactiveDays: 32,
      headline: 'Welcome back. Here is a quick briefing to help you get your bearings.',
      summaryItems: baseSummaryItems.slice(0, 3),
      generatedFrom: {
        lastActiveAt: '2026-02-28T00:00:00.000Z',
        now: '2026-04-01T00:00:00.000Z',
      },
      maxItems: 3,
    });
  });

  it('waits until 45 inactive days for middle profiles', () => {
    const belowThreshold = createReorientationSummary({
      ...createBaseParams(),
      profileId: 'MIDDLE',
      lastActiveAt: '2026-02-20T00:00:00.000Z',
    });
    const atThreshold = createReorientationSummary({
      ...createBaseParams(),
      profileId: 'MIDDLE',
      lastActiveAt: '2026-02-15T00:00:00.000Z',
    });

    expect(belowThreshold).toEqual({
      status: 'NOT_NEEDED',
      reason: 'BELOW_THRESHOLD',
    });
    expect(atThreshold).toMatchObject({
      status: 'AVAILABLE',
      profileId: 'MIDDLE',
      inactiveDays: 45,
    });
  });

  it('keeps advanced profiles disabled by default unless explicitly enabled', () => {
    expect(
      createReorientationSummary({
        ...createBaseParams(),
        profileId: 'ADVANCED',
      }),
    ).toEqual({
      status: 'NOT_NEEDED',
      reason: 'DISABLED_FOR_PROFILE',
    });

    expect(
      createReorientationSummary({
        ...createBaseParams(),
        profileId: 'ADVANCED',
        preference: {
          enabled: true,
        },
        lastActiveAt: '2026-02-10T00:00:00.000Z',
      }),
    ).toMatchObject({
      status: 'AVAILABLE',
      profileId: 'ADVANCED',
    });
  });

  it('returns no meaningful change when the interpreted source has no new context', () => {
    const result = createReorientationSummary({
      ...createBaseParams(),
      summarySource: {
        snapshotModel: {
          ...baseSnapshotModel,
          history: {
            hasNewSinceLastCheck: false,
          },
        },
        orientationContext: createOrientationContext({
          accountId: 'acct-1',
          strategyAlignment: 'Aligned',
          sinceLastChecked: {
            sinceTimestamp: Date.parse('2026-02-28T00:00:00.000Z'),
            accountId: 'acct-1',
            summaryCount: 0,
            events: [],
          },
        }),
        accountId: 'acct-1',
      },
      summaryItems: [],
    });

    expect(result).toEqual({
      status: 'NOT_NEEDED',
      reason: 'NO_MEANINGFUL_CHANGE',
    });
  });

  it('is deterministic for identical inputs', () => {
    const params = createBaseParams();

    expect(createReorientationSummary(params)).toEqual(createReorientationSummary(params));
  });

  it('caps available summaries at three items', () => {
    const result = createReorientationSummary(createBaseParams());

    expect(result.status).toBe('AVAILABLE');
    if (result.status === 'AVAILABLE') {
      expect(result.summaryItems).toHaveLength(3);
      expect(result.maxItems).toBe(3);
    }
  });

  it('keeps generated wording calm and free of raw signal leakage', () => {
    const result = createReorientationSummary(createBaseParams());

    expect(result.status).toBe('AVAILABLE');
    if (result.status !== 'AVAILABLE') {
      return;
    }

    const combinedText = [result.headline, ...result.summaryItems.flatMap((item) => [item.label, item.detail])]
      .join(' ')
      .toLowerCase();

    expect(combinedText).not.toContain('must');
    expect(combinedText).not.toContain('should');
    expect(combinedText).not.toContain('now');
    expect(combinedText).not.toContain('urgent');
    expect(combinedText).not.toContain('overdue');
    expect(combinedText).not.toContain('cross');
    expect(combinedText).not.toContain('momentum_basics');
    expect(combinedText).not.toContain('evt-1');
  });
});
