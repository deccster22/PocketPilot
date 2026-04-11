import { defaultJournalEntryStore, type JournalEntryStore } from '@/services/insights/journalEntryStore';
import {
  createJournalEntry,
  createJournalEntryStoreKey,
  createStoredJournalEntry,
  resolveJournalContext,
} from '@/services/insights/journalShared';
import type {
  InsightsHistorySurface,
  JournalEntryContext,
  JournalEntrySaveResult,
} from '@/services/insights/types';

function isJournalEnabledForSurface(surface: InsightsHistorySurface): boolean {
  return surface === 'INSIGHTS_SCREEN';
}

function hasBodyText(body: string): boolean {
  return body.trim().length > 0;
}

export function saveJournalEntry(params: {
  surface?: InsightsHistorySurface;
  context?: JournalEntryContext | null;
  body: string;
  nowProvider?: () => number;
  accountId?: string;
  journalEntryStore?: Pick<JournalEntryStore, 'load' | 'save'>;
}): JournalEntrySaveResult {
  const surface = params.surface ?? 'INSIGHTS_SCREEN';

  if (!isJournalEnabledForSurface(surface)) {
    return {
      status: 'REJECTED',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    };
  }

  if (!hasBodyText(params.body)) {
    return {
      status: 'REJECTED',
      reason: 'EMPTY_BODY',
    };
  }

  const generatedAt = new Date((params.nowProvider ?? Date.now)()).toISOString();
  const context = resolveJournalContext(params.context, generatedAt);

  if (context === null) {
    return {
      status: 'REJECTED',
      reason: 'NO_JOURNAL_CONTEXT',
    };
  }

  const journalEntryStore = params.journalEntryStore ?? defaultJournalEntryStore;
  const contextKey = createJournalEntryStoreKey({
    accountId: params.accountId,
    context,
  });

  if (journalEntryStore.load(contextKey)) {
    return {
      status: 'REJECTED',
      reason: 'ENTRY_ALREADY_EXISTS',
    };
  }

  const storedEntry = createStoredJournalEntry({
    context,
    body: params.body,
    updatedAt: generatedAt,
  });

  journalEntryStore.save(contextKey, storedEntry);

  return {
    status: 'SAVED',
    entry: createJournalEntry({
      context,
      storedEntry,
    }),
  };
}
