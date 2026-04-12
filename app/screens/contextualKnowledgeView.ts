import type {
  ContextualKnowledgeCandidate,
  ContextualKnowledgeLane,
  ContextualKnowledgePresentation,
} from '@/services/knowledge/types';

export type ContextualKnowledgeSectionViewData = {
  visible: boolean;
  title: string;
  summary: string;
  presentation: ContextualKnowledgePresentation;
  items: ReadonlyArray<ContextualKnowledgeCandidate>;
};

const HIDDEN_PRESENTATION: ContextualKnowledgePresentation = {
  maxVisibleTopics: 0,
  emphasis: 'SUBORDINATE',
  shouldRenderShelf: false,
};

function createContextualKnowledgeTitle(
  presentation: ContextualKnowledgePresentation,
  itemCount: number,
): string {
  if (!presentation.shouldRenderShelf) {
    return 'Optional knowledge';
  }

  switch (presentation.emphasis) {
    case 'STANDARD':
      return 'Optional knowledge';
    case 'LIGHT':
      return itemCount === 1 ? 'Small optional context' : 'Optional context';
    default:
      return itemCount === 1 ? 'Quiet context' : 'Quiet optional context';
  }
}

function createContextualKnowledgeSummary(
  presentation: ContextualKnowledgePresentation,
  itemCount: number,
): string {
  if (!presentation.shouldRenderShelf) {
    return 'The shelf stays hidden until the prepared context is stronger.';
  }

  switch (presentation.emphasis) {
    case 'STANDARD':
      return 'These links stay subordinate to the main surface and appear only when relevance is clear.';
    case 'LIGHT':
      return itemCount === 1
        ? 'A single calm link stays visible when the current surface still has enough relevance.'
        : 'A small, calm set of links stays visible when the current surface still has enough relevance.';
    default:
      return itemCount === 1
        ? 'Only one quiet link stays visible, and only when the surface is still relevant enough.'
        : 'Only the quietest prepared links stay visible, and only when the surface is still relevant enough.';
  }
}

export function createContextualKnowledgeSectionViewData(
  lane: ContextualKnowledgeLane | null | undefined,
): ContextualKnowledgeSectionViewData {
  if (
    !lane ||
    lane.availability.status !== 'AVAILABLE' ||
    !lane.presentation.shouldRenderShelf ||
    lane.topics.length === 0
  ) {
    return {
      visible: false,
      title: createContextualKnowledgeTitle(HIDDEN_PRESENTATION, 0),
      summary: createContextualKnowledgeSummary(HIDDEN_PRESENTATION, 0),
      presentation: HIDDEN_PRESENTATION,
      items: [],
    };
  }

  return {
    visible: true,
    title: createContextualKnowledgeTitle(lane.presentation, lane.topics.length),
    summary: createContextualKnowledgeSummary(lane.presentation, lane.topics.length),
    presentation: lane.presentation,
    items: lane.topics.map((topic) => ({
      topicId: topic.topicId,
      title: topic.title,
      reason: topic.reason,
    })),
  };
}
