import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createInsightsJournalScreenViewData } from '@/app/screens/insightsJournalScreenView';

describe('createInsightsJournalScreenViewData', () => {
  it('reads the prepared journal VM without deriving linkage or storage rules in app', () => {
    expect(
      createInsightsJournalScreenViewData({
        generatedAt: '2026-04-11T07:00:00.000Z',
        title: 'Year in Review note',
        linkageLabel: 'Linked to 2025 in review',
        availability: {
          status: 'AVAILABLE',
          entry: {
            entryId: 'journal:YEAR_IN_REVIEW:2025',
            contextType: 'YEAR_IN_REVIEW',
            contextId: '2025',
            title: 'Year in Review note',
            linkageLabel: 'Linked to 2025 in review',
            body: 'A steadier year than it first felt like.',
            updatedAtLabel: 'Updated 2026-04-11 06:45 UTC',
          },
        },
      }),
    ).toEqual({
      title: 'Journal',
      summary:
        'A small optional note lane for reflection context. It stays text-only, private, and under your control.',
      availabilityMessage: null,
      noteTitle: 'Year in Review note',
      linkageLabel: 'Linked to 2025 in review',
      updatedAtLabel: 'Updated 2026-04-11 06:45 UTC',
      body: 'A steadier year than it first felt like.',
      emptyStateTitle: null,
      emptyStateSummary: null,
      primaryActionLabel: 'Edit note',
      editorTitle: 'Edit note',
      editorPlaceholder: 'Add a small note in your own words. PocketPilot will not rewrite it.',
      submitActionLabel: 'Update note',
    });
  });

  it('shows an empty state for optional journaling when no note has been saved yet', () => {
    expect(
      createInsightsJournalScreenViewData({
        generatedAt: '2026-04-11T07:00:00.000Z',
        title: 'Summary note',
        linkageLabel: 'Linked to March 2026 summary',
        availability: {
          status: 'AVAILABLE',
          entry: null,
        },
      }),
    ).toEqual({
      title: 'Journal',
      summary:
        'A small optional note lane for reflection context. It stays text-only, private, and under your control.',
      availabilityMessage: null,
      noteTitle: 'Summary note',
      linkageLabel: 'Linked to March 2026 summary',
      updatedAtLabel: null,
      body: null,
      emptyStateTitle: 'No note saved yet',
      emptyStateSummary:
        'Add a few lines if you want a small reflection note attached to this context. Leaving it blank is fine.',
      primaryActionLabel: 'Write note',
      editorTitle: 'Write note',
      editorPlaceholder: 'Add a small note in your own words. PocketPilot will not rewrite it.',
      submitActionLabel: 'Save note',
    });
  });

  it('shows a minimal honest unavailable state when no journal context is attached', () => {
    expect(
      createInsightsJournalScreenViewData({
        generatedAt: '2026-04-11T07:00:00.000Z',
        title: null,
        linkageLabel: null,
        availability: {
          status: 'UNAVAILABLE',
          reason: 'NO_JOURNAL_CONTEXT',
        },
      }),
    ).toEqual({
      title: 'Journal',
      summary:
        'A small optional note lane for reflection context. It stays text-only, private, and under your control.',
      availabilityMessage: 'A journal note is not attached to this reflection context yet.',
      noteTitle: null,
      linkageLabel: null,
      updatedAtLabel: null,
      body: null,
      emptyStateTitle: null,
      emptyStateSummary: null,
      primaryActionLabel: null,
      editorTitle: null,
      editorPlaceholder: null,
      submitActionLabel: null,
    });
  });

  it('keeps the helper on the prepared journal VM only', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'screens', 'insightsJournalScreenView.ts'),
      'utf8',
    );

    expect(source).toMatch(/vm\.availability\.status === 'UNAVAILABLE'/);
    expect(source).toMatch(/vm\.title/);
    expect(source).toMatch(/vm\.linkageLabel/);
    expect(source).not.toMatch(
      /fetchJournalEntryVM|saveJournalEntry|updateJournalEntry|resolveJournalContext|createAnnualReviewWindow|createReflectionPeriodWindow|eventLedger|eventId|strategyId|providerId|metadata|score|badge/,
    );
  });

  it('returns null when the prepared journal VM is unavailable', () => {
    expect(createInsightsJournalScreenViewData(null)).toBeNull();
  });
});
