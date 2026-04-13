export type KnowledgeDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type KnowledgeMediaType = 'ARTICLE' | 'DIAGRAM' | 'VIDEO' | 'INTERACTIVE' | 'CASE_STUDY';

export type KnowledgeSurface =
  | 'KNOWLEDGE_LIBRARY'
  | 'DASHBOARD'
  | 'SNAPSHOT'
  | 'TRADE_HUB'
  | 'STRATEGY_PREVIEW';

export type KnowledgeCatalogFamily =
  | 'orientation'
  | 'core-language'
  | 'strategies'
  | 'action-risk'
  | 'reflection'
  | 'knowledge-system';

export type KnowledgeCatalogPriority = 'NOW' | 'NEXT' | 'LATER';

export type KnowledgeNode = {
  topicId: string;
  title: string;
  summary: string;
  content: string;
  mediaType: KnowledgeMediaType;
  difficulty: KnowledgeDifficulty;
  strategyLinks: ReadonlyArray<string>;
  signalLinks: ReadonlyArray<string>;
  eventTypeLinks: ReadonlyArray<string>;
};

export type KnowledgeTopicSection = {
  heading: string;
  body: ReadonlyArray<string>;
};

export type KnowledgeCatalogEntry = KnowledgeNode & {
  family: KnowledgeCatalogFamily;
  priority: KnowledgeCatalogPriority;
  sections: ReadonlyArray<KnowledgeTopicSection>;
  relatedTopicIds: ReadonlyArray<string>;
};

export type KnowledgeLibraryItem = {
  topicId: string;
  title: string;
  summary: string;
  difficulty: KnowledgeDifficulty;
  mediaType: KnowledgeMediaType;
};

export type KnowledgeLibraryTopicSummary = KnowledgeLibraryItem;

export type KnowledgeLibrarySection = {
  id: string;
  title: string;
  items: ReadonlyArray<KnowledgeLibraryItem>;
};

export type KnowledgeLibraryAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_KNOWLEDGE_BASELINE' | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      sections: ReadonlyArray<KnowledgeLibrarySection>;
    };

export type KnowledgeLibraryVM = {
  title: string;
  summary: string;
  availability: KnowledgeLibraryAvailability;
};

export type KnowledgeTopicRelatedItem = {
  topicId: string;
  title: string;
  summary: string;
  difficulty: KnowledgeDifficulty | null;
  mediaType: KnowledgeMediaType | null;
};

export type KnowledgeTopicDetail = {
  topicId: string;
  title: string;
  summary: string;
  difficulty: KnowledgeDifficulty | null;
  sections: ReadonlyArray<KnowledgeTopicSection>;
  relatedTopicIds: ReadonlyArray<string>;
  relatedTopics: ReadonlyArray<KnowledgeTopicRelatedItem>;
  contextFraming: KnowledgeTopicContextFramingAvailability;
};

export type KnowledgeTopicAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_TOPIC_SELECTED' | 'TOPIC_NOT_FOUND' | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      topic: KnowledgeTopicDetail;
    };

export type KnowledgeTopicContextOrigin = {
  originSurface: KnowledgeContextSurface | 'NONE';
  linkageReason: ContextualKnowledgeLinkageReason | null;
};

export type KnowledgeTopicContextFramingReason =
  | 'STRATEGY'
  | 'SIGNAL'
  | 'EVENT'
  | 'SURFACE_CONTEXT';

export type KnowledgeTopicContextFraming = {
  title: string;
  summary: string;
  originSurface: 'DASHBOARD' | 'TRADE_HUB' | 'NONE';
  linkageReasons: ReadonlyArray<KnowledgeTopicContextFramingReason>;
};

export type KnowledgeTopicContextFramingAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_CONTEXTUAL_ORIGIN' | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      framing: KnowledgeTopicContextFraming;
    };

export type KnowledgeTopicDetailVM = {
  generatedAt: string | null;
  availability: KnowledgeTopicAvailability;
};

export type KnowledgeContextSurface =
  | 'SNAPSHOT'
  | 'DASHBOARD'
  | 'TRADE_HUB'
  | 'INSIGHTS'
  | 'STRATEGY_PREVIEW';

export type ContextualKnowledgeCandidate = {
  topicId: string;
  title: string;
  reason: string;
};

export type ContextualKnowledgeEmphasis = 'SUBORDINATE' | 'LIGHT' | 'STANDARD';

export type ContextualKnowledgePresentation = {
  maxVisibleTopics: number;
  emphasis: ContextualKnowledgeEmphasis;
  shouldRenderShelf: boolean;
};

export type ContextualKnowledgeLinkageReason =
  | 'STRATEGY'
  | 'SIGNAL'
  | 'EVENT'
  | 'SURFACE_CONTEXT'
  | 'MIXED';

export type ContextualKnowledgeLinkage = {
  selectedTopicIds: ReadonlyArray<string>;
  selectionReason: ContextualKnowledgeLinkageReason;
};

export type ContextualKnowledgeLaneTopic = KnowledgeLibraryTopicSummary & {
  reason: string;
};

export type ContextualKnowledgeLane = {
  availability: ContextualKnowledgeAvailability;
  linkage: ContextualKnowledgeLinkage;
  presentation: ContextualKnowledgePresentation;
  topics: ReadonlyArray<ContextualKnowledgeLaneTopic>;
};

export type ContextualKnowledgeAvailability =
  | {
      status: 'UNAVAILABLE';
      reason:
        | 'NO_RELEVANT_TOPIC'
        | 'NOT_ENABLED_FOR_SURFACE'
        | 'INSUFFICIENT_INTERPRETED_CONTEXT';
    }
  | {
      status: 'AVAILABLE';
      surface: KnowledgeContextSurface;
      items: ReadonlyArray<ContextualKnowledgeCandidate>;
    };
