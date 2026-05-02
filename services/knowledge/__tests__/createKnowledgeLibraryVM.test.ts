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

    expect(result.sections.map((section) => section.items.length)).toEqual([6, 15, 10, 19]);
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
    expect(result.sections[1].items.map((item) => item.topicId)).toEqual(
      expect.arrayContaining([
        'glossary-stop-loss-price',
        'glossary-target-price',
        'glossary-risk-amount',
        'glossary-risk-percent',
        'glossary-guardrails',
      ]),
    );
    expect(result.sections[3].items.map((item) => item.topicId)).toEqual(
      expect.arrayContaining([
        'trade-hub-entry-price',
        'trade-hub-stop-loss-price',
        'trade-hub-target-price',
        'trade-hub-prepared-planning-levels',
        'trade-hub-risk-amount',
        'trade-hub-risk-percent',
        'trade-hub-position-size',
        'trade-hub-reward-risk',
        'trade-hub-manual-override',
        'trade-hub-guardrails',
        'trade-hub-risk-limit-per-trade',
        'trade-hub-daily-loss-threshold',
        'trade-hub-cooldown-after-loss',
        'trade-hub-confirmation-shell-and-non-dispatch-boundary',
      ]),
    );
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

  it('keeps P7-K19 first-wave evidence topics hidden from the visible library shelf sections', () => {
    const firstWaveEvidenceTopicIds = [
      'evidence-trend-follow-bitcoin-above-the-old-high-worked',
      'evidence-trend-follow-from-liquidity-tailwind-to-deleveraging-grind-caution',
      'evidence-breakout-watcher-bitcoin-above-the-old-high-worked',
      'evidence-breakout-watcher-bitcoin-august-2020-failed-escape-caution',
      'evidence-buy-the-dip-bitcoin-above-the-old-high-worked',
      'evidence-buy-the-dip-bitcoin-june-to-august-2022-caution',
    ] as const;

    const result = createKnowledgeLibraryVM({ nodes: knowledgeCatalog });

    if (result.status !== 'AVAILABLE') {
      throw new Error('Expected knowledge library to be available.');
    }

    const visibleTopicIds = new Set(
      result.sections.flatMap((section) => section.items.map((item) => item.topicId)),
    );

    firstWaveEvidenceTopicIds.forEach((topicId) => {
      expect(visibleTopicIds.has(topicId)).toBe(false);
    });
  });

  it('keeps P7-K21 first-wave concept topics hidden from visible library shelf sections while priority is NEXT', () => {
    const firstWaveConceptTopicIds = [
      'concept-trend',
      'concept-breakout',
      'concept-support',
      'concept-resistance',
      'concept-reversion',
    ] as const;

    const result = createKnowledgeLibraryVM({ nodes: knowledgeCatalog });

    if (result.status !== 'AVAILABLE') {
      throw new Error('Expected knowledge library to be available.');
    }

    const visibleTopicIds = new Set(
      result.sections.flatMap((section) => section.items.map((item) => item.topicId)),
    );

    firstWaveConceptTopicIds.forEach((topicId) => {
      expect(visibleTopicIds.has(topicId)).toBe(false);
    });
  });
});
