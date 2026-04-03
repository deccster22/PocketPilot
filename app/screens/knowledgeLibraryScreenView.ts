import type {
  KnowledgeDifficulty,
  KnowledgeLibraryVM,
  KnowledgeMediaType,
} from '@/services/knowledge/types';

export type KnowledgeLibraryCardViewData = {
  topicId: string;
  title: string;
  summary: string;
  difficultyText: string;
  mediaTypeText: string;
};

export type KnowledgeLibrarySectionViewData = {
  id: string;
  title: string;
  items: KnowledgeLibraryCardViewData[];
};

export type KnowledgeLibraryScreenViewData = {
  title: string;
  summary: string;
  availabilityMessage: string | null;
  sections: KnowledgeLibrarySectionViewData[];
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

function formatAvailabilityMessage(reason: Extract<
  KnowledgeLibraryVM['availability'],
  { status: 'UNAVAILABLE' }
>['reason']): string {
  switch (reason) {
    case 'NO_KNOWLEDGE_BASELINE':
      return 'Knowledge is not available yet.';
    default:
      return 'Knowledge is not enabled on this surface.';
  }
}

export function createKnowledgeLibraryScreenViewData(
  vm: KnowledgeLibraryVM | null,
): KnowledgeLibraryScreenViewData | null {
  if (!vm) {
    return null;
  }

  if (vm.availability.status === 'UNAVAILABLE') {
    return {
      title: vm.title,
      summary: vm.summary,
      availabilityMessage: formatAvailabilityMessage(vm.availability.reason),
      sections: [],
    };
  }

  return {
    title: vm.title,
    summary: vm.summary,
    availabilityMessage: null,
    sections: vm.availability.sections.map((section) => ({
      id: section.id,
      title: section.title,
      items: section.items.map((item) => ({
        topicId: item.topicId,
        title: item.title,
        summary: item.summary,
        difficultyText: formatDifficulty(item.difficulty),
        mediaTypeText: formatMediaType(item.mediaType),
      })),
    })),
  };
}
