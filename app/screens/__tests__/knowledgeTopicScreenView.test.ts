import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createKnowledgeTopicScreenViewData } from '@/app/screens/knowledgeTopicScreenView';

describe('createKnowledgeTopicScreenViewData', () => {
  it('reads the prepared topic detail VM without assembling topic content in app', () => {
    expect(
      createKnowledgeTopicScreenViewData({
        generatedAt: null,
        availability: {
          status: 'AVAILABLE',
          topic: {
            topicId: 'pp-estimated-vs-confirmed-context',
            title: 'Estimated vs Confirmed Context',
            summary:
              'PocketPilot distinguishes between estimated and confirmed context so it can stay honest about how solid a current read is.',
            difficulty: 'BEGINNER',
            sections: [
              {
                heading: 'Overview',
                body: [
                  'PocketPilot distinguishes between estimated and confirmed context so it can stay honest about how solid a current read is.',
                ],
              },
              {
                heading: 'Why the distinction matters',
                body: [
                  'it prevents false confidence',
                  'it helps users judge how firm the current interpretation is',
                ],
              },
            ],
            relatedTopicIds: ['pp-what-strategy-status-means'],
            relatedTopics: [
              {
                topicId: 'pp-what-strategy-status-means',
                title: 'What Strategy Status Means',
                summary:
                  'Strategy Status tells you how your selected strategy reads the current market.',
                difficulty: 'BEGINNER',
                mediaType: 'ARTICLE',
              },
            ],
          },
        },
      }),
    ).toEqual({
      title: 'Estimated vs Confirmed Context',
      summary:
        'PocketPilot distinguishes between estimated and confirmed context so it can stay honest about how solid a current read is.',
      difficultyText: 'Beginner',
      availabilityMessage: null,
      sections: [
        {
          heading: 'Overview',
          body: [
            'PocketPilot distinguishes between estimated and confirmed context so it can stay honest about how solid a current read is.',
          ],
        },
        {
          heading: 'Why the distinction matters',
          body: [
            'it prevents false confidence',
            'it helps users judge how firm the current interpretation is',
          ],
        },
      ],
      relatedTopics: [
        {
          topicId: 'pp-what-strategy-status-means',
          title: 'What Strategy Status Means',
          summary: 'Strategy Status tells you how your selected strategy reads the current market.',
          metaText: 'Beginner / Article',
        },
      ],
    });
  });

  it('shows a minimal honest unavailable state when topic detail is unavailable', () => {
    expect(
      createKnowledgeTopicScreenViewData({
        generatedAt: null,
        availability: {
          status: 'UNAVAILABLE',
          reason: 'TOPIC_NOT_FOUND',
        },
      }),
    ).toEqual({
      title: 'Knowledge topic',
      summary:
        'A calm topic view for one PocketPilot concept or strategy. It stays optional and ready when you want more depth.',
      difficultyText: null,
      availabilityMessage: 'That topic is not available in the current knowledge shelf.',
      sections: [],
      relatedTopics: [],
    });
  });

  it('keeps the screen helper on the prepared topic detail VM only', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'screens', 'knowledgeTopicScreenView.ts'),
      'utf8',
    );

    expect(source).toMatch(/vm\.availability\.status === 'UNAVAILABLE'/);
    expect(source).not.toMatch(
      /knowledgeCatalog|KnowledgeCatalogEntry|createKnowledgeTopicDetailVM|fetchKnowledgeTopicDetailVM|docs\/knowledge|canonicalPath|markdown|README\.md/,
    );
  });

  it('returns null when the prepared topic detail VM is unavailable', () => {
    expect(createKnowledgeTopicScreenViewData(null)).toBeNull();
  });
});
