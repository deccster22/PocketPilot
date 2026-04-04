import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createInsightsReflectionScreenViewData } from '@/app/screens/insightsReflectionScreenView';

describe('createInsightsReflectionScreenViewData', () => {
  it('reads the prepared reflection comparison VM without assembling windows or summary items in app', () => {
    expect(
      createInsightsReflectionScreenViewData({
        generatedAt: '2026-04-03T00:00:00.000Z',
        availability: {
          status: 'AVAILABLE',
          leftWindow: {
            id: 'since-last-viewed',
            title: 'Since you last viewed Insights',
            startAt: '2026-03-23T00:00:00.000Z',
            endAt: '2026-03-23T00:00:00.000Z',
          },
          rightWindow: {
            id: 'earlier-context',
            title: 'Earlier context',
            startAt: '2026-03-21T00:00:00.000Z',
            endAt: '2026-03-22T00:00:00.000Z',
          },
          items: [
            {
              title: 'Interpreted focus shifted',
              summary:
                'The newer window leaned more toward provisional context, while the earlier window was led more by price shifts.',
              emphasis: 'SHIFT',
            },
            {
              title: 'The newer window stayed more provisional',
              summary:
                'Some supporting price context remained more provisional in the newer window, so that side stayed a little less settled.',
              emphasis: 'CONTEXT',
            },
          ],
          limitations: ['This comparison uses two nearby interpreted slices from recent history.'],
        },
      }),
    ).toEqual({
      title: 'Recent comparison',
      summary:
        'A brief comparison between two interpreted slices. It stays factual, selective, and non-judgmental.',
      availabilityMessage: null,
      windows: [
        {
          id: 'since-last-viewed',
          label: 'Newer window',
          title: 'Since you last viewed Insights',
          rangeText: '2026-03-23 00:00 UTC',
        },
        {
          id: 'earlier-context',
          label: 'Earlier window',
          title: 'Earlier context',
          rangeText: '2026-03-21 00:00 UTC to 2026-03-22 00:00 UTC',
        },
      ],
      items: [
        {
          emphasisText: 'Shift',
          title: 'Interpreted focus shifted',
          summary:
            'The newer window leaned more toward provisional context, while the earlier window was led more by price shifts.',
        },
        {
          emphasisText: 'Context',
          title: 'The newer window stayed more provisional',
          summary:
            'Some supporting price context remained more provisional in the newer window, so that side stayed a little less settled.',
        },
      ],
      limitations: ['This comparison uses two nearby interpreted slices from recent history.'],
    });
  });

  it('shows a minimal honest unavailable state when comparison history is not ready yet', () => {
    expect(
      createInsightsReflectionScreenViewData({
        generatedAt: '2026-04-03T00:00:00.000Z',
        availability: {
          status: 'UNAVAILABLE',
          reason: 'INSUFFICIENT_INTERPRETED_HISTORY',
        },
      }),
    ).toEqual({
      title: 'Recent comparison',
      summary:
        'A brief comparison between two interpreted slices. It stays factual, selective, and non-judgmental.',
      availabilityMessage: 'There is not enough interpreted history yet to form a calm comparison.',
      windows: [],
      items: [],
      limitations: [],
    });
  });

  it('keeps the reflection helper on the prepared comparison VM only', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'screens', 'insightsReflectionScreenView.ts'),
      'utf8',
    );

    expect(source).toMatch(/vm\.availability\.status === 'UNAVAILABLE'/);
    expect(source).toMatch(/leftWindow/);
    expect(source).toMatch(/rightWindow/);
    expect(source).not.toMatch(
      /createReflectionComparisonVM|fetchReflectionComparisonVM|createInsightsHistoryVM|eventLedger|eventId|strategyId|signalsTriggered|providerId|metadata|score|unread|inbox|badge/,
    );
  });

  it('returns null when the prepared reflection comparison VM is unavailable', () => {
    expect(createInsightsReflectionScreenViewData(null)).toBeNull();
  });
});
