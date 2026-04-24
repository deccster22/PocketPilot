import type { StrategyCatalogEntry } from '@/core/strategy/catalogTypes';
import type { StrategyId } from '@/core/strategy/types';

import type {
  NearbyAlternativeAvailability,
  StrategyNavigatorSurface,
  StrategyPreviewFocus,
  StrategyPreviewScenarioId,
} from './types';

const MAX_NEARBY_ALTERNATIVES = 2;
const MIN_COMPARABLE_SCORE = 3;
const SUPPORT_LENS_PENALTY = -2;
const SUPPORT_LENS_STRATEGY_IDS = new Set<StrategyId>(['data_quality']);

const ENABLED_SURFACES = new Set<StrategyNavigatorSurface>(['STRATEGY_NAVIGATOR']);

const STRATEGY_PROXIMITY: Readonly<
  Partial<Record<StrategyId, Readonly<Partial<Record<StrategyId, number>>>>>
> = {
  data_quality: {
    momentum_basics: 2,
    dip_buying: 3,
    trend_following: 2,
    mean_reversion: 3,
    fib_levels: 1,
  },
  momentum_basics: {
    data_quality: 2,
    dip_buying: 1,
    trend_following: 5,
    mean_reversion: 1,
    fib_levels: 4,
  },
  dip_buying: {
    data_quality: 3,
    momentum_basics: 1,
    trend_following: 1,
    mean_reversion: 5,
    fib_levels: 4,
  },
  trend_following: {
    data_quality: 2,
    momentum_basics: 5,
    dip_buying: 1,
    mean_reversion: 1,
    fib_levels: 4,
  },
  mean_reversion: {
    data_quality: 3,
    momentum_basics: 1,
    dip_buying: 5,
    trend_following: 1,
    fib_levels: 4,
  },
  fib_levels: {
    data_quality: 1,
    momentum_basics: 4,
    dip_buying: 4,
    trend_following: 4,
    mean_reversion: 4,
  },
};

const SCENARIO_BONUS: Readonly<
  Record<StrategyPreviewScenarioId, Readonly<Partial<Record<StrategyId, number>>>>
> = {
  DIP_VOLATILITY: {
    data_quality: 1,
    momentum_basics: -1,
    dip_buying: 2,
    trend_following: -1,
    mean_reversion: 2,
    fib_levels: 1,
  },
  TREND_CONTINUATION: {
    data_quality: 0,
    momentum_basics: 2,
    dip_buying: -1,
    trend_following: 2,
    mean_reversion: -1,
    fib_levels: 1,
  },
  MIXED_REVERSAL: {
    data_quality: 1,
    momentum_basics: 0,
    dip_buying: 2,
    trend_following: 0,
    mean_reversion: 2,
    fib_levels: 1,
  },
  RANGE_COMPRESSION: {
    data_quality: 1,
    momentum_basics: 0,
    dip_buying: 0,
    trend_following: 1,
    mean_reversion: 1,
    fib_levels: 2,
  },
};

const FOCUS_BONUS_RULES: ReadonlyArray<{
  pattern: RegExp;
  bonuses: Readonly<Partial<Record<StrategyId, number>>>;
}> = [
  {
    pattern: /\bestimated\b|\bconfirmed\b|\bcertainty\b|\btrustworthy\b|\bcoverage\b/i,
    bonuses: {
      data_quality: 2,
    },
  },
  {
    pattern: /\bcontinuation\b|\bfollow-through\b|\btrend\b|\bdirectional\b|\bstrength\b/i,
    bonuses: {
      momentum_basics: 1,
      trend_following: 2,
      fib_levels: 1,
    },
  },
  {
    pattern: /\bdip\b|\bpullback\b|\bweakness\b|\breversal\b|\bovershoot\b/i,
    bonuses: {
      dip_buying: 2,
      mean_reversion: 2,
      fib_levels: 1,
    },
  },
  {
    pattern: /\blevel\b|\bzone\b|\bstructure\b|\bsupport\b|\bresistance\b|\bretracement\b/i,
    bonuses: {
      fib_levels: 2,
      trend_following: 1,
      mean_reversion: 1,
    },
  },
];

function isEnabledForSurface(surface: StrategyNavigatorSurface): boolean {
  return ENABLED_SURFACES.has(surface);
}

function resolveProximityScore(bestFitStrategyId: StrategyId, candidateStrategyId: StrategyId): number {
  return (
    STRATEGY_PROXIMITY[bestFitStrategyId]?.[candidateStrategyId] ??
    STRATEGY_PROXIMITY[candidateStrategyId]?.[bestFitStrategyId] ??
    0
  );
}

function resolveScenarioBonus(
  scenarioId: StrategyPreviewScenarioId,
  candidateStrategyId: StrategyId,
): number {
  return SCENARIO_BONUS[scenarioId]?.[candidateStrategyId] ?? 0;
}

function createFocusText(focus: StrategyPreviewFocus | null | undefined): string {
  if (!focus) {
    return '';
  }

  return [
    focus.snapshotHeadline,
    ...focus.dashboardFocus,
    ...focus.eventHighlights,
    focus.alertPosture,
  ]
    .join(' ')
    .trim();
}

function resolveFocusBonus(candidateStrategyId: StrategyId, focusText: string): number {
  if (focusText.length === 0) {
    return 0;
  }

  return FOCUS_BONUS_RULES.reduce((score, rule) => {
    if (!rule.pattern.test(focusText)) {
      return score;
    }

    return score + (rule.bonuses[candidateStrategyId] ?? 0);
  }, 0);
}

function resolveSupportLensPenalty(
  bestFitStrategyId: StrategyId,
  candidateStrategyId: StrategyId,
): number {
  if (
    bestFitStrategyId !== 'data_quality' &&
    SUPPORT_LENS_STRATEGY_IDS.has(candidateStrategyId)
  ) {
    return SUPPORT_LENS_PENALTY;
  }

  return 0;
}

type NearbyAlternativeScore = {
  strategyId: StrategyId;
  score: number;
};

function scoreNearbyAlternative(params: {
  bestFitStrategyId: StrategyId;
  bestFitArchetype: StrategyCatalogEntry['archetype'];
  candidate: Pick<StrategyCatalogEntry, 'id' | 'archetype'>;
  scenarioId: StrategyPreviewScenarioId;
  focusText: string;
}): NearbyAlternativeScore | null {
  if (params.candidate.id === params.bestFitStrategyId) {
    return null;
  }

  const proximityScore = resolveProximityScore(params.bestFitStrategyId, params.candidate.id);
  const scenarioBonus = resolveScenarioBonus(params.scenarioId, params.candidate.id);
  const focusBonus = resolveFocusBonus(params.candidate.id, params.focusText);
  const supportLensPenalty = resolveSupportLensPenalty(
    params.bestFitStrategyId,
    params.candidate.id,
  );
  const sameArchetypeBonus =
    params.candidate.archetype === params.bestFitArchetype ? 1 : 0;
  const clearlyDistant =
    proximityScore <= 1 && scenarioBonus <= 0 && focusBonus === 0 && sameArchetypeBonus === 0;

  if (clearlyDistant) {
    return null;
  }

  return {
    strategyId: params.candidate.id,
    score:
      proximityScore +
      scenarioBonus +
      focusBonus +
      sameArchetypeBonus +
      supportLensPenalty,
  };
}

export function selectNearbyAlternativeStrategies(params: {
  surface?: StrategyNavigatorSurface;
  bestFitStrategyId?: StrategyId | null;
  strategies?: ReadonlyArray<Pick<StrategyCatalogEntry, 'id' | 'archetype'>> | null;
  scenarioId?: StrategyPreviewScenarioId | null;
  focus?: StrategyPreviewFocus | null;
}): NearbyAlternativeAvailability {
  const surface = params.surface ?? 'STRATEGY_NAVIGATOR';
  const bestFitStrategyId = params.bestFitStrategyId ?? null;
  const scenarioId = params.scenarioId ?? null;

  if (!isEnabledForSurface(surface)) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    };
  }

  if (!bestFitStrategyId || !scenarioId || !params.strategies || params.strategies.length < 2) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_COMPARABLE_ALTERNATIVES',
    };
  }

  const bestFitStrategy = params.strategies.find(
    (strategy) => strategy.id === bestFitStrategyId,
  );

  if (!bestFitStrategy) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_COMPARABLE_ALTERNATIVES',
    };
  }

  const focusText = createFocusText(params.focus);
  const scoredAlternatives = params.strategies
    .map((candidate) =>
      scoreNearbyAlternative({
        bestFitStrategyId,
        scenarioId: scenarioId,
        bestFitArchetype: bestFitStrategy.archetype,
        candidate,
        focusText,
      }),
    )
    .filter((score): score is NearbyAlternativeScore => score !== null)
    .sort(
      (left, right) =>
        right.score - left.score || left.strategyId.localeCompare(right.strategyId),
    );

  const preferredAlternatives = scoredAlternatives
    .filter((candidate) => candidate.score >= MIN_COMPARABLE_SCORE)
    .slice(0, MAX_NEARBY_ALTERNATIVES);
  const fallbackAlternatives = scoredAlternatives
    .filter((candidate) => candidate.score > 0)
    .slice(0, MAX_NEARBY_ALTERNATIVES);
  const selectedAlternatives =
    preferredAlternatives.length > 0 ? preferredAlternatives : fallbackAlternatives;

  if (selectedAlternatives.length === 0) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_COMPARABLE_ALTERNATIVES',
    };
  }

  return {
    status: 'AVAILABLE',
    selection: {
      bestFitStrategyId,
      nearbyAlternativeStrategyIds: selectedAlternatives.map(
        (candidate) => candidate.strategyId,
      ),
    },
  };
}
