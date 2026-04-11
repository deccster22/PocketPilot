import {
  createAnnualReviewWindow,
  createReflectionPeriodWindow,
  resolveAnnualReviewPeriod,
} from '@/services/insights/periodSummaryShared';
import type {
  JournalEntry,
  JournalEntryContext,
  JournalContextType,
} from '@/services/insights/types';

export type StoredJournalEntry = {
  entryId: string;
  body: string;
  updatedAt: string;
};

export type ResolvedJournalContext = {
  contextType: JournalContextType;
  contextId: string | null;
  title: string;
  linkageLabel: string | null;
};

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

function padNumber(value: number): string {
  return value.toString().padStart(2, '0');
}

function formatMonthYear(timestampMs: number): string {
  const date = new Date(timestampMs);
  return `${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function formatQuarterRange(startAtMs: number, endAtMs: number): string {
  const startDate = new Date(startAtMs);
  const endDate = new Date(endAtMs - 1);
  const startMonth = MONTH_NAMES[startDate.getUTCMonth()];
  const endMonth = MONTH_NAMES[endDate.getUTCMonth()];
  const startYear = startDate.getUTCFullYear();
  const endYear = endDate.getUTCFullYear();

  if (startYear === endYear) {
    return `${startMonth} to ${endMonth} ${startYear}`;
  }

  return `${startMonth} ${startYear} to ${endMonth} ${endYear}`;
}

function createPeriodContextId(context: Extract<JournalEntryContext, { contextType: 'PERIOD_SUMMARY' }>, generatedAt: string): string | null {
  if (!context.period) {
    return null;
  }

  const window = createReflectionPeriodWindow(context.period, generatedAt);
  const startDate = new Date(window.startAtMs);

  if (context.period === 'LAST_MONTH') {
    return `${startDate.getUTCFullYear()}-${padNumber(startDate.getUTCMonth() + 1)}`;
  }

  const quarterNumber = Math.floor(startDate.getUTCMonth() / 3) + 1;
  return `${startDate.getUTCFullYear()}-Q${quarterNumber}`;
}

function createPeriodLinkageLabel(
  context: Extract<JournalEntryContext, { contextType: 'PERIOD_SUMMARY' }>,
  generatedAt: string,
): string | null {
  if (!context.period) {
    return null;
  }

  const window = createReflectionPeriodWindow(context.period, generatedAt);

  if (context.period === 'LAST_MONTH') {
    return `Linked to ${formatMonthYear(window.startAtMs)} summary`;
  }

  return `Linked to ${formatQuarterRange(window.startAtMs, window.endAtMs)} summary`;
}

function createUpdatedAtLabel(updatedAt: string): string | null {
  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `Updated ${date.getUTCFullYear()}-${padNumber(date.getUTCMonth() + 1)}-${padNumber(
    date.getUTCDate(),
  )} ${padNumber(date.getUTCHours())}:${padNumber(date.getUTCMinutes())} UTC`;
}

export function resolveJournalContext(
  context: JournalEntryContext | null | undefined,
  generatedAt: string,
): ResolvedJournalContext | null {
  if (!context) {
    return null;
  }

  switch (context.contextType) {
    case 'GENERAL_REFLECTION':
      return {
        contextType: 'GENERAL_REFLECTION',
        contextId: null,
        title: 'Reflection note',
        linkageLabel: null,
      };
    case 'PERIOD_SUMMARY': {
      const contextId = createPeriodContextId(context, generatedAt);

      if (contextId === null) {
        return null;
      }

      return {
        contextType: 'PERIOD_SUMMARY',
        contextId,
        title: 'Summary note',
        linkageLabel: createPeriodLinkageLabel(context, generatedAt),
      };
    }
    default: {
      const period = context.period ?? resolveAnnualReviewPeriod();
      const reviewWindow = createAnnualReviewWindow(period, generatedAt);

      return {
        contextType: 'YEAR_IN_REVIEW',
        contextId: reviewWindow.year.toString(),
        title: 'Year in Review note',
        linkageLabel: `Linked to ${reviewWindow.year} in review`,
      };
    }
  }
}

export function createJournalEntryStoreKey(params: {
  accountId?: string;
  context: ResolvedJournalContext;
}): string {
  const accountScope = params.accountId?.trim() ? params.accountId.trim() : 'all-accounts';
  const contextScope = params.context.contextId ?? 'general';

  return `${accountScope}:${params.context.contextType}:${contextScope}`;
}

export function createStoredJournalEntry(params: {
  context: ResolvedJournalContext;
  body: string;
  updatedAt: string;
}): StoredJournalEntry {
  return {
    entryId: `journal:${params.context.contextType}:${params.context.contextId ?? 'general'}`,
    body: params.body,
    updatedAt: params.updatedAt,
  };
}

export function createJournalEntry(params: {
  context: ResolvedJournalContext;
  storedEntry: StoredJournalEntry;
}): JournalEntry {
  return {
    entryId: params.storedEntry.entryId,
    contextType: params.context.contextType,
    contextId: params.context.contextId,
    title: params.context.title,
    linkageLabel: params.context.linkageLabel,
    body: params.storedEntry.body,
    updatedAtLabel: createUpdatedAtLabel(params.storedEntry.updatedAt),
  };
}
