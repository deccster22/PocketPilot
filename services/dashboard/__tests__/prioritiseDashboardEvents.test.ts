import {
  classifyDashboardItem,
  prioritiseDashboardEvents,
} from '@/services/dashboard/prioritiseDashboardEvents';
import type { DashboardItem } from '@/services/dashboard/types';

function createItem(overrides: Partial<DashboardItem> = {}): DashboardItem {
  return {
    symbol: 'BTC',
    accountId: 'acct-1',
    strategyId: 'strategy-a',
    eventType: 'PRICE_MOVEMENT',
    alignmentState: 'WATCHFUL',
    trendDirection: 'neutral',
    certainty: 'estimated',
    timestamp: 100,
    ...overrides,
  };
}

describe('prioritiseDashboardEvents', () => {
  it('classifies events into prime, secondary, and background deterministically', () => {
    const newestPrime = createItem({
      symbol: 'SOL',
      timestamp: 400,
      trendDirection: 'weakening',
      certainty: 'confirmed',
      eventType: 'DIP_DETECTED',
      alignmentState: 'NEEDS_REVIEW',
    });
    const olderPrime = createItem({
      symbol: 'BTC',
      timestamp: 300,
      trendDirection: 'strengthening',
      certainty: 'confirmed',
      eventType: 'MOMENTUM_BUILDING',
    });
    const explicitSecondary = createItem({
      symbol: 'ETH',
      timestamp: 350,
      eventType: 'ESTIMATED_PRICE',
      certainty: 'estimated',
      trendDirection: 'neutral',
    });
    const background = createItem({
      symbol: 'DOGE',
      timestamp: 200,
      certainty: 'estimated',
      trendDirection: 'neutral',
      eventType: 'PRICE_MOVEMENT',
    });

    expect(prioritiseDashboardEvents([background, explicitSecondary, olderPrime, newestPrime])).toEqual(
      {
        prime: [newestPrime, olderPrime],
        secondary: [explicitSecondary],
        background: [background],
      },
    );
  });

  it('ranks confirmed items above estimated items when timestamps match', () => {
    const confirmed = createItem({
      symbol: 'BTC',
      timestamp: 500,
      trendDirection: 'strengthening',
      certainty: 'confirmed',
      eventType: 'PRICE_MOVEMENT',
    });
    const estimated = createItem({
      symbol: 'ETH',
      timestamp: 500,
      trendDirection: 'strengthening',
      certainty: 'estimated',
      eventType: 'PRICE_MOVEMENT',
    });

    expect(prioritiseDashboardEvents([estimated, confirmed]).prime).toEqual([confirmed]);
    expect(prioritiseDashboardEvents([estimated, confirmed]).secondary).toEqual([estimated]);
  });

  it('prefers explicit event types over generic movement when higher-order rules tie', () => {
    const explicitItem = createItem({
      symbol: 'ADA',
      timestamp: 600,
      trendDirection: 'neutral',
      certainty: 'confirmed',
      eventType: 'DATA_QUALITY',
    });
    const genericItem = createItem({
      symbol: 'BTC',
      timestamp: 600,
      trendDirection: 'neutral',
      certainty: 'confirmed',
      eventType: 'PRICE_MOVEMENT',
    });

    expect(prioritiseDashboardEvents([genericItem, explicitItem]).secondary).toEqual([
      explicitItem,
      genericItem,
    ]);
  });

  it('keeps classification rules explicit and readable', () => {
    expect(
      classifyDashboardItem(
        createItem({
          trendDirection: 'strengthening',
          certainty: 'confirmed',
        }),
      ),
    ).toBe('prime');
    expect(
      classifyDashboardItem(
        createItem({
          trendDirection: 'weakening',
          certainty: 'estimated',
        }),
      ),
    ).toBe('secondary');
    expect(
      classifyDashboardItem(
        createItem({
          trendDirection: 'neutral',
          certainty: 'estimated',
          eventType: 'PRICE_MOVEMENT',
        }),
      ),
    ).toBe('background');
  });
});
