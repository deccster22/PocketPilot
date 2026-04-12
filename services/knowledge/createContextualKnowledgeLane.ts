import type { UserProfile } from '@/core/profile/types';
import { knowledgeCatalog } from '@/services/knowledge/knowledgeCatalog';
import { fetchContextualKnowledgeAvailability } from '@/services/knowledge/fetchContextualKnowledgeAvailability';
import type {
  ContextualKnowledgeLane,
  ContextualKnowledgeLaneTopic,
  KnowledgeCatalogEntry,
  KnowledgeLibraryTopicSummary,
} from '@/services/knowledge/types';

const TOPIC_LIMIT_BY_PROFILE: Record<UserProfile, number> = {
  BEGINNER: 3,
  MIDDLE: 2,
  ADVANCED: 1,
};

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

  if (availability.status !== 'AVAILABLE') {
    return {
      availability,
      topics: [],
    };
  }

  const nodesByTopicId = new Map(nodes.map((node) => [node.topicId, node] as const));
  const topicLimit = TOPIC_LIMIT_BY_PROFILE[profile];
  const topics = availability.items
    .slice(0, topicLimit)
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

  return {
    availability,
    topics,
  };
}
