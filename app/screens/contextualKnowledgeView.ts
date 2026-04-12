import type { ContextualKnowledgeCandidate, ContextualKnowledgeLane } from '@/services/knowledge/types';

export type ContextualKnowledgeSectionViewData = {
  visible: boolean;
  items: ReadonlyArray<ContextualKnowledgeCandidate>;
};

export function createContextualKnowledgeSectionViewData(
  lane: ContextualKnowledgeLane | null | undefined,
): ContextualKnowledgeSectionViewData {
  if (!lane || lane.availability.status !== 'AVAILABLE' || lane.topics.length === 0) {
    return {
      visible: false,
      items: [],
    };
  }

  return {
    visible: true,
    items: lane.topics.map((topic) => ({
      topicId: topic.topicId,
      title: topic.title,
      reason: topic.reason,
    })),
  };
}
