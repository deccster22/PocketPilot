import type { StrategyId } from '@/core/strategy/types';

import type { StrategyMetadata, StrategyMetadataFamily } from './types';

const METADATA_STRATEGY_ORDER: ReadonlyArray<StrategyId> = [
  'data_quality',
  'momentum_basics',
  'dip_buying',
  'trend_following',
  'mean_reversion',
  'fib_levels',
];

const STRATEGY_METADATA_REGISTRY: Readonly<Partial<Record<StrategyId, StrategyMetadata>>> = {
  data_quality: {
    strategyId: 'data_quality',
    label: 'Data Quality',
    family: 'DATA_SUPPORT',
    postureTags: ['CERTAINTY_SUPPORT'],
    scenarioTags: [
      'DIP_VOLATILITY',
      'TREND_CONTINUATION',
      'MIXED_REVERSAL',
      'RANGE_COMPRESSION',
    ],
    contrastNeighborTags: ['CERTAINTY_SUPPORT'],
    fitPrioritySummary: 'certainty boundaries and whether context still looks trustworthy',
    knowledgeTopicId: 'pp-estimated-vs-confirmed-context',
  },
  momentum_basics: {
    strategyId: 'momentum_basics',
    label: 'Momentum Basics',
    family: 'MOMENTUM',
    postureTags: ['TREND_CONTINUATION', 'ORDERLY_FOLLOW_THROUGH'],
    scenarioTags: ['TREND_CONTINUATION', 'RANGE_COMPRESSION'],
    contrastNeighborTags: ['TREND_CONTINUATION', 'STRUCTURE_LEVELS'],
    fitPrioritySummary: 'orderly follow-through rather than movement speed alone',
    knowledgeTopicId: 'strategy-momentum-pulse',
  },
  dip_buying: {
    strategyId: 'dip_buying',
    label: 'Dip Buying',
    family: 'PULLBACK',
    postureTags: ['PULLBACK_STABILIZATION', 'MEAN_RESET'],
    scenarioTags: ['DIP_VOLATILITY', 'MIXED_REVERSAL'],
    contrastNeighborTags: [
      'PULLBACK_STABILIZATION',
      'MEAN_RESET',
      'STRUCTURE_LEVELS',
    ],
    fitPrioritySummary: 'whether weakness is stabilizing into a calmer pullback',
    knowledgeTopicId: 'strategy-buy-the-dip',
  },
  trend_following: {
    strategyId: 'trend_following',
    label: 'Trend Following',
    family: 'MOMENTUM',
    postureTags: ['TREND_STRUCTURE', 'DIRECTIONAL_HOLD'],
    scenarioTags: ['TREND_CONTINUATION', 'RANGE_COMPRESSION'],
    contrastNeighborTags: ['TREND_CONTINUATION', 'STRUCTURE_LEVELS'],
    fitPrioritySummary: 'whether the broader directional structure is still holding',
    knowledgeTopicId: 'strategy-trend-follow',
  },
  mean_reversion: {
    strategyId: 'mean_reversion',
    label: 'Mean Reversion',
    family: 'REVERSAL',
    postureTags: ['MEAN_RESET', 'OVERSHOOT_EASING'],
    scenarioTags: ['DIP_VOLATILITY', 'MIXED_REVERSAL', 'RANGE_COMPRESSION'],
    contrastNeighborTags: [
      'PULLBACK_STABILIZATION',
      'MEAN_RESET',
      'STRUCTURE_LEVELS',
    ],
    fitPrioritySummary: 'stretch-versus-baseline context and whether pressure is easing',
    knowledgeTopicId: null,
  },
  fib_levels: {
    strategyId: 'fib_levels',
    label: 'Fibonacci Levels',
    family: 'STRUCTURE',
    postureTags: ['STRUCTURE_LEVELS', 'RETRACEMENT_BEHAVIOR'],
    scenarioTags: [
      'DIP_VOLATILITY',
      'TREND_CONTINUATION',
      'MIXED_REVERSAL',
      'RANGE_COMPRESSION',
    ],
    contrastNeighborTags: [
      'TREND_CONTINUATION',
      'PULLBACK_STABILIZATION',
      'MEAN_RESET',
      'STRUCTURE_LEVELS',
    ],
    fitPrioritySummary: 'how price behaves around nearby structural levels',
    knowledgeTopicId: null,
  },
};

export function listStrategyMetadataRegistry(): ReadonlyArray<StrategyMetadata> {
  return METADATA_STRATEGY_ORDER.map((strategyId) => STRATEGY_METADATA_REGISTRY[strategyId]).filter(
    (metadata): metadata is StrategyMetadata => metadata !== undefined,
  );
}

export function resolveStrategyMetadata(strategyId: StrategyId): StrategyMetadata | null {
  return STRATEGY_METADATA_REGISTRY[strategyId] ?? null;
}

export function isSupportStrategyMetadataFamily(
  family: StrategyMetadataFamily,
): boolean {
  return family === 'DATA_SUPPORT' || family === 'RISK_SUPPORT';
}
