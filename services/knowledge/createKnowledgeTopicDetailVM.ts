import type {
  KnowledgeCatalogEntry,
  KnowledgeTopicAvailability,
  KnowledgeTopicContextOrigin,
  KnowledgeTopicRelatedItem,
} from '@/services/knowledge/types';
import { createKnowledgeTopicContextFraming } from '@/services/knowledge/createKnowledgeTopicContextFraming';

function toRelatedTopic(entry: KnowledgeCatalogEntry): KnowledgeTopicRelatedItem {
  return {
    topicId: entry.topicId,
    title: entry.title,
    summary: entry.summary,
    difficulty: entry.difficulty,
    mediaType: entry.mediaType,
  };
}

export function createKnowledgeTopicDetailVM(params: {
  topicId?: string | null;
  nodes: ReadonlyArray<KnowledgeCatalogEntry>;
  contextualOrigin?: KnowledgeTopicContextOrigin | null;
}): KnowledgeTopicAvailability {
  if (!params.topicId) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_TOPIC_SELECTED',
    };
  }

  const nodesByTopicId = new Map(params.nodes.map((node) => [node.topicId, node] as const));
  const topic = nodesByTopicId.get(params.topicId);

  if (!topic) {
    return {
      status: 'UNAVAILABLE',
      reason: 'TOPIC_NOT_FOUND',
    };
  }

  const relatedTopics = topic.relatedTopicIds
    .map((relatedTopicId) => nodesByTopicId.get(relatedTopicId))
    .filter((entry): entry is KnowledgeCatalogEntry => Boolean(entry))
    .map(toRelatedTopic);

  return {
    status: 'AVAILABLE',
    topic: {
      topicId: topic.topicId,
      title: topic.title,
      summary: topic.summary,
      difficulty: topic.difficulty,
      sections: topic.sections,
      relatedTopicIds: relatedTopics.map((entry) => entry.topicId),
      relatedTopics,
      contextFraming: createKnowledgeTopicContextFraming({
        contextualOrigin: params.contextualOrigin,
      }),
    },
  };
}
