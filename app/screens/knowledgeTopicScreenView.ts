import type {
  KnowledgeDifficulty,
  KnowledgeMediaType,
  KnowledgeTopicContextFraming,
  KnowledgeTopicContextFramingAvailability,
  KnowledgeTopicContextFramingReason,
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

export type KnowledgeTopicContextFramingViewData = {
  title: string;
  summary: string;
  originSurfaceText: string;
  linkageReasonsText: string | null;
};

export type KnowledgeTopicScreenViewData = {
  title: string;
  summary: string;
  difficultyText: string | null;
  availabilityMessage: string | null;
  contextFraming: KnowledgeTopicContextFramingViewData | null;
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

function formatOriginSurface(
  originSurface: KnowledgeTopicContextFraming['originSurface'],
): string {
  switch (originSurface) {
    case 'DASHBOARD':
      return 'Dashboard';
    case 'TRADE_HUB':
      return 'Trade Hub';
    default:
      return 'None';
  }
}

function formatLinkageReason(
  reason: KnowledgeTopicContextFramingReason,
): string {
  switch (reason) {
    case 'STRATEGY':
      return 'Strategy';
    case 'SIGNAL':
      return 'Signal';
    case 'EVENT':
      return 'Event';
    default:
      return 'Surface context';
  }
}

function formatLinkageReasons(
  reasons: ReadonlyArray<KnowledgeTopicContextFramingReason>,
): string | null {
  if (reasons.length === 0) {
    return null;
  }

  return reasons.map(formatLinkageReason).join(' / ');
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

function createContextFramingViewData(
  framingAvailability: KnowledgeTopicContextFramingAvailability,
): KnowledgeTopicContextFramingViewData | null {
  if (framingAvailability.status !== 'AVAILABLE') {
    return null;
  }

  return {
    title: framingAvailability.framing.title,
    summary: framingAvailability.framing.summary,
    originSurfaceText: formatOriginSurface(framingAvailability.framing.originSurface),
    linkageReasonsText: formatLinkageReasons(framingAvailability.framing.linkageReasons),
  };
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
      contextFraming: null,
      sections: [],
      relatedTopics: [],
    };
  }

  const contextFraming = createContextFramingViewData(vm.availability.topic.contextFraming);

  return {
    title: vm.availability.topic.title,
    summary: vm.availability.topic.summary,
    difficultyText: vm.availability.topic.difficulty
      ? formatDifficulty(vm.availability.topic.difficulty)
      : null,
    availabilityMessage: null,
    contextFraming,
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
