import type { EventLedgerEntry } from '@/core/types/eventLedger';
import type { InsightsEventKind } from '@/services/insights/types';
import type { SinceLastCheckedPayload } from '@/services/events/createSinceLastChecked';
import type { SinceLastCheckedItem } from '@/services/orientation/types';
import {
  createEventHistoryEntry,
  createStoryGroups,
  isMarketEvent,
} from '@/services/insights/historyInterpretation';
import type {
  SinceLastCheckedArchiveEntry,
  SinceLastCheckedArchiveVM,
} from '@/services/insights/types';

const MAX_CONTINUITY_ITEMS = 3;

function createUnavailable(
  generatedAt: string | null,
  reason: Extract<SinceLastCheckedArchiveVM['availability'], { status: 'UNAVAILABLE' }>['reason'],
): SinceLastCheckedArchiveVM {
  return {
    generatedAt,
    availability: {
      status: 'UNAVAILABLE',
      reason,
    },
  };
}

function toItemEmphasis(eventKind: InsightsEventKind): SinceLastCheckedItem['emphasis'] {
  switch (eventKind) {
    case 'CONTEXT':
      return 'CONTEXT';
    case 'OTHER':
      return 'NEUTRAL';
    default:
      return 'CHANGE';
  }
}

function resolveNewestTimestamp(events: ReadonlyArray<EventLedgerEntry>): string | null {
  if (events.length === 0) {
    return null;
  }

  const newestTimestamp = Math.max(...events.map((event) => event.timestamp));

  return Number.isFinite(newestTimestamp) ? new Date(newestTimestamp).toISOString() : null;
}

function createContinuityItems(events: ReadonlyArray<EventLedgerEntry>): SinceLastCheckedItem[] {
  const groups = createStoryGroups(events.filter(isMarketEvent)).slice(0, MAX_CONTINUITY_ITEMS);

  return groups.map((group) => {
    const interpretedEntry = createEventHistoryEntry(group);

    return {
      title: interpretedEntry.title,
      summary: interpretedEntry.summary,
      emphasis: toItemEmphasis(interpretedEntry.eventKind),
    };
  });
}

function createViewedEntry(params: {
  accountId: string;
  history: ReadonlyArray<EventLedgerEntry>;
  viewedAt: string | null;
}): SinceLastCheckedArchiveEntry | null {
  if (!params.viewedAt) {
    return null;
  }

  const viewedAtTimestamp = Date.parse(params.viewedAt);

  if (!Number.isFinite(viewedAtTimestamp)) {
    return null;
  }

  const candidateEvents = params.history.filter(
    (event) => event.accountId === params.accountId && event.timestamp <= viewedAtTimestamp,
  );
  const items = createContinuityItems(candidateEvents);

  if (items.length === 0) {
    return null;
  }

  return {
    title: 'Most recently cleared from Snapshot',
    summary:
      'The last Snapshot Since Last Checked briefing was acknowledged and remains available here for continuity.',
    items,
    surfacedAt: resolveNewestTimestamp(candidateEvents),
    viewedAt: params.viewedAt,
  };
}

function createPendingEntry(params: {
  accountId: string;
  snapshotSinceLastChecked?: SinceLastCheckedPayload | null;
}): SinceLastCheckedArchiveEntry | null {
  if (!params.snapshotSinceLastChecked) {
    return null;
  }

  const candidateEvents = params.snapshotSinceLastChecked.events.filter(
    (event) => event.accountId === params.accountId,
  );
  const items = createContinuityItems(candidateEvents);

  if (items.length === 0) {
    return null;
  }

  return {
    title: 'Current Snapshot continuity',
    summary:
      'These meaningful changes are still active on Snapshot and also remain available in deeper continuity.',
    items,
    surfacedAt: resolveNewestTimestamp(candidateEvents),
    viewedAt: null,
  };
}

export function createSinceLastCheckedArchiveVM(params: {
  generatedAt: string | null;
  accountId?: string;
  history: ReadonlyArray<EventLedgerEntry>;
  snapshotSinceLastChecked?: SinceLastCheckedPayload | null;
  snapshotViewedAt?: string | null;
}): SinceLastCheckedArchiveVM {
  if (!params.accountId) {
    return createUnavailable(params.generatedAt, 'NO_ACCOUNT_CONTEXT');
  }

  const pendingEntry = createPendingEntry({
    accountId: params.accountId,
    snapshotSinceLastChecked: params.snapshotSinceLastChecked,
  });
  const viewedEntry = createViewedEntry({
    accountId: params.accountId,
    history: params.history,
    viewedAt: params.snapshotViewedAt ?? null,
  });
  const entries = [pendingEntry, viewedEntry].filter(
    (entry): entry is SinceLastCheckedArchiveEntry => Boolean(entry),
  );

  if (entries.length === 0) {
    return createUnavailable(params.generatedAt, 'NO_ARCHIVED_CONTINUITY');
  }

  return {
    generatedAt: params.generatedAt,
    availability: {
      status: 'AVAILABLE',
      entries,
    },
  };
}
