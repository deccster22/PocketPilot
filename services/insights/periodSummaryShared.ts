import type { ReflectionPeriod } from '@/services/insights/types';

export type ReflectionPeriodWindow = {
  startAtMs: number;
  endAtMs: number;
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

export const SUMMARY_ARCHIVE_PERIODS: ReadonlyArray<ReflectionPeriod> = [
  'LAST_MONTH',
  'LAST_QUARTER',
];

function formatMonthYear(timestampMs: number): string {
  const date = new Date(timestampMs);

  return `${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function createReflectionPeriodWindow(
  period: ReflectionPeriod,
  generatedAt: string,
): ReflectionPeriodWindow {
  const now = new Date(generatedAt);
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  if (period === 'LAST_MONTH') {
    const currentMonthStartMs = Date.UTC(year, month, 1);
    const previousMonthStartMs = Date.UTC(
      month === 0 ? year - 1 : year,
      month === 0 ? 11 : month - 1,
      1,
    );

    return {
      startAtMs: previousMonthStartMs,
      endAtMs: currentMonthStartMs,
    };
  }

  const currentQuarterStartMonth = Math.floor(month / 3) * 3;
  const currentQuarterStartMs = Date.UTC(year, currentQuarterStartMonth, 1);
  const previousQuarterStartMonth = currentQuarterStartMonth - 3;
  const previousQuarterYear = previousQuarterStartMonth < 0 ? year - 1 : year;
  const normalizedQuarterStartMonth =
    previousQuarterStartMonth < 0 ? previousQuarterStartMonth + 12 : previousQuarterStartMonth;

  return {
    startAtMs: Date.UTC(previousQuarterYear, normalizedQuarterStartMonth, 1),
    endAtMs: currentQuarterStartMs,
  };
}

export function formatReflectionPeriodTitle(period: ReflectionPeriod): string {
  return period === 'LAST_MONTH' ? 'Last month' : 'Last quarter';
}

export function formatSummaryArchiveCoveredRangeLabel(
  period: ReflectionPeriod,
  generatedAt: string,
): string {
  const window = createReflectionPeriodWindow(period, generatedAt);

  if (period === 'LAST_MONTH') {
    return `Covered period: ${formatMonthYear(window.startAtMs)}`;
  }

  const quarterStart = new Date(window.startAtMs);
  const quarterEnd = new Date(window.endAtMs - 1);
  const startMonth = MONTH_NAMES[quarterStart.getUTCMonth()];
  const endMonth = MONTH_NAMES[quarterEnd.getUTCMonth()];
  const startYear = quarterStart.getUTCFullYear();
  const endYear = quarterEnd.getUTCFullYear();

  if (startYear === endYear) {
    return `Covered period: ${startMonth} to ${endMonth} ${startYear}`;
  }

  return `Covered period: ${startMonth} ${startYear} to ${endMonth} ${endYear}`;
}

export function formatSummaryArchiveGeneratedAtLabel(generatedAt: string): string | null {
  if (generatedAt.length < 10) {
    return null;
  }

  return `Prepared ${generatedAt.slice(0, 10)}`;
}
