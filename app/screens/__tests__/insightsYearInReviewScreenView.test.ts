import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createInsightsYearInReviewScreenViewData } from '@/app/screens/insightsYearInReviewScreenView';

describe('createInsightsYearInReviewScreenViewData', () => {
  it('reads the prepared year-in-review VM without deriving debrief items in app', () => {
    expect(
      createInsightsYearInReviewScreenViewData({
        generatedAt: '2026-04-15T00:00:00.000Z',
        availability: {
          status: 'AVAILABLE',
          period: 'LAST_YEAR',
          title: '2025 in review',
          summary:
            'Across 2025, interpreted history stayed centered more on price shifts than on a new interpreted pattern.',
          items: [
            {
              label: 'What stood out most',
              value: 'Price shifts appeared most often in interpreted history across the year.',
              emphasis: 'NEUTRAL',
            },
            {
              label: 'How the year developed',
              value:
                'The year stayed centered on price shifts rather than taking on a different interpreted pattern.',
              emphasis: 'NEUTRAL',
            },
            {
              label: 'Recurring symbol',
              value: 'BTC appeared most often in interpreted notes across the year.',
              emphasis: 'NEUTRAL',
            },
          ],
          limitations: [
            'Most of the year returned to one recurring interpreted pattern, so the debrief emphasizes continuity over change.',
          ],
        },
      }),
    ).toEqual({
      title: 'Year in Review',
      summary:
        'A calm annual debrief built from the last completed calendar year. It stays descriptive, contextual, and non-judgmental.',
      availabilityMessage: null,
      reviewTitle: '2025 in review',
      reviewSummary:
        'Across 2025, interpreted history stayed centered more on price shifts than on a new interpreted pattern.',
      items: [
        {
          emphasisText: 'Note',
          label: 'What stood out most',
          value: 'Price shifts appeared most often in interpreted history across the year.',
        },
        {
          emphasisText: 'Note',
          label: 'How the year developed',
          value:
            'The year stayed centered on price shifts rather than taking on a different interpreted pattern.',
        },
        {
          emphasisText: 'Note',
          label: 'Recurring symbol',
          value: 'BTC appeared most often in interpreted notes across the year.',
        },
      ],
      limitations: [
        'Most of the year returned to one recurring interpreted pattern, so the debrief emphasizes continuity over change.',
      ],
    });
  });

  it('shows a minimal honest unavailable state when year history is not ready yet', () => {
    expect(
      createInsightsYearInReviewScreenViewData({
        generatedAt: '2026-04-15T00:00:00.000Z',
        availability: {
          status: 'UNAVAILABLE',
          reason: 'INSUFFICIENT_HISTORY',
        },
      }),
    ).toEqual({
      title: 'Year in Review',
      summary:
        'A calm annual debrief built from the last completed calendar year. It stays descriptive, contextual, and non-judgmental.',
      availabilityMessage:
        'There is not enough interpreted history in the last completed calendar year yet to form a calm annual debrief.',
      reviewTitle: null,
      reviewSummary: null,
      items: [],
      limitations: [],
    });
  });

  it('keeps the year-in-review helper on the prepared VM only', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'screens', 'insightsYearInReviewScreenView.ts'),
      'utf8',
    );

    expect(source).toMatch(/vm\.availability\.status === 'UNAVAILABLE'/);
    expect(source).toMatch(/reviewTitle/);
    expect(source).toMatch(/reviewSummary/);
    expect(source).not.toMatch(
      /createYearInReviewVM|fetchYearInReviewVM|createPeriodSummaryVM|fetchPeriodSummaryVM|createInsightsHistoryVM|eventLedger|eventId|strategyId|signalsTriggered|providerId|metadata|score|unread|inbox|badge/,
    );
  });

  it('returns null when the prepared year-in-review VM is unavailable', () => {
    expect(createInsightsYearInReviewScreenViewData(null)).toBeNull();
  });
});
