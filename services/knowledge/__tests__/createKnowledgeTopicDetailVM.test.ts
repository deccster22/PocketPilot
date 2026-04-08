import { createKnowledgeTopicDetailVM } from '@/services/knowledge/createKnowledgeTopicDetailVM';
import { knowledgeCatalog } from '@/services/knowledge/knowledgeCatalog';

describe('createKnowledgeTopicDetailVM', () => {
  it('returns one prepared topic detail contract for a selected topic', () => {
    const result = createKnowledgeTopicDetailVM({
      topicId: 'pp-estimated-vs-confirmed-context',
      nodes: knowledgeCatalog,
    });

    expect(result).toMatchObject({
      status: 'AVAILABLE',
      topic: {
        topicId: 'pp-estimated-vs-confirmed-context',
        title: 'Estimated vs Confirmed Context',
        summary:
          'PocketPilot distinguishes between estimated and confirmed context so it can stay honest about how solid a current read is. Estimated does not mean broken. Confirmed does not mean guaranteed.',
        difficulty: 'BEGINNER',
        sections: [
          {
            heading: 'Overview',
            body: [
              'PocketPilot distinguishes between estimated and confirmed context so it can stay honest about how solid a current read is. Estimated does not mean broken. Confirmed does not mean guaranteed.',
            ],
          },
          {
            heading: 'Deeper context',
            body: [
              'Markets are rarely clean enough for total certainty. PocketPilot is designed to communicate that honestly.',
              'Estimated context means the product has a useful read, but it is still provisional, incomplete, or not strong enough to present as settled.',
              'Confirmed context means the read looks more established or better supported by the evidence currently available.',
              'The important rule is that the app must never upgrade weak context into stronger-sounding certainty. This is a trust issue as much as a wording issue.',
            ],
          },
          {
            heading: 'Why the distinction matters',
            body: [
              'it prevents false confidence',
              'it stops weak reads from sounding like advice',
              'it helps users judge how firm the current interpretation is',
            ],
          },
          {
            heading: 'Common misunderstandings',
            body: [
              'estimated does not mean useless',
              'confirmed does not mean the future is locked',
            ],
          },
          {
            heading: 'Key terms',
            body: ['estimated', 'confirmed', 'provisional', 'confidence must be honest'],
          },
        ],
        relatedTopicIds: [
          'pp-what-strategy-status-means',
          'pp-what-a-marketevent-is',
          'pp-why-pocketpilot-avoids-urgency-language',
        ],
        relatedTopics: [
          {
            topicId: 'pp-what-strategy-status-means',
            title: 'What Strategy Status Means',
            difficulty: 'BEGINNER',
            mediaType: 'ARTICLE',
          },
          {
            topicId: 'pp-what-a-marketevent-is',
            title: 'What a MarketEvent Is',
            difficulty: 'BEGINNER',
            mediaType: 'ARTICLE',
          },
          {
            topicId: 'pp-why-pocketpilot-avoids-urgency-language',
            title: 'Why PocketPilot Avoids Urgency Language',
            difficulty: 'BEGINNER',
            mediaType: 'ARTICLE',
          },
        ],
      },
    });
  });

  it('returns unavailable when no topic is selected', () => {
    expect(
      createKnowledgeTopicDetailVM({
        topicId: null,
        nodes: knowledgeCatalog,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_TOPIC_SELECTED',
    });
  });

  it('returns unavailable when the selected topic does not exist', () => {
    expect(
      createKnowledgeTopicDetailVM({
        topicId: 'missing-topic',
        nodes: knowledgeCatalog,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'TOPIC_NOT_FOUND',
    });
  });

  it('keeps topic detail prepared for rendering without leaking raw docs paths or markdown structure', () => {
    const result = createKnowledgeTopicDetailVM({
      topicId: 'strategy-buy-the-dip',
      nodes: knowledgeCatalog,
    });

    if (result.status !== 'AVAILABLE') {
      throw new Error('Expected topic detail to be available.');
    }

    const serialized = JSON.stringify(result.topic);

    expect(serialized).not.toMatch(/canonicalPath|docs\/knowledge|README\.md|###|##|---/);
  });

  it('remains deterministic for identical inputs', () => {
    const params = {
      topicId: 'strategy-buy-the-dip',
      nodes: knowledgeCatalog,
    };

    expect(createKnowledgeTopicDetailVM(params)).toEqual(createKnowledgeTopicDetailVM(params));
  });
});
