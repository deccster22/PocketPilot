import { listCatalog } from '@/core/strategy/catalog';
import { knowledgeCatalog } from '@/services/knowledge/knowledgeCatalog';
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
    const scenarios = listStrategyPreviewScenarios();
    const result = createStrategyNavigatorVM({
      generatedAt: '2026-04-05T00:00:00.000Z',
      selectedStrategyId: 'momentum_basics',
      selectedScenarioId: 'TREND_CONTINUATION',
      strategies: createStrategies(),
      scenarios,
      knowledgeNodes: knowledgeCatalog,
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
    expect(result.scenarios).toEqual(scenarios);
    expect(result.availability).toEqual({
      status: 'AVAILABLE',
      strategyId: 'momentum_basics',
      scenario: scenarios[1],
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
    expect(result.explanation).toEqual({
      status: 'AVAILABLE',
      content: {
        title: 'Why Momentum Basics reacts this way',
        summary:
          'Momentum Basics looks for orderly strength and clean follow-through when an existing move is still extending in an orderly way. This keeps the simulated read focused on interpretation priorities rather than outcomes.',
        bullets: [
          'What it is noticing: Snapshot would keep strength in view, but it would still wait for orderly follow-through rather than celebrate the move.',
          'Why that matters: This lens gives more weight to moves that keep building in a steady way than to fast movement on its own.',
          'Relevant interpreted MarketEvents: Momentum-building events would matter most when they repeat without support starting to fray. Price-movement events would stay secondary unless they begin to interrupt the broader strength read.',
        ],
      },
    });
    expect(result.contrast).toEqual({
      status: 'AVAILABLE',
      content: {
        title: 'What changes in this scenario',
        summary:
          'Compared with a more neutral or mixed backdrop, Momentum Basics leans more toward orderly follow-through instead of loud movement alone because volatility is contained, structure is directional and orderly, and the condition is more extended than a neutral pause.',
        bullets: [
          'More attention here: Momentum-building events would matter most when they repeat without support starting to fray.',
          'Less central here: oversold or reversal language, because the backdrop is still extending rather than resetting.',
          'Preview expression: Names still building orderly strength would move closer to the prime zone.',
        ],
      },
    });
    expect(result.fitContrast).toEqual({
      status: 'AVAILABLE',
      contrast: {
        bestFitStrategyId: 'momentum_basics',
        bestFitLabel: 'Momentum Basics',
        whyItFits: [
          'Current simulated backdrop: volatility is contained, structure is directional and orderly, and the condition is more extended than a neutral pause.',
          'Momentum Basics stays the closer fit because it keeps attention on orderly follow-through rather than movement speed alone while the backdrop is still extending in an orderly direction.',
        ],
        lessSuitableAlternatives: [
          {
            strategyId: 'trend_following',
            label: 'Trend Following',
            lines: [
              'Compared with Momentum Basics, Trend Following is less suitable right now because it leans on whether the broader directional structure is still holding while the continuation remains extended rather than reset.',
            ],
          },
          {
            strategyId: 'fib_levels',
            label: 'Fibonacci Levels',
            lines: [
              'Compared with Momentum Basics, Fibonacci Levels is less suitable right now because it leans on how price behaves around nearby structural levels while the continuation remains extended rather than reset.',
            ],
          },
        ],
        ambiguityNote: null,
      },
    });
    expect(result.knowledgeFollowThrough).toEqual({
      status: 'AVAILABLE',
      items: [
        {
          topicId: 'strategy-momentum-pulse',
          title: 'Momentum Pulse',
          reason:
            'This preview keeps the momentum lens grounded in pace, follow-through, and whether acceleration still looks orderly.',
        },
        {
          topicId: 'pp-what-market-regime-means',
          title: 'What Market Regime Means',
          reason:
            'This simulated continuation makes more sense when the broader backdrop still has room in the interpretation.',
        },
      ],
    });
  });

  it('returns unavailable honestly when a strategy has not been selected yet', () => {
    const result = createStrategyNavigatorVM({
      generatedAt: '2026-04-05T00:00:00.000Z',
      selectedStrategyId: null,
      selectedScenarioId: 'DIP_VOLATILITY',
      strategies: createStrategies(),
      scenarios: listStrategyPreviewScenarios(),
    });

    expect(result.availability).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_STRATEGY_SELECTED',
    });
    expect(result.explanation).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_EXPLANATION_AVAILABLE',
    });
    expect(result.contrast).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_CONTRAST_AVAILABLE',
    });
    expect(result.fitContrast).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_COMPARABLE_CONTEXT',
    });
  });

  it('returns unavailable honestly when a scenario is missing', () => {
    const result = createStrategyNavigatorVM({
      generatedAt: '2026-04-05T00:00:00.000Z',
      selectedStrategyId: 'dip_buying',
      selectedScenarioId: null,
      strategies: createStrategies(),
      scenarios: listStrategyPreviewScenarios(),
    });

    expect(result.availability).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_SCENARIO_AVAILABLE',
    });
    expect(result.explanation).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_EXPLANATION_AVAILABLE',
    });
    expect(result.contrast).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_CONTRAST_AVAILABLE',
    });
    expect(result.fitContrast).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_COMPARABLE_CONTEXT',
    });
  });

  it('keeps surface eligibility in services instead of leaving it to app', () => {
    const result = createStrategyNavigatorVM({
      generatedAt: '2026-04-05T00:00:00.000Z',
      selectedStrategyId: 'trend_following',
      selectedScenarioId: 'MIXED_REVERSAL',
      strategies: createStrategies(),
      scenarios: listStrategyPreviewScenarios(),
      knowledgeNodes: knowledgeCatalog,
      surface: 'DASHBOARD',
    });

    expect(result.availability).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });
    expect(result.explanation).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });
    expect(result.contrast).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });
    expect(result.fitContrast).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });
  });

  it('keeps the preview intact and returns follow-through unavailable honestly when knowledge context is missing', () => {
    const result = createStrategyNavigatorVM({
      generatedAt: '2026-04-05T00:00:00.000Z',
      selectedStrategyId: 'trend_following',
      selectedScenarioId: 'TREND_CONTINUATION',
      strategies: createStrategies(),
      scenarios: listStrategyPreviewScenarios(),
      knowledgeNodes: null,
    });

    expect(result.availability.status).toBe('AVAILABLE');
    expect(result.explanation.status).toBe('AVAILABLE');
    expect(result.contrast.status).toBe('AVAILABLE');
    expect(result.fitContrast.status).toBe('AVAILABLE');
    expect(result.knowledgeFollowThrough).toEqual({
      status: 'UNAVAILABLE',
      reason: 'KNOWLEDGE_UNAVAILABLE',
    });
  });

  it('keeps preview copy descriptive and free of execution or urgency semantics', () => {
    const result = createStrategyNavigatorVM({
      generatedAt: '2026-04-05T00:00:00.000Z',
      selectedStrategyId: 'fib_levels',
      selectedScenarioId: 'RANGE_COMPRESSION',
      strategies: createStrategies(),
      scenarios: listStrategyPreviewScenarios(),
      knowledgeNodes: knowledgeCatalog,
    });

    if (result.availability.status !== 'AVAILABLE') {
      throw new Error('Expected preview to be available.');
    }

    const serialized = JSON.stringify(result);

    expect(serialized).not.toMatch(
      /sell|execute|execution|dispatch|broker|profit|forecast|prediction|guarantee|urgent|act now/i,
    );
    expect(serialized).not.toMatch(
      /eventId|signalsTriggered|signalCode|providerId|metadata|runtime|accountId|confidenceScore|docs\/knowledge|README\.md|canonicalPath|markdown/i,
    );
  });

  it('stays deterministic for identical inputs', () => {
    const params = {
      generatedAt: '2026-04-05T00:00:00.000Z',
      selectedStrategyId: 'mean_reversion' as const,
      selectedScenarioId: 'MIXED_REVERSAL' as const,
      strategies: createStrategies(),
      scenarios: listStrategyPreviewScenarios(),
      knowledgeNodes: knowledgeCatalog,
    };

    expect(createStrategyNavigatorVM(params)).toEqual(createStrategyNavigatorVM(params));
  });
});
