import { createKnowledgeLibraryVM } from '@/services/knowledge/createKnowledgeLibraryVM';
import { knowledgeCatalog } from '@/services/knowledge/knowledgeCatalog';

describe('createKnowledgeLibraryVM', () => {
  it('groups the baseline catalog into deterministic sections and item order', () => {
    const reversedCatalog = [...knowledgeCatalog].reverse();

    expect(createKnowledgeLibraryVM({ nodes: reversedCatalog })).toEqual({
      status: 'AVAILABLE',
      sections: [
        {
          id: 'getting-started',
          title: 'Getting Started',
          items: [
            {
              topicId: 'how-pocketpilot-thinks',
              title: 'How PocketPilot thinks',
              summary:
                'PocketPilot turns interpreted market events into calmer surfaces instead of a raw market feed.',
              difficulty: 'BEGINNER',
              mediaType: 'ARTICLE',
            },
            {
              topicId: 'estimated-vs-confirmed-context',
              title: 'Estimated and confirmed context',
              summary:
                'Estimated inputs stay usable, but PocketPilot labels them clearly so the surface does not read as settled fact.',
              difficulty: 'BEGINNER',
              mediaType: 'ARTICLE',
            },
          ],
        },
        {
          id: 'strategy-basics',
          title: 'Strategy Basics',
          items: [
            {
              topicId: 'strategy-basics-momentum-and-dips',
              title: 'Strategy basics: momentum and dips',
              summary:
                'PocketPilot uses simple strategy language first, so a move can be read as building strength, a dip worth watching, or just movement that needs more context.',
              difficulty: 'BEGINNER',
              mediaType: 'ARTICLE',
            },
          ],
        },
        {
          id: 'event-interpretation',
          title: 'Event Interpretation',
          items: [
            {
              topicId: 'reading-market-events',
              title: 'Reading PocketPilot market events',
              summary:
                'A market event describes what changed in the interpreted picture and how settled that read looks right now.',
              difficulty: 'INTERMEDIATE',
              mediaType: 'DIAGRAM',
            },
          ],
        },
        {
          id: 'risk-and-discipline',
          title: 'Risk and Discipline',
          items: [
            {
              topicId: 'discipline-before-action',
              title: 'Discipline before action',
              summary:
                'PocketPilot keeps review, constraints, and confirmation ahead of speed so the product stays strategy-first.',
              difficulty: 'INTERMEDIATE',
              mediaType: 'CASE_STUDY',
            },
          ],
        },
      ],
    });
  });

  it('returns unavailable when no baseline nodes are present', () => {
    expect(createKnowledgeLibraryVM({ nodes: [] })).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_KNOWLEDGE_BASELINE',
    });
  });

  it('keeps the canonical KnowledgeNode contract explicit and minimal', () => {
    expect(Object.keys(knowledgeCatalog[0]).sort()).toEqual([
      'content',
      'difficulty',
      'eventTypeLinks',
      'mediaType',
      'signalLinks',
      'strategyLinks',
      'summary',
      'title',
      'topicId',
    ]);
  });

  it('returns display-safe library items without raw links, content bodies, or engagement metadata', () => {
    const result = createKnowledgeLibraryVM({ nodes: knowledgeCatalog });

    if (result.status !== 'AVAILABLE') {
      throw new Error('Expected knowledge library to be available.');
    }

    const serialized = JSON.stringify(result.sections);

    expect(serialized).not.toMatch(
      /content|strategyLinks|signalLinks|eventTypeLinks|providerId|metadata|progress|completion|streak|recommended/i,
    );
  });

  it('keeps the seed baseline copy calm and non-directive', () => {
    knowledgeCatalog.forEach((node) => {
      const copy = `${node.title} ${node.summary} ${node.content}`;

      expect(copy).not.toMatch(/!/);
      expect(copy).not.toMatch(/buy now|act now|don't miss|guaranteed|beat the market|urgent/i);
    });
  });
});
