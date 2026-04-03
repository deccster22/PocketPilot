import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createKnowledgeLibraryScreenViewData } from '@/app/screens/knowledgeLibraryScreenView';

describe('createKnowledgeLibraryScreenViewData', () => {
  it('reads the prepared Knowledge Library VM without assembling raw knowledge nodes in app', () => {
    const view = createKnowledgeLibraryScreenViewData({
      title: 'Knowledge Library',
      summary:
        'A quiet reference shelf for how PocketPilot frames strategy, market events, and calm discipline.',
      availability: {
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
            ],
          },
        ],
      },
    });

    expect(view).toEqual({
      title: 'Knowledge Library',
      summary:
        'A quiet reference shelf for how PocketPilot frames strategy, market events, and calm discipline.',
      availabilityMessage: null,
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
              difficultyText: 'Beginner',
              mediaTypeText: 'Article',
            },
          ],
        },
      ],
    });
  });

  it('shows a minimal honest unavailable state when the knowledge baseline is unavailable', () => {
    expect(
      createKnowledgeLibraryScreenViewData({
        title: 'Knowledge Library',
        summary:
          'A quiet reference shelf for how PocketPilot frames strategy, market events, and calm discipline.',
        availability: {
          status: 'UNAVAILABLE',
          reason: 'NO_KNOWLEDGE_BASELINE',
        },
      }),
    ).toEqual({
      title: 'Knowledge Library',
      summary:
        'A quiet reference shelf for how PocketPilot frames strategy, market events, and calm discipline.',
      availabilityMessage: 'Knowledge is not available yet.',
      sections: [],
    });
  });

  it('keeps the screen helper on the prepared library VM only', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'screens', 'knowledgeLibraryScreenView.ts'),
      'utf8',
    );

    expect(source).toMatch(/vm\.availability\.status === 'UNAVAILABLE'/);
    expect(source).not.toMatch(
      /knowledgeCatalog|KnowledgeNode|createKnowledgeLibraryVM|signalLinks|eventTypeLinks|content|providerId|metadata/,
    );
  });

  it('returns null when the prepared Knowledge Library VM is unavailable', () => {
    expect(createKnowledgeLibraryScreenViewData(null)).toBeNull();
  });
});
