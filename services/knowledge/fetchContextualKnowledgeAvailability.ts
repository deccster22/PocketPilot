import type { MarketEvent } from '@/core/types/marketEvent';
import type { DashboardSurfaceModel } from '@/services/dashboard/types';
import type {
  InsightsArchiveVM,
  InsightsHistoryWithContinuityVM,
  ReflectionComparisonVM,
} from '@/services/insights/types';
import { knowledgeCatalog } from '@/services/knowledge/knowledgeCatalog';
import { createContextualKnowledgeAvailability } from '@/services/knowledge/createContextualKnowledgeAvailability';
import type {
  ContextualKnowledgeAvailability,
  KnowledgeCatalogEntry,
  KnowledgeContextSurface,
} from '@/services/knowledge/types';
import type { MessagePolicyAvailability, MessagePolicyKind } from '@/services/messages/types';
import type { StrategyNavigatorVM } from '@/services/strategyNavigator/types';
import type { TradeHubSurfaceModel } from '@/services/trade/types';

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

function collectDashboardEventTypes(surface: DashboardSurfaceModel | null | undefined) {
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

export function fetchContextualKnowledgeAvailability(params: {
  surface: KnowledgeContextSurface;
  nodes?: ReadonlyArray<KnowledgeCatalogEntry>;
  dashboardSurface?: DashboardSurfaceModel | null;
  messagePolicy?: MessagePolicyAvailability | null;
  strategyNavigatorVM?: StrategyNavigatorVM | null;
  tradeHubSurface?: TradeHubSurfaceModel | null;
  marketEvents?: ReadonlyArray<MarketEvent> | null;
  insightsHistory?: InsightsHistoryWithContinuityVM | null;
  insightsArchive?: InsightsArchiveVM | null;
  reflectionComparison?: ReflectionComparisonVM | null;
}): ContextualKnowledgeAvailability {
  const nodes = params.nodes ?? knowledgeCatalog;

  switch (params.surface) {
    case 'STRATEGY_PREVIEW':
      return createContextualKnowledgeAvailability({
        nodes,
        input: {
          surface: params.surface,
          strategyIds:
            params.strategyNavigatorVM?.availability.status === 'AVAILABLE'
              ? [params.strategyNavigatorVM.availability.strategyId]
              : [],
          scenarioId:
            params.strategyNavigatorVM?.availability.status === 'AVAILABLE'
              ? params.strategyNavigatorVM.availability.scenario.scenarioId
              : null,
          marketEvents: params.marketEvents,
        },
      });
    case 'DASHBOARD':
      return createContextualKnowledgeAvailability({
        nodes,
        input: {
          surface: params.surface,
          strategyIds: collectDashboardStrategyIds(params.dashboardSurface),
          eventTypes: collectDashboardEventTypes(params.dashboardSurface),
          messageKinds: collectMessageKinds(params.messagePolicy),
          marketEvents: params.marketEvents,
        },
      });
    case 'TRADE_HUB':
      return createContextualKnowledgeAvailability({
        nodes,
        input: {
          surface: params.surface,
          tradeHubSurface: params.tradeHubSurface ?? undefined,
          marketEvents: params.marketEvents,
        },
      });
    case 'INSIGHTS':
      return createContextualKnowledgeAvailability({
        nodes,
        input: {
          surface: params.surface,
          insights: {
            hasHistory: params.insightsHistory?.availability.status === 'AVAILABLE',
            hasArchive: params.insightsArchive?.availability.status === 'AVAILABLE',
            hasReflection: params.reflectionComparison?.availability.status === 'AVAILABLE',
            hasNewItems: (params.insightsHistory?.continuity.newItemCount ?? 0) > 0,
          },
          marketEvents: params.marketEvents,
        },
      });
    default:
      return createContextualKnowledgeAvailability({
        nodes,
        input: {
          surface: params.surface,
          marketEvents: params.marketEvents,
        },
      });
  }
}
