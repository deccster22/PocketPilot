import { createKnowledgeLibraryVM } from '@/services/knowledge/createKnowledgeLibraryVM';
import { knowledgeCatalog } from '@/services/knowledge/knowledgeCatalog';
import type {
  KnowledgeLibraryVM,
  KnowledgeNode,
  KnowledgeSurface,
} from '@/services/knowledge/types';

function isKnowledgeEnabledForSurface(surface: KnowledgeSurface): boolean {
  return surface === 'KNOWLEDGE_LIBRARY';
}

export function fetchKnowledgeLibraryVM(params?: {
  surface?: KnowledgeSurface;
  nodes?: ReadonlyArray<KnowledgeNode>;
}): KnowledgeLibraryVM {
  const surface = params?.surface ?? 'KNOWLEDGE_LIBRARY';
  const nodes = params?.nodes ?? knowledgeCatalog;

  return {
    title: 'Knowledge Library',
    summary:
      'A quiet reference shelf for how PocketPilot frames strategy, market events, and calm discipline.',
    availability: isKnowledgeEnabledForSurface(surface)
      ? createKnowledgeLibraryVM({
          nodes,
        })
      : {
          status: 'UNAVAILABLE',
          reason: 'NOT_ENABLED_FOR_SURFACE',
        },
  };
}
