import type { EventType, MarketEvent } from '@/core/types/marketEvent';
import type { DashboardSurfaceModel } from '@/services/dashboard/types';
import type { MessagePolicyAvailability, MessagePolicyKind } from '@/services/messages/types';
import type {
  InsightsArchiveVM,
  InsightsHistoryWithContinuityVM,
  ReflectionComparisonVM,
} from '@/services/insights/types';
import type {
  ContextualKnowledgeCandidate,
  ContextualKnowledgeLinkage,
  ContextualKnowledgeLinkageReason,
  KnowledgeCatalogEntry,
  KnowledgeContextSurface,
} from '@/services/knowledge/types';
import type { StrategyNavigatorVM, StrategyPreviewScenarioId } from '@/services/strategyNavigator/types';
import type {
  ProtectionPlanRiskAlignment,
  ProtectionPlanRiskCertainty,
  TradeHubActionState,
  TradeHubSurfaceModel,
} from '@/services/trade/types';

export type ContextualKnowledgeSelectionContext = {
  surface: KnowledgeContextSurface;
  strategyIds: ReadonlyArray<string>;
  eventTypes: ReadonlyArray<EventType>;
  signalCodes: ReadonlyArray<string>;
  messageKinds: ReadonlyArray<MessagePolicyKind>;
  scenarioId?: StrategyPreviewScenarioId | null;
  tradeHub: {
    primaryActionState: TradeHubActionState | null;
    primaryCertainty: ProtectionPlanRiskCertainty | null;
    primaryAlignment: ProtectionPlanRiskAlignment | null;
    hasPrimaryPlan: boolean;
    alternativePlanCount: number;
    hasPreparedRiskBasis: boolean;
    hasPositionSizing: boolean;
    hasGuardrailEvaluation: boolean;
  } | null;
  insights: {
    hasHistory: boolean;
    hasArchive: boolean;
    hasReflection: boolean;
    hasNewItems: boolean;
  } | null;
};

export type ContextualKnowledgeTopicSelection = {
  linkage: ContextualKnowledgeLinkage;
  items: ReadonlyArray<ContextualKnowledgeCandidate>;
};

type TopicSource = Exclude<ContextualKnowledgeLinkageReason, 'MIXED'>;

type TopicHint = {
  topicId: string;
  reason: string;
  weight: number;
  source: TopicSource;
};

type CandidateScore = {
  topicId: string;
  title: string;
  score: number;
  bestReason: string;
  bestWeight: number;
  dominantSource: TopicSource;
  sourceTotals: Record<TopicSource, number>;
};

const MAX_CANDIDATES = 3;

const SOURCE_PRIORITY: Readonly<Record<TopicSource, number>> = {
  STRATEGY: 0,
  SIGNAL: 1,
  EVENT: 2,
  SURFACE_CONTEXT: 3,
};

function uniqueValues<T>(values?: ReadonlyArray<T>): T[] {
  return values ? [...new Set(values)] : [];
}

function createTopicHint(hint: TopicHint): TopicHint {
  return hint;
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
      dominantSource: hint.source,
      sourceTotals: {
        STRATEGY: hint.source === 'STRATEGY' ? hint.weight : 0,
        SIGNAL: hint.source === 'SIGNAL' ? hint.weight : 0,
        EVENT: hint.source === 'EVENT' ? hint.weight : 0,
        SURFACE_CONTEXT: hint.source === 'SURFACE_CONTEXT' ? hint.weight : 0,
      },
    });
    return;
  }

  existing.score += hint.weight;
  existing.sourceTotals[hint.source] += hint.weight;

  const dominantSourceTotal = existing.sourceTotals[existing.dominantSource];
  const nextSourceTotal = existing.sourceTotals[hint.source];

  if (
    nextSourceTotal > dominantSourceTotal ||
    (nextSourceTotal === dominantSourceTotal &&
      SOURCE_PRIORITY[hint.source] < SOURCE_PRIORITY[existing.dominantSource])
  ) {
    existing.dominantSource = hint.source;
  }

  if (
    hint.weight > existing.bestWeight ||
    (hint.weight === existing.bestWeight &&
      hint.reason.localeCompare(existing.bestReason) < 0)
  ) {
    existing.bestReason = hint.reason;
    existing.bestWeight = hint.weight;
  }
}

function collectDashboardStrategyIds(surface: DashboardSurfaceModel | null | undefined): string[] {
  if (!surface) {
    return [];
  }

  return [
    ...surface.primeZone.items,
    ...surface.secondaryZone.items,
    ...surface.deepZone.items,
  ]
    .map((item) => item.strategyId)
    .filter((strategyId): strategyId is string => Boolean(strategyId));
}

function collectDashboardEventTypes(surface: DashboardSurfaceModel | null | undefined): EventType[] {
  if (!surface) {
    return [];
  }

  return [
    ...surface.primeZone.items,
    ...surface.secondaryZone.items,
    ...surface.deepZone.items,
  ].map((item) => item.eventType);
}

function collectMessageKinds(
  messagePolicy: MessagePolicyAvailability | null | undefined,
): MessagePolicyKind[] {
  if (messagePolicy?.status !== 'AVAILABLE') {
    return [];
  }

  return messagePolicy.messages.map((message) => message.kind);
}

function collectSignalCodes(marketEvents?: ReadonlyArray<MarketEvent> | null): string[] {
  if (!marketEvents) {
    return [];
  }

  return uniqueValues(marketEvents.flatMap((event) => event.signalsTriggered));
}

function collectStrategyIdsFromMarketEvents(
  marketEvents?: ReadonlyArray<MarketEvent> | null,
): string[] {
  if (!marketEvents) {
    return [];
  }

  return uniqueValues(marketEvents.map((event) => event.strategyId));
}

function collectEventTypesFromMarketEvents(
  marketEvents?: ReadonlyArray<MarketEvent> | null,
): EventType[] {
  if (!marketEvents) {
    return [];
  }

  return uniqueValues(marketEvents.map((event) => event.eventType));
}

function collectSignalHints(signalCode: string): TopicHint[] {
  const normalized = signalCode.toLowerCase();

  if (normalized.includes('breakout')) {
    return [
      createTopicHint({
        topicId: 'strategy-breakout-watcher',
        reason:
          'This signal is about a boundary giving way, so the breakout watcher strategy is the clearest support.',
        weight: 7,
        source: 'SIGNAL',
      }),
    ];
  }

  if (normalized.includes('momentum')) {
    return [
      createTopicHint({
        topicId: 'strategy-momentum-pulse',
        reason:
          'This signal is about acceleration building, so the momentum pulse strategy is the clearest support.',
        weight: 7,
        source: 'SIGNAL',
      }),
    ];
  }

  if (normalized.includes('dip') || normalized.includes('pullback')) {
    return [
      createTopicHint({
        topicId: 'strategy-buy-the-dip',
        reason:
          'This signal is about a pullback, so the buy-the-dip strategy is the clearest support.',
        weight: 7,
        source: 'SIGNAL',
      }),
    ];
  }

  if (normalized.includes('reversion') || normalized.includes('reversal')) {
    return [
      createTopicHint({
        topicId: 'strategy-reversion-bounce',
        reason:
          'This signal is about an unwind or reversal, so the reversion-bounce strategy is the clearest support.',
        weight: 7,
        source: 'SIGNAL',
      }),
    ];
  }

  if (normalized.includes('range') || normalized.includes('compression') || normalized.includes('coil')) {
    return [
      createTopicHint({
        topicId: 'strategy-range-trader',
        reason:
          'This signal is about contained movement, so the range-trader strategy is the clearest support.',
        weight: 7,
        source: 'SIGNAL',
      }),
    ];
  }

  if (
    normalized.includes('candle') ||
    normalized.includes('wick') ||
    normalized.includes('engulf') ||
    normalized.includes('rejection')
  ) {
    return [
      createTopicHint({
        topicId: 'strategy-candle-signals',
        reason:
          'This signal is about compact candle behaviour, so the candle-signals strategy is the clearest support.',
        weight: 7,
        source: 'SIGNAL',
      }),
    ];
  }

  if (normalized.includes('confluence') || normalized.includes('alignment')) {
    return [
      createTopicHint({
        topicId: 'strategy-confluence-alignment',
        reason:
          'This signal is about layered agreement, so the confluence-alignment strategy is the clearest support.',
        weight: 7,
        source: 'SIGNAL',
      }),
    ];
  }

  if (
    normalized.includes('data') ||
    normalized.includes('estimate') ||
    normalized.includes('confirmed') ||
    normalized.includes('quality')
  ) {
    return [
      createTopicHint({
        topicId: 'pp-estimated-vs-confirmed-context',
        reason:
          'This signal is about how solid the current read is, so the estimated-versus-confirmed boundary is the clearest support.',
        weight: 7,
        source: 'SIGNAL',
      }),
    ];
  }

  if (normalized.includes('price') || normalized.includes('move')) {
    return [
      createTopicHint({
        topicId: 'pp-what-a-marketevent-is',
        reason:
          'This signal is a raw market move clue, so the MarketEvent explainer is the clearest support.',
        weight: 5,
        source: 'SIGNAL',
      }),
    ];
  }

  return [];
}

function buildStrategyHints(context: ContextualKnowledgeSelectionContext): TopicHint[] {
  const hints: TopicHint[] = [];

  uniqueValues(context.strategyIds).forEach((strategyId) => {
    switch (strategyId) {
      case 'data_quality':
        hints.push(
          createTopicHint({
            topicId: 'pp-estimated-vs-confirmed-context',
            reason:
              'This selected lens is primarily about how much of the current read is confirmed versus estimated.',
            weight: 8,
            source: 'STRATEGY',
          }),
        );
        break;
      case 'momentum_basics':
        hints.push(
          createTopicHint({
            topicId: 'strategy-momentum-pulse',
            reason:
              'This selected lens is about whether momentum is genuinely building or starting to flatten out.',
            weight: 8,
            source: 'STRATEGY',
          }),
        );
        break;
      case 'dip_buying':
        hints.push(
          createTopicHint({
            topicId: 'strategy-buy-the-dip',
            reason:
              'This selected lens is focused on pullbacks, stabilisation, and whether weakness still fits the broader picture.',
            weight: 8,
            source: 'STRATEGY',
          }),
        );
        break;
      case 'trend_following':
        hints.push(
          createTopicHint({
            topicId: 'strategy-trend-follow',
            reason:
              'This selected lens is focused on whether the broader directional structure is still holding together.',
            weight: 8,
            source: 'STRATEGY',
          }),
        );
        break;
      case 'mean_reversion':
        hints.push(
          createTopicHint({
            topicId: 'strategy-reversion-bounce',
            reason:
              'This selected lens is focused on whether an overstretched move is starting to unwind more cleanly.',
            weight: 8,
            source: 'STRATEGY',
          }),
        );
        break;
      case 'fib_levels':
        hints.push(
          createTopicHint({
            topicId: 'strategy-fibonacci-zones',
            reason:
              'This selected lens is focused on structure, measured zones, and whether price is reacting around meaningful reference areas.',
            weight: 8,
            source: 'STRATEGY',
          }),
        );
        break;
      case 'snapshot_change':
        hints.push(
          createTopicHint({
            topicId: 'pp-what-strategy-status-means',
            reason:
              'This selected lens is about reading how strategy state changes, so strategy status is the clearest supporting explanation.',
            weight: 6,
            source: 'STRATEGY',
          }),
        );
        break;
      default:
        break;
    }
  });

  return hints;
}

function buildEventHints(context: ContextualKnowledgeSelectionContext): TopicHint[] {
  const hints: TopicHint[] = [];

  uniqueValues(context.eventTypes).forEach((eventType) => {
    switch (eventType) {
      case 'DATA_QUALITY':
      case 'ESTIMATED_PRICE':
        hints.push(
          createTopicHint({
            topicId: 'pp-estimated-vs-confirmed-context',
            reason:
              'The current interpreted event is explicitly provisional, so the estimated-versus-confirmed boundary matters most.',
            weight: 6,
            source: 'EVENT',
          }),
        );
        break;
      case 'MOMENTUM_BUILDING':
        hints.push(
          createTopicHint({
            topicId: 'strategy-momentum-pulse',
            reason:
              'The current interpreted event is about building pace and whether that acceleration looks durable enough to trust.',
            weight: 6,
            source: 'EVENT',
          }),
        );
        break;
      case 'DIP_DETECTED':
        hints.push(
          createTopicHint({
            topicId: 'strategy-buy-the-dip',
            reason:
              'The current interpreted event is a pullback context, so dip framing is the cleanest supporting explanation.',
            weight: 6,
            source: 'EVENT',
          }),
        );
        break;
      case 'PRICE_MOVEMENT':
        hints.push(
          createTopicHint({
            topicId: 'pp-what-a-marketevent-is',
            reason:
              'This surface is reacting to interpreted MarketEvents rather than raw tape, so the event framing itself is the useful explainer.',
            weight: 5,
            source: 'EVENT',
          }),
        );
        break;
    }
  });

  return hints;
}

function buildMessageHints(context: ContextualKnowledgeSelectionContext): TopicHint[] {
  const hints: TopicHint[] = [];

  uniqueValues(context.messageKinds).forEach((messageKind) => {
    switch (messageKind) {
      case 'BRIEFING':
        hints.push(
          createTopicHint({
            topicId: 'pp-what-snapshot-is-for',
            reason: 'This message posture is meant to orient quickly rather than turn the surface into a homework flow.',
            weight: 4,
            source: 'SURFACE_CONTEXT',
          }),
        );
        break;
      case 'ALERT':
        hints.push(
          createTopicHint({
            topicId: 'pp-what-alerts-are-for',
            reason: 'This message posture is meant to explain alerting calmly, without turning support into pressure.',
            weight: 4,
            source: 'SURFACE_CONTEXT',
          }),
        );
        break;
      case 'REORIENTATION':
        hints.push(
          createTopicHint({
            topicId: 'pp-what-reorientation-is-for',
            reason: 'This message posture is a calm return briefing, not a guilt mechanic or catch-up trap.',
            weight: 5,
            source: 'SURFACE_CONTEXT',
          }),
        );
        break;
      case 'REFERRAL':
        hints.push(
          createTopicHint({
            topicId: 'pp-what-knowledge-links-are-for',
            reason:
              'This message posture is pointing toward optional explanation, so the knowledge-link contract itself is the clearest explainer.',
            weight: 5,
            source: 'SURFACE_CONTEXT',
          }),
        );
        break;
      case 'GUARDED_STOP':
        hints.push(
          createTopicHint({
            topicId: 'pp-stop-loss-basics',
            reason:
              'This message posture is about risk framing, so a calm stop-loss explainer is the most relevant knowledge support.',
            weight: 5,
            source: 'SURFACE_CONTEXT',
          }),
        );
        break;
    }
  });

  return hints;
}

function buildSurfaceHints(context: ContextualKnowledgeSelectionContext): TopicHint[] {
  switch (context.surface) {
    case 'DASHBOARD':
      return [
        createTopicHint({
          topicId: 'pp-what-dashboard-is-for',
          reason:
            'This surface is where PocketPilot goes deeper on interpreted context without turning into an indicator wall.',
          weight: 2,
          source: 'SURFACE_CONTEXT',
        }),
      ];
    case 'TRADE_HUB':
      return [
        createTopicHint({
          topicId: 'pp-what-trade-hub-is-for',
          reason:
            'This surface is the calm action-support layer, so the Trade Hub overview is the clearest baseline explainer.',
          weight: 2,
          source: 'SURFACE_CONTEXT',
        }),
      ];
    case 'INSIGHTS':
      return [
        createTopicHint({
          topicId: 'pp-what-insights-is-for',
          reason: 'This surface is a reflection layer, so the Insights overview is the cleanest baseline explainer.',
          weight: 2,
          source: 'SURFACE_CONTEXT',
        }),
      ];
    case 'STRATEGY_PREVIEW':
      return [
        createTopicHint({
          topicId: 'pp-what-strategy-preview-strategy-navigator-is-for',
          reason:
            'This surface is an exploratory bridge between learning and commitment, so the preview explainer is the cleanest baseline context.',
          weight: 2,
          source: 'SURFACE_CONTEXT',
        }),
      ];
    default:
      return [];
  }
}

function buildScenarioHints(context: ContextualKnowledgeSelectionContext): TopicHint[] {
  if (context.surface !== 'STRATEGY_PREVIEW' || !context.scenarioId) {
    return [];
  }

  switch (context.scenarioId) {
    case 'DIP_VOLATILITY':
      return [
        createTopicHint({
          topicId: 'pp-estimated-vs-confirmed-context',
          reason: 'This scenario is intentionally unsettled, so certainty boundaries matter before the move itself.',
          weight: 5,
          source: 'EVENT',
        }),
      ];
    case 'TREND_CONTINUATION':
      return [
        createTopicHint({
          topicId: 'pp-what-market-regime-means',
          reason:
            'This scenario is about persistence and backdrop support, so regime framing helps explain why continuation can still be mixed.',
          weight: 5,
          source: 'EVENT',
        }),
      ];
    case 'MIXED_REVERSAL':
      return [
        createTopicHint({
          topicId: 'strategy-reversion-bounce',
          reason: 'This scenario is about an unwind trying to take shape, so a reversion explainer is the clearest supporting reference.',
          weight: 5,
          source: 'EVENT',
        }),
        createTopicHint({
          topicId: 'pp-estimated-vs-confirmed-context',
          reason: 'This scenario stays mixed, so certainty boundaries matter before any clean reversal story.',
          weight: 4,
          source: 'EVENT',
        }),
      ];
    case 'RANGE_COMPRESSION':
      return [
        createTopicHint({
          topicId: 'strategy-range-trader',
          reason:
            'This scenario is about a tighter unresolved range, so range-focused context is the clearest supporting explainer.',
          weight: 5,
          source: 'EVENT',
        }),
      ];
  }
}

function buildTradeHubHints(context: ContextualKnowledgeSelectionContext): TopicHint[] {
  if (context.surface !== 'TRADE_HUB' || !context.tradeHub) {
    return [];
  }

  const hints: TopicHint[] = [];

  if (context.tradeHub.primaryActionState) {
    switch (context.tradeHub.primaryActionState) {
      case 'READY':
        hints.push(
          createTopicHint({
            topicId: 'pp-what-protection-plans-are-for',
            reason: 'This plan is already framed and ready to review, so protection-plan context stays the calmest next read.',
            weight: 6,
            source: 'EVENT',
          }),
        );
        break;
      case 'CAUTION':
        hints.push(
          createTopicHint({
            topicId: 'pp-risk-reward-basics',
            reason: 'This plan still carries caution, so risk and reward stay the clearest support for the current frame.',
            weight: 6,
            source: 'EVENT',
          }),
        );
        hints.push(
          createTopicHint({
            topicId: 'pp-stop-loss-basics',
            reason: 'This plan still needs protective boundaries, so stop-loss context stays relevant here.',
            weight: 5,
            source: 'EVENT',
          }),
        );
        break;
      case 'WAIT':
        hints.push(
          createTopicHint({
            topicId: 'pp-position-sizing-basics',
            reason: 'This plan is still waiting on better conditions, so sizing context stays the calmest support.',
            weight: 6,
            source: 'EVENT',
          }),
        );
        hints.push(
          createTopicHint({
            topicId: 'pp-what-protection-plans-are-for',
            reason: 'This is still a support-only frame, so protection-plan context stays useful before anything else.',
            weight: 4,
            source: 'EVENT',
          }),
        );
        break;
    }
  }

  if (context.tradeHub.primaryCertainty === 'LOW') {
    hints.push(
      createTopicHint({
        topicId: 'pp-estimated-vs-confirmed-context',
        reason: 'This plan is still low-certainty, so the confirmed-versus-estimated boundary matters before the read feels settled.',
        weight: 5,
        source: 'EVENT',
      }),
    );
  }

  if (context.tradeHub.primaryAlignment === 'MISALIGNED') {
    hints.push(
      createTopicHint({
        topicId: 'pp-risk-reward-basics',
        reason: 'This plan is misaligned, so the risk-reward frame stays more useful than a stronger action story.',
        weight: 4,
        source: 'EVENT',
      }),
    );
  }

  if (context.tradeHub.hasPreparedRiskBasis) {
    hints.push(
      createTopicHint({
        topicId: 'pp-risk-reward-basics',
        reason: 'The prepared risk lane is already visible, so risk and reward stay central to the current frame.',
        weight: 5,
        source: 'EVENT',
      }),
    );
  }

  if (context.tradeHub.hasPositionSizing) {
    hints.push(
      createTopicHint({
        topicId: 'pp-position-sizing-basics',
        reason: 'Prepared sizing is available, so position-sizing context stays useful here.',
        weight: 5,
        source: 'EVENT',
      }),
    );
  }

  if (context.tradeHub.hasGuardrailEvaluation) {
    hints.push(
      createTopicHint({
        topicId: 'pp-stop-loss-basics',
        reason: 'Prepared guardrail evaluation is available, so stop-loss context is the cleanest safety follow-through.',
        weight: 5,
        source: 'EVENT',
      }),
    );
  }

  return hints;
}

function buildInsightHints(context: ContextualKnowledgeSelectionContext): TopicHint[] {
  if (!context.insights) {
    return [];
  }

  const hints: TopicHint[] = [];

  if (context.surface !== 'INSIGHTS') {
    return hints;
  }

  if (context.insights.hasNewItems) {
    hints.push(
      createTopicHint({
        topicId: 'pp-what-since-last-checked-is-for',
        reason: 'This reflection context includes newly surfaced history, so the Since Last Checked explainer is the most relevant support.',
        weight: 5,
        source: 'EVENT',
      }),
    );
  }

  if (context.insights.hasArchive) {
    hints.push(
      createTopicHint({
        topicId: 'pp-what-summary-archive-is-for',
        reason: 'This reflection context includes deeper stored history, so the archive explainer is the most relevant support.',
        weight: 5,
        source: 'EVENT',
      }),
    );
  }

  if (context.insights.hasReflection) {
    hints.push(
      createTopicHint({
        topicId: 'pp-what-monthly-and-quarterly-summaries-are-for',
        reason: 'This reflection context is comparing periods, so the medium-horizon summary explainer is the most relevant support.',
        weight: 5,
        source: 'EVENT',
      }),
    );
  }

  return hints;
}

function hasMeaningfulContext(context: ContextualKnowledgeSelectionContext): boolean {
  switch (context.surface) {
    case 'STRATEGY_PREVIEW':
      return Boolean(context.scenarioId && uniqueValues(context.strategyIds).length > 0);
    case 'DASHBOARD':
      return Boolean(
        uniqueValues(context.strategyIds).length > 0 ||
          uniqueValues(context.eventTypes).length > 0 ||
          uniqueValues(context.signalCodes).length > 0 ||
          uniqueValues(context.messageKinds).length > 0,
      );
    case 'TRADE_HUB':
      return Boolean(
        context.tradeHub?.hasPrimaryPlan ||
          context.tradeHub?.alternativePlanCount ||
          uniqueValues(context.signalCodes).length > 0 ||
          uniqueValues(context.eventTypes).length > 0,
      );
    case 'INSIGHTS':
      return Boolean(
        context.insights?.hasHistory ||
          context.insights?.hasArchive ||
          context.insights?.hasReflection ||
          context.insights?.hasNewItems,
      );
    default:
      return false;
  }
}

function determineSelectionReason(items: ReadonlyArray<CandidateScore>): ContextualKnowledgeLinkageReason {
  if (items.length === 0) {
    return 'SURFACE_CONTEXT';
  }

  const sources = new Set<TopicSource>();
  items.forEach((item) => sources.add(item.dominantSource));

  if (sources.size === 0) {
    return 'SURFACE_CONTEXT';
  }

  if (sources.size === 1) {
    return [...sources][0];
  }

  return 'MIXED';
}

export function createContextualKnowledgeSelectionContext(params: {
  surface: KnowledgeContextSurface;
  dashboardSurface?: DashboardSurfaceModel | null;
  messagePolicy?: MessagePolicyAvailability | null;
  strategyNavigatorVM?: StrategyNavigatorVM | null;
  tradeHubSurface?: TradeHubSurfaceModel | null;
  marketEvents?: ReadonlyArray<MarketEvent> | null;
  insightsHistory?: InsightsHistoryWithContinuityVM | null;
  insightsArchive?: InsightsArchiveVM | null;
  reflectionComparison?: ReflectionComparisonVM | null;
}): ContextualKnowledgeSelectionContext {
  const dashboardStrategyIds = collectDashboardStrategyIds(params.dashboardSurface);
  const dashboardEventTypes = collectDashboardEventTypes(params.dashboardSurface);
  const marketEventStrategyIds = collectStrategyIdsFromMarketEvents(params.marketEvents);
  const marketEventTypes = collectEventTypesFromMarketEvents(params.marketEvents);
  const signalCodes = collectSignalCodes(params.marketEvents);
  const strategyNavigatorAvailability =
    params.strategyNavigatorVM?.availability.status === 'AVAILABLE'
      ? params.strategyNavigatorVM.availability
      : null;

  return {
    surface: params.surface,
    strategyIds: uniqueValues([
      ...dashboardStrategyIds,
      ...marketEventStrategyIds,
      ...(strategyNavigatorAvailability ? [strategyNavigatorAvailability.strategyId] : []),
    ]),
    eventTypes: uniqueValues([...dashboardEventTypes, ...marketEventTypes]),
    signalCodes,
    messageKinds: uniqueValues(collectMessageKinds(params.messagePolicy)),
    scenarioId: strategyNavigatorAvailability?.scenario.scenarioId ?? null,
    tradeHub:
      params.tradeHubSurface && params.surface === 'TRADE_HUB'
        ? {
            primaryActionState: params.tradeHubSurface.primaryPlan?.actionState ?? null,
            primaryCertainty: params.tradeHubSurface.primaryPlan?.certainty ?? null,
            primaryAlignment: params.tradeHubSurface.primaryPlan?.alignment ?? null,
            hasPrimaryPlan: Boolean(params.tradeHubSurface.primaryPlan),
            alternativePlanCount: params.tradeHubSurface.alternativePlans.length,
            hasPreparedRiskBasis:
              params.tradeHubSurface.riskLane.preparedRiskLane.basisAvailability.status ===
              'AVAILABLE',
            hasPositionSizing:
              params.tradeHubSurface.riskLane.positionSizingAvailability.status === 'AVAILABLE',
            hasGuardrailEvaluation:
              params.tradeHubSurface.riskLane.guardrailEvaluationAvailability.status === 'AVAILABLE',
          }
        : null,
    insights:
      params.surface === 'INSIGHTS'
        ? {
            hasHistory: params.insightsHistory?.availability.status === 'AVAILABLE',
            hasArchive: params.insightsArchive?.availability.status === 'AVAILABLE',
            hasReflection: params.reflectionComparison?.availability.status === 'AVAILABLE',
            hasNewItems: (params.insightsHistory?.continuity.newItemCount ?? 0) > 0,
          }
        : null,
  };
}

export function selectContextualKnowledgeTopics(params: {
  nodes: ReadonlyArray<KnowledgeCatalogEntry>;
  context: ContextualKnowledgeSelectionContext;
}): ContextualKnowledgeTopicSelection {
  const { context, nodes } = params;
  const nodesByTopicId = new Map(nodes.map((node) => [node.topicId, node] as const));
  const scores = new Map<string, CandidateScore>();

  if (!hasMeaningfulContext(context)) {
    return {
      linkage: {
        selectedTopicIds: [],
        selectionReason: 'SURFACE_CONTEXT',
      },
      items: [],
    };
  }

  buildStrategyHints(context).forEach((hint) => addHint(scores, nodesByTopicId, hint));
  buildSignalHintsFromContext(context).forEach((hint) => addHint(scores, nodesByTopicId, hint));
  buildEventHints(context).forEach((hint) => addHint(scores, nodesByTopicId, hint));
  buildMessageHints(context).forEach((hint) => addHint(scores, nodesByTopicId, hint));
  buildSurfaceHints(context).forEach((hint) => addHint(scores, nodesByTopicId, hint));
  buildScenarioHints(context).forEach((hint) => addHint(scores, nodesByTopicId, hint));
  buildTradeHubHints(context).forEach((hint) => addHint(scores, nodesByTopicId, hint));
  buildInsightHints(context).forEach((hint) => addHint(scores, nodesByTopicId, hint));

  const selectedScores = [...scores.values()]
    .sort((left, right) => {
      const scoreDiff = right.score - left.score;

      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      const sourceDiff =
        SOURCE_PRIORITY[left.dominantSource] - SOURCE_PRIORITY[right.dominantSource];

      if (sourceDiff !== 0) {
        return sourceDiff;
      }

      const titleDiff = left.title.localeCompare(right.title);

      if (titleDiff !== 0) {
        return titleDiff;
      }

      return left.topicId.localeCompare(right.topicId);
    })
    .slice(0, MAX_CANDIDATES);

  const selectionReason = determineSelectionReason(selectedScores);
  const items = selectedScores.map((item) => ({
    topicId: item.topicId,
    title: item.title,
    reason: item.bestReason,
  }));

  return {
    linkage: {
      selectedTopicIds: items.map((item) => item.topicId),
      selectionReason,
    },
    items,
  };
}

function buildSignalHintsFromContext(context: ContextualKnowledgeSelectionContext): TopicHint[] {
  return uniqueValues(context.signalCodes).flatMap((signalCode) => collectSignalHints(signalCode));
}
