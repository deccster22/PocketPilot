import { defaultJournalEntryStore, type JournalEntryStore } from '@/services/insights/journalEntryStore';
import {
  createJournalEntry,
  createJournalEntryStoreKey,
  resolveJournalContext,
} from '@/services/insights/journalShared';
import type {
  InsightsHistorySurface,
  JournalEntryContext,
  JournalEntryVM,
} from '@/services/insights/types';

function isJournalEnabledForSurface(surface: InsightsHistorySurface): boolean {
  return surface === 'INSIGHTS_SCREEN';
}

export function fetchJournalEntryVM(params?: {
  surface?: InsightsHistorySurface;
  context?: JournalEntryContext | null;
  nowProvider?: () => number;
  accountId?: string;
  journalEntryStore?: Pick<JournalEntryStore, 'load'>;
}): JournalEntryVM {
  const surface = params?.surface ?? 'INSIGHTS_SCREEN';
  const generatedAt = new Date((params?.nowProvider ?? Date.now)()).toISOString();

  if (!isJournalEnabledForSurface(surface)) {
    return {
      generatedAt,
      title: null,
      linkageLabel: null,
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NOT_ENABLED_FOR_SURFACE',
      },
    };
  }

  const context = resolveJournalContext(params?.context, generatedAt);

  if (context === null) {
    return {
      generatedAt,
      title: null,
      linkageLabel: null,
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NO_JOURNAL_CONTEXT',
      },
    };
  }

  const journalEntryStore = params?.journalEntryStore ?? defaultJournalEntryStore;
  const storedEntry = journalEntryStore.load(
    createJournalEntryStoreKey({
      accountId: params?.accountId,
      context,
    }),
  );

  return {
    generatedAt,
    title: context.title,
    linkageLabel: context.linkageLabel,
    availability: {
      status: 'AVAILABLE',
      entry: storedEntry
        ? createJournalEntry({
            context,
            storedEntry,
          })
        : null,
    },
  };
}
