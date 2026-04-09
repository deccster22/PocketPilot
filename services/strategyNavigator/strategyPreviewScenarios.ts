import type { StrategyPreviewScenario, StrategyPreviewScenarioId } from './types';

const STRATEGY_PREVIEW_SCENARIOS: ReadonlyArray<StrategyPreviewScenario> = [
  {
    scenarioId: 'DIP_VOLATILITY',
    title: 'Dip with expanding volatility',
    summary:
      'A quick drop lands alongside wider price swings, so the move looks less settled than a routine pullback.',
    traits: {
      volatilityState: 'expanding',
      structureState: 'pullback under strain',
      conditionState: 'less settled than a routine dip',
    },
  },
  {
    scenarioId: 'TREND_CONTINUATION',
    title: 'Trend continuation',
    summary:
      'An existing move keeps extending in the same direction, with enough order to ask whether the backdrop is still supporting it.',
    traits: {
      volatilityState: 'contained',
      structureState: 'directional and orderly',
      conditionState: 'more extended than a neutral pause',
    },
  },
  {
    scenarioId: 'MIXED_REVERSAL',
    title: 'Mixed reversal attempt',
    summary:
      'A prior move starts to unwind, but the picture is still divided rather than cleanly flipped into a new regime.',
    traits: {
      volatilityState: 'uneven',
      structureState: 'contested',
      conditionState: 'changing without looking settled',
    },
  },
  {
    scenarioId: 'RANGE_COMPRESSION',
    title: 'Range compression',
    summary:
      'Price movement tightens and activity quiets down, leaving the next move unresolved instead of obvious.',
    traits: {
      volatilityState: 'compressed',
      structureState: 'range-bound',
      conditionState: 'calmer but still unresolved',
    },
  },
] as const;

function copyScenario(scenario: StrategyPreviewScenario): StrategyPreviewScenario {
  return {
    ...scenario,
    traits: scenario.traits
      ? {
          ...scenario.traits,
        }
      : undefined,
  };
}

export function listStrategyPreviewScenarios(): StrategyPreviewScenario[] {
  return STRATEGY_PREVIEW_SCENARIOS.map(copyScenario);
}

export function getStrategyPreviewScenario(
  scenarioId: StrategyPreviewScenarioId,
): StrategyPreviewScenario | undefined {
  const scenario = STRATEGY_PREVIEW_SCENARIOS.find(
    (scenarioOption) => scenarioOption.scenarioId === scenarioId,
  );

  return scenario ? copyScenario(scenario) : undefined;
}
