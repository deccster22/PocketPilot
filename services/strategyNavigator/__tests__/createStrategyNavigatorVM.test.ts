import { listCatalog } from '@/core/strategy/catalog';
import { createStrategyNavigatorVM } from '@/services/strategyNavigator/createStrategyNavigatorVM';
import { listStrategyPreviewScenarios } from '@/services/strategyNavigator/strategyPreviewScenarios';

const PREVIEW_STRATEGY_IDS = new Set([
  'data_quality',
  'momentum_basics',
  'dip_buying',
  'trend_following',
  'mean_reversion',
  'fib_levels',
]);

function createStrategies() {
  return listCatalog().filter((strategy) => PREVIEW_STRATEGY_IDS.has(strategy.id));
}

describe('createStrategyNavigatorVM', () => {
  it('builds one calm descriptive preview from explicit strategy and scenario inputs', () => {
    const result = createStrategyNavigatorVM({
      generatedAt: '2026-04-05T00:00:00.000Z',
      selectedStrategyId: 'momentum_basics',
      selectedScenarioId: 'TREND_CONTINUATION',
      strategies: createStrategies(),
      scenarios: listStrategyPreviewScenarios(),
    });

    expect(result.title).toBe('Strategy Preview');
    expect(result.summary).toBe(
      'A calm walkthrough of how PocketPilot would shift its read under a simulated market picture.',
    );
    expect(result.generatedAt).toBe('2026-04-05T00:00:00.000Z');
    expect(result.selectedStrategyId).toBe('momentum_basics');
    expect(result.selectedScenarioId).toBe('TREND_CONTINUATION');
    expect(result.strategyOptions.map((strategy) => strategy.strategyId)).toEqual([
      'data_quality',
      'momentum_basics',
      'dip_buying',
      'trend_following',
      'mean_reversion',
      'fib_levels',
    ]);
    expect(result.scenarios.map((scenario) => scenario.scenarioId)).toEqual([
      'DIP_VOLATILITY',
      'TREND_CONTINUATION',
      'MIXED_REVERSAL',
      'RANGE_COMPRESSION',
    ]);
    expect(result.availability).toEqual({
      status: 'AVAILABLE',
      strategyId: 'momentum_basics',
      scenario: {
        scenarioId: 'TREND_CONTINUATION',
        title: 'Trend continuation',
        summary:
          'An existing move keeps extending in the same direction, with enough order to ask whether the backdrop is still supporting it.',
      },
      focus: {
        snapshotHeadline:
          'Snapshot would keep strength in view, but it would still wait for orderly follow-through rather than celebrate the move.',
        dashboardFocus: [
          'Names still building orderly strength would move closer to the prime zone.',
          'PocketPilot would keep overstretched or thinly supported moves tempered instead of letting the continuation become theatre.',
        ],
        eventHighlights: [
          'Momentum-building events would matter most when they repeat without support starting to fray.',
          'Price-movement events would stay secondary unless they begin to interrupt the broader strength read.',
        ],
        alertPosture:
          'Alerts would stay observational and mostly confirm that strength is still building in an orderly way.',
      },
    });
  });

  it('returns unavailable honestly when a strategy has not been selected yet', () => {
    expect(
      createStrategyNavigatorVM({
        generatedAt: '2026-04-05T00:00:00.000Z',
        selectedStrategyId: null,
        selectedScenarioId: 'DIP_VOLATILITY',
        strategies: createStrategies(),
        scenarios: listStrategyPreviewScenarios(),
      }).availability,
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_STRATEGY_SELECTED',
    });
  });

  it('returns unavailable honestly when a scenario is missing', () => {
    expect(
      createStrategyNavigatorVM({
        generatedAt: '2026-04-05T00:00:00.000Z',
        selectedStrategyId: 'dip_buying',
        selectedScenarioId: null,
        strategies: createStrategies(),
        scenarios: listStrategyPreviewScenarios(),
      }).availability,
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_SCENARIO_AVAILABLE',
    });
  });

  it('keeps surface eligibility in services instead of leaving it to app', () => {
    expect(
      createStrategyNavigatorVM({
        generatedAt: '2026-04-05T00:00:00.000Z',
        selectedStrategyId: 'trend_following',
        selectedScenarioId: 'MIXED_REVERSAL',
        strategies: createStrategies(),
        scenarios: listStrategyPreviewScenarios(),
        surface: 'DASHBOARD',
      }).availability,
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });
  });

  it('keeps preview copy descriptive and free of execution or urgency semantics', () => {
    const result = createStrategyNavigatorVM({
      generatedAt: '2026-04-05T00:00:00.000Z',
      selectedStrategyId: 'fib_levels',
      selectedScenarioId: 'RANGE_COMPRESSION',
      strategies: createStrategies(),
      scenarios: listStrategyPreviewScenarios(),
    });

    if (result.availability.status !== 'AVAILABLE') {
      throw new Error('Expected preview to be available.');
    }

    const serialized = JSON.stringify(result.availability.focus);

    expect(serialized).not.toMatch(
      /buy|sell|entry|exit|execute|execution|dispatch|order|broker|profit|forecast|prediction|guarantee|urgent|act now/i,
    );
    expect(serialized).not.toMatch(
      /eventId|signalsTriggered|signalCode|providerId|metadata|runtime|accountId|confidenceScore/i,
    );
  });

  it('stays deterministic for identical inputs', () => {
    const params = {
      generatedAt: '2026-04-05T00:00:00.000Z',
      selectedStrategyId: 'mean_reversion' as const,
      selectedScenarioId: 'MIXED_REVERSAL' as const,
      strategies: createStrategies(),
      scenarios: listStrategyPreviewScenarios(),
    };

    expect(createStrategyNavigatorVM(params)).toEqual(createStrategyNavigatorVM(params));
  });
});
