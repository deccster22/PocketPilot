import { listCatalog } from '@/core/strategy/catalog';
import {
  isSupportStrategyMetadataFamily,
  listStrategyMetadataRegistry,
  resolveStrategyMetadata,
} from '@/services/strategyNavigator/strategyMetadata';

const PREVIEW_STRATEGY_IDS = new Set([
  'data_quality',
  'momentum_basics',
  'dip_buying',
  'trend_following',
  'mean_reversion',
  'fib_levels',
]);

describe('strategy metadata registry', () => {
  it('resolves canonical metadata for every supported Strategy Navigator strategy', () => {
    const supportedStrategies = listCatalog().filter((strategy) =>
      PREVIEW_STRATEGY_IDS.has(strategy.id),
    );

    expect(supportedStrategies.length).toBe(6);

    for (const strategy of supportedStrategies) {
      const metadata = resolveStrategyMetadata(strategy.id);

      expect(metadata).not.toBeNull();
      expect(metadata).toEqual(
        expect.objectContaining({
          strategyId: strategy.id,
          label: expect.any(String),
          family: expect.any(String),
          fitPrioritySummary: expect.any(String),
        }),
      );
      expect(metadata?.postureTags.length).toBeGreaterThan(0);
      expect(metadata?.scenarioTags.length).toBeGreaterThan(0);
      expect(metadata?.contrastNeighborTags.length).toBeGreaterThan(0);
    }
  });

  it('keeps metadata registry deterministic and explicitly ordered', () => {
    const first = listStrategyMetadataRegistry();
    const second = listStrategyMetadataRegistry();

    expect(first).toEqual(second);
    expect(first.map((metadata) => metadata.strategyId)).toEqual([
      'data_quality',
      'momentum_basics',
      'dip_buying',
      'trend_following',
      'mean_reversion',
      'fib_levels',
    ]);
  });

  it('classifies support lenses explicitly and keeps unknown strategies unresolved', () => {
    const dataQualityMetadata = resolveStrategyMetadata('data_quality');
    const dipBuyingMetadata = resolveStrategyMetadata('dip_buying');

    expect(dataQualityMetadata?.family).toBe('DATA_SUPPORT');
    expect(dipBuyingMetadata?.family).toBe('PULLBACK');
    expect(
      dataQualityMetadata
        ? isSupportStrategyMetadataFamily(dataQualityMetadata.family)
        : false,
    ).toBe(true);
    expect(
      dipBuyingMetadata
        ? isSupportStrategyMetadataFamily(dipBuyingMetadata.family)
        : true,
    ).toBe(false);
    expect(resolveStrategyMetadata('snapshot_change')).toBeNull();
  });

  it('keeps metadata free of trade execution and ranking theatre language', () => {
    const serialized = JSON.stringify(listStrategyMetadataRegistry());

    expect(serialized).not.toMatch(
      /execute|execution|dispatch|broker|trade now|leaderboard|top 10|winner|prediction|forecast/i,
    );
  });
});
