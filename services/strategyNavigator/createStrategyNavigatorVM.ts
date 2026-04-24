import type { StrategyCatalogEntry } from '@/core/strategy/catalogTypes';
import type { StrategyId } from '@/core/strategy/types';
import type { KnowledgeCatalogEntry } from '@/services/knowledge/types';

import { createStrategyFitContrast } from './createStrategyFitContrast';
import { createStrategyPreviewContrast } from './createStrategyPreviewContrast';
import { createStrategyPreviewExplanation } from './createStrategyPreviewExplanation';
import { selectNearbyAlternativeStrategies } from './selectNearbyAlternativeStrategies';
import { selectStrategyPreviewKnowledge } from './selectStrategyPreviewKnowledge';
import type {
  StrategyNavigatorSurface,
  StrategyNavigatorVM,
  StrategyPreviewFocus,
  StrategyPreviewScenario,
  StrategyPreviewScenarioId,
} from './types';

type StrategyPreviewLens =
  | 'DATA_QUALITY'
  | 'MOMENTUM'
  | 'DIP'
  | 'TREND'
  | 'MEAN_REVERSION'
  | 'LEVELS';

function isEnabledForSurface(surface: StrategyNavigatorSurface): boolean {
  return surface === 'STRATEGY_NAVIGATOR';
}

function copyScenario(scenario: StrategyPreviewScenario): StrategyPreviewScenario {
  return {
    ...scenario,
    traits: scenario.traits
      ? {
          ...scenario.traits,
        }
      : undefined,
  };
}

function toStrategyOptions(
  strategies: ReadonlyArray<StrategyCatalogEntry>,
): StrategyNavigatorVM['strategyOptions'] {
  return strategies.map((strategy) => ({
    strategyId: strategy.id,
    title: strategy.name,
    summary: strategy.shortDescription,
    archetype: strategy.archetype,
  }));
}

function resolveStrategyLens(strategyId: StrategyId): StrategyPreviewLens {
  switch (strategyId) {
    case 'data_quality':
      return 'DATA_QUALITY';
    case 'momentum_basics':
      return 'MOMENTUM';
    case 'dip_buying':
      return 'DIP';
    case 'trend_following':
      return 'TREND';
    case 'mean_reversion':
      return 'MEAN_REVERSION';
    case 'fib_levels':
      return 'LEVELS';
    default:
      return 'MOMENTUM';
  }
}

function createDataQualityFocus(scenarioId: StrategyPreviewScenarioId): StrategyPreviewFocus {
  switch (scenarioId) {
    case 'DIP_VOLATILITY':
      return {
        snapshotHeadline:
          'Snapshot would talk about unsettled certainty first, because a volatile dip can look louder than the underlying read deserves.',
        dashboardFocus: [
          'Estimated-price and coverage caveats would stay near the top of the Dashboard before directional interpretation widened.',
          'PocketPilot would keep the emphasis on what still looks trustworthy rather than on bargain language.',
        ],
        eventHighlights: [
          'Estimated-price events would matter because they explain why the move may still read as provisional.',
          'Data-quality events would matter if symbol coverage or quote freshness starts to thin out during the drop.',
        ],
        alertPosture:
          'Alerts would stay restrained and mostly frame certainty limits before framing the move itself.',
      };
    case 'TREND_CONTINUATION':
      return {
        snapshotHeadline:
          'Snapshot would acknowledge the continuation, but it would still show whether the read rests on confirmed or estimated context.',
        dashboardFocus: [
          'Names with steadier confirmed context would carry more weight than names moving on thinner evidence.',
          'The Dashboard would keep certainty labelling visible so the trend does not read more settled than it is.',
        ],
        eventHighlights: [
          'Momentum-building events would matter only when their certainty stays intact.',
          'Data-quality events would matter when they change how much trust the continuation deserves.',
        ],
        alertPosture:
          'Alerts would sound measured and would describe whether support is firming or still partly estimated.',
      };
    case 'MIXED_REVERSAL':
      return {
        snapshotHeadline:
          'Snapshot would describe a split picture and make certainty boundaries visible before leaning into the reversal story.',
        dashboardFocus: [
          'Conflicting confirmed-versus-estimated reads would matter more than trying to declare a clean turn.',
          'PocketPilot would keep the focus on whether the new read is broadening or still patchy.',
        ],
        eventHighlights: [
          'Price-movement events would matter when they keep repeating across the same symbols or sectors.',
          'Estimated-price events would matter if the reversal story still depends on thin context.',
        ],
        alertPosture:
          'Alerts would stay descriptive and would describe the reversal attempt as early, mixed, or still not well-supported.',
      };
    default:
      return {
        snapshotHeadline:
          'Snapshot would describe a quieter tape by asking how much of that calm is confirmed versus merely thin.',
        dashboardFocus: [
          'The Dashboard would lift steadier confirmed context above names that only look quiet because activity has dried up.',
          'PocketPilot would keep certainty notes visible so compression does not read like proof of control.',
        ],
        eventHighlights: [
          'Data-quality events would matter if lower activity starts reducing the quality of the picture.',
          'Price-movement events would matter when the range tightens in a way that still looks well-supported.',
        ],
        alertPosture:
          'Alerts would stay sparse and would mainly note whether the quieter picture is genuinely supported.',
      };
  }
}

function createMomentumFocus(scenarioId: StrategyPreviewScenarioId): StrategyPreviewFocus {
  switch (scenarioId) {
    case 'DIP_VOLATILITY':
      return {
        snapshotHeadline:
          'Snapshot would read this as a stressed pullback first and would wait to see whether strength can rebuild cleanly.',
        dashboardFocus: [
          'Recent leaders would lose emphasis until the pullback starts absorbing rather than widening.',
          'PocketPilot would watch for orderly rebuilding strength instead of treating the dip itself as proof of opportunity.',
        ],
        eventHighlights: [
          'Dip-detected and price-movement events would matter because they show whether the setback is still broadening.',
          'Momentum-building events would regain priority only after follow-through starts to steady.',
        ],
        alertPosture:
          'Alerts would stay quiet until the move stops expanding and fresh strength becomes easier to explain calmly.',
      };
    case 'TREND_CONTINUATION':
      return {
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
      };
    case 'MIXED_REVERSAL':
      return {
        snapshotHeadline:
          'Snapshot would describe a momentum pause and ask whether strength is merely cooling or actually rolling over.',
        dashboardFocus: [
          'The Dashboard would separate names still holding support from names where momentum is visibly fading.',
          'PocketPilot would give more room to mixed context and less room to one-way continuation framing.',
        ],
        eventHighlights: [
          'Price-movement events would matter when the prior move starts losing follow-through.',
          'Momentum-building events would matter only if they return quickly enough to stabilise the picture.',
        ],
        alertPosture:
          'Alerts would describe the reversal attempt as mixed until renewed strength or deeper deterioration becomes clearer.',
      };
    default:
      return {
        snapshotHeadline:
          'Snapshot would describe a quiet tape by asking whether momentum is resting, fading, or still preparing another push.',
        dashboardFocus: [
          'The Dashboard would lean toward names holding structure through the compression rather than names merely moving less.',
          'PocketPilot would look for early rebuilding strength instead of forcing a breakout story.',
        ],
        eventHighlights: [
          'Price-movement events would matter if the range starts resolving with a clear directional bias.',
          'Momentum-building events would matter when repeated strength returns after the quieter stretch.',
        ],
        alertPosture:
          'Alerts would stay light and would mostly note whether the pause still looks constructive.',
      };
  }
}

function createDipFocus(scenarioId: StrategyPreviewScenarioId): StrategyPreviewFocus {
  switch (scenarioId) {
    case 'DIP_VOLATILITY':
      return {
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
      };
    case 'TREND_CONTINUATION':
      return {
        snapshotHeadline:
          'Snapshot would describe a trend extension as less naturally aligned with this dip-focused lens until a calmer retracement appears.',
        dashboardFocus: [
          'The Dashboard would keep stretched continuation names from dominating simply because they are moving fast.',
          'PocketPilot would look for the first orderly pullback that could make the trend easier to re-enter mentally.',
        ],
        eventHighlights: [
          'Momentum-building events would matter as context, but they would not outrank the search for a cleaner pullback.',
          'Price-movement events would matter if the continuation starts easing into a calmer dip.',
        ],
        alertPosture:
          'Alerts would stay measured and would mostly say that continuation is still present but not yet offering a cleaner dip-style read.',
      };
    case 'MIXED_REVERSAL':
      return {
        snapshotHeadline:
          'Snapshot would ask whether the prior move has stretched far enough for a steadier rebound attempt to matter.',
        dashboardFocus: [
          'The Dashboard would lift names where weakness looks exhausted and the reversal attempt is becoming more orderly.',
          'PocketPilot would still keep mixed context visible so the bounce does not read as settled too early.',
        ],
        eventHighlights: [
          'Dip-detected events would matter when they stop worsening and start pairing with steadier price movement.',
          'Price-movement events would matter if the rebound becomes broad enough to look more than incidental.',
        ],
        alertPosture:
          'Alerts would describe the reversal attempt as early support-building rather than a finished turn.',
      };
    default:
      return {
        snapshotHeadline:
          'Snapshot would describe the quieter range by asking whether pressure is easing enough to create a calmer dip-watch setup.',
        dashboardFocus: [
          'The Dashboard would favour names where compression follows weakness instead of compression that arrives without a meaningful pullback.',
          'PocketPilot would keep the focus on patience while the range remains unresolved.',
        ],
        eventHighlights: [
          'Price-movement events would matter if the tighter range starts forming after an earlier stretch lower.',
          'Estimated-price events would matter when quieter trading also means thinner certainty.',
        ],
        alertPosture:
          'Alerts would stay sparse and would mostly note whether the calmer range is making the dip easier to interpret.',
      };
  }
}

function createTrendFocus(scenarioId: StrategyPreviewScenarioId): StrategyPreviewFocus {
  switch (scenarioId) {
    case 'DIP_VOLATILITY':
      return {
        snapshotHeadline:
          'Snapshot would ask whether the larger direction still holds through the pullback or whether structure is starting to fray.',
        dashboardFocus: [
          'The Dashboard would emphasise whether trend structure is still being respected despite the volatility.',
          'PocketPilot would keep the broader directional backdrop above one sharp move in isolation.',
        ],
        eventHighlights: [
          'Price-movement events would matter when they test whether the ongoing trend is staying orderly.',
          'Dip-detected events would matter as a pullback check rather than as a stand-alone attraction.',
        ],
        alertPosture:
          'Alerts would describe whether the pullback still fits the broader trend posture or is beginning to strain it.',
      };
    case 'TREND_CONTINUATION':
      return {
        snapshotHeadline:
          'Snapshot would read this as a continuation first and would ask whether the broader structure is still carrying it cleanly.',
        dashboardFocus: [
          'The Dashboard would bring sustained directional names forward when follow-through remains orderly.',
          'PocketPilot would still keep a lid on moves that look stretched faster than the structure can support.',
        ],
        eventHighlights: [
          'Momentum-building events would matter when they reinforce an already established directional picture.',
          'Price-movement events would matter when they confirm that the trend is persisting instead of wobbling.',
        ],
        alertPosture:
          'Alerts would feel steady and would mostly describe whether the trend still has structure behind it.',
      };
    case 'MIXED_REVERSAL':
      return {
        snapshotHeadline:
          'Snapshot would describe a possible turn by testing whether the prior trend is weakening or simply pausing.',
        dashboardFocus: [
          'The Dashboard would compare names still holding the old trend against names where structure is starting to flip.',
          'PocketPilot would keep the mixed posture visible instead of declaring a fresh trend too early.',
        ],
        eventHighlights: [
          'Price-movement events would matter when repeated reversals begin to challenge the prior direction.',
          'Momentum-building events would matter only if the new direction starts showing repeated support.',
        ],
        alertPosture:
          'Alerts would describe the reversal attempt as a structural test rather than a completed change of state.',
      };
    default:
      return {
        snapshotHeadline:
          'Snapshot would treat the tighter range as a pause and would ask whether it still belongs to the larger trend or is turning neutral.',
        dashboardFocus: [
          'The Dashboard would emphasise names still holding directional structure through the quieter tape.',
          'PocketPilot would wait for the range to resolve before increasing emphasis on any single move.',
        ],
        eventHighlights: [
          'Price-movement events would matter if the compression begins resolving in the direction of the broader trend.',
          'Momentum-building events would matter when the quieter stretch starts giving way to renewed directional support.',
        ],
        alertPosture:
          'Alerts would stay light and would mostly note whether the pause still looks trend-supportive.',
      };
  }
}

function createMeanReversionFocus(scenarioId: StrategyPreviewScenarioId): StrategyPreviewFocus {
  switch (scenarioId) {
    case 'DIP_VOLATILITY':
      return {
        snapshotHeadline:
          'Snapshot would describe the drop as a possible overshoot, but it would still wait for the move to stop stretching before leaning on reversion language.',
        dashboardFocus: [
          'The Dashboard would look for names where weakness appears stretched relative to the recent baseline.',
          'PocketPilot would keep volatility in view so the overshoot thesis does not read as settled too early.',
        ],
        eventHighlights: [
          'Dip-detected events would matter when they start to look disproportionate to the prior baseline.',
          'Price-movement events would matter if the move begins stabilising instead of continuing to extend.',
        ],
        alertPosture:
          'Alerts would stay patient and would mostly describe when the move begins looking stretched enough to monitor for reversion.',
      };
    case 'TREND_CONTINUATION':
      return {
        snapshotHeadline:
          'Snapshot would treat a clean continuation as less aligned with mean reversion until the move starts stretching away from its prior baseline.',
        dashboardFocus: [
          'The Dashboard would keep an eye on extension rather than treat continuation alone as the main story.',
          'PocketPilot would bring forward names where the move is becoming unusually one-sided relative to recent norms.',
        ],
        eventHighlights: [
          'Momentum-building events would matter mostly as evidence that the extension is still running.',
          'Price-movement events would matter when they start to suggest the move is becoming overextended.',
        ],
        alertPosture:
          'Alerts would describe continuation as something to contextualise, not something this lens would automatically favour.',
      };
    case 'MIXED_REVERSAL':
      return {
        snapshotHeadline:
          'Snapshot would see this as the cleanest mean-reversion setup of the four scenarios because the prior stretch is already trying to unwind.',
        dashboardFocus: [
          'The Dashboard would bring forward names where the reversal is easing a prior overshoot instead of simply creating fresh noise.',
          'PocketPilot would still keep the mixed backdrop visible so the unwind does not read like a finished reset.',
        ],
        eventHighlights: [
          'Price-movement events would matter when they confirm the overshoot is beginning to ease.',
          'Dip-detected or momentum-building events would matter only insofar as they explain how the unwind is progressing.',
        ],
        alertPosture:
          'Alerts would describe the reversal as a baseline-rebalancing move when that read is supported, while still staying modest.',
      };
    default:
      return {
        snapshotHeadline:
          'Snapshot would describe the tighter range by asking whether price is settling back toward a baseline after earlier stretch.',
        dashboardFocus: [
          'The Dashboard would focus on names where compression looks like a reset instead of a vacuum.',
          'PocketPilot would keep the mean reference implicit and user-legible rather than turning it into a raw statistic dump.',
        ],
        eventHighlights: [
          'Price-movement events would matter if the range starts centring after a prior move away from baseline.',
          'Estimated-price events would matter when the quieter tape also weakens certainty about that reset.',
        ],
        alertPosture:
          'Alerts would stay light and would mostly note whether the market is settling back toward balance.',
      };
  }
}

function createLevelsFocus(scenarioId: StrategyPreviewScenarioId): StrategyPreviewFocus {
  switch (scenarioId) {
    case 'DIP_VOLATILITY':
      return {
        snapshotHeadline:
          'Snapshot would describe the dip through nearby support and retracement interaction rather than through speed alone.',
        dashboardFocus: [
          'The Dashboard would emphasise whether price is respecting or slipping through nearby reference levels.',
          'PocketPilot would keep the move grounded in structure rather than in dramatic swing-by-swing narration.',
        ],
        eventHighlights: [
          'Price-movement events would matter when they approach, reject, or cut through nearby levels.',
          'Estimated-price events would matter if level interaction is still too noisy to read cleanly.',
        ],
        alertPosture:
          'Alerts would describe level interaction calmly and would avoid treating one touch as a final verdict.',
      };
    case 'TREND_CONTINUATION':
      return {
        snapshotHeadline:
          'Snapshot would read the continuation by asking whether price is stepping through levels cleanly or running ahead of its structure.',
        dashboardFocus: [
          'The Dashboard would keep attention on level-by-level progression rather than on the headline move alone.',
          'PocketPilot would note when continuation is staying orderly between reference areas.',
        ],
        eventHighlights: [
          'Momentum-building events would matter as context when level progression still looks orderly.',
          'Price-movement events would matter when price starts clustering around a specific reference area.',
        ],
        alertPosture:
          'Alerts would stay calm and would mostly note whether price is still respecting the next structural reference.',
      };
    case 'MIXED_REVERSAL':
      return {
        snapshotHeadline:
          'Snapshot would frame the reversal attempt as a test of reclaimed or rejected structure rather than a clean flip.',
        dashboardFocus: [
          'The Dashboard would focus on whether price is reclaiming prior levels or failing beneath them.',
          'PocketPilot would keep mixed posture visible because level retests can remain unsettled for a while.',
        ],
        eventHighlights: [
          'Price-movement events would matter when the reversal interacts with the same reference area more than once.',
          'Momentum-building events would matter only if the reclaim starts looking repeatable.',
        ],
        alertPosture:
          'Alerts would describe whether the reversal is gaining structural footing instead of implying that the turn is finished.',
      };
    default:
      return {
        snapshotHeadline:
          'Snapshot would read the compression as a tightening zone and would ask which reference area is quietly taking shape.',
        dashboardFocus: [
          'The Dashboard would bring forward names where the range is tightening around a clear structural band.',
          'PocketPilot would resist forcing a breakout story before the level interaction becomes clearer.',
        ],
        eventHighlights: [
          'Price-movement events would matter when repeated touches keep defining the same zone.',
          'Estimated-price events would matter when the quieter tape makes the level read thinner than usual.',
        ],
        alertPosture:
          'Alerts would stay sparse and would mostly note whether the range is organising around a meaningful level.',
      };
  }
}

function createFocus(strategyId: StrategyId, scenarioId: StrategyPreviewScenarioId): StrategyPreviewFocus {
  switch (resolveStrategyLens(strategyId)) {
    case 'DATA_QUALITY':
      return createDataQualityFocus(scenarioId);
    case 'MOMENTUM':
      return createMomentumFocus(scenarioId);
    case 'DIP':
      return createDipFocus(scenarioId);
    case 'TREND':
      return createTrendFocus(scenarioId);
    case 'MEAN_REVERSION':
      return createMeanReversionFocus(scenarioId);
    default:
      return createLevelsFocus(scenarioId);
  }
}

export function createStrategyNavigatorVM(params: {
  generatedAt: string | null;
  selectedStrategyId?: StrategyId | null;
  selectedScenarioId?: StrategyPreviewScenarioId | null;
  strategies: ReadonlyArray<StrategyCatalogEntry>;
  scenarios: ReadonlyArray<StrategyPreviewScenario>;
  knowledgeNodes?: ReadonlyArray<KnowledgeCatalogEntry> | null;
  surface?: StrategyNavigatorSurface;
}): StrategyNavigatorVM {
  const surface = params.surface ?? 'STRATEGY_NAVIGATOR';
  const selectedStrategyId = params.selectedStrategyId ?? null;
  const selectedScenarioId = params.selectedScenarioId ?? null;
  const strategyOptions = toStrategyOptions(params.strategies);
  const baseVm = {
    title: 'Strategy Preview',
    summary: 'A calm walkthrough of how PocketPilot would shift its read under a simulated market picture.',
    generatedAt: params.generatedAt,
    selectedStrategyId,
    selectedScenarioId,
    strategyOptions,
    scenarios: params.scenarios.map(copyScenario),
  } satisfies Omit<
    StrategyNavigatorVM,
    'availability' | 'explanation' | 'contrast' | 'fitContrast' | 'knowledgeFollowThrough'
  >;
  const selectedStrategy = selectedStrategyId
    ? params.strategies.find((strategy) => strategy.id === selectedStrategyId)
    : undefined;
  const selectedScenario = selectedScenarioId
    ? params.scenarios.find((scenario) => scenario.scenarioId === selectedScenarioId)
    : undefined;

  if (!isEnabledForSurface(surface)) {
    return {
      ...baseVm,
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NOT_ENABLED_FOR_SURFACE',
      },
      explanation: createStrategyPreviewExplanation({
        surface,
      }),
      contrast: createStrategyPreviewContrast({
        surface,
      }),
      fitContrast: createStrategyFitContrast({
        surface,
      }),
    };
  }

  if (!selectedStrategy) {
    return {
      ...baseVm,
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NO_STRATEGY_SELECTED',
      },
      explanation: createStrategyPreviewExplanation({
        surface,
        scenario: selectedScenario,
      }),
      contrast: createStrategyPreviewContrast({
        surface,
        scenario: selectedScenario,
      }),
      fitContrast: createStrategyFitContrast({
        surface,
        scenario: selectedScenario,
      }),
    };
  }

  if (!selectedScenario) {
    return {
      ...baseVm,
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NO_SCENARIO_AVAILABLE',
      },
      explanation: createStrategyPreviewExplanation({
        surface,
        strategy: selectedStrategy,
      }),
      contrast: createStrategyPreviewContrast({
        surface,
        strategy: selectedStrategy,
      }),
      fitContrast: createStrategyFitContrast({
        surface,
        strategy: selectedStrategy,
        strategies: params.strategies,
      }),
    };
  }

  const focus = createFocus(selectedStrategy.id, selectedScenario.scenarioId);
  const explanation = createStrategyPreviewExplanation({
    surface,
    strategy: selectedStrategy,
    scenario: selectedScenario,
    focus,
  });
  const nearbyAlternativeAvailability = selectNearbyAlternativeStrategies({
    surface,
    bestFitStrategyId: selectedStrategy.id,
    strategies: params.strategies,
    scenarioId: selectedScenario.scenarioId,
    focus,
  });

  return {
    ...baseVm,
    availability: {
      status: 'AVAILABLE',
      strategyId: selectedStrategy.id,
      scenario: copyScenario(selectedScenario),
      focus,
    },
    explanation,
    contrast: createStrategyPreviewContrast({
      surface,
      strategy: selectedStrategy,
      scenario: selectedScenario,
      focus,
    }),
    fitContrast: createStrategyFitContrast({
      surface,
      strategy: selectedStrategy,
      strategies: params.strategies,
      scenario: selectedScenario,
      focus,
      nearbyAlternativeAvailability,
    }),
    knowledgeFollowThrough: selectStrategyPreviewKnowledge({
      surface,
      strategyId: selectedStrategy.id,
      scenarioId: selectedScenario.scenarioId,
      focus,
      nodes: params.knowledgeNodes,
    }),
  };
}
