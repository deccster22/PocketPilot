import type { StrategyCatalogEntry } from '@/core/strategy/catalogTypes';
import type { StrategyId } from '@/core/strategy/types';

import type {
  StrategyFitContrastAvailability,
  StrategyNavigatorSurface,
  StrategyPreviewFocus,
  StrategyPreviewScenario,
} from './types';

const MAX_ALTERNATIVES = 2;

const ENABLED_SURFACES = new Set<StrategyNavigatorSurface>(['STRATEGY_NAVIGATOR']);

const NEARBY_ALTERNATIVES: Readonly<Partial<Record<StrategyId, ReadonlyArray<StrategyId>>>> = {
  data_quality: ['momentum_basics', 'trend_following'],
  momentum_basics: ['trend_following', 'dip_buying'],
  dip_buying: ['mean_reversion', 'trend_following'],
  trend_following: ['momentum_basics', 'fib_levels'],
  mean_reversion: ['dip_buying', 'fib_levels'],
  fib_levels: ['trend_following', 'mean_reversion'],
};

function isEnabledForSurface(surface: StrategyNavigatorSurface): boolean {
  return ENABLED_SURFACES.has(surface);
}

function describeScenarioTraits(scenario: StrategyPreviewScenario): string {
  const traits = scenario.traits;

  if (!traits) {
    return 'the simulated backdrop remains finite and interpretation-led';
  }

  const parts = [
    traits.volatilityState ? `volatility is ${traits.volatilityState}` : null,
    traits.structureState ? `structure is ${traits.structureState}` : null,
    traits.conditionState ? `the condition is ${traits.conditionState}` : null,
  ].filter((part): part is string => part !== null);

  if (parts.length === 0) {
    return 'the simulated backdrop remains finite and interpretation-led';
  }

  if (parts.length === 1) {
    return parts[0];
  }

  if (parts.length === 2) {
    return `${parts[0]} and ${parts[1]}`;
  }

  return `${parts[0]}, ${parts[1]}, and ${parts[2]}`;
}

function describeStrategyPriority(strategyId: StrategyId): string {
  switch (strategyId) {
    case 'data_quality':
      return 'certainty boundaries and whether context still looks trustworthy';
    case 'momentum_basics':
      return 'orderly follow-through rather than movement speed alone';
    case 'dip_buying':
      return 'whether weakness is stabilizing into a calmer pullback';
    case 'trend_following':
      return 'whether the broader directional structure is still holding';
    case 'mean_reversion':
      return 'stretch-versus-baseline context and whether pressure is easing';
    case 'fib_levels':
      return 'how price behaves around nearby structural levels';
    default:
      return 'interpreted context quality before directional theatre';
  }
}

function describeFitWindow(scenarioId: StrategyPreviewScenario['scenarioId']): string {
  switch (scenarioId) {
    case 'DIP_VOLATILITY':
      return 'the pullback is still stressed and trying to settle';
    case 'TREND_CONTINUATION':
      return 'the backdrop is still extending in an orderly direction';
    case 'MIXED_REVERSAL':
      return 'the backdrop is changing while the read still stays mixed';
    default:
      return 'the tape is quieter while resolution still stays open';
  }
}

function describeAlternativeWindow(scenarioId: StrategyPreviewScenario['scenarioId']): string {
  switch (scenarioId) {
    case 'DIP_VOLATILITY':
      return 'the dip still carries expansion stress';
    case 'TREND_CONTINUATION':
      return 'the continuation remains extended rather than reset';
    case 'MIXED_REVERSAL':
      return 'the reversal attempt remains mixed and unsettled';
    default:
      return 'the range remains unresolved despite quieter movement';
  }
}

function createAmbiguityNote(scenario: StrategyPreviewScenario): string | null {
  switch (scenario.scenarioId) {
    case 'DIP_VOLATILITY':
      return 'Ambiguity remains: expanding volatility can keep this dip read provisional until conditions settle.';
    case 'MIXED_REVERSAL':
      return 'Ambiguity remains: the reversal picture is still mixed, so this contrast is orientation, not a verdict.';
    case 'RANGE_COMPRESSION':
      return 'Ambiguity remains: compression can resolve in either direction, so this stays a context note rather than a call.';
    default:
      return null;
  }
}

function resolveNearbyAlternatives(params: {
  bestFitStrategyId: StrategyId;
  strategies: ReadonlyArray<Pick<StrategyCatalogEntry, 'id' | 'name'>>;
}): Array<Pick<StrategyCatalogEntry, 'id' | 'name'>> {
  const strategiesById = new Map(params.strategies.map((strategy) => [strategy.id, strategy] as const));
  const preferredIds = NEARBY_ALTERNATIVES[params.bestFitStrategyId] ?? [];
  const selectedIds: StrategyId[] = [];

  preferredIds.forEach((strategyId) => {
    if (strategyId !== params.bestFitStrategyId && strategiesById.has(strategyId)) {
      selectedIds.push(strategyId);
    }
  });

  if (selectedIds.length < MAX_ALTERNATIVES) {
    params.strategies.forEach((strategy) => {
      if (strategy.id === params.bestFitStrategyId || selectedIds.includes(strategy.id)) {
        return;
      }

      selectedIds.push(strategy.id);
    });
  }

  return selectedIds
    .slice(0, MAX_ALTERNATIVES)
    .map((strategyId) => strategiesById.get(strategyId))
    .filter((strategy): strategy is Pick<StrategyCatalogEntry, 'id' | 'name'> => Boolean(strategy));
}

function createPreparedEmphasisLine(focus: StrategyPreviewFocus): string {
  const emphasis = focus.dashboardFocus[0] ?? focus.snapshotHeadline;

  return `Current prepared emphasis: ${emphasis}`;
}

export function createStrategyFitContrast(params: {
  surface?: StrategyNavigatorSurface;
  strategy?: Pick<StrategyCatalogEntry, 'id' | 'name'> | null;
  strategies?: ReadonlyArray<Pick<StrategyCatalogEntry, 'id' | 'name'>> | null;
  scenario?: StrategyPreviewScenario | null;
  focus?: StrategyPreviewFocus | null;
}): StrategyFitContrastAvailability {
  const surface = params.surface ?? 'STRATEGY_NAVIGATOR';

  if (!isEnabledForSurface(surface)) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    };
  }

  if (
    !params.strategy ||
    !params.scenario ||
    !params.focus?.snapshotHeadline ||
    !params.strategies ||
    params.strategies.length < 2
  ) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_COMPARABLE_CONTEXT',
    };
  }

  const nearbyAlternatives = resolveNearbyAlternatives({
    bestFitStrategyId: params.strategy.id,
    strategies: params.strategies,
  });

  if (nearbyAlternatives.length === 0) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_COMPARABLE_CONTEXT',
    };
  }

  const fitWindow = describeFitWindow(params.scenario.scenarioId);
  const alternativeWindow = describeAlternativeWindow(params.scenario.scenarioId);

  return {
    status: 'AVAILABLE',
    contrast: {
      bestFitStrategyId: params.strategy.id,
      bestFitLabel: params.strategy.name,
      whyItFits: [
        `Current simulated backdrop: ${describeScenarioTraits(params.scenario)}.`,
        `${params.strategy.name} fits this context better because it keeps attention on ${describeStrategyPriority(
          params.strategy.id,
        )} while ${fitWindow}.`,
        createPreparedEmphasisLine(params.focus),
      ],
      lessSuitableAlternatives: nearbyAlternatives.map((alternative) => ({
        strategyId: alternative.id,
        label: alternative.name,
        lines: [
          `${alternative.name} is less suitable right now because it leans on ${describeStrategyPriority(
            alternative.id,
          )}, while ${alternativeWindow}.`,
          `In this lane, ${params.strategy?.name} stays the steadier interpretation-first fit while context keeps evolving.`,
        ],
      })),
      ambiguityNote: createAmbiguityNote(params.scenario),
    },
  };
}
