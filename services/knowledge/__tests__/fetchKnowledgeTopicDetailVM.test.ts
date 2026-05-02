import { fetchKnowledgeTopicDetailVM } from '@/services/knowledge/fetchKnowledgeTopicDetailVM';
import { knowledgeCatalog } from '@/services/knowledge/knowledgeCatalog';

describe('fetchKnowledgeTopicDetailVM', () => {
  it('returns one canonical topic detail VM for the Knowledge Library surface', () => {
    const result = fetchKnowledgeTopicDetailVM({
      surface: 'KNOWLEDGE_LIBRARY',
      topicId: 'pp-what-dashboard-is-for',
      contextualOrigin: {
        originSurface: 'DASHBOARD',
        linkageReason: 'SURFACE_CONTEXT',
      },
    });

    expect(result).toMatchObject({
      generatedAt: null,
      availability: {
        status: 'AVAILABLE',
        topic: {
          topicId: 'pp-what-dashboard-is-for',
          title: 'What Dashboard Is For',
          contextFraming: {
            status: 'AVAILABLE',
            framing: {
              originSurface: 'DASHBOARD',
              linkageReasons: ['SURFACE_CONTEXT'],
            },
          },
        },
      },
    });
  });

  it('returns unavailable instead of forcing topic detail onto other surfaces', () => {
    expect(
      fetchKnowledgeTopicDetailVM({
        surface: 'DASHBOARD',
        topicId: 'pp-estimated-vs-confirmed-context',
        contextualOrigin: {
          originSurface: 'DASHBOARD',
          linkageReason: 'EVENT',
        },
      }),
    ).toEqual({
      generatedAt: null,
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NOT_ENABLED_FOR_SURFACE',
      },
    });
  });

  it('allows the thin Strategy Preview proof path to open one prepared topic detail', () => {
    expect(
      fetchKnowledgeTopicDetailVM({
        surface: 'STRATEGY_PREVIEW',
        topicId: 'strategy-buy-the-dip',
        contextualOrigin: null,
      }),
    ).toMatchObject({
      generatedAt: null,
      availability: {
        status: 'AVAILABLE',
        topic: {
          topicId: 'strategy-buy-the-dip',
          title: 'Buy the Dip',
        },
      },
    });
  });

  it('returns honest unavailable states for missing selection and missing topic ids', () => {
    expect(
      fetchKnowledgeTopicDetailVM({
        surface: 'KNOWLEDGE_LIBRARY',
      }),
    ).toEqual({
      generatedAt: null,
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NO_TOPIC_SELECTED',
      },
    });

    expect(
      fetchKnowledgeTopicDetailVM({
        surface: 'KNOWLEDGE_LIBRARY',
        topicId: 'missing-topic',
      }),
    ).toEqual({
      generatedAt: null,
      availability: {
        status: 'UNAVAILABLE',
        reason: 'TOPIC_NOT_FOUND',
      },
    });
  });

  it('remains deterministic for identical inputs', () => {
    const params = {
      surface: 'KNOWLEDGE_LIBRARY' as const,
      topicId: 'strategy-buy-the-dip',
    };

    expect(fetchKnowledgeTopicDetailVM(params)).toEqual(fetchKnowledgeTopicDetailVM(params));
  });

  it('resolves P7-K12 first-rollout help topic IDs without using missing-topic fallback', () => {
    const firstRolloutTopicIds = [
      'glossary-stop-loss-price',
      'glossary-target-price',
      'glossary-risk-amount',
      'glossary-risk-percent',
      'glossary-guardrails',
      'trade-hub-stop-loss-price',
      'trade-hub-target-price',
      'trade-hub-risk-amount',
      'trade-hub-risk-percent',
      'trade-hub-guardrails',
    ] as const;

    firstRolloutTopicIds.forEach((topicId) => {
      const result = fetchKnowledgeTopicDetailVM({
        surface: 'KNOWLEDGE_LIBRARY',
        topicId,
      });

      expect(result.availability.status).toBe('AVAILABLE');

      if (result.availability.status !== 'AVAILABLE') {
        throw new Error(`Expected ${topicId} to resolve, received ${result.availability.reason}.`);
      }

      expect(result.availability.topic.topicId).toBe(topicId);
    });
  });

  it('resolves all six P7-K19 first-wave evidence topic IDs as available hidden follow-through routes', () => {
    const firstWaveEvidenceTopicIds = [
      'evidence-trend-follow-bitcoin-above-the-old-high-worked',
      'evidence-trend-follow-from-liquidity-tailwind-to-deleveraging-grind-caution',
      'evidence-breakout-watcher-bitcoin-above-the-old-high-worked',
      'evidence-breakout-watcher-bitcoin-august-2020-failed-escape-caution',
      'evidence-buy-the-dip-bitcoin-above-the-old-high-worked',
      'evidence-buy-the-dip-bitcoin-june-to-august-2022-caution',
    ] as const;

    firstWaveEvidenceTopicIds.forEach((topicId) => {
      const result = fetchKnowledgeTopicDetailVM({
        surface: 'KNOWLEDGE_LIBRARY',
        topicId,
      });

      expect(result.availability.status).toBe('AVAILABLE');

      if (result.availability.status !== 'AVAILABLE') {
        throw new Error(`Expected ${topicId} to resolve, received ${result.availability.reason}.`);
      }

      expect(result.availability.topic.topicId).toBe(topicId);
    });
  });

  it('resolves all five P7-K21 first-wave concept topic IDs as available hidden follow-through routes', () => {
    const firstWaveConceptTopicIds = [
      'concept-trend',
      'concept-breakout',
      'concept-support',
      'concept-resistance',
      'concept-reversion',
    ] as const;

    firstWaveConceptTopicIds.forEach((topicId) => {
      const result = fetchKnowledgeTopicDetailVM({
        surface: 'KNOWLEDGE_LIBRARY',
        topicId,
      });

      expect(result.availability.status).toBe('AVAILABLE');

      if (result.availability.status !== 'AVAILABLE') {
        throw new Error(`Expected ${topicId} to resolve, received ${result.availability.reason}.`);
      }

      expect(result.availability.topic.topicId).toBe(topicId);
    });
  });

  it('routes first-wave evidence topics to only the intended first-wave concept links', () => {
    const expectedConceptLinksByEvidence = {
      'evidence-trend-follow-bitcoin-above-the-old-high-worked': [
        'concept-trend',
        'concept-breakout',
        'concept-support',
      ],
      'evidence-trend-follow-from-liquidity-tailwind-to-deleveraging-grind-caution': [
        'concept-trend',
      ],
      'evidence-breakout-watcher-bitcoin-above-the-old-high-worked': [
        'concept-breakout',
        'concept-resistance',
        'concept-support',
      ],
      'evidence-breakout-watcher-bitcoin-august-2020-failed-escape-caution': [
        'concept-breakout',
        'concept-resistance',
      ],
      'evidence-buy-the-dip-bitcoin-above-the-old-high-worked': [
        'concept-support',
        'concept-trend',
      ],
      'evidence-buy-the-dip-bitcoin-june-to-august-2022-caution': [
        'concept-reversion',
        'concept-trend',
        'concept-support',
      ],
    } as const;

    (
      Object.entries(expectedConceptLinksByEvidence) as ReadonlyArray<
        [string, ReadonlyArray<string>]
      >
    ).forEach(([evidenceTopicId, expectedConceptIds]) => {
      const result = fetchKnowledgeTopicDetailVM({
        surface: 'KNOWLEDGE_LIBRARY',
        topicId: evidenceTopicId,
      });

      expect(result.availability.status).toBe('AVAILABLE');

      if (result.availability.status !== 'AVAILABLE') {
        throw new Error(`Expected ${evidenceTopicId} to resolve, received ${result.availability.reason}.`);
      }

      expect(result.availability.topic.relatedTopicIds).toEqual(expectedConceptIds);
      expect(result.availability.topic.relatedTopicIds).not.toEqual(
        expect.arrayContaining(['concept-momentum', 'concept-confluence', 'concept-volatility']),
      );
    });
  });

  it('exposes exactly two first-wave evidence links from each first-wave source strategy topic', () => {
    const expectedByStrategy = {
      'strategy-trend-follow': [
        'evidence-trend-follow-bitcoin-above-the-old-high-worked',
        'evidence-trend-follow-from-liquidity-tailwind-to-deleveraging-grind-caution',
      ],
      'strategy-breakout-watcher': [
        'evidence-breakout-watcher-bitcoin-above-the-old-high-worked',
        'evidence-breakout-watcher-bitcoin-august-2020-failed-escape-caution',
      ],
      'strategy-buy-the-dip': [
        'evidence-buy-the-dip-bitcoin-above-the-old-high-worked',
        'evidence-buy-the-dip-bitcoin-june-to-august-2022-caution',
      ],
    } as const;

    (Object.entries(expectedByStrategy) as ReadonlyArray<[string, ReadonlyArray<string>]>).forEach(
      ([strategyTopicId, expectedEvidenceTopicIds]) => {
        const result = fetchKnowledgeTopicDetailVM({
          surface: 'KNOWLEDGE_LIBRARY',
          topicId: strategyTopicId,
        });

        expect(result.availability.status).toBe('AVAILABLE');

        if (result.availability.status !== 'AVAILABLE') {
          throw new Error(
            `Expected ${strategyTopicId} to resolve, received ${result.availability.reason}.`,
          );
        }

        const evidenceRelatedTopicIds = result.availability.topic.relatedTopicIds.filter((topicId) =>
          topicId.startsWith('evidence-'),
        );

        expect(evidenceRelatedTopicIds).toEqual(expectedEvidenceTopicIds);

        const evidenceRelatedTitles = result.availability.topic.relatedTopics
          .filter((topic) => topic.topicId.startsWith('evidence-'))
          .map((topic) => topic.title.toLowerCase());

        evidenceRelatedTitles.forEach((title) => {
          expect(title).not.toMatch(
            /worked|winning trade|good trade|should enter|should exit|buy signal|sell signal|safe trade|profit/i,
          );
        });
      },
    );
  });

  it('keeps non-first-wave market-example and future-slug topics unavailable in runtime detail', () => {
    const nonRoutableTopicIds = [
      'market-examples-bitcoin-above-the-old-high',
      'market-examples-bitcoin-august-2020-failed-escape-above-12000',
      'market-examples-bitcoin-june-to-august-2022-relief-rally-inside-a-broken-structure',
      'market-examples-bitcoin-19k-20k-bottoming-cluster-and-the-post-ftx-reclaim',
      'market-examples-from-liquidity-tailwind-to-deleveraging-grind',
      'market-examples-terra-from-peg-wobble-to-exit-spiral',
      'range-oscillation',
      'range-break',
      'fibonacci-reaction',
      'fibonacci-failure',
      'candle-signal-valid',
      'candle-signal-noise',
      'concept-momentum',
      'concept-confluence',
      'concept-volatility',
      'concept-fibonacci-levels',
      'concept-candlestick-patterns',
    ] as const;

    nonRoutableTopicIds.forEach((topicId) => {
      const result = fetchKnowledgeTopicDetailVM({
        surface: 'KNOWLEDGE_LIBRARY',
        topicId,
      });

      expect(result).toEqual({
        generatedAt: null,
        availability: {
          status: 'UNAVAILABLE',
          reason: 'TOPIC_NOT_FOUND',
        },
      });
    });
  });

  it('does not add first-wave evidence related links onto Trade Hub topics in this phase', () => {
    const tradeHubTopicIds = knowledgeCatalog
      .map((entry) => entry.topicId)
      .filter((topicId) => topicId.startsWith('trade-hub-'));

    tradeHubTopicIds.forEach((topicId) => {
      const result = fetchKnowledgeTopicDetailVM({
        surface: 'KNOWLEDGE_LIBRARY',
        topicId,
      });

      expect(result.availability.status).toBe('AVAILABLE');

      if (result.availability.status !== 'AVAILABLE') {
        throw new Error(`Expected ${topicId} to resolve, received ${result.availability.reason}.`);
      }

      expect(result.availability.topic.relatedTopicIds.some((related) => related.startsWith('evidence-'))).toBe(false);
    });
  });
});
