import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createInsightsSummaryScreenViewData } from '@/app/screens/insightsSummaryScreenView';

describe('createInsightsSummaryScreenViewData', () => {
  it('reads the prepared period summary VM without deriving summary items in app', () => {
    expect(
      createInsightsSummaryScreenViewData(
        {
          generatedAt: '2026-04-15T00:00:00.000Z',
          availability: {
            status: 'AVAILABLE',
            period: 'LAST_MONTH',
            title: 'Last month',
            summary:
              'Last month stayed centered more on price shifts than on a new interpreted pattern.',
            items: [
              {
                label: 'What stayed most visible',
                value: "Price shifts appeared most often in this period's interpreted history.",
                emphasis: 'NEUTRAL',
              },
              {
                label: 'How the period developed',
                value:
                  'The period stayed centered on price shifts rather than taking on a different interpreted pattern.',
                emphasis: 'NEUTRAL',
              },
              {
                label: 'Recurring symbol',
                value: 'BTC appeared most often in interpreted notes across this period.',
                emphasis: 'NEUTRAL',
              },
            ],
            limitations: [
              'Most of this period returned to one recurring interpreted pattern, so the summary emphasizes continuity over change.',
            ],
          },
        },
        {
          selectedPeriod: 'LAST_MONTH',
        },
      ),
    ).toEqual({
      title: 'Period summaries',
      summary:
        'A calm monthly or quarterly readback built from interpreted history. It stays descriptive, selective, and non-judgmental.',
      availabilityMessage: null,
      periodOptions: [
        {
          id: 'LAST_MONTH',
          label: 'Last month',
          isSelected: true,
        },
        {
          id: 'LAST_QUARTER',
          label: 'Last quarter',
          isSelected: false,
        },
      ],
      periodTitle: 'Last month',
      periodSummary:
        'Last month stayed centered more on price shifts than on a new interpreted pattern.',
      items: [
        {
          emphasisText: 'Note',
          label: 'What stayed most visible',
          value: "Price shifts appeared most often in this period's interpreted history.",
        },
        {
          emphasisText: 'Note',
          label: 'How the period developed',
          value:
            'The period stayed centered on price shifts rather than taking on a different interpreted pattern.',
        },
        {
          emphasisText: 'Note',
          label: 'Recurring symbol',
          value: 'BTC appeared most often in interpreted notes across this period.',
        },
      ],
      limitations: [
        'Most of this period returned to one recurring interpreted pattern, so the summary emphasizes continuity over change.',
      ],
    });
  });

  it('shows a minimal honest unavailable state when period history is not ready yet', () => {
    expect(
      createInsightsSummaryScreenViewData(
        {
          generatedAt: '2026-04-15T00:00:00.000Z',
          availability: {
            status: 'UNAVAILABLE',
            reason: 'INSUFFICIENT_HISTORY',
          },
        },
        {
          selectedPeriod: 'LAST_QUARTER',
        },
      ),
    ).toEqual({
      title: 'Period summaries',
      summary:
        'A calm monthly or quarterly readback built from interpreted history. It stays descriptive, selective, and non-judgmental.',
      availabilityMessage:
        'There is not enough interpreted history in this period yet to form a calm summary.',
      periodOptions: [
        {
          id: 'LAST_MONTH',
          label: 'Last month',
          isSelected: false,
        },
        {
          id: 'LAST_QUARTER',
          label: 'Last quarter',
          isSelected: true,
        },
      ],
      periodTitle: null,
      periodSummary: null,
      items: [],
      limitations: [],
    });
  });

  it('keeps the summary helper on the prepared period summary VM only', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'screens', 'insightsSummaryScreenView.ts'),
      'utf8',
    );

    expect(source).toMatch(/vm\.availability\.status === 'UNAVAILABLE'/);
    expect(source).toMatch(/selectedPeriod/);
    expect(source).toMatch(/periodOptions/);
    expect(source).not.toMatch(
      /createPeriodSummaryVM|fetchPeriodSummaryVM|createInsightsHistoryVM|eventLedger|eventId|strategyId|signalsTriggered|providerId|metadata|score|unread|inbox|badge/,
    );
  });

  it('returns null when the prepared period summary VM is unavailable', () => {
    expect(
      createInsightsSummaryScreenViewData(null, {
        selectedPeriod: 'LAST_MONTH',
      }),
    ).toBeNull();
  });
});
