import type { MarketEvent } from '@/core/types/marketEvent';
import type { OrientationContext } from '@/services/orientation/createOrientationContext';
import { deriveSnapshotTrendDirection } from '@/services/snapshot/deriveSnapshotTrendDirection';

const momentumEvent: MarketEvent = {
  eventId: 'acct-1:momentum_basics:momentum:BTC:100',
  timestamp: 100,
  accountId: 'acct-1',
  symbol: 'BTC',
  strategyId: 'momentum_basics',
  eventType: 'MOMENTUM_BUILDING',
  alignmentState: 'ALIGNED',
  signalsTriggered: ['momentum'],
  confidenceScore: 0.82,
  certainty: 'confirmed',
  price: 100,
  pctChange: 0.02,
  metadata: {},
};

function createOrientationContext(
  overrides?: Partial<OrientationContext>,
): OrientationContext {
  return {
    accountId: 'acct-1',
    symbol: 'BTC',
    strategyId: 'momentum_basics',
    currentState: {
      latestRelevantEvent: momentumEvent,
      strategyAlignment: 'Aligned',
      certainty: 'confirmed',
    },
    historyContext: {
      eventsSinceLastViewed: [],
      sinceLastChecked: null,
    },
    ...overrides,
  };
}

describe('deriveSnapshotTrendDirection', () => {
  it('returns strengthening for momentum-building events', () => {
    const orientationContext = createOrientationContext();

    expect(deriveSnapshotTrendDirection(orientationContext)).toBe('strengthening');
  });

  it('returns weakening for data quality events', () => {
    const orientationContext = createOrientationContext({
      currentState: {
        latestRelevantEvent: {
          ...momentumEvent,
          eventType: 'DATA_QUALITY',
          alignmentState: 'NEEDS_REVIEW',
        },
        strategyAlignment: 'Needs review',
        certainty: 'estimated',
      },
    });

    expect(deriveSnapshotTrendDirection(orientationContext)).toBe('weakening');
  });

  it('falls back to alignment state when no latest event exists', () => {
    const orientationContext = createOrientationContext({
      currentState: {
        latestRelevantEvent: null,
        strategyAlignment: 'Needs review',
        certainty: null,
      },
    });

    expect(deriveSnapshotTrendDirection(orientationContext)).toBe('weakening');
  });

  it('returns neutral when neither event nor alignment implies a directional change', () => {
    const orientationContext = createOrientationContext({
      currentState: {
        latestRelevantEvent: null,
        strategyAlignment: 'Aligned',
        certainty: null,
      },
    });

    expect(deriveSnapshotTrendDirection(orientationContext)).toBe('neutral');
  });
});
