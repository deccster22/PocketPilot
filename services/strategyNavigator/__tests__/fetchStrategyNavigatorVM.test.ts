import { fetchStrategyNavigatorVM } from '@/services/strategyNavigator/fetchStrategyNavigatorVM';

describe('fetchStrategyNavigatorVM', () => {
  it('returns one canonical prepared Strategy Preview VM with deterministic starter catalogs', () => {
    const result = fetchStrategyNavigatorVM({
      surface: 'STRATEGY_NAVIGATOR',
      selectedStrategyId: 'dip_buying',
      selectedScenarioId: 'DIP_VOLATILITY',
      nowProvider: () => Date.parse('2026-04-05T00:00:00.000Z'),
    });

    expect(result.generatedAt).toBe('2026-04-05T00:00:00.000Z');
    expect(result.strategyOptions.map((strategy) => strategy.strategyId)).toEqual([
      'data_quality',
      'momentum_basics',
      'dip_buying',
      'trend_following',
      'mean_reversion',
      'fib_levels',
    ]);
    expect(result.scenarios).toEqual([
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
    ]);
    expect(result.explanation).toEqual({
      status: 'AVAILABLE',
      content: {
        title: 'Why Dip Buying reacts this way',
        summary:
          'Dip Buying watches for weakness that is starting to settle into a calmer pullback when the market is dropping while volatility is expanding. This keeps the simulated read focused on interpretation priorities rather than outcomes.',
        bullets: [
          'What it is noticing: Snapshot would treat this as a dip worth watching, but only once the drop starts to settle into something interpretable.',
          'Why that matters: This lens cares about whether pressure is becoming more interpretable, because a messy drop is different from a steadier dip-watch setup.',
          'Relevant interpreted MarketEvents: Dip-detected events would matter most when they are followed by calmer price movement. Estimated-price events would matter if the backdrop is still too noisy to trust the read.',
        ],
      },
    });
    expect(result.knowledgeFollowThrough).toEqual({
      status: 'AVAILABLE',
      items: [
        {
          topicId: 'strategy-buy-the-dip',
          title: 'Buy the Dip',
          reason:
            'This preview is about pullbacks and stabilisation, so this is the clearest strategy follow-through if you want more context.',
        },
        {
          topicId: 'pp-estimated-vs-confirmed-context',
          title: 'Estimated vs Confirmed Context',
          reason:
            'This simulated dip stays unsettled, so certainty boundaries matter before the move sounds cleaner than it is.',
        },
      ],
    });
  });

  it('returns unavailable when the selected strategy is outside the starter preview set', () => {
    expect(
      fetchStrategyNavigatorVM({
        surface: 'STRATEGY_NAVIGATOR',
        selectedStrategyId: 'snapshot_change',
        selectedScenarioId: 'TREND_CONTINUATION',
        nowProvider: () => Date.parse('2026-04-05T00:00:00.000Z'),
      }).availability,
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_STRATEGY_SELECTED',
    });
    expect(
      fetchStrategyNavigatorVM({
        surface: 'STRATEGY_NAVIGATOR',
        selectedStrategyId: 'snapshot_change',
        selectedScenarioId: 'TREND_CONTINUATION',
        nowProvider: () => Date.parse('2026-04-05T00:00:00.000Z'),
      }).explanation,
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_EXPLANATION_AVAILABLE',
    });
  });

  it('keeps raw internals out of the prepared user-facing preview output', () => {
    const result = fetchStrategyNavigatorVM({
      surface: 'STRATEGY_NAVIGATOR',
      selectedStrategyId: 'trend_following',
      selectedScenarioId: 'TREND_CONTINUATION',
      nowProvider: () => Date.parse('2026-04-05T00:00:00.000Z'),
    });

    if (result.availability.status !== 'AVAILABLE') {
      throw new Error('Expected preview to be available.');
    }

    expect(JSON.stringify(result)).not.toMatch(
      /eventId|signalsTriggered|signalCode|providerId|metadata|runtime|accountId|confidenceScore|notification|badge|docs\/knowledge|README\.md|canonicalPath|markdown/i,
    );
  });

  it('keeps the preview available when knowledge inputs are missing and returns follow-through unavailable honestly', () => {
    const result = fetchStrategyNavigatorVM({
      surface: 'STRATEGY_NAVIGATOR',
      selectedStrategyId: 'trend_following',
      selectedScenarioId: 'TREND_CONTINUATION',
      knowledgeNodes: [],
      nowProvider: () => Date.parse('2026-04-05T00:00:00.000Z'),
    });

    expect(result.availability.status).toBe('AVAILABLE');
    expect(result.explanation.status).toBe('AVAILABLE');
    expect(result.knowledgeFollowThrough).toEqual({
      status: 'UNAVAILABLE',
      reason: 'KNOWLEDGE_UNAVAILABLE',
    });
  });

  it('stays deterministic for identical inputs once time is supplied', () => {
    const params = {
      surface: 'STRATEGY_NAVIGATOR' as const,
      selectedStrategyId: 'data_quality' as const,
      selectedScenarioId: 'MIXED_REVERSAL' as const,
      nowProvider: () => Date.parse('2026-04-05T00:00:00.000Z'),
    };

    expect(fetchStrategyNavigatorVM(params)).toEqual(fetchStrategyNavigatorVM(params));
  });
});
