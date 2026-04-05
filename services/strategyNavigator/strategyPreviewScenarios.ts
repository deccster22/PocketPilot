import type { StrategyPreviewScenario, StrategyPreviewScenarioId } from './types';

const STRATEGY_PREVIEW_SCENARIOS: ReadonlyArray<StrategyPreviewScenario> = [
  {
    scenarioId: 'DIP_VOLATILITY',
    title: 'Dip with expanding volatility',
    summary:
      'A quick drop lands alongside wider price swings, so the move looks less settled than a routine pullback.',
  },
  {
    scenarioId: 'TREND_CONTINUATION',
    title: 'Trend continuation',
    summary:
      'An existing move keeps extending in the same direction, with enough order to ask whether the backdrop is still supporting it.',
  },
  {
    scenarioId: 'MIXED_REVERSAL',
    title: 'Mixed reversal attempt',
    summary:
      'A prior move starts to unwind, but the picture is still divided rather than cleanly flipped into a new regime.',
  },
  {
    scenarioId: 'RANGE_COMPRESSION',
    title: 'Range compression',
    summary:
      'Price movement tightens and activity quiets down, leaving the next move unresolved instead of obvious.',
  },
] as const;

export function listStrategyPreviewScenarios(): StrategyPreviewScenario[] {
  return STRATEGY_PREVIEW_SCENARIOS.map((scenario) => ({
    ...scenario,
  }));
}

export function getStrategyPreviewScenario(
  scenarioId: StrategyPreviewScenarioId,
): StrategyPreviewScenario | undefined {
  return STRATEGY_PREVIEW_SCENARIOS.find((scenario) => scenario.scenarioId === scenarioId);
}
