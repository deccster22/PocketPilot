import type { UserProfile } from '@/core/profile/types';
import type { Strategy } from '@/core/strategy/types';

import { dataQualityStrategy } from '@/core/strategy/strategies/dataQualityStrategy';
import { noopStrategy } from '@/core/strategy/strategies/noopStrategy';
import { defaultStrategyIdsForProfile } from '@/core/strategy/profileDefaults';

const implementedStrategiesById: Record<string, Strategy> = {
  [dataQualityStrategy.id]: dataQualityStrategy,
  [noopStrategy.id]: noopStrategy,
};

export function resolveActiveStrategies(params: { profile: UserProfile }): Strategy[] {
  const resolved = defaultStrategyIdsForProfile(params.profile)
    .map((strategyId) => implementedStrategiesById[strategyId])
    .filter((strategy): strategy is Strategy => strategy !== undefined);

  return resolved.length > 0 ? resolved : [noopStrategy];
}
