export type KnowledgeDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type KnowledgeMediaType =
  | 'ARTICLE'
  | 'DIAGRAM'
  | 'VIDEO'
  | 'INTERACTIVE'
  | 'CASE_STUDY';

export type KnowledgeSurface =
  | 'KNOWLEDGE_LIBRARY'
  | 'DASHBOARD'
  | 'SNAPSHOT'
  | 'TRADE_HUB';

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

export type KnowledgeLibraryItem = {
  topicId: string;
  title: string;
  summary: string;
  difficulty: KnowledgeDifficulty;
  mediaType: KnowledgeMediaType;
};

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
