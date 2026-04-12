import type { UserProfile } from '@/core/profile/types';
import type {
  ContextualKnowledgeAvailability,
  ContextualKnowledgeEmphasis,
  ContextualKnowledgePresentation,
  KnowledgeContextSurface,
} from '@/services/knowledge/types';

type PresentationRule = {
  maxVisibleTopics: number;
  emphasis: ContextualKnowledgeEmphasis;
  minimumAvailableTopics: number;
};

const HIDDEN_PRESENTATION: ContextualKnowledgePresentation = {
  maxVisibleTopics: 0,
  emphasis: 'SUBORDINATE',
  shouldRenderShelf: false,
};

const LIVE_SURFACE_RULES: Readonly<
  Partial<Record<KnowledgeContextSurface, Record<UserProfile, PresentationRule>>>
> = {
  DASHBOARD: {
    BEGINNER: {
      maxVisibleTopics: 3,
      emphasis: 'STANDARD',
      minimumAvailableTopics: 1,
    },
    MIDDLE: {
      maxVisibleTopics: 2,
      emphasis: 'LIGHT',
      minimumAvailableTopics: 1,
    },
    ADVANCED: {
      maxVisibleTopics: 1,
      emphasis: 'SUBORDINATE',
      minimumAvailableTopics: 2,
    },
  },
  TRADE_HUB: {
    BEGINNER: {
      maxVisibleTopics: 2,
      emphasis: 'LIGHT',
      minimumAvailableTopics: 1,
    },
    MIDDLE: {
      maxVisibleTopics: 1,
      emphasis: 'SUBORDINATE',
      minimumAvailableTopics: 2,
    },
    ADVANCED: {
      maxVisibleTopics: 1,
      emphasis: 'SUBORDINATE',
      minimumAvailableTopics: 2,
    },
  },
};

export function createContextualKnowledgePresentation(params: {
  profile: UserProfile;
  surface: KnowledgeContextSurface;
  availability: ContextualKnowledgeAvailability;
}): ContextualKnowledgePresentation {
  if (params.availability.status !== 'AVAILABLE') {
    return HIDDEN_PRESENTATION;
  }

  const surfaceRules = LIVE_SURFACE_RULES[params.surface];
  const rule = surfaceRules?.[params.profile];

  if (!rule) {
    return HIDDEN_PRESENTATION;
  }

  const availableTopicCount = params.availability.items.length;

  return {
    maxVisibleTopics: Math.min(rule.maxVisibleTopics, availableTopicCount),
    emphasis: rule.emphasis,
    shouldRenderShelf: availableTopicCount >= rule.minimumAvailableTopics,
  };
}
