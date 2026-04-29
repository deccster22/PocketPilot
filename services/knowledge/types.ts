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

export type InlineGlossarySurface = 'DASHBOARD_EXPLANATION' | 'TRADE_HUB_SAFETY';

export type GlossaryTermVariant = {
  topicId: string;
  canonicalTerm: string;
  matchTerms: ReadonlyArray<string>;
};

export type GlossaryMatch = {
  topicId: string;
  matchedText: string;
  canonicalTerm: string;
};

export type InlineGlossarySegment =
  | {
      kind: 'TEXT';
      text: string;
    }
  | {
      kind: 'GLOSSARY_TERM';
      text: string;
      topicId: string;
      acknowledgementKey: string;
      renderMode: 'LINKED' | 'PLAIN';
    };

export type InlineGlossaryBlock = {
  segments: ReadonlyArray<InlineGlossarySegment>;
  acknowledgementKeys: ReadonlyArray<string>;
};

export type InlineGlossaryAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_ELIGIBLE_TERMS' | 'NOT_ENABLED_FOR_PROFILE' | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      block: InlineGlossaryBlock;
    };

export type TradeHubHelpAffordanceSurface = 'TRADE_HUB' | 'RISK_TOOL';

export type TradeHubHelpAffordanceSlot =
  | 'TRADE_HUB_GUARDRAILS'
  | 'RISK_TOOL_STOP_LOSS_PRICE'
  | 'RISK_TOOL_TARGET_PRICE'
  | 'RISK_TOOL_ACTIVE_RISK_BASIS';

export type TradeHubHelpAffordanceTerm =
  | 'STOP_LOSS_PRICE'
  | 'TARGET_PRICE'
  | 'RISK_AMOUNT'
  | 'RISK_PERCENT'
  | 'GUARDRAILS';

export type TradeHubHelpAffordanceTreatment = 'GLOSSARY_THEN_TOPIC';

export type TradeHubHelpDestination = {
  glossaryTopicId: string;
  glossaryPath: string;
  topicId: string;
  topicPath: string;
};

export type TradeHubHelpAffordance = {
  term: TradeHubHelpAffordanceTerm;
  termLabel: string;
  surface: TradeHubHelpAffordanceSurface;
  slot: TradeHubHelpAffordanceSlot;
  treatment: TradeHubHelpAffordanceTreatment;
  destination: TradeHubHelpDestination;
  tapTopicId: string;
  followThroughTopicId: string;
};

export type TradeHubHelpAffordanceAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_ELIGIBLE_TERMS' | 'NOT_ENABLED_FOR_PROFILE' | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      affordances: ReadonlyArray<TradeHubHelpAffordance>;
    };

export type InlineGlossarySignalSurface = 'DASHBOARD' | 'TRADE_HUB';

export type InlineGlossarySignalProfileTier = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type InlineGlossarySignalKey = {
  topicId: string;
  surface: InlineGlossarySignalSurface;
  profileTier: InlineGlossarySignalProfileTier;
};

export type InlineGlossaryAggregateSignal = {
  key: InlineGlossarySignalKey;
  surfacedCount: number;
  acknowledgedCount: number;
};

export type InlineGlossarySignalSummaryAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_SIGNALS_RECORDED';
    }
  | {
      status: 'AVAILABLE';
      signals: ReadonlyArray<InlineGlossaryAggregateSignal>;
    };
