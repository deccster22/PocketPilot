import type { ComparisonWindow } from '@/services/insights/types';

const DAY_MS = 24 * 60 * 60 * 1000;

export type ComparisonRange = {
  startAtMs: number;
  endAtMs: number;
  label: string;
  nounPhrase: string;
};

export type ResolvedComparisonWindow = {
  window: Exclude<
    ComparisonWindow,
    'BEFORE_STRATEGY_CHANGE_VS_AFTER_STRATEGY_CHANGE'
  >;
  title: string;
  newerRange: ComparisonRange;
  earlierRange: ComparisonRange;
};

function formatQuarterLabel(year: number, quarterIndex: number): string {
  return `Q${quarterIndex + 1} ${year}`;
}

function createQuarterRange(params: {
  year: number;
  quarterIndex: number;
}): ComparisonRange {
  const quarterStartMonth = params.quarterIndex * 3;
  const startAtMs = Date.UTC(params.year, quarterStartMonth, 1);
  const endAtMs = Date.UTC(params.year, quarterStartMonth + 3, 1);
  const label = formatQuarterLabel(params.year, params.quarterIndex);

  return {
    startAtMs,
    endAtMs,
    label,
    nounPhrase: label,
  };
}

function createYearRange(year: number): ComparisonRange {
  return {
    startAtMs: Date.UTC(year, 0, 1),
    endAtMs: Date.UTC(year + 1, 0, 1),
    label: `${year}`,
    nounPhrase: `${year}`,
  };
}

export function resolveComparisonWindow(
  window: ComparisonWindow,
  generatedAt: string,
): ResolvedComparisonWindow | null {
  const generatedAtMs = Date.parse(generatedAt);

  if (Number.isNaN(generatedAtMs)) {
    return null;
  }

  switch (window) {
    case 'LAST_90_DAYS_VS_PREVIOUS_90_DAYS': {
      const newerRange = {
        startAtMs: generatedAtMs - 90 * DAY_MS,
        endAtMs: generatedAtMs,
        label: 'Last 90 days',
        nounPhrase: 'the last 90 days',
      };
      const earlierRange = {
        startAtMs: generatedAtMs - 180 * DAY_MS,
        endAtMs: generatedAtMs - 90 * DAY_MS,
        label: 'Previous 90 days',
        nounPhrase: 'the previous 90 days',
      };

      return {
        window,
        title: 'Last 90 days compared with the previous 90 days',
        newerRange,
        earlierRange,
      };
    }
    case 'LAST_QUARTER_VS_PREVIOUS_QUARTER': {
      const now = new Date(generatedAt);
      const currentQuarterIndex = Math.floor(now.getUTCMonth() / 3);
      const currentQuarterStartMonth = currentQuarterIndex * 3;
      const currentQuarterStartMs = Date.UTC(now.getUTCFullYear(), currentQuarterStartMonth, 1);
      const lastQuarterEnd = new Date(currentQuarterStartMs);
      const lastQuarterStart = new Date(currentQuarterStartMs);

      lastQuarterStart.setUTCMonth(lastQuarterStart.getUTCMonth() - 3);
      const previousQuarterStart = new Date(currentQuarterStartMs);

      previousQuarterStart.setUTCMonth(previousQuarterStart.getUTCMonth() - 6);

      const newerRange = createQuarterRange({
        year: lastQuarterStart.getUTCFullYear(),
        quarterIndex: Math.floor(lastQuarterStart.getUTCMonth() / 3),
      });
      const earlierRange = createQuarterRange({
        year: previousQuarterStart.getUTCFullYear(),
        quarterIndex: Math.floor(previousQuarterStart.getUTCMonth() / 3),
      });

      return {
        window,
        title: `${newerRange.label} compared with ${earlierRange.label}`,
        newerRange: {
          ...newerRange,
          endAtMs: lastQuarterEnd.getTime(),
        },
        earlierRange: {
          ...earlierRange,
          endAtMs: lastQuarterStart.getTime(),
        },
      };
    }
    case 'LAST_YEAR_VS_PREVIOUS_YEAR': {
      const now = new Date(generatedAt);
      const lastYear = now.getUTCFullYear() - 1;
      const previousYear = lastYear - 1;
      const newerRange = createYearRange(lastYear);
      const earlierRange = createYearRange(previousYear);

      return {
        window,
        title: `${newerRange.label} compared with ${earlierRange.label}`,
        newerRange,
        earlierRange,
      };
    }
    default:
      return null;
  }
}
