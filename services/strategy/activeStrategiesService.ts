import type { UserProfile } from '@/core/profile/types';
import type { Strategy } from '@/core/strategy/types';

import { dataQualityStrategy } from '@/core/strategy/strategies/dataQualityStrategy';
import { dipBuyingStrategy } from '@/core/strategy/strategies/dipBuyingStrategy';
import { momentumBasicsStrategy } from '@/core/strategy/strategies/momentumBasicsStrategy';
import { noopStrategy } from '@/core/strategy/strategies/noopStrategy';
import { snapshotChangeStrategy } from '@/core/strategy/strategies/snapshotChangeStrategy';
import { defaultStrategyIdsForProfile } from '@/core/strategy/profileDefaults';

const implementedStrategiesById: Record<string, Strategy> = {
  [dataQualityStrategy.id]: dataQualityStrategy,
  [dipBuyingStrategy.id]: dipBuyingStrategy,
  [momentumBasicsStrategy.id]: momentumBasicsStrategy,
  [noopStrategy.id]: noopStrategy,
  [snapshotChangeStrategy.id]: snapshotChangeStrategy,
};

export function resolveActiveStrategies(params: { profile: UserProfile }): Strategy[] {
  const resolved = defaultStrategyIdsForProfile(params.profile)
    .map((strategyId) => implementedStrategiesById[strategyId])
    .filter((strategy): strategy is Strategy => strategy !== undefined);

  return resolved.length > 0 ? resolved : [noopStrategy];
}
