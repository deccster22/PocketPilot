import type { UserProfile } from '@/core/profile/types';
import { STRATEGY_BUNDLES, type StrategyBundleId } from '@/core/strategy/bundles';
import { defaultBundleIdsForProfile } from '@/core/strategy/profileDefaults';
import { dataQualityStrategy } from '@/core/strategy/strategies/dataQualityStrategy';
import { dipBuyingStrategy } from '@/core/strategy/strategies/dipBuyingStrategy';
import { momentumBasicsStrategy } from '@/core/strategy/strategies/momentumBasicsStrategy';
import { noopStrategy } from '@/core/strategy/strategies/noopStrategy';
import { snapshotChangeStrategy } from '@/core/strategy/strategies/snapshotChangeStrategy';
import type { Strategy } from '@/core/strategy/types';

const implementedStrategiesById: Record<string, Strategy> = {
  [dataQualityStrategy.id]: dataQualityStrategy,
  [dipBuyingStrategy.id]: dipBuyingStrategy,
  [momentumBasicsStrategy.id]: momentumBasicsStrategy,
  [noopStrategy.id]: noopStrategy,
  [snapshotChangeStrategy.id]: snapshotChangeStrategy,
};

export function resolveStrategyIds(input: {
  bundleIds?: StrategyBundleId[];
  strategyIds?: string[];
}): string[] {
  if (input.bundleIds && input.bundleIds.length > 0) {
    const bundleById = new Map(STRATEGY_BUNDLES.map((bundle) => [bundle.id, bundle]));
    const orderedBundles = input.bundleIds
      .map((bundleId) => bundleById.get(bundleId))
      .filter((bundle): bundle is (typeof STRATEGY_BUNDLES)[number] => bundle !== undefined)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const resolved: string[] = [];
    const seen = new Set<string>();

    for (const bundle of orderedBundles) {
      for (const strategyId of bundle.strategyIds) {
        if (!seen.has(strategyId)) {
          seen.add(strategyId);
          resolved.push(strategyId);
        }
      }
    }

    return resolved;
  }

  if (input.strategyIds && input.strategyIds.length > 0) {
    return [...input.strategyIds];
  }

  return [];
}

export function resolveActiveStrategies(params: {
  profile?: UserProfile;
  bundleIds?: StrategyBundleId[];
  strategyIds?: string[];
}): Strategy[] {
  const bundleIds =
    params.bundleIds ?? (params.profile ? defaultBundleIdsForProfile(params.profile) : undefined);

  const resolved = resolveStrategyIds({
    bundleIds,
    strategyIds: params.strategyIds,
  })
    .map((strategyId) => implementedStrategiesById[strategyId])
    .filter((strategy): strategy is Strategy => strategy !== undefined);

  return resolved.length > 0 ? resolved : [noopStrategy];
}
