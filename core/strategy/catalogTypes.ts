import type { StrategyId } from '@/core/strategy/types';

export type StrategyArchetype = 'BEGINNER' | 'MIDDLE' | 'ADVANCED';

export type StrategyCatalogEntry = {
  id: StrategyId;
  name: string;
  archetype: StrategyArchetype;
  shortDescription: string;
  sortOrder: number;
  tags?: string[];
};
