import { fetchKnowledgeTopicDetailVM } from '@/services/knowledge/fetchKnowledgeTopicDetailVM';

describe('fetchKnowledgeTopicDetailVM', () => {
  it('returns one canonical topic detail VM for the Knowledge Library surface', () => {
    const result = fetchKnowledgeTopicDetailVM({
      surface: 'KNOWLEDGE_LIBRARY',
      topicId: 'pp-estimated-vs-confirmed-context',
    });

    expect(result).toMatchObject({
      generatedAt: null,
      availability: {
        status: 'AVAILABLE',
        topic: {
          topicId: 'pp-estimated-vs-confirmed-context',
          title: 'Estimated vs Confirmed Context',
        },
      },
    });
  });

  it('returns unavailable instead of forcing topic detail onto other surfaces', () => {
    expect(
      fetchKnowledgeTopicDetailVM({
        surface: 'DASHBOARD',
        topicId: 'pp-estimated-vs-confirmed-context',
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
});
