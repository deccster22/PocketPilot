import type { MarketEvent } from '@/core/types/marketEvent';
import type { OrientationContext } from '@/services/orientation/createOrientationContext';
import { createSnapshotModel } from '@/services/snapshot/createSnapshotModel';

const latestEvent: MarketEvent = {
  eventId: 'acct-1:strategy-a:latest:ETH:200',
  timestamp: 200,
  accountId: 'acct-1',
  symbol: 'ETH',
  strategyId: 'strategy-a',
  eventType: 'ESTIMATED_PRICE',
  alignmentState: 'NEEDS_REVIEW',
  signalsTriggered: ['estimated_quote'],
  confidenceScore: 0.91,
  certainty: 'estimated',
  price: 200,
  pctChange: -0.03,
  metadata: {},
};

function buildOrientationContext(
  overrides?: Partial<OrientationContext>,
): OrientationContext {
  return {
    accountId: 'acct-1',
    symbol: 'ETH',
    strategyId: 'strategy-a',
    currentState: {
      latestRelevantEvent: latestEvent,
      strategyAlignment: 'Needs review',
      certainty: 'estimated',
    },
    historyContext: {
      eventsSinceLastViewed: [latestEvent],
      sinceLastChecked: {
        sinceTimestamp: 150,
        accountId: 'acct-1',
        events: [latestEvent],
        summaryCount: 1,
      },
    },
    ...overrides,
  };
}

describe('createSnapshotModel', () => {
  it('maps orientation context into the canonical snapshot shape', () => {
    const model = createSnapshotModel(buildOrientationContext());

    expect(model).toEqual({
      core: {
        currentState: {
          price: 200,
          pctChange24h: -0.03,
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
        hasMeaningfulChanges: true,
        eventsSinceLastViewedCount: 1,
        sinceLastCheckedSummaryCount: 1,
      },
    });
  });

  it('keeps secondary fields subordinate and optional', () => {
    const model = createSnapshotModel(buildOrientationContext());

    expect(model.secondary.volatilityContext).toBeUndefined();
    expect(model.secondary.strategyFit).toBeUndefined();
    expect(model.secondary.contributingEventCount).toBeUndefined();
  });

  it('returns null current values and no meaningful history when there is no latest event', () => {
    const model = createSnapshotModel(
      buildOrientationContext({
        currentState: {
          latestRelevantEvent: null,
          strategyAlignment: 'Aligned',
          certainty: null,
        },
        historyContext: {
          eventsSinceLastViewed: [],
          sinceLastChecked: null,
        },
      }),
    );

    expect(model).toEqual({
      core: {
        currentState: {
          price: null,
          pctChange24h: null,
          certainty: null,
        },
        strategyStatus: {
          alignmentState: 'Aligned',
          latestEventType: null,
          trendDirection: 'neutral',
        },
      },
      secondary: {},
      history: {
        hasMeaningfulChanges: false,
        eventsSinceLastViewedCount: 0,
        sinceLastCheckedSummaryCount: null,
      },
    });
  });
});
