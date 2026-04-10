import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createInsightsScreenViewData } from '@/app/screens/insightsScreenView';

describe('createInsightsScreenViewData', () => {
  it('reads the prepared Insights history VM without assembling raw event rows in app', () => {
    expect(
      createInsightsScreenViewData(
        {
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
                    summary:
                      'Price context for BTC moved up by 3.00% in the recent interpreted picture.',
                    timestamp: '2026-04-03T00:00:00.000Z',
                    symbol: 'BTC',
                    eventKind: 'STATE_CHANGE',
                  },
                ],
              },
            ],
          },
          continuity: {
            state: 'NEW_HISTORY_AVAILABLE',
            viewedAt: '2026-04-02T00:00:00.000Z',
            newestEventAt: '2026-04-03T00:00:00.000Z',
            newItemCount: 1,
            summary:
              'Since you last viewed Insights, 1 newer interpreted history note is available.',
          },
        },
        {
          hasArchive: true,
          hasReflection: true,
          hasSummaries: true,
          hasSummaryArchive: true,
          hasYearInReview: true,
          hasExport: true,
        },
      ),
    ).toEqual({
      title: 'Insights',
      summary:
        'A quiet shelf of meaningful interpreted changes. It stays selective, factual, and optional.',
      continuityNote:
        'Since you last viewed Insights, 1 newer interpreted history note is available.',
      availabilityMessage: null,
      archiveActionLabel: 'View deeper history',
      archiveActionSummary:
        'Open a slightly deeper interpreted archive when you want a little more context.',
      reflectionActionLabel: 'Compare recent history',
      reflectionActionSummary:
        'Place two interpreted slices side by side when you want a brief sense of what changed.',
      summaryActionLabel: 'View period summaries',
      summaryActionSummary:
        'Open a calm monthly or quarterly readback built from interpreted history.',
      summaryArchiveActionLabel: 'Browse summary archive',
      summaryArchiveActionSummary:
        'Revisit prepared monthly and quarterly readbacks on a quiet archive shelf.',
      yearInReviewActionLabel: 'Open Year in Review',
      yearInReviewActionSummary:
        'Open a calm annual debrief for the last completed calendar year when you want a wider reflection.',
      exportActionLabel: 'Prepare export',
      exportActionSummary:
        'Review calm export options for the reflection material that is already ready under Insights.',
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
      createInsightsScreenViewData(
        {
          generatedAt: '2026-04-03T00:00:00.000Z',
          availability: {
            status: 'UNAVAILABLE',
            reason: 'INSUFFICIENT_INTERPRETED_HISTORY',
          },
          continuity: {
            state: 'NO_HISTORY',
            viewedAt: '2026-04-02T00:00:00.000Z',
            newestEventAt: null,
            newItemCount: 0,
            summary: null,
          },
        },
        {
          hasSummaries: true,
          hasSummaryArchive: true,
          hasYearInReview: true,
          hasExport: true,
        },
      ),
    ).toEqual({
      title: 'Insights',
      summary:
        'A quiet shelf of meaningful interpreted changes. It stays selective, factual, and optional.',
      continuityNote: null,
      availabilityMessage:
        'Insights will appear once there is a little more interpreted history to review.',
      archiveActionLabel: null,
      archiveActionSummary: null,
      reflectionActionLabel: null,
      reflectionActionSummary: null,
      summaryActionLabel: 'View period summaries',
      summaryActionSummary:
        'Open a calm monthly or quarterly readback built from interpreted history.',
      summaryArchiveActionLabel: 'Browse summary archive',
      summaryArchiveActionSummary:
        'Revisit prepared monthly and quarterly readbacks on a quiet archive shelf.',
      yearInReviewActionLabel: 'Open Year in Review',
      yearInReviewActionSummary:
        'Open a calm annual debrief for the last completed calendar year when you want a wider reflection.',
      exportActionLabel: 'Prepare export',
      exportActionSummary:
        'Review calm export options for the reflection material that is already ready under Insights.',
      sections: [],
    });
  });

  it('keeps the screen helper on the prepared Insights VM only', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'screens', 'insightsScreenView.ts'),
      'utf8',
    );

    expect(source).toMatch(/vm\.availability\.status === 'UNAVAILABLE'/);
    expect(source).toMatch(/vm\.continuity\.summary/);
    expect(source).toMatch(/hasArchive/);
    expect(source).toMatch(/hasReflection/);
    expect(source).toMatch(/hasSummaries/);
    expect(source).toMatch(/hasSummaryArchive/);
    expect(source).toMatch(/hasYearInReview/);
    expect(source).toMatch(/hasExport/);
    expect(source).not.toMatch(
      /createInsightsHistoryVM|fetchInsightsHistoryVM|fetchPeriodSummaryVM|fetchReflectionComparisonVM|fetchSummaryArchiveVM|fetchYearInReviewVM|fetchExportOptionsVM|fetchPreparedExportRequest|createYearInReviewVM|createExportOptionsVM|createPreparedExportRequest|createInsightsContinuity|createSinceLastChecked|eventLedger|eventId|strategyId|signalsTriggered|providerId|metadata|score|unread|inbox|badge/,
    );
  });

  it('returns null when the prepared Insights history VM is unavailable', () => {
    expect(createInsightsScreenViewData(null)).toBeNull();
  });
});
