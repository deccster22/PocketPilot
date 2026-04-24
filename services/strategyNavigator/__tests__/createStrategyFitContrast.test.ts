import { listCatalog } from '@/core/strategy/catalog';
import { createStrategyFitContrast } from '@/services/strategyNavigator/createStrategyFitContrast';
import { listStrategyPreviewScenarios } from '@/services/strategyNavigator/strategyPreviewScenarios';

const PREVIEW_STRATEGY_IDS = new Set([
  'data_quality',
  'momentum_basics',
  'dip_buying',
  'trend_following',
  'mean_reversion',
  'fib_levels',
]);

const DIP_FOCUS = {
  snapshotHeadline:
    'Snapshot would treat this as a dip worth watching, but only once the drop starts to settle into something interpretable.',
  dashboardFocus: [
    'The Dashboard would look for orderly weakness and early stabilisation instead of chase-the-drop framing.',
    'Estimated or widening moves would keep the setup in a more cautious lane until the tape calms.',
  ],
  eventHighlights: [
    'Dip-detected events would matter most when they are followed by calmer price movement.',
    'Estimated-price events would matter if the backdrop is still too noisy to trust the read.',
  ],
  alertPosture:
    'Alerts would feel patient and would describe the dip as something to monitor rather than something to chase.',
} as const;

function createStrategies() {
  return listCatalog()
    .filter((strategy) => PREVIEW_STRATEGY_IDS.has(strategy.id))
    .map((strategy) => ({
      id: strategy.id,
      name: strategy.name,
      archetype: strategy.archetype,
    }));
}

describe('createStrategyFitContrast', () => {
  it('builds one calm comparative fit contrast for the current simulated best-fit strategy and nearby alternatives', () => {
    expect(
      createStrategyFitContrast({
        strategy: {
          id: 'dip_buying',
          name: 'Dip Buying',
        },
        strategies: createStrategies(),
        scenario: listStrategyPreviewScenarios()[0],
        focus: DIP_FOCUS,
      }),
    ).toEqual({
      status: 'AVAILABLE',
      contrast: {
        bestFitStrategyId: 'dip_buying',
        bestFitLabel: 'Dip Buying',
        whyItFits: [
          'Current simulated backdrop: volatility is expanding, structure is pullback under strain, and the condition is less settled than a routine dip.',
          'Dip Buying stays the closer fit because it keeps attention on whether weakness is stabilizing into a calmer pullback while the pullback is still stressed and trying to settle.',
        ],
        lessSuitableAlternatives: [
          {
            strategyId: 'mean_reversion',
            label: 'Mean Reversion',
            lines: [
              'Compared with Dip Buying, Mean Reversion is less suitable right now because it leans on stretch-versus-baseline context and whether pressure is easing while the dip still carries expansion stress.',
            ],
          },
          {
            strategyId: 'fib_levels',
            label: 'Fibonacci Levels',
            lines: [
              'Compared with Dip Buying, Fibonacci Levels is less suitable right now because it leans on how price behaves around nearby structural levels while the dip still carries expansion stress.',
            ],
          },
        ],
        ambiguityNote:
          'Ambiguity remains: expanding volatility can keep this dip read provisional until conditions settle.',
      },
    });
  });

  it('returns unavailable honestly when comparable inputs are incomplete', () => {
    expect(
      createStrategyFitContrast({
        strategy: {
          id: 'dip_buying',
          name: 'Dip Buying',
        },
        strategies: [
          {
            id: 'dip_buying',
            name: 'Dip Buying',
            archetype: 'BEGINNER',
          },
        ],
        scenario: listStrategyPreviewScenarios()[0],
        focus: DIP_FOCUS,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_COMPARABLE_CONTEXT',
    });
  });

  it('returns unavailable on surfaces where Strategy Navigator is not enabled', () => {
    expect(
      createStrategyFitContrast({
        surface: 'DASHBOARD',
        strategy: {
          id: 'dip_buying',
          name: 'Dip Buying',
        },
        strategies: createStrategies(),
        scenario: listStrategyPreviewScenarios()[0],
        focus: DIP_FOCUS,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });
  });

  it('keeps ambiguity explicit when the scenario remains mixed', () => {
    const result = createStrategyFitContrast({
      strategy: {
        id: 'mean_reversion',
        name: 'Mean Reversion',
      },
      strategies: createStrategies(),
      scenario: listStrategyPreviewScenarios()[2],
      focus: {
        snapshotHeadline:
          'Snapshot would see this as the cleanest mean-reversion setup of the four scenarios because the prior stretch is already trying to unwind.',
        dashboardFocus: [
          'The Dashboard would bring forward names where the reversal is easing a prior overshoot instead of simply creating fresh noise.',
        ],
        eventHighlights: [
          'Price-movement events would matter when they confirm the overshoot is beginning to ease.',
        ],
        alertPosture:
          'Alerts would describe the reversal as a baseline-rebalancing move when that read is supported, while still staying modest.',
      },
    });

    expect(result.status).toBe('AVAILABLE');
    if (result.status !== 'AVAILABLE') {
      throw new Error('Expected contrast to be available.');
    }

    expect(result.contrast.ambiguityNote).toBe(
      'Ambiguity remains: the reversal picture is still mixed, so this contrast is orientation, not a verdict.',
    );
  });

  it('keeps fit contrast copy descriptive and free of execution or ranking theatre language', () => {
    const result = createStrategyFitContrast({
      strategy: {
        id: 'momentum_basics',
        name: 'Momentum Basics',
      },
      strategies: createStrategies(),
      scenario: listStrategyPreviewScenarios()[1],
      focus: {
        snapshotHeadline:
          'Snapshot would keep strength in view, but it would still wait for orderly follow-through rather than celebrate the move.',
        dashboardFocus: [
          'Names still building orderly strength would move closer to the prime zone.',
        ],
        eventHighlights: [
          'Momentum-building events would matter most when they repeat without support starting to fray.',
        ],
        alertPosture:
          'Alerts would stay observational and mostly confirm that strength is still building in an orderly way.',
      },
    });

    expect(JSON.stringify(result)).not.toMatch(
      /sell|execute|execution|dispatch|broker|profit|prediction|forecast|guarantee|urgent|act now|top 10|leaderboard|winner/i,
    );
    expect(JSON.stringify(result)).not.toMatch(
      /eventId|signalsTriggered|signalCode|providerId|metadata|runtime|accountId|confidenceScore/i,
    );
  });

  it('does not repeat visible fit-contrast lines for identical context', () => {
    const result = createStrategyFitContrast({
      strategy: {
        id: 'dip_buying',
        name: 'Dip Buying',
      },
      strategies: createStrategies(),
      scenario: listStrategyPreviewScenarios()[0],
      focus: DIP_FOCUS,
    });

    expect(result.status).toBe('AVAILABLE');
    if (result.status !== 'AVAILABLE') {
      throw new Error('Expected fit contrast to be available.');
    }

    const visibleLines = [
      ...result.contrast.whyItFits,
      ...result.contrast.lessSuitableAlternatives.flatMap((alternative) => alternative.lines),
      result.contrast.ambiguityNote ?? null,
    ].filter((line): line is string => Boolean(line));

    expect(new Set(visibleLines).size).toBe(visibleLines.length);
  });

  it('stays deterministic for identical inputs', () => {
    const params = {
      strategy: {
        id: 'fib_levels' as const,
        name: 'Fibonacci Levels',
      },
      strategies: createStrategies(),
      scenario: listStrategyPreviewScenarios()[3],
      focus: {
        snapshotHeadline:
          'Snapshot would read the compression as a tightening zone and would ask which reference area is quietly taking shape.',
        dashboardFocus: [
          'The Dashboard would bring forward names where the range is tightening around a clear structural band.',
        ],
        eventHighlights: [
          'Price-movement events would matter when repeated touches keep defining the same zone.',
        ],
        alertPosture:
          'Alerts would stay sparse and would mostly note whether the range is organising around a meaningful level.',
      },
    };

    expect(createStrategyFitContrast(params)).toEqual(createStrategyFitContrast(params));
  });
});
