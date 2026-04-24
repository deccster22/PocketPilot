import type { StrategyCatalogEntry } from '@/core/strategy/catalogTypes';
import type { StrategyId } from '@/core/strategy/types';

import { selectNearbyAlternativeStrategies } from './selectNearbyAlternativeStrategies';
import { resolveStrategyMetadata } from './strategyMetadata';
import type {
  NearbyAlternativeAvailability,
  StrategyFitContrastAvailability,
  StrategyNavigatorSurface,
  StrategyPreviewFocus,
  StrategyPreviewScenario,
} from './types';

const ENABLED_SURFACES = new Set<StrategyNavigatorSurface>(['STRATEGY_NAVIGATOR']);

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
  return (
    resolveStrategyMetadata(strategyId)?.fitPrioritySummary ??
    'interpreted context quality before directional theatre'
  );
}

function resolveStrategyLabel(strategyId: StrategyId, fallbackLabel: string): string {
  return resolveStrategyMetadata(strategyId)?.label ?? fallbackLabel;
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

function mapNearbyAlternativeUnavailableReason(
  reason: Extract<NearbyAlternativeAvailability, { status: 'UNAVAILABLE' }>['reason'],
): Extract<StrategyFitContrastAvailability, { status: 'UNAVAILABLE' }>['reason'] {
  if (reason === 'NOT_ENABLED_FOR_SURFACE') {
    return 'NOT_ENABLED_FOR_SURFACE';
  }

  return 'NO_COMPARABLE_CONTEXT';
}

function resolveNearbyAlternatives(params: {
  strategies: ReadonlyArray<Pick<StrategyCatalogEntry, 'id' | 'name'>>;
  nearbyAlternativeStrategyIds: ReadonlyArray<StrategyId>;
}): Array<Pick<StrategyCatalogEntry, 'id' | 'name'>> {
  const strategiesById = new Map(
    params.strategies.map((strategy) => [strategy.id, strategy] as const),
  );

  return params.nearbyAlternativeStrategyIds
    .map((strategyId) => strategiesById.get(strategyId))
    .filter(
      (strategy): strategy is Pick<StrategyCatalogEntry, 'id' | 'name'> =>
        strategy !== undefined,
    );
}

function createUniqueLines(lines: ReadonlyArray<string>): string[] {
  const dedupedLines: string[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const normalizedLine = line.trim();

    if (normalizedLine.length === 0 || seen.has(normalizedLine)) {
      continue;
    }

    seen.add(normalizedLine);
    dedupedLines.push(normalizedLine);
  }

  return dedupedLines;
}

export function createStrategyFitContrast(params: {
  surface?: StrategyNavigatorSurface;
  strategy?: Pick<StrategyCatalogEntry, 'id' | 'name'> | null;
  strategies?: ReadonlyArray<
    Pick<StrategyCatalogEntry, 'id' | 'name' | 'archetype'>
  > | null;
  scenario?: StrategyPreviewScenario | null;
  focus?: StrategyPreviewFocus | null;
  nearbyAlternativeAvailability?: NearbyAlternativeAvailability | null;
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
  const strategy = params.strategy;

  const nearbyAlternativeAvailability =
    params.nearbyAlternativeAvailability ??
    selectNearbyAlternativeStrategies({
      surface,
      bestFitStrategyId: strategy.id,
      strategies: params.strategies,
      scenarioId: params.scenario.scenarioId,
      focus: params.focus,
    });

  if (nearbyAlternativeAvailability.status === 'UNAVAILABLE') {
    return {
      status: 'UNAVAILABLE',
      reason: mapNearbyAlternativeUnavailableReason(
        nearbyAlternativeAvailability.reason,
      ),
    };
  }

  const nearbyAlternatives = resolveNearbyAlternatives({
    strategies: params.strategies,
    nearbyAlternativeStrategyIds:
      nearbyAlternativeAvailability.selection.nearbyAlternativeStrategyIds,
  });

  if (nearbyAlternatives.length === 0) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_COMPARABLE_CONTEXT',
    };
  }

  const fitWindow = describeFitWindow(params.scenario.scenarioId);
  const alternativeWindow = describeAlternativeWindow(params.scenario.scenarioId);
  const bestFitLabel = resolveStrategyLabel(strategy.id, strategy.name);

  return {
    status: 'AVAILABLE',
    contrast: {
      bestFitStrategyId: strategy.id,
      bestFitLabel,
      whyItFits: createUniqueLines([
        `Current simulated backdrop: ${describeScenarioTraits(params.scenario)}.`,
        `${bestFitLabel} stays the closer fit because it keeps attention on ${describeStrategyPriority(
          strategy.id,
        )} while ${fitWindow}.`,
      ]),
      lessSuitableAlternatives: nearbyAlternatives.map((alternative) => {
        const alternativeLabel = resolveStrategyLabel(alternative.id, alternative.name);

        return {
          strategyId: alternative.id,
          label: alternativeLabel,
          lines: createUniqueLines([
            `Compared with ${bestFitLabel}, ${alternativeLabel} is less suitable right now because it leans on ${describeStrategyPriority(
              alternative.id,
            )} while ${alternativeWindow}.`,
          ]),
        };
      }),
      ambiguityNote: createAmbiguityNote(params.scenario),
    },
  };
}
