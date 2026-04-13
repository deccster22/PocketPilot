import { createKnowledgeTopicDetailVM } from '@/services/knowledge/createKnowledgeTopicDetailVM';
import { knowledgeCatalog } from '@/services/knowledge/knowledgeCatalog';
import type {
  KnowledgeCatalogEntry,
  KnowledgeSurface,
  KnowledgeTopicContextOrigin,
  KnowledgeTopicDetailVM,
} from '@/services/knowledge/types';

function isKnowledgeTopicEnabledForSurface(surface: KnowledgeSurface): boolean {
  return surface === 'KNOWLEDGE_LIBRARY' || surface === 'STRATEGY_PREVIEW';
}

export function fetchKnowledgeTopicDetailVM(params?: {
  surface?: KnowledgeSurface;
  topicId?: string | null;
  nodes?: ReadonlyArray<KnowledgeCatalogEntry>;
  contextualOrigin?: KnowledgeTopicContextOrigin | null;
}): KnowledgeTopicDetailVM {
  const surface = params?.surface ?? 'KNOWLEDGE_LIBRARY';
  const nodes = params?.nodes ?? knowledgeCatalog;

  return {
    generatedAt: null,
    availability: isKnowledgeTopicEnabledForSurface(surface)
      ? createKnowledgeTopicDetailVM({
          topicId: params?.topicId,
          nodes,
          contextualOrigin: params?.contextualOrigin,
        })
      : {
          status: 'UNAVAILABLE',
          reason: 'NOT_ENABLED_FOR_SURFACE',
        },
  };
}
