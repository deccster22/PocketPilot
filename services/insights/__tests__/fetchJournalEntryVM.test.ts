import { fetchJournalEntryVM } from '@/services/insights/fetchJournalEntryVM';
import { createInMemoryJournalEntryStore } from '@/services/insights/journalEntryStore';
import { saveJournalEntry } from '@/services/insights/saveJournalEntry';

describe('fetchJournalEntryVM', () => {
  it('returns an available empty journal state by default for the general Insights reflection lane', () => {
    const journalEntryStore = createInMemoryJournalEntryStore();
    const params = {
      surface: 'INSIGHTS_SCREEN' as const,
      nowProvider: () => Date.parse('2026-04-11T00:00:00.000Z'),
      context: {
        contextType: 'GENERAL_REFLECTION' as const,
      },
      journalEntryStore,
    };

    expect(fetchJournalEntryVM(params)).toEqual({
      generatedAt: '2026-04-11T00:00:00.000Z',
      title: 'Reflection note',
      linkageLabel: null,
      availability: {
        status: 'AVAILABLE',
        entry: null,
      },
    });
    expect(fetchJournalEntryVM(params)).toEqual(fetchJournalEntryVM(params));
  });

  it('returns one prepared journal entry without leaking account or runtime details', () => {
    const journalEntryStore = createInMemoryJournalEntryStore();

    saveJournalEntry({
      surface: 'INSIGHTS_SCREEN',
      nowProvider: () => Date.parse('2026-04-11T06:45:00.000Z'),
      accountId: 'acct-1',
      context: {
        contextType: 'YEAR_IN_REVIEW',
        period: 'LAST_YEAR',
      },
      body: 'A calmer year than it first looked. I want to remember that the choppy weeks were still part of one broader picture.',
      journalEntryStore,
    });

    const result = fetchJournalEntryVM({
      surface: 'INSIGHTS_SCREEN',
      nowProvider: () => Date.parse('2026-04-11T07:00:00.000Z'),
      accountId: 'acct-1',
      context: {
        contextType: 'YEAR_IN_REVIEW',
        period: 'LAST_YEAR',
      },
      journalEntryStore,
    });

    expect(result).toEqual({
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
          body: 'A calmer year than it first looked. I want to remember that the choppy weeks were still part of one broader picture.',
          updatedAtLabel: 'Updated 2026-04-11 06:45 UTC',
        },
      },
    });
    expect(JSON.stringify(result)).not.toMatch(
      /acct-1|providerId|metadata|runtime|score|streak|mood|good trader|bad trader/,
    );
  });

  it('returns an honest unavailable state when the journal path is not enabled on the surface', () => {
    expect(
      fetchJournalEntryVM({
        surface: 'DASHBOARD',
        nowProvider: () => Date.parse('2026-04-11T00:00:00.000Z'),
        context: {
          contextType: 'GENERAL_REFLECTION',
        },
      }),
    ).toEqual({
      generatedAt: '2026-04-11T00:00:00.000Z',
      title: null,
      linkageLabel: null,
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NOT_ENABLED_FOR_SURFACE',
      },
    });
  });

  it('returns an honest unavailable state when no journal context is supplied', () => {
    expect(
      fetchJournalEntryVM({
        surface: 'INSIGHTS_SCREEN',
        nowProvider: () => Date.parse('2026-04-11T00:00:00.000Z'),
      }),
    ).toEqual({
      generatedAt: '2026-04-11T00:00:00.000Z',
      title: null,
      linkageLabel: null,
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NO_JOURNAL_CONTEXT',
      },
    });
  });
});
