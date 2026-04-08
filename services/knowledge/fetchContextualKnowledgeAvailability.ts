import type { DashboardSurfaceVM } from '@/services/dashboard/dashboardSurfaceService';
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

function collectDashboardStrategyIds(surface: DashboardSurfaceVM | null | undefined): string[] {
  if (!surface) {
    return [];
  }

  return [
    ...surface.model.primeZone.items,
    ...surface.model.secondaryZone.items,
    ...surface.model.deepZone.items,
  ]
    .map((item) => item.strategyId)
    .filter((strategyId): strategyId is string => Boolean(strategyId));
}

function collectDashboardEventTypes(surface: DashboardSurfaceVM | null | undefined) {
  if (!surface) {
    return [];
  }

  return [
    ...surface.model.primeZone.items,
    ...surface.model.secondaryZone.items,
    ...surface.model.deepZone.items,
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
  dashboardSurface?: DashboardSurfaceVM | null;
  messagePolicy?: MessagePolicyAvailability | null;
  strategyNavigatorVM?: StrategyNavigatorVM | null;
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
        },
      });
    default:
      return createContextualKnowledgeAvailability({
        nodes,
        input: {
          surface: params.surface,
        },
      });
  }
}
