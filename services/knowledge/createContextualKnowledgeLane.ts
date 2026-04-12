import type { UserProfile } from '@/core/profile/types';
import { knowledgeCatalog } from '@/services/knowledge/knowledgeCatalog';
import { createContextualKnowledgePresentation } from '@/services/knowledge/createContextualKnowledgePresentation';
import { fetchContextualKnowledgeAvailability } from '@/services/knowledge/fetchContextualKnowledgeAvailability';
import type {
  ContextualKnowledgeLane,
  ContextualKnowledgeLaneTopic,
  KnowledgeCatalogEntry,
  KnowledgeLibraryTopicSummary,
} from '@/services/knowledge/types';

function toKnowledgeLibraryTopicSummary(node: KnowledgeCatalogEntry): KnowledgeLibraryTopicSummary {
  return {
    topicId: node.topicId,
    title: node.title,
    summary: node.summary,
    difficulty: node.difficulty,
    mediaType: node.mediaType,
  };
}

function toContextualKnowledgeLaneTopic(params: {
  node: KnowledgeCatalogEntry;
  reason: string;
}): ContextualKnowledgeLaneTopic {
  return {
    ...toKnowledgeLibraryTopicSummary(params.node),
    reason: params.reason,
  };
}

export function createContextualKnowledgeLane(
  params: Parameters<typeof fetchContextualKnowledgeAvailability>[0] & {
    profile: UserProfile;
  },
): ContextualKnowledgeLane {
  const { profile, ...availabilityParams } = params;
  const nodes = availabilityParams.nodes ?? knowledgeCatalog;
  const availability = fetchContextualKnowledgeAvailability({
    ...availabilityParams,
    nodes,
  });
  const presentation = createContextualKnowledgePresentation({
    profile,
    surface: availabilityParams.surface,
    availability,
  });

  if (availability.status !== 'AVAILABLE') {
    return {
      availability,
      presentation,
      topics: [],
    };
  }

  const nodesByTopicId = new Map(nodes.map((node) => [node.topicId, node] as const));
  const topics = availability.items
    .slice(0, presentation.maxVisibleTopics)
    .map((item) => {
      const node = nodesByTopicId.get(item.topicId);

      if (!node) {
        return null;
      }

      return toContextualKnowledgeLaneTopic({
        node,
        reason: item.reason,
      });
    })
    .filter((topic): topic is ContextualKnowledgeLaneTopic => Boolean(topic));

  const effectivePresentation =
    topics.length === 0
      ? {
          ...presentation,
          shouldRenderShelf: false,
        }
      : presentation;

  return {
    availability,
    presentation: effectivePresentation,
    topics,
  };
}
