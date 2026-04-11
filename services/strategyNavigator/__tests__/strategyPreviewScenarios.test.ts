import {
  getStrategyPreviewScenario,
  listStrategyPreviewScenarios,
} from '@/services/strategyNavigator/strategyPreviewScenarios';

const EXPECTED_DIP_VOLATILITY = {
  scenarioId: 'DIP_VOLATILITY',
  title: 'Dip with expanding volatility',
  summary:
    'A quick drop lands alongside wider price swings, so the move looks less settled than a routine pullback.',
  traits: {
    volatilityState: 'expanding',
    structureState: 'pullback under strain',
    conditionState: 'less settled than a routine dip',
  },
} as const;

describe('strategyPreviewScenarios', () => {
  it('returns a finite deterministic scenario catalog with explicit interpreted traits', () => {
    expect(listStrategyPreviewScenarios()).toEqual([
      EXPECTED_DIP_VOLATILITY,
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
    ]);
    expect(listStrategyPreviewScenarios()).toEqual(listStrategyPreviewScenarios());
  });

  it('returns copied scenario objects so callers cannot mutate the canonical catalog', () => {
    const scenarios = listStrategyPreviewScenarios();

    scenarios[0].summary = 'mutated';
    if (scenarios[0].traits) {
      scenarios[0].traits.volatilityState = 'mutated';
    }

    expect(getStrategyPreviewScenario('DIP_VOLATILITY')).toEqual(EXPECTED_DIP_VOLATILITY);
    expect(listStrategyPreviewScenarios()[0]).toEqual(EXPECTED_DIP_VOLATILITY);
  });
});
