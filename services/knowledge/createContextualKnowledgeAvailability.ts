import type { EventType, MarketEvent } from '@/core/types/marketEvent';
import type { MessagePolicyKind } from '@/services/messages/types';
import type {
  ContextualKnowledgeAvailability,
  KnowledgeCatalogEntry,
  KnowledgeContextSurface,
} from '@/services/knowledge/types';
import { selectContextualKnowledgeTopics } from '@/services/knowledge/selectContextualKnowledgeTopics';
import type { StrategyPreviewScenarioId } from '@/services/strategyNavigator/types';
import type { TradeHubSurfaceModel } from '@/services/trade/types';

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
  marketEvents?: ReadonlyArray<MarketEvent> | null;
};

type ContextualKnowledgeSelectionContext = Parameters<
  typeof selectContextualKnowledgeTopics
>[0]['context'];

const ENABLED_SURFACES = new Set<KnowledgeContextSurface>([
  'DASHBOARD',
  'INSIGHTS',
  'TRADE_HUB',
  'STRATEGY_PREVIEW',
]);

function uniqueValues<T>(values?: ReadonlyArray<T>): T[] {
  return values ? [...new Set(values)] : [];
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

function collectSignalCodes(marketEvents?: ReadonlyArray<MarketEvent> | null): string[] {
  if (!marketEvents) {
    return [];
  }

  return uniqueValues(marketEvents.flatMap((event) => event.signalsTriggered));
}

function collectMessageKinds(messageKinds?: ReadonlyArray<MessagePolicyKind> | null): MessagePolicyKind[] {
  return uniqueValues(messageKinds ?? []);
}

function createSelectionContext(input: ContextualKnowledgeInput): ContextualKnowledgeSelectionContext {
  const marketEventStrategyIds = collectStrategyIdsFromMarketEvents(input.marketEvents);
  const marketEventTypes = collectEventTypesFromMarketEvents(input.marketEvents);

  return {
    surface: input.surface,
    strategyIds: uniqueValues([...(input.strategyIds ?? []), ...marketEventStrategyIds]),
    eventTypes: uniqueValues([...(input.eventTypes ?? []), ...marketEventTypes]),
    signalCodes: collectSignalCodes(input.marketEvents),
    messageKinds: collectMessageKinds(input.messageKinds),
    scenarioId: input.scenarioId ?? null,
    tradeHub:
      input.surface === 'TRADE_HUB' && input.tradeHubSurface
        ? {
            primaryActionState: input.tradeHubSurface.primaryPlan?.actionState ?? null,
            primaryCertainty: input.tradeHubSurface.primaryPlan?.certainty ?? null,
            primaryAlignment: input.tradeHubSurface.primaryPlan?.alignment ?? null,
            hasPrimaryPlan: Boolean(input.tradeHubSurface.primaryPlan),
            alternativePlanCount: input.tradeHubSurface.alternativePlans.length,
            hasPreparedRiskBasis:
              input.tradeHubSurface.riskLane.preparedRiskLane.basisAvailability.status ===
              'AVAILABLE',
            hasPositionSizing:
              input.tradeHubSurface.riskLane.positionSizingAvailability.status === 'AVAILABLE',
            hasGuardrailEvaluation:
              input.tradeHubSurface.riskLane.guardrailEvaluationAvailability.status === 'AVAILABLE',
          }
        : null,
    insights:
      input.surface === 'INSIGHTS' && input.insights
        ? {
            hasHistory: input.insights.hasHistory,
            hasArchive: input.insights.hasArchive,
            hasReflection: input.insights.hasReflection,
            hasNewItems: input.insights.hasNewItems,
          }
        : null,
  };
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

  const context = createSelectionContext(input);

  if (!hasMeaningfulContext(context)) {
    return {
      status: 'UNAVAILABLE',
      reason: 'INSUFFICIENT_INTERPRETED_CONTEXT',
    };
  }

  const selection = selectContextualKnowledgeTopics({
    nodes,
    context,
  });

  if (selection.items.length === 0) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_RELEVANT_TOPIC',
    };
  }

  return {
    status: 'AVAILABLE',
    surface: input.surface,
    items: selection.items,
  };
}
