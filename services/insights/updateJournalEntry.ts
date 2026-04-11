import { defaultJournalEntryStore, type JournalEntryStore } from '@/services/insights/journalEntryStore';
import {
  createJournalEntry,
  createJournalEntryStoreKey,
  resolveJournalContext,
} from '@/services/insights/journalShared';
import type {
  InsightsHistorySurface,
  JournalEntryContext,
  JournalEntryUpdateResult,
} from '@/services/insights/types';

function isJournalEnabledForSurface(surface: InsightsHistorySurface): boolean {
  return surface === 'INSIGHTS_SCREEN';
}

function hasBodyText(body: string): boolean {
  return body.trim().length > 0;
}

export function updateJournalEntry(params: {
  surface?: InsightsHistorySurface;
  context?: JournalEntryContext | null;
  entryId: string;
  body: string;
  nowProvider?: () => number;
  accountId?: string;
  journalEntryStore?: Pick<JournalEntryStore, 'load' | 'save'>;
}): JournalEntryUpdateResult {
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
  const existingEntry = journalEntryStore.load(contextKey);

  if (!existingEntry || existingEntry.entryId !== params.entryId) {
    return {
      status: 'REJECTED',
      reason: 'ENTRY_NOT_FOUND',
    };
  }

  const updatedEntry = {
    entryId: existingEntry.entryId,
    body: params.body,
    updatedAt: generatedAt,
  };

  journalEntryStore.save(contextKey, updatedEntry);

  return {
    status: 'UPDATED',
    entry: createJournalEntry({
      context,
      storedEntry: updatedEntry,
    }),
  };
}
