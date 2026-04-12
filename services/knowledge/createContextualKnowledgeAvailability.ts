import type { EventType } from '@/core/types/marketEvent';
import type { TradeHubSurfaceModel } from '@/services/trade/types';
import type { MessagePolicyKind } from '@/services/messages/types';
import type {
  ContextualKnowledgeAvailability,
  KnowledgeCatalogEntry,
  KnowledgeContextSurface,
} from '@/services/knowledge/types';
import type { StrategyPreviewScenarioId } from '@/services/strategyNavigator/types';

type ContextualKnowledgeInput = {
  surface: KnowledgeContextSurface;
  strategyIds?: ReadonlyArray<string>;
  eventTypes?: ReadonlyArray<EventType>;
  messageKinds?: ReadonlyArray<MessagePolicyKind>;
  scenarioId?: StrategyPreviewScenarioId | null;
  tradeHubSurface?: TradeHubSurfaceModel | undefined;
  insights?:
    | {
        hasHistory: boolean;
        hasArchive: boolean;
        hasReflection: boolean;
        hasNewItems: boolean;
      }
    | undefined;
};

type TopicHint = {
  topicId: string;
  reason: string;
  weight: number;
};

type CandidateScore = {
  topicId: string;
  title: string;
  score: number;
  bestReason: string;
  bestWeight: number;
};

const MAX_CANDIDATES = 3;

const ENABLED_SURFACES = new Set<KnowledgeContextSurface>([
  'DASHBOARD',
  'INSIGHTS',
  'TRADE_HUB',
  'STRATEGY_PREVIEW',
]);

const STRATEGY_HINTS: Readonly<Record<string, ReadonlyArray<TopicHint>>> = {
  data_quality: [
    {
      topicId: 'pp-estimated-vs-confirmed-context',
      reason: 'This selected lens is primarily about how much of the current read is confirmed versus estimated.',
      weight: 6,
    },
  ],
  momentum_basics: [
    {
      topicId: 'strategy-momentum-pulse',
      reason: 'This selected lens is about whether momentum is genuinely building or starting to flatten out.',
      weight: 6,
    },
  ],
  dip_buying: [
    {
      topicId: 'strategy-buy-the-dip',
      reason: 'This selected lens is focused on pullbacks, stabilisation, and whether weakness still fits the broader picture.',
      weight: 6,
    },
  ],
  trend_following: [
    {
      topicId: 'strategy-trend-follow',
      reason: 'This selected lens is focused on whether the broader directional structure is still holding together.',
      weight: 6,
    },
  ],
  mean_reversion: [
    {
      topicId: 'strategy-reversion-bounce',
      reason: 'This selected lens is focused on whether an overstretched move is starting to unwind more cleanly.',
      weight: 6,
    },
  ],
  fib_levels: [
    {
      topicId: 'strategy-fibonacci-zones',
      reason: 'This selected lens is focused on structure, measured zones, and whether price is reacting around meaningful reference areas.',
      weight: 6,
    },
  ],
};

const EVENT_HINTS: Readonly<Record<EventType, ReadonlyArray<TopicHint>>> = {
  DATA_QUALITY: [
    {
      topicId: 'pp-estimated-vs-confirmed-context',
      reason: 'The current interpreted event is mainly about certainty quality, so the estimated-versus-confirmed boundary matters most.',
      weight: 5,
    },
  ],
  ESTIMATED_PRICE: [
    {
      topicId: 'pp-estimated-vs-confirmed-context',
      reason: 'The current interpreted event is explicitly provisional, so the estimated-versus-confirmed boundary matters most.',
      weight: 5,
    },
  ],
  MOMENTUM_BUILDING: [
    {
      topicId: 'strategy-momentum-pulse',
      reason: 'The current interpreted event is about building pace and whether that acceleration looks durable enough to trust.',
      weight: 5,
    },
  ],
  DIP_DETECTED: [
    {
      topicId: 'strategy-buy-the-dip',
      reason: 'The current interpreted event is a pullback context, so dip framing is the cleanest supporting explanation.',
      weight: 5,
    },
  ],
  PRICE_MOVEMENT: [
    {
      topicId: 'pp-what-a-marketevent-is',
      reason: 'This surface is reacting to interpreted MarketEvents rather than raw tape, so the event framing itself is the useful explainer.',
      weight: 4,
    },
  ],
};

const MESSAGE_HINTS: Readonly<Record<MessagePolicyKind, ReadonlyArray<TopicHint>>> = {
  BRIEFING: [
    {
      topicId: 'pp-what-snapshot-is-for',
      reason: 'This message posture is meant to orient quickly rather than turn the surface into a homework flow.',
      weight: 3,
    },
  ],
  ALERT: [
    {
      topicId: 'pp-what-alerts-are-for',
      reason: 'This message posture is meant to explain alerting calmly, without turning support into pressure.',
      weight: 3,
    },
  ],
  REORIENTATION: [
    {
      topicId: 'pp-what-reorientation-is-for',
      reason: 'This message posture is a calm return briefing, not a guilt mechanic or catch-up trap.',
      weight: 4,
    },
  ],
  REFERRAL: [
    {
      topicId: 'pp-what-knowledge-links-are-for',
      reason: 'This message posture is pointing toward optional explanation, so the knowledge-link contract itself is the clearest explainer.',
      weight: 4,
    },
  ],
  GUARDED_STOP: [
    {
      topicId: 'pp-stop-loss-basics',
      reason: 'This message posture is about risk framing, so a calm stop-loss explainer is the most relevant knowledge support.',
      weight: 4,
    },
  ],
};

const SURFACE_HINTS: Readonly<Partial<Record<KnowledgeContextSurface, ReadonlyArray<TopicHint>>>> = {
  DASHBOARD: [
    {
      topicId: 'pp-what-dashboard-is-for',
      reason: 'This surface is where PocketPilot goes deeper on interpreted context without turning into an indicator wall.',
      weight: 2,
    },
  ],
  TRADE_HUB: [
    {
      topicId: 'pp-what-trade-hub-is-for',
      reason:
        'This surface is the calm action-support layer, so the Trade Hub overview is the clearest baseline explainer.',
      weight: 2,
    },
  ],
  INSIGHTS: [
    {
      topicId: 'pp-what-insights-is-for',
      reason: 'This surface is a reflection layer, so the Insights overview is the cleanest baseline explainer.',
      weight: 2,
    },
  ],
  STRATEGY_PREVIEW: [
    {
      topicId: 'pp-what-strategy-preview-strategy-navigator-is-for',
      reason: 'This surface is an exploratory bridge between learning and commitment, so the preview explainer is the cleanest baseline context.',
      weight: 2,
    },
  ],
};

const SCENARIO_HINTS: Readonly<Record<StrategyPreviewScenarioId, ReadonlyArray<TopicHint>>> = {
  DIP_VOLATILITY: [
    {
      topicId: 'pp-estimated-vs-confirmed-context',
      reason: 'This scenario is intentionally unsettled, so certainty boundaries matter before the move itself.',
      weight: 4,
    },
  ],
  TREND_CONTINUATION: [
    {
      topicId: 'pp-what-market-regime-means',
      reason: 'This scenario is about persistence and backdrop support, so regime framing helps explain why continuation can still be mixed.',
      weight: 4,
    },
  ],
  MIXED_REVERSAL: [
    {
      topicId: 'strategy-reversion-bounce',
      reason: 'This scenario is about an unwind trying to take shape, so a reversion explainer is the clearest supporting reference.',
      weight: 4,
    },
    {
      topicId: 'pp-estimated-vs-confirmed-context',
      reason: 'This scenario stays mixed, so certainty boundaries matter before any clean reversal story.',
      weight: 4,
    },
  ],
  RANGE_COMPRESSION: [
    {
      topicId: 'strategy-range-trader',
      reason: 'This scenario is about a tighter unresolved range, so range-focused context is the clearest supporting explainer.',
      weight: 4,
    },
  ],
};

function uniqueValues<T>(values?: ReadonlyArray<T>): T[] {
  return values ? [...new Set(values)] : [];
}

function hasInterpretedContext(input: ContextualKnowledgeInput): boolean {
  switch (input.surface) {
    case 'STRATEGY_PREVIEW':
      return Boolean(input.scenarioId && uniqueValues(input.strategyIds).length > 0);
    case 'DASHBOARD':
      return Boolean(
        uniqueValues(input.strategyIds).length > 0 ||
          uniqueValues(input.eventTypes).length > 0 ||
          uniqueValues(input.messageKinds).length > 0,
      );
    case 'INSIGHTS':
      return Boolean(
        input.insights?.hasHistory ||
          input.insights?.hasArchive ||
          input.insights?.hasReflection ||
          input.insights?.hasNewItems,
      );
    case 'TRADE_HUB':
      return Boolean(
        input.tradeHubSurface?.primaryPlan ||
          input.tradeHubSurface?.alternativePlans.length,
      );
    default:
      return false;
  }
}

function addHint(
  scores: Map<string, CandidateScore>,
  nodesByTopicId: ReadonlyMap<string, KnowledgeCatalogEntry>,
  hint: TopicHint,
) {
  const entry = nodesByTopicId.get(hint.topicId);

  if (!entry) {
    return;
  }

  const existing = scores.get(entry.topicId);

  if (!existing) {
    scores.set(entry.topicId, {
      topicId: entry.topicId,
      title: entry.title,
      score: hint.weight,
      bestReason: hint.reason,
      bestWeight: hint.weight,
    });
    return;
  }

  existing.score += hint.weight;

  if (
    hint.weight > existing.bestWeight ||
    (hint.weight === existing.bestWeight &&
      hint.reason.localeCompare(existing.bestReason) < 0)
  ) {
    existing.bestReason = hint.reason;
    existing.bestWeight = hint.weight;
  }
}

function buildInsightHints(input: ContextualKnowledgeInput): TopicHint[] {
  if (input.surface !== 'INSIGHTS' || !input.insights) {
    return [];
  }

  const hints: TopicHint[] = [];

  if (input.insights.hasNewItems) {
    hints.push({
      topicId: 'pp-what-since-last-checked-is-for',
      reason: 'This reflection context includes newly surfaced history, so the Since Last Checked explainer is the most relevant support.',
      weight: 4,
    });
  }

  if (input.insights.hasArchive) {
    hints.push({
      topicId: 'pp-what-summary-archive-is-for',
      reason: 'This reflection context includes deeper stored history, so the archive explainer is the most relevant support.',
      weight: 4,
    });
  }

  if (input.insights.hasReflection) {
    hints.push({
      topicId: 'pp-what-monthly-and-quarterly-summaries-are-for',
      reason: 'This reflection context is comparing periods, so the medium-horizon summary explainer is the most relevant support.',
      weight: 4,
    });
  }

  return hints;
}

function buildTradeHubHints(input: ContextualKnowledgeInput): TopicHint[] {
  if (input.surface !== 'TRADE_HUB' || !input.tradeHubSurface) {
    return [];
  }

  const hints: TopicHint[] = [];
  const { primaryPlan } = input.tradeHubSurface;

  if (!primaryPlan && input.tradeHubSurface.alternativePlans.length === 0) {
    return hints;
  }

  if (primaryPlan) {
    switch (primaryPlan.actionState) {
      case 'READY':
        hints.push({
          topicId: 'pp-what-protection-plans-are-for',
          reason:
            'This plan is already framed and ready to review, so protection-plan context stays the calmest next read.',
          weight: 5,
        });
        break;
      case 'CAUTION':
        hints.push({
          topicId: 'pp-risk-reward-basics',
          reason:
            'This plan still carries caution, so risk and reward stay the clearest support for the current frame.',
          weight: 5,
        });
        hints.push({
          topicId: 'pp-stop-loss-basics',
          reason:
            'This plan still needs protective boundaries, so stop-loss context stays relevant here.',
          weight: 4,
        });
        break;
      case 'WAIT':
        hints.push({
          topicId: 'pp-position-sizing-basics',
          reason:
            'This plan is still waiting on better conditions, so sizing context stays the calmest support.',
          weight: 5,
        });
        hints.push({
          topicId: 'pp-what-protection-plans-are-for',
          reason:
            'This is still a support-only frame, so protection-plan context stays useful before anything else.',
          weight: 3,
        });
        break;
    }

    if (primaryPlan.certainty === 'LOW') {
      hints.push({
        topicId: 'pp-estimated-vs-confirmed-context',
        reason:
          'This plan is still low-certainty, so the confirmed-versus-estimated boundary matters before the read feels settled.',
        weight: 4,
      });
    }

    if (primaryPlan.alignment === 'MISALIGNED') {
      hints.push({
        topicId: 'pp-risk-reward-basics',
        reason:
          'This plan is misaligned, so the risk-reward frame stays more useful than a stronger action story.',
        weight: 3,
      });
    }
  }

  if (input.tradeHubSurface.riskLane.preparedRiskLane.basisAvailability.status === 'AVAILABLE') {
    hints.push({
      topicId: 'pp-risk-reward-basics',
      reason:
        'The prepared risk lane is already visible, so risk and reward stay central to the current frame.',
      weight: 4,
    });
  }

  if (input.tradeHubSurface.riskLane.positionSizingAvailability.status === 'AVAILABLE') {
    hints.push({
      topicId: 'pp-position-sizing-basics',
      reason:
        'Prepared sizing is available, so position-sizing context stays useful here.',
      weight: 4,
    });
  }

  if (input.tradeHubSurface.riskLane.guardrailEvaluationAvailability.status === 'AVAILABLE') {
    hints.push({
      topicId: 'pp-stop-loss-basics',
      reason:
        'Prepared guardrail evaluation is available, so stop-loss context is the cleanest safety follow-through.',
      weight: 4,
    });
  }

  return hints;
}

export function createContextualKnowledgeAvailability(params: {
  nodes: ReadonlyArray<KnowledgeCatalogEntry>;
  input: ContextualKnowledgeInput;
}): ContextualKnowledgeAvailability {
  const { input, nodes } = params;

  if (!ENABLED_SURFACES.has(input.surface)) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    };
  }

  if (!hasInterpretedContext(input)) {
    return {
      status: 'UNAVAILABLE',
      reason: 'INSUFFICIENT_INTERPRETED_CONTEXT',
    };
  }

  const nodesByTopicId = new Map(nodes.map((node) => [node.topicId, node] as const));
  const scores = new Map<string, CandidateScore>();

  (SURFACE_HINTS[input.surface] ?? []).forEach((hint) => addHint(scores, nodesByTopicId, hint));
  uniqueValues(input.strategyIds)
    .flatMap((strategyId) => STRATEGY_HINTS[strategyId] ?? [])
    .forEach((hint) => addHint(scores, nodesByTopicId, hint));
  uniqueValues(input.eventTypes)
    .flatMap((eventType) => EVENT_HINTS[eventType] ?? [])
    .forEach((hint) => addHint(scores, nodesByTopicId, hint));
  uniqueValues(input.messageKinds)
    .flatMap((messageKind) => MESSAGE_HINTS[messageKind] ?? [])
    .forEach((hint) => addHint(scores, nodesByTopicId, hint));

  if (input.scenarioId) {
    (SCENARIO_HINTS[input.scenarioId] ?? []).forEach((hint) =>
      addHint(scores, nodesByTopicId, hint),
    );
  }

  buildInsightHints(input).forEach((hint) => addHint(scores, nodesByTopicId, hint));
  buildTradeHubHints(input).forEach((hint) => addHint(scores, nodesByTopicId, hint));

  const items = [...scores.values()]
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
    .slice(0, MAX_CANDIDATES)
    .map((item) => ({
      topicId: item.topicId,
      title: item.title,
      reason: item.bestReason,
    }));

  if (items.length === 0) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_RELEVANT_TOPIC',
    };
  }

  return {
    status: 'AVAILABLE',
    surface: input.surface,
    items,
  };
}
