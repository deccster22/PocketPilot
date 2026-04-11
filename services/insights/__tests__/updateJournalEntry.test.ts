import { createInMemoryJournalEntryStore } from '@/services/insights/journalEntryStore';
import { saveJournalEntry } from '@/services/insights/saveJournalEntry';
import { updateJournalEntry } from '@/services/insights/updateJournalEntry';

describe('updateJournalEntry', () => {
  it('updates an existing journal entry explicitly and keeps the same linkage contract', () => {
    const journalEntryStore = createInMemoryJournalEntryStore();

    const saved = saveJournalEntry({
      surface: 'INSIGHTS_SCREEN',
      nowProvider: () => Date.parse('2026-04-11T01:15:00.000Z'),
      context: {
        contextType: 'YEAR_IN_REVIEW',
        period: 'LAST_YEAR',
      },
      body: 'Early note.',
      journalEntryStore,
    });

    expect(saved.status).toBe('SAVED');

    expect(
      updateJournalEntry({
        surface: 'INSIGHTS_SCREEN',
        nowProvider: () => Date.parse('2026-04-11T03:30:00.000Z'),
        context: {
          contextType: 'YEAR_IN_REVIEW',
          period: 'LAST_YEAR',
        },
        entryId: saved.status === 'SAVED' ? saved.entry.entryId : 'missing',
        body: 'The second pass still feels calm. I want to keep the wider annual picture in mind.',
        journalEntryStore,
      }),
    ).toEqual({
      status: 'UPDATED',
      entry: {
        entryId: 'journal:YEAR_IN_REVIEW:2025',
        contextType: 'YEAR_IN_REVIEW',
        contextId: '2025',
        title: 'Year in Review note',
        linkageLabel: 'Linked to 2025 in review',
        body: 'The second pass still feels calm. I want to keep the wider annual picture in mind.',
        updatedAtLabel: 'Updated 2026-04-11 03:30 UTC',
      },
    });
  });

  it('rejects updates when the entry does not exist for the prepared context', () => {
    expect(
      updateJournalEntry({
        surface: 'INSIGHTS_SCREEN',
        nowProvider: () => Date.parse('2026-04-11T03:30:00.000Z'),
        context: {
          contextType: 'GENERAL_REFLECTION',
        },
        entryId: 'journal:GENERAL_REFLECTION:general',
        body: 'No entry is there yet.',
      }),
    ).toEqual({
      status: 'REJECTED',
      reason: 'ENTRY_NOT_FOUND',
    });
  });

  it('rejects blank updates instead of rewriting the note into something else', () => {
    const journalEntryStore = createInMemoryJournalEntryStore();
    const saved = saveJournalEntry({
      surface: 'INSIGHTS_SCREEN',
      nowProvider: () => Date.parse('2026-04-11T01:15:00.000Z'),
      context: {
        contextType: 'GENERAL_REFLECTION',
      },
      body: 'Leave the wording as-is.',
      journalEntryStore,
    });

    expect(
      updateJournalEntry({
        surface: 'INSIGHTS_SCREEN',
        nowProvider: () => Date.parse('2026-04-11T03:30:00.000Z'),
        context: {
          contextType: 'GENERAL_REFLECTION',
        },
        entryId: saved.status === 'SAVED' ? saved.entry.entryId : 'missing',
        body: '  ',
        journalEntryStore,
      }),
    ).toEqual({
      status: 'REJECTED',
      reason: 'EMPTY_BODY',
    });
  });
});
