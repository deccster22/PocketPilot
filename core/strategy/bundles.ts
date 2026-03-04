export type StrategyBundleId = 'beginner_core' | 'middle_core' | 'advanced_core';

export type StrategyBundle = {
  id: StrategyBundleId;
  name: string;
  strategyIds: string[];
  sortOrder: number;
};

export const STRATEGY_BUNDLES: StrategyBundle[] = [
  {
    id: 'beginner_core',
    name: 'Beginner Core',
    strategyIds: ['data_quality', 'dip_buying', 'momentum_basics'],
    sortOrder: 10,
  },
  {
    id: 'middle_core',
    name: 'Middle Core',
    strategyIds: ['data_quality', 'snapshot_change', 'noop'],
    sortOrder: 20,
  },
  {
    id: 'advanced_core',
    name: 'Advanced Core',
    strategyIds: ['data_quality', 'snapshot_change', 'noop'],
    sortOrder: 30,
  },
];
