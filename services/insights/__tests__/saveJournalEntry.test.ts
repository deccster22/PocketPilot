import { fetchJournalEntryVM } from '@/services/insights/fetchJournalEntryVM';
import { createInMemoryJournalEntryStore } from '@/services/insights/journalEntryStore';
import { saveJournalEntry } from '@/services/insights/saveJournalEntry';

describe('saveJournalEntry', () => {
  it('saves one text-only journal entry for a summary context without rewriting the user text', () => {
    const journalEntryStore = createInMemoryJournalEntryStore();
    const body =
      'The month felt narrower than the headline moves suggested.\nI want to remember that the steadier setup mattered more than the noisier spikes.';

    const result = saveJournalEntry({
      surface: 'INSIGHTS_SCREEN',
      nowProvider: () => Date.parse('2026-04-11T01:15:00.000Z'),
      context: {
        contextType: 'PERIOD_SUMMARY',
        period: 'LAST_MONTH',
      },
      body,
      journalEntryStore,
    });

    expect(result).toEqual({
      status: 'SAVED',
      entry: {
        entryId: 'journal:PERIOD_SUMMARY:2026-03',
        contextType: 'PERIOD_SUMMARY',
        contextId: '2026-03',
        title: 'Summary note',
        linkageLabel: 'Linked to March 2026 summary',
        body,
        updatedAtLabel: 'Updated 2026-04-11 01:15 UTC',
      },
    });

    expect(
      fetchJournalEntryVM({
        surface: 'INSIGHTS_SCREEN',
        nowProvider: () => Date.parse('2026-04-11T01:15:00.000Z'),
        context: {
          contextType: 'PERIOD_SUMMARY',
          period: 'LAST_MONTH',
        },
        journalEntryStore,
      }),
    ).toEqual({
      generatedAt: '2026-04-11T01:15:00.000Z',
      title: 'Summary note',
      linkageLabel: 'Linked to March 2026 summary',
      availability: {
        status: 'AVAILABLE',
        entry: {
          entryId: 'journal:PERIOD_SUMMARY:2026-03',
          contextType: 'PERIOD_SUMMARY',
          contextId: '2026-03',
          title: 'Summary note',
          linkageLabel: 'Linked to March 2026 summary',
          body,
          updatedAtLabel: 'Updated 2026-04-11 01:15 UTC',
        },
      },
    });
  });

  it('rejects empty journal saves instead of inventing content', () => {
    expect(
      saveJournalEntry({
        surface: 'INSIGHTS_SCREEN',
        nowProvider: () => Date.parse('2026-04-11T01:15:00.000Z'),
        context: {
          contextType: 'GENERAL_REFLECTION',
        },
        body: '   ',
      }),
    ).toEqual({
      status: 'REJECTED',
      reason: 'EMPTY_BODY',
    });
  });

  it('keeps creation explicit instead of silently converting duplicate saves into a hidden update', () => {
    const journalEntryStore = createInMemoryJournalEntryStore();

    saveJournalEntry({
      surface: 'INSIGHTS_SCREEN',
      nowProvider: () => Date.parse('2026-04-11T01:15:00.000Z'),
      context: {
        contextType: 'GENERAL_REFLECTION',
      },
      body: 'First note.',
      journalEntryStore,
    });

    expect(
      saveJournalEntry({
        surface: 'INSIGHTS_SCREEN',
        nowProvider: () => Date.parse('2026-04-11T02:00:00.000Z'),
        context: {
          contextType: 'GENERAL_REFLECTION',
        },
        body: 'Second note.',
        journalEntryStore,
      }),
    ).toEqual({
      status: 'REJECTED',
      reason: 'ENTRY_ALREADY_EXISTS',
    });
  });
});
