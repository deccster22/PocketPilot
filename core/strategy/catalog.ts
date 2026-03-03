import type { StrategyId } from '@/core/strategy/types';
import type { StrategyArchetype, StrategyCatalogEntry } from '@/core/strategy/catalogTypes';

export const STRATEGY_CATALOG: readonly StrategyCatalogEntry[] = [
  {
    id: 'noop',
    name: 'No-op Strategy',
    archetype: 'ADVANCED',
    shortDescription: 'Placeholder strategy that emits no signals.',
    sortOrder: 0,
    tags: ['placeholder'],
  },
  {
    id: 'data_quality',
    name: 'Data Quality',
    archetype: 'BEGINNER',
    shortDescription: 'Highlights when quote coverage may be incomplete or estimated.',
    sortOrder: 10,
  },
  {
    id: 'momentum_basics',
    name: 'Momentum Basics',
    archetype: 'BEGINNER',
    shortDescription: 'Tracks directional persistence using simple momentum cues.',
    sortOrder: 20,
  },
  {
    id: 'dip_buying',
    name: 'Dip Buying',
    archetype: 'BEGINNER',
    shortDescription: 'Identifies pullbacks for potential recovery monitoring.',
    sortOrder: 30,
  },
  {
    id: 'trend_following',
    name: 'Trend Following',
    archetype: 'MIDDLE',
    shortDescription: 'Follows sustained directional movement over time windows.',
    sortOrder: 40,
  },
  {
    id: 'mean_reversion',
    name: 'Mean Reversion',
    archetype: 'MIDDLE',
    shortDescription: 'Watches deviations from a baseline for reversion behavior.',
    sortOrder: 50,
  },
  {
    id: 'fib_levels',
    name: 'Fibonacci Levels',
    archetype: 'ADVANCED',
    shortDescription: 'Evaluates price interaction near predefined retracement levels.',
    sortOrder: 60,
  },
] as const;

export function getCatalogEntry(id: StrategyId): StrategyCatalogEntry | undefined {
  return STRATEGY_CATALOG.find((entry) => entry.id === id);
}

export function listCatalog(params?: { archetype?: StrategyArchetype }): StrategyCatalogEntry[] {
  const filtered = params?.archetype
    ? STRATEGY_CATALOG.filter((entry) => entry.archetype === params.archetype)
    : STRATEGY_CATALOG;

  return [...filtered].sort((a, b) => a.sortOrder - b.sortOrder);
}
