import type {
  KnowledgeDifficulty,
  KnowledgeMediaType,
  KnowledgeTopicDetailVM,
} from '@/services/knowledge/types';

export type KnowledgeTopicSectionViewData = {
  heading: string;
  body: string[];
};

export type KnowledgeTopicRelatedCardViewData = {
  topicId: string;
  title: string;
  summary: string;
  metaText: string | null;
};

export type KnowledgeTopicScreenViewData = {
  title: string;
  summary: string;
  difficultyText: string | null;
  availabilityMessage: string | null;
  sections: KnowledgeTopicSectionViewData[];
  relatedTopics: KnowledgeTopicRelatedCardViewData[];
};

function formatDifficulty(difficulty: KnowledgeDifficulty): string {
  switch (difficulty) {
    case 'BEGINNER':
      return 'Beginner';
    case 'INTERMEDIATE':
      return 'Intermediate';
    default:
      return 'Advanced';
  }
}

function formatMediaType(mediaType: KnowledgeMediaType): string {
  switch (mediaType) {
    case 'ARTICLE':
      return 'Article';
    case 'DIAGRAM':
      return 'Diagram';
    case 'VIDEO':
      return 'Video';
    case 'INTERACTIVE':
      return 'Interactive';
    default:
      return 'Case study';
  }
}

function formatAvailabilityMessage(
  reason: Extract<KnowledgeTopicDetailVM['availability'], { status: 'UNAVAILABLE' }>['reason'],
): string {
  switch (reason) {
    case 'NO_TOPIC_SELECTED':
      return 'Choose a topic from the library to open the detail view.';
    case 'TOPIC_NOT_FOUND':
      return 'That topic is not available in the current knowledge shelf.';
    default:
      return 'This topic detail view is not enabled on this surface.';
  }
}

function formatRelatedMeta(params: {
  difficulty: KnowledgeDifficulty | null;
  mediaType: KnowledgeMediaType | null;
}): string | null {
  const parts = [
    params.difficulty ? formatDifficulty(params.difficulty) : null,
    params.mediaType ? formatMediaType(params.mediaType) : null,
  ].filter((part): part is string => Boolean(part));

  return parts.length > 0 ? parts.join(' / ') : null;
}

export function createKnowledgeTopicScreenViewData(
  vm: KnowledgeTopicDetailVM | null,
): KnowledgeTopicScreenViewData | null {
  if (!vm) {
    return null;
  }

  if (vm.availability.status === 'UNAVAILABLE') {
    return {
      title: 'Knowledge topic',
      summary:
        'A calm topic view for one PocketPilot concept or strategy. It stays optional and ready when you want more depth.',
      difficultyText: null,
      availabilityMessage: formatAvailabilityMessage(vm.availability.reason),
      sections: [],
      relatedTopics: [],
    };
  }

  return {
    title: vm.availability.topic.title,
    summary: vm.availability.topic.summary,
    difficultyText: vm.availability.topic.difficulty
      ? formatDifficulty(vm.availability.topic.difficulty)
      : null,
    availabilityMessage: null,
    sections: vm.availability.topic.sections.map((section) => ({
      heading: section.heading,
      body: [...section.body],
    })),
    relatedTopics: vm.availability.topic.relatedTopics.map((topic) => ({
      topicId: topic.topicId,
      title: topic.title,
      summary: topic.summary,
      metaText: formatRelatedMeta({
        difficulty: topic.difficulty,
        mediaType: topic.mediaType,
      }),
    })),
  };
}
