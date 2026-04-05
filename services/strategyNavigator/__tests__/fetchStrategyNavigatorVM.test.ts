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

    expect(JSON.stringify(result.availability.focus)).not.toMatch(
      /eventId|signalsTriggered|signalCode|providerId|metadata|runtime|accountId|confidenceScore|notification|badge/i,
    );
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
