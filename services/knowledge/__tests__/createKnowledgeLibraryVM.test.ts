import { createKnowledgeLibraryVM } from '@/services/knowledge/createKnowledgeLibraryVM';
import { knowledgeCatalog } from '@/services/knowledge/knowledgeCatalog';

describe('createKnowledgeLibraryVM', () => {
  it('groups the canonical catalog into deterministic shelf sections and item order', () => {
    const reversedCatalog = [...knowledgeCatalog].reverse();
    const result = createKnowledgeLibraryVM({ nodes: reversedCatalog });

    expect(result).toMatchObject({
      status: 'AVAILABLE',
      sections: [
        {
          id: 'orientation',
          title: 'Orientation',
        },
        {
          id: 'core-language',
          title: 'Core Language',
        },
        {
          id: 'strategies',
          title: 'Strategy Guides',
        },
        {
          id: 'action-risk',
          title: 'Action and Risk',
        },
      ],
    });

    if (result.status !== 'AVAILABLE') {
      throw new Error('Expected knowledge library to be available.');
    }

    expect(result.sections.map((section) => section.items.length)).toEqual([6, 10, 10, 5]);
    expect(result.sections[0].items.map((item) => item.topicId)).toEqual([
      'pp-choosing-profile-and-strategy',
      'pp-what-dashboard-is-for',
      'pp-what-pocketpilot-is',
      'pp-what-snapshot-is-for',
      'pp-what-trade-hub-is-for',
      'pp-why-pocketpilot-supports-action-without-pushing-action',
    ]);
    expect(result.sections[2].items.map((item) => item.topicId)).toEqual([
      'strategy-breakout-watcher',
      'strategy-buy-the-dip',
      'strategy-candle-signals',
      'strategy-confluence-alignment',
      'strategy-fibonacci-zones',
      'strategy-momentum-pulse',
      'strategy-range-trader',
      'strategy-reversion-bounce',
      'strategy-trend-follow',
      'pp-what-strategy-preview-strategy-navigator-is-for',
    ]);
  });

  it('returns unavailable when no baseline nodes are present', () => {
    expect(createKnowledgeLibraryVM({ nodes: [] })).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_KNOWLEDGE_BASELINE',
    });
  });

  it('keeps the canonical catalog entry contract explicit and service-owned', () => {
    expect(Object.keys(knowledgeCatalog[0]).sort()).toEqual([
      'content',
      'difficulty',
      'eventTypeLinks',
      'family',
      'mediaType',
      'priority',
      'relatedTopicIds',
      'sections',
      'signalLinks',
      'strategyLinks',
      'summary',
      'title',
      'topicId',
    ]);
  });

  it('returns display-safe library items without raw topic sections, raw content, or source metadata', () => {
    const result = createKnowledgeLibraryVM({ nodes: knowledgeCatalog });

    if (result.status !== 'AVAILABLE') {
      throw new Error('Expected knowledge library to be available.');
    }

    const serialized = JSON.stringify(result.sections);

    expect(serialized).not.toMatch(
      /"content":|"sections":|"relatedTopicIds":|canonicalPath|docs\/knowledge|providerId|metadata|completion|streak|recommended/i,
    );
  });

  it('keeps the canonical baseline copy calm and non-directive', () => {
    knowledgeCatalog.forEach((node) => {
      const copy = `${node.title} ${node.summary} ${node.content}`;

      expect(copy).not.toMatch(/!/);
      expect(copy).not.toMatch(/must read|required reading|complete to continue|unlock/i);
    });
  });
});
