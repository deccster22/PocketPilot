import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createInsightsArchiveScreenViewData } from '@/app/screens/insightsArchiveScreenView';

describe('createInsightsArchiveScreenViewData', () => {
  it('reads the prepared summary archive VM without deriving archive content in app', () => {
    expect(
      createInsightsArchiveScreenViewData({
        generatedAt: '2026-04-15T00:00:00.000Z',
        availability: {
          status: 'AVAILABLE',
          entries: [
            {
              archiveId: 'period-summary:last_month',
              period: 'LAST_MONTH',
              title: 'Last month',
              summary:
                'Last month moved from provisional context toward price shifts in interpreted history.',
              coveredRangeLabel: 'Covered period: March 2026',
              generatedAtLabel: 'Prepared 2026-04-15',
            },
            {
              archiveId: 'period-summary:last_quarter',
              period: 'LAST_QUARTER',
              title: 'Last quarter',
              summary:
                'Last quarter moved from measured pullbacks toward price shifts in interpreted history.',
              coveredRangeLabel: 'Covered period: January to March 2026',
              generatedAtLabel: 'Prepared 2026-04-15',
            },
          ],
        },
      }),
    ).toEqual({
      title: 'Summary archive',
      summary:
        'A quiet shelf for prepared monthly and quarterly readbacks. It stays descriptive, contextual, and optional.',
      availabilityMessage: null,
      entries: [
        {
          archiveId: 'period-summary:last_month',
          period: 'LAST_MONTH',
          periodLabel: 'Monthly summary',
          title: 'Last month',
          summary:
            'Last month moved from provisional context toward price shifts in interpreted history.',
          coveredRangeLabel: 'Covered period: March 2026',
          generatedAtLabel: 'Prepared 2026-04-15',
          actionLabel: 'Open summary',
        },
        {
          archiveId: 'period-summary:last_quarter',
          period: 'LAST_QUARTER',
          periodLabel: 'Quarterly summary',
          title: 'Last quarter',
          summary:
            'Last quarter moved from measured pullbacks toward price shifts in interpreted history.',
          coveredRangeLabel: 'Covered period: January to March 2026',
          generatedAtLabel: 'Prepared 2026-04-15',
          actionLabel: 'Open summary',
        },
      ],
    });
  });

  it('shows a minimal honest unavailable state when no archived summaries exist yet', () => {
    expect(
      createInsightsArchiveScreenViewData({
        generatedAt: '2026-04-15T00:00:00.000Z',
        availability: {
          status: 'UNAVAILABLE',
          reason: 'NO_ARCHIVED_SUMMARIES',
        },
      }),
    ).toEqual({
      title: 'Summary archive',
      summary:
        'A quiet shelf for prepared monthly and quarterly readbacks. It stays descriptive, contextual, and optional.',
      availabilityMessage: 'No archived period summaries are available to revisit yet.',
      entries: [],
    });
  });

  it('keeps the archive helper on the prepared summary archive VM only', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'screens', 'insightsArchiveScreenView.ts'),
      'utf8',
    );

    expect(source).toMatch(/vm\.availability\.status === 'UNAVAILABLE'/);
    expect(source).toMatch(/formatPeriodLabel/);
    expect(source).toMatch(/entry\.coveredRangeLabel/);
    expect(source).not.toMatch(
      /createSummaryArchiveVM|fetchSummaryArchiveVM|createPeriodSummaryVM|fetchPeriodSummaryVM|createInsightsHistoryVM|eventLedger|eventId|strategyId|signalsTriggered|providerId|metadata|score|unread|inbox|badge/,
    );
  });

  it('returns null when the prepared summary archive VM is unavailable', () => {
    expect(createInsightsArchiveScreenViewData(null)).toBeNull();
  });
});
