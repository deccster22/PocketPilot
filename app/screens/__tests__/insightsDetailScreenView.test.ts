import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createInsightsDetailScreenViewData } from '@/app/screens/insightsDetailScreenView';

describe('createInsightsDetailScreenViewData', () => {
  it('reads the prepared Insights archive VM without assembling archive rows in app', () => {
    expect(
      createInsightsDetailScreenViewData({
        generatedAt: '2026-04-03T00:00:00.000Z',
        availability: {
          status: 'AVAILABLE',
          sections: [
            {
              id: 'since-last-viewed',
              title: 'Since you last viewed Insights',
              items: [
                {
                  title: 'SOL price context stayed estimated',
                  summary:
                    'Recent pricing context for SOL remained estimated, so this part of the picture stayed provisional.',
                  timestamp: '2026-03-23T00:00:00.000Z',
                  symbol: 'SOL',
                  eventKind: 'CONTEXT',
                  detailNote:
                    'The interpreted posture stayed watchful rather than settled. Estimated pricing context remained part of this note, so the interpretation stayed provisional.',
                },
              ],
            },
            {
              id: 'earlier-context',
              title: 'Earlier context',
              items: [
                {
                  title: 'BTC price picture shifted',
                  summary:
                    'Price context for BTC moved up by 4.00% in the recent interpreted picture.',
                  timestamp: '2026-03-21T00:00:00.000Z',
                  symbol: 'BTC',
                  eventKind: 'STATE_CHANGE',
                  detailNote:
                    'The interpreted posture stayed watchful rather than settled. This note remained descriptive rather than prescriptive.',
                },
              ],
            },
          ],
        },
        selectedSectionId: 'earlier-context',
        sinceLastCheckedContinuity: {
          status: 'AVAILABLE',
          entries: [
            {
              title: 'Most recently cleared from Snapshot',
              summary:
                'The last Snapshot Since Last Checked briefing was acknowledged and remains available here for continuity.',
              items: [
                {
                  title: 'SOL price context stayed estimated',
                  summary:
                    'Recent pricing context for SOL remained estimated, so this part of the picture stayed provisional.',
                  emphasis: 'CONTEXT',
                },
              ],
              surfacedAt: '2026-03-23T00:00:00.000Z',
              viewedAt: '2026-03-24T00:00:00.000Z',
            },
          ],
        },
      }),
    ).toEqual({
      title: 'Insights archive',
      summary:
        'A slightly deeper shelf for interpreted history. It remains selective, factual, and optional.',
      availabilityMessage: null,
      continuityTitle: 'Since last checked continuity',
      continuitySummary:
        'Snapshot clears after view, and continuity remains available here as calm interpreted context.',
      continuityEntries: [
        {
          title: 'Most recently cleared from Snapshot',
          summary:
            'The last Snapshot Since Last Checked briefing was acknowledged and remains available here for continuity.',
          surfacedAtText: '2026-03-23 00:00 UTC',
          viewedAtText: '2026-03-24 00:00 UTC',
          items: [
            {
              title: 'SOL price context stayed estimated',
              summary:
                'Recent pricing context for SOL remained estimated, so this part of the picture stayed provisional.',
              emphasis: 'CONTEXT',
            },
          ],
        },
      ],
      selectedSectionTitle: 'Earlier context',
      sectionOptions: [
        {
          id: 'since-last-viewed',
          title: 'Since you last viewed Insights',
          isSelected: false,
        },
        {
          id: 'earlier-context',
          title: 'Earlier context',
          isSelected: true,
        },
      ],
      items: [
        {
          title: 'BTC price picture shifted',
          summary: 'Price context for BTC moved up by 4.00% in the recent interpreted picture.',
          detailNoteText:
            'The interpreted posture stayed watchful rather than settled. This note remained descriptive rather than prescriptive.',
          timestampText: '2026-03-21 00:00 UTC',
          symbolText: 'BTC',
          eventKindText: 'State change',
        },
      ],
    });
  });

  it('shows a minimal honest unavailable state when the deeper archive is not ready yet', () => {
    expect(
      createInsightsDetailScreenViewData({
        generatedAt: '2026-04-03T00:00:00.000Z',
        availability: {
          status: 'UNAVAILABLE',
          reason: 'INSUFFICIENT_INTERPRETED_HISTORY',
        },
        selectedSectionId: null,
        sinceLastCheckedContinuity: {
          status: 'UNAVAILABLE',
          reason: 'NO_ARCHIVED_CONTINUITY',
        },
      }),
    ).toEqual({
      title: 'Insights archive',
      summary:
        'A slightly deeper shelf for interpreted history. It remains selective, factual, and optional.',
      availabilityMessage: 'There is not enough deeper interpreted history to open the archive yet.',
      continuityTitle: null,
      continuitySummary: null,
      continuityEntries: [],
      selectedSectionTitle: null,
      sectionOptions: [],
      items: [],
    });
  });

  it('keeps the detail helper on the prepared archive VM only', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'screens', 'insightsDetailScreenView.ts'),
      'utf8',
    );

    expect(source).toMatch(/vm\.availability\.status === 'UNAVAILABLE'/);
    expect(source).toMatch(/selectedSectionId/);
    expect(source).toMatch(/vm\.sinceLastCheckedContinuity\.status === 'AVAILABLE'/);
    expect(source).not.toMatch(
      /createInsightsArchiveVM|fetchInsightsArchiveVM|createSinceLastCheckedArchiveVM|fetchSinceLastCheckedArchiveVM|createInsightsHistoryVM|eventLedger|eventId|strategyId|signalsTriggered|providerId|metadata|unread|inbox|badge|push|notification/,
    );
  });

  it('returns null when the prepared Insights archive VM is unavailable', () => {
    expect(createInsightsDetailScreenViewData(null)).toBeNull();
  });
});
