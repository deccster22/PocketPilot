import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createInsightsScreenViewData } from '@/app/screens/insightsScreenView';

describe('createInsightsScreenViewData', () => {
  it('reads the prepared Insights history VM without assembling raw event rows in app', () => {
    expect(
      createInsightsScreenViewData({
        generatedAt: '2026-04-03T00:00:00.000Z',
        availability: {
          status: 'AVAILABLE',
          sections: [
            {
              id: 'recent-history',
              title: 'Recent history',
              items: [
                {
                  title: 'BTC price picture shifted',
                  summary: 'Price context for BTC moved up by 3.00% in the recent interpreted picture.',
                  timestamp: '2026-04-03T00:00:00.000Z',
                  symbol: 'BTC',
                  eventKind: 'STATE_CHANGE',
                },
              ],
            },
          ],
        },
      }),
    ).toEqual({
      title: 'Insights',
      summary:
        'A quiet shelf of meaningful interpreted changes. It stays selective, factual, and optional.',
      availabilityMessage: null,
      sections: [
        {
          id: 'recent-history',
          title: 'Recent history',
          items: [
            {
              title: 'BTC price picture shifted',
              summary: 'Price context for BTC moved up by 3.00% in the recent interpreted picture.',
              timestampText: '2026-04-03 00:00 UTC',
              symbolText: 'BTC',
              eventKindText: 'State change',
            },
          ],
        },
      ],
    });
  });

  it('shows a minimal honest unavailable state when interpreted history is not ready yet', () => {
    expect(
      createInsightsScreenViewData({
        generatedAt: '2026-04-03T00:00:00.000Z',
        availability: {
          status: 'UNAVAILABLE',
          reason: 'INSUFFICIENT_INTERPRETED_HISTORY',
        },
      }),
    ).toEqual({
      title: 'Insights',
      summary:
        'A quiet shelf of meaningful interpreted changes. It stays selective, factual, and optional.',
      availabilityMessage: 'Insights will appear once there is a little more interpreted history to review.',
      sections: [],
    });
  });

  it('keeps the screen helper on the prepared Insights VM only', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'screens', 'insightsScreenView.ts'),
      'utf8',
    );

    expect(source).toMatch(/vm\.availability\.status === 'UNAVAILABLE'/);
    expect(source).not.toMatch(
      /createInsightsHistoryVM|fetchInsightsHistoryVM|createSinceLastChecked|eventLedger|eventId|strategyId|signalsTriggered|providerId|metadata/,
    );
  });

  it('returns null when the prepared Insights history VM is unavailable', () => {
    expect(createInsightsScreenViewData(null)).toBeNull();
  });
});
