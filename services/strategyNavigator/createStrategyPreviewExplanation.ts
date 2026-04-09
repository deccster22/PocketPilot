import type { StrategyCatalogEntry } from '@/core/strategy/catalogTypes';

import type {
  StrategyNavigatorSurface,
  StrategyPreviewExplanationAvailability,
  StrategyPreviewFocus,
  StrategyPreviewScenario,
} from './types';

function isEnabledForSurface(surface: StrategyNavigatorSurface): boolean {
  return surface === 'STRATEGY_NAVIGATOR';
}

function describeScenarioContext(
  scenarioId: StrategyPreviewScenario['scenarioId'],
): string {
  switch (scenarioId) {
    case 'DIP_VOLATILITY':
      return 'the market is dropping while volatility is expanding';
    case 'TREND_CONTINUATION':
      return 'an existing move is still extending in an orderly way';
    case 'MIXED_REVERSAL':
      return 'a prior move is unwinding but the read is still mixed';
    default:
      return 'price is compressing and the next move is still unresolved';
  }
}

function describeStrategyWorldview(
  strategyId: StrategyCatalogEntry['id'],
): {
  summaryClause: string;
  whyItMatters: string;
} {
  switch (strategyId) {
    case 'data_quality':
      return {
        summaryClause: 'starts by checking how trustworthy the picture looks',
        whyItMatters:
          'This lens cares about certainty boundaries first, because thin or estimated context can make any move sound cleaner than it really is.',
      };
    case 'momentum_basics':
      return {
        summaryClause: 'looks for orderly strength and clean follow-through',
        whyItMatters:
          'This lens gives more weight to moves that keep building in a steady way than to fast movement on its own.',
      };
    case 'dip_buying':
      return {
        summaryClause:
          'watches for weakness that is starting to settle into a calmer pullback',
        whyItMatters:
          'This lens cares about whether pressure is becoming more interpretable, because a messy drop is different from a steadier dip-watch setup.',
      };
    case 'trend_following':
      return {
        summaryClause: 'reads the move through the larger directional structure',
        whyItMatters:
          'This lens cares about whether the broader direction is still holding together, not just whether one move is loud.',
      };
    case 'mean_reversion':
      return {
        summaryClause:
          'looks for price that has stretched away from a recent baseline and may be starting to rebalance',
        whyItMatters:
          'This lens cares about extension relative to a baseline, because the same move can read as routine continuation or as an overshoot that is easing.',
      };
    default:
      return {
        summaryClause: 'reads the scenario through nearby structure and reference levels',
        whyItMatters:
          'This lens cares about how price behaves around support, resistance, or retracement zones, because structure often matters more here than speed alone.',
      };
  }
}

function createEventBullet(eventHighlights: ReadonlyArray<string>): string | null {
  if (eventHighlights.length === 0) {
    return null;
  }

  return `Relevant interpreted MarketEvents: ${eventHighlights.join(' ')}`;
}

export function createStrategyPreviewExplanation(params: {
  surface?: StrategyNavigatorSurface;
  strategy?: Pick<StrategyCatalogEntry, 'id' | 'name'> | null;
  scenario?: StrategyPreviewScenario | null;
  focus?: StrategyPreviewFocus | null;
}): StrategyPreviewExplanationAvailability {
  const surface = params.surface ?? 'STRATEGY_NAVIGATOR';

  if (!isEnabledForSurface(surface)) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    };
  }

  if (!params.strategy || !params.scenario || !params.focus?.snapshotHeadline) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_EXPLANATION_AVAILABLE',
    };
  }

  const worldview = describeStrategyWorldview(params.strategy.id);
  const eventBullet = createEventBullet(params.focus.eventHighlights);

  if (!eventBullet) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_EXPLANATION_AVAILABLE',
    };
  }

  return {
    status: 'AVAILABLE',
    content: {
      title: `Why ${params.strategy.name} reacts this way`,
      summary: `${params.strategy.name} ${worldview.summaryClause} when ${describeScenarioContext(
        params.scenario.scenarioId,
      )}. This keeps the simulated read focused on interpretation priorities rather than outcomes.`,
      bullets: [
        `What it is noticing: ${params.focus.snapshotHeadline}`,
        `Why that matters: ${worldview.whyItMatters}`,
        eventBullet,
      ],
    },
  };
}
