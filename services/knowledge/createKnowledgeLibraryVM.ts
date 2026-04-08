import type {
  KnowledgeCatalogEntry,
  KnowledgeLibraryAvailability,
  KnowledgeLibraryItem,
  KnowledgeLibrarySection,
} from '@/services/knowledge/types';

const SECTION_TITLES = {
  orientation: 'Orientation',
  'core-language': 'Core Language',
  strategies: 'Strategy Guides',
  'action-risk': 'Action and Risk',
  reflection: 'Reflection',
  'knowledge-system': 'Knowledge System',
} as const;

type SectionId = keyof typeof SECTION_TITLES;

const SECTION_ORDER: readonly SectionId[] = [
  'orientation',
  'core-language',
  'strategies',
  'action-risk',
  'reflection',
  'knowledge-system',
];

function toKnowledgeLibraryItem(node: KnowledgeCatalogEntry): KnowledgeLibraryItem {
  return {
    topicId: node.topicId,
    title: node.title,
    summary: node.summary,
    difficulty: node.difficulty,
    mediaType: node.mediaType,
  };
}

function compareNodes(left: KnowledgeCatalogEntry, right: KnowledgeCatalogEntry): number {
  return left.title.localeCompare(right.title);
}

function buildSection(params: {
  sectionId: SectionId;
  nodesBySectionId: ReadonlyMap<SectionId, ReadonlyArray<KnowledgeCatalogEntry>>;
}): KnowledgeLibrarySection | null {
  const items = (params.nodesBySectionId.get(params.sectionId) ?? []).map(toKnowledgeLibraryItem);

  if (items.length === 0) {
    return null;
  }

  return {
    id: params.sectionId,
    title: SECTION_TITLES[params.sectionId],
    items,
  };
}

export function createKnowledgeLibraryVM(params: {
  nodes: ReadonlyArray<KnowledgeCatalogEntry>;
}): KnowledgeLibraryAvailability {
  const nodesBySectionId = new Map<SectionId, ReadonlyArray<KnowledgeCatalogEntry>>();

  SECTION_ORDER.forEach((sectionId) => {
    nodesBySectionId.set(
      sectionId,
      params.nodes
        .filter(
          (node): node is KnowledgeCatalogEntry =>
            node.family === sectionId && node.priority === 'NOW',
        )
        .sort(compareNodes),
    );
  });

  const sections = SECTION_ORDER.map((sectionId) =>
    buildSection({
      sectionId,
      nodesBySectionId,
    }),
  ).filter((section): section is KnowledgeLibrarySection => Boolean(section));

  if (sections.length === 0) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_KNOWLEDGE_BASELINE',
    };
  }

  return {
    status: 'AVAILABLE',
    sections,
  };
}
