import type { StrategyCatalogEntry } from '@/core/strategy/catalogTypes';
import type { StrategyId } from '@/core/strategy/types';

import type {
  StrategyNavigatorSurface,
  StrategyPreviewContrastAvailability,
  StrategyPreviewFocus,
  StrategyPreviewScenario,
  StrategyPreviewScenarioId,
  StrategyPreviewScenarioTraits,
} from './types';

type StrategyPreviewContrastFrame = {
  summaryFocus: string;
  lessCentral: string;
};

function isEnabledForSurface(surface: StrategyNavigatorSurface): boolean {
  return surface === 'STRATEGY_NAVIGATOR';
}

function describeScenarioBaseline(scenarioId: StrategyPreviewScenarioId): string {
  switch (scenarioId) {
    case 'DIP_VOLATILITY':
      return 'Compared with a calmer pullback';
    case 'TREND_CONTINUATION':
      return 'Compared with a more neutral or mixed backdrop';
    case 'MIXED_REVERSAL':
      return 'Compared with a cleaner continuation';
    default:
      return 'Compared with a louder directional backdrop';
  }
}

function describeScenarioTraits(traits: StrategyPreviewScenarioTraits): string {
  const parts = [
    traits.volatilityState ? `volatility is ${traits.volatilityState}` : null,
    traits.structureState ? `structure is ${traits.structureState}` : null,
    traits.conditionState ? `the condition is ${traits.conditionState}` : null,
  ].filter((part): part is string => part !== null);

  if (parts.length === 0) {
    return 'the simulated backdrop stays finite and interpretation-led';
  }

  if (parts.length === 1) {
    return parts[0];
  }

  if (parts.length === 2) {
    return `${parts[0]} and ${parts[1]}`;
  }

  return `${parts[0]}, ${parts[1]}, and ${parts[2]}`;
}

function createContrastFrame(
  strategyId: StrategyId,
  scenarioId: StrategyPreviewScenarioId,
): StrategyPreviewContrastFrame | null {
  const lessCentral = (() => {
    switch (scenarioId) {
      case 'DIP_VOLATILITY':
        return 'clean continuation language or quick rebound framing, because the backdrop is still stressed rather than settled.';
      case 'TREND_CONTINUATION':
        return 'oversold or reversal language, because the backdrop is still extending rather than resetting.';
      case 'MIXED_REVERSAL':
        return 'one-way continuation language, because the structure is changing without looking fully resolved yet.';
      case 'RANGE_COMPRESSION':
        return 'headline-move intensity or fast-resolution framing, because the tape is quieter while the next move stays open.';
      default:
        return null;
    }
  })();

  if (!lessCentral) {
    return null;
  }

  switch (strategyId) {
    case 'data_quality':
      return {
        summaryFocus: 'certainty boundaries and what still looks trustworthy',
        lessCentral,
      };
    case 'momentum_basics':
      return {
        summaryFocus: 'orderly follow-through instead of loud movement alone',
        lessCentral,
      };
    case 'dip_buying':
      return {
        summaryFocus: 'whether weakness is settling into a calmer pullback',
        lessCentral,
      };
    case 'trend_following':
      return {
        summaryFocus: 'whether the broader directional structure is still holding',
        lessCentral,
      };
    case 'mean_reversion':
      return {
        summaryFocus: 'stretch-versus-baseline context and whether pressure is easing',
        lessCentral,
      };
    case 'fib_levels':
      return {
        summaryFocus: 'how price is behaving around nearby structure and reference levels',
        lessCentral,
      };
    default:
      return null;
  }
}

function createMoreAttentionBullet(focus: StrategyPreviewFocus): string | null {
  const emphasis = focus.eventHighlights[0] ?? focus.snapshotHeadline;

  return emphasis ? `More attention here: ${emphasis}` : null;
}

function createPreviewExpressionBullet(focus: StrategyPreviewFocus): string | null {
  const previewExpression = focus.dashboardFocus[0] ?? focus.alertPosture;

  return previewExpression ? `Preview expression: ${previewExpression}` : null;
}

export function createStrategyPreviewContrast(params: {
  surface?: StrategyNavigatorSurface;
  strategy?: Pick<StrategyCatalogEntry, 'id' | 'name'> | null;
  scenario?: StrategyPreviewScenario | null;
  focus?: StrategyPreviewFocus | null;
}): StrategyPreviewContrastAvailability {
  const surface = params.surface ?? 'STRATEGY_NAVIGATOR';

  if (!isEnabledForSurface(surface)) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    };
  }

  if (!params.strategy || !params.scenario || !params.focus?.snapshotHeadline || !params.scenario.traits) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_CONTRAST_AVAILABLE',
    };
  }

  const frame = createContrastFrame(params.strategy.id, params.scenario.scenarioId);
  const moreAttention = createMoreAttentionBullet(params.focus);
  const previewExpression = createPreviewExpressionBullet(params.focus);

  if (!frame || !moreAttention || !previewExpression) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_CONTRAST_AVAILABLE',
    };
  }

  return {
    status: 'AVAILABLE',
    content: {
      title: 'What changes in this scenario',
      summary: `${describeScenarioBaseline(params.scenario.scenarioId)}, ${params.strategy.name} leans more toward ${frame.summaryFocus} because ${describeScenarioTraits(
        params.scenario.traits,
      )}.`,
      bullets: [moreAttention, `Less central here: ${frame.lessCentral}`, previewExpression],
    },
  };
}
