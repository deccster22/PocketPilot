import { listCatalog } from '@/core/strategy/catalog';
import { selectNearbyAlternativeStrategies } from '@/services/strategyNavigator/selectNearbyAlternativeStrategies';

const PREVIEW_STRATEGY_IDS = new Set([
  'data_quality',
  'momentum_basics',
  'dip_buying',
  'trend_following',
  'mean_reversion',
  'fib_levels',
]);

function createStrategies() {
  return listCatalog()
    .filter((strategy) => PREVIEW_STRATEGY_IDS.has(strategy.id))
    .map((strategy) => ({
      id: strategy.id,
      archetype: strategy.archetype,
    }));
}

describe('selectNearbyAlternativeStrategies', () => {
  it('selects nearby alternatives that are context-adjacent for trend continuation instead of distant comparators', () => {
    const result = selectNearbyAlternativeStrategies({
      bestFitStrategyId: 'momentum_basics',
      strategies: createStrategies(),
      scenarioId: 'TREND_CONTINUATION',
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

    expect(result).toEqual({
      status: 'AVAILABLE',
      selection: {
        bestFitStrategyId: 'momentum_basics',
        nearbyAlternativeStrategyIds: ['trend_following', 'fib_levels'],
      },
    });
  });

  it('keeps nearby selection deterministic for identical inputs', () => {
    const params = {
      bestFitStrategyId: 'dip_buying' as const,
      strategies: createStrategies(),
      scenarioId: 'DIP_VOLATILITY' as const,
      focus: {
        snapshotHeadline:
          'Snapshot would treat this as a dip worth watching, but only once the drop starts to settle into something interpretable.',
        dashboardFocus: [
          'The Dashboard would look for orderly weakness and early stabilisation instead of chase-the-drop framing.',
        ],
        eventHighlights: [
          'Dip-detected events would matter most when they are followed by calmer price movement.',
        ],
        alertPosture:
          'Alerts would feel patient and would describe the dip as something to monitor rather than something to chase.',
      },
    };

    expect(selectNearbyAlternativeStrategies(params)).toEqual(
      selectNearbyAlternativeStrategies(params),
    );
  });

  it('keeps support-lens alternatives out when a truer adjacent comparator exists', () => {
    const result = selectNearbyAlternativeStrategies({
      bestFitStrategyId: 'dip_buying',
      strategies: createStrategies(),
      scenarioId: 'DIP_VOLATILITY',
      focus: {
        snapshotHeadline:
          'Snapshot would treat this as a dip worth watching, but only once the drop starts to settle into something interpretable.',
        dashboardFocus: [
          'Estimated or widening moves would keep the setup in a more cautious lane until the tape calms.',
        ],
        eventHighlights: [
          'Estimated-price events would matter if the backdrop is still too noisy to trust the read.',
        ],
        alertPosture:
          'Alerts would feel patient and would describe the dip as something to monitor rather than something to chase.',
      },
    });

    expect(result.status).toBe('AVAILABLE');
    if (result.status !== 'AVAILABLE') {
      throw new Error('Expected nearby alternatives to be available.');
    }

    expect(result.selection.nearbyAlternativeStrategyIds).toContain('mean_reversion');
    expect(result.selection.nearbyAlternativeStrategyIds).toContain('fib_levels');
    expect(result.selection.nearbyAlternativeStrategyIds).not.toContain('data_quality');
  });

  it('returns unavailable honestly when comparable alternatives are missing', () => {
    expect(
      selectNearbyAlternativeStrategies({
        bestFitStrategyId: 'dip_buying',
        strategies: [
          {
            id: 'dip_buying',
            archetype: 'BEGINNER',
          },
        ],
        scenarioId: 'DIP_VOLATILITY',
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_COMPARABLE_ALTERNATIVES',
    });
  });

  it('returns unavailable when Strategy Navigator is not enabled for the surface', () => {
    expect(
      selectNearbyAlternativeStrategies({
        surface: 'DASHBOARD',
        bestFitStrategyId: 'dip_buying',
        strategies: createStrategies(),
        scenarioId: 'DIP_VOLATILITY',
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });
  });

  it('keeps distant strategies out of nearby selection when stronger adjacent options exist', () => {
    const result = selectNearbyAlternativeStrategies({
      bestFitStrategyId: 'momentum_basics',
      strategies: createStrategies(),
      scenarioId: 'TREND_CONTINUATION',
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

    expect(result.status).toBe('AVAILABLE');
    if (result.status !== 'AVAILABLE') {
      throw new Error('Expected nearby alternatives to be available.');
    }

    expect(result.selection.nearbyAlternativeStrategyIds).toContain('trend_following');
    expect(result.selection.nearbyAlternativeStrategyIds).toContain('fib_levels');
    expect(result.selection.nearbyAlternativeStrategyIds).not.toContain('mean_reversion');
  });
});
