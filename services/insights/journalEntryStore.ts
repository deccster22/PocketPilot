import type { StoredJournalEntry } from '@/services/insights/journalShared';

export type JournalEntryStore = {
  load(contextKey: string): StoredJournalEntry | null;
  save(contextKey: string, entry: StoredJournalEntry): void;
  reset(): void;
};

function cloneStoredEntry(entry: StoredJournalEntry): StoredJournalEntry {
  return {
    entryId: entry.entryId,
    body: entry.body,
    updatedAt: entry.updatedAt,
  };
}

export function createInMemoryJournalEntryStore(
  initialEntries?: ReadonlyArray<{
    contextKey: string;
    entry: StoredJournalEntry;
  }>,
): JournalEntryStore {
  const entries = new Map<string, StoredJournalEntry>();

  initialEntries?.forEach(({ contextKey, entry }) => {
    entries.set(contextKey, cloneStoredEntry(entry));
  });

  return {
    load(contextKey) {
      const entry = entries.get(contextKey);
      return entry ? cloneStoredEntry(entry) : null;
    },
    save(contextKey, entry) {
      entries.set(contextKey, cloneStoredEntry(entry));
    },
    reset() {
      entries.clear();
    },
  };
}

export const defaultJournalEntryStore = createInMemoryJournalEntryStore();
