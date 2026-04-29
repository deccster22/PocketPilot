import { fetchKnowledgeTopicDetailVM } from '@/services/knowledge/fetchKnowledgeTopicDetailVM';

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
});
