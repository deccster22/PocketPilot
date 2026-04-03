import type {
  KnowledgeLibraryAvailability,
  KnowledgeLibraryItem,
  KnowledgeLibrarySection,
  KnowledgeNode,
} from '@/services/knowledge/types';

const SECTION_TITLES = {
  'getting-started': 'Getting Started',
  'strategy-basics': 'Strategy Basics',
  'event-interpretation': 'Event Interpretation',
  'risk-and-discipline': 'Risk and Discipline',
} as const;

type SectionId = keyof typeof SECTION_TITLES;

const SECTION_ORDER: readonly SectionId[] = [
  'getting-started',
  'strategy-basics',
  'event-interpretation',
  'risk-and-discipline',
];

const TOPIC_ORDER_BY_SECTION: Readonly<Record<SectionId, readonly string[]>> = {
  'getting-started': ['how-pocketpilot-thinks', 'estimated-vs-confirmed-context'],
  'strategy-basics': ['strategy-basics-momentum-and-dips'],
  'event-interpretation': ['reading-market-events'],
  'risk-and-discipline': ['discipline-before-action'],
};

function resolveSectionId(topicId: string): SectionId | null {
  switch (topicId) {
    case 'how-pocketpilot-thinks':
    case 'estimated-vs-confirmed-context':
      return 'getting-started';
    case 'strategy-basics-momentum-and-dips':
      return 'strategy-basics';
    case 'reading-market-events':
      return 'event-interpretation';
    case 'discipline-before-action':
      return 'risk-and-discipline';
    default:
      return null;
  }
}

function toKnowledgeLibraryItem(node: KnowledgeNode): KnowledgeLibraryItem {
  return {
    topicId: node.topicId,
    title: node.title,
    summary: node.summary,
    difficulty: node.difficulty,
    mediaType: node.mediaType,
  };
}

function buildSection(params: {
  sectionId: SectionId;
  nodesByTopicId: ReadonlyMap<string, KnowledgeNode>;
}): KnowledgeLibrarySection | null {
  const items = TOPIC_ORDER_BY_SECTION[params.sectionId]
    .map((topicId) => params.nodesByTopicId.get(topicId))
    .filter((node): node is KnowledgeNode => Boolean(node))
    .map(toKnowledgeLibraryItem);

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
  nodes: ReadonlyArray<KnowledgeNode>;
}): KnowledgeLibraryAvailability {
  const nodesByTopicId = new Map<string, KnowledgeNode>();

  params.nodes.forEach((node) => {
    const sectionId = resolveSectionId(node.topicId);

    if (!sectionId || nodesByTopicId.has(node.topicId)) {
      return;
    }

    nodesByTopicId.set(node.topicId, node);
  });

  const sections = SECTION_ORDER.map((sectionId) =>
    buildSection({
      sectionId,
      nodesByTopicId,
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
